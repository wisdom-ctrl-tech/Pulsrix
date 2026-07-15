import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { AssemblyAI } from 'assemblyai';
import OpenAI from 'openai';
import { Resend } from 'resend';
import { adminDb } from '@/lib/firebase/admin';

// Check if API keys are available
const assemblyaiApiKey = process.env.ASSEMBLYAI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!assemblyaiApiKey) {
  console.error('❌ ASSEMBLYAI_API_KEY is missing');
}
if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY is missing');
}
if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY is missing');
}

// Initialize clients
const assemblyai = new AssemblyAI({
  apiKey: assemblyaiApiKey!,
});

const openai = new OpenAI({
  apiKey: openaiApiKey!,
});

const resend = new Resend(resendApiKey!);

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Upload request received');

    // Check if Firebase Admin is available
    if (!adminDb) {
      throw new Error('Firebase Admin is not initialized. Check environment variables.');
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const meetingName = formData.get('meetingName') as string;
    const email = formData.get('email') as string;

    console.log('📝 Meeting:', meetingName);
    console.log('📧 Email:', email);
    console.log('📁 File:', file ? file.name : 'No file');

    if (!file || !meetingName || !email) {
      return NextResponse.json(
        { error: 'File, meeting name, and email are required' },
        { status: 400 }
      );
    }

    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    console.log('📁 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `${randomUUID()}-${file.name}`);
    await writeFile(tempPath, buffer);

    console.log('💾 File saved to:', tempPath);

    // Step 1: Upload to AssemblyAI
    console.log('🎙️ Uploading to AssemblyAI...');
    const transcript = await assemblyai.transcripts.create({
      audio_url: tempPath,
      language_code: 'en',
    });

    console.log('📝 Transcript ID:', transcript.id);

    // Wait for transcription to complete
    let transcriptResult;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const status = await assemblyai.transcripts.get(transcript.id);
      if (status.status === 'completed') {
        transcriptResult = status;
        break;
      } else if (status.status === 'error') {
        throw new Error('Transcription failed: ' + status.error);
      }
      console.log(`⏳ Waiting for transcription... (${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcriptResult) {
      throw new Error('Transcription timed out');
    }

    console.log('✅ Transcription complete! Length:', transcriptResult.text?.length || 0);

    // Step 2: Generate summary with OpenAI
    console.log('🤖 Generating summary with OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a meeting summarizer. Create a structured summary of the meeting transcript.
            Format your response as:
            1. Key Discussion Points (bulleted list)
            2. Decisions Made (bulleted list)
            3. Action Items (bulleted list with assignees if mentioned)
            4. Next Steps (if mentioned)`,
        },
        {
          role: 'user',
          content: `Meeting name: ${meetingName}\n\nTranscript:\n${transcriptResult.text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || '';

    console.log('✅ Summary generated! Length:', summary.length);

    // Step 3: Save to Firebase
    console.log('💾 Saving to Firebase...');
    const meetingData = {
      userId: email,
      meetingName,
      email,
      transcript: transcriptResult.text,
      summary,
      status: 'completed',
      createdAt: new Date().toISOString(),
      fileSize: file.size,
    };

    const docRef = await adminDb.collection('meetings').add(meetingData);
    console.log('📄 Meeting saved with ID:', docRef.id);

    // Step 4: Send email
    console.log('📧 Sending email...');
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `📝 Meeting Summary: ${meetingName}`,
      html: `
        <h1>Meeting Summary: ${meetingName}</h1>
        <p>Here's your AI-generated summary:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
          ${summary}
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          View all your summaries at: <a href="https://your-app.com/dashboard/history">Your Dashboard</a>
        </p>
      `,
    });

    console.log('✅ Email sent!');

    // Clean up temp file
    await unlink(tempPath).catch(() => {});

    return NextResponse.json({
      success: true,
      meetingId: docRef.id,
      message: 'Meeting processed successfully!',
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}