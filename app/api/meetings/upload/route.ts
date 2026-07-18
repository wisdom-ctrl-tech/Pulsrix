import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { AssemblyAI } from 'assemblyai';
import OpenAI from 'openai';
import { Resend } from 'resend';
import admin from 'firebase-admin';

// ============================================================
// 1. INITIALIZE FIREBASE ADMIN
// ============================================================
let adminDb: FirebaseFirestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    privateKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');

    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId.trim(),
          clientEmail: clientEmail.trim(),
          privateKey: privateKey,
        }),
      });
      console.log('✅ Firebase Admin initialized');
    }

    adminDb = admin.firestore();
    adminAuth = admin.auth();
  }
} catch (error) {
  console.error('❌ Firebase Admin error:', error);
}

// ============================================================
// 2. CHECK API KEYS
// ============================================================
const assemblyaiApiKey = process.env.ASSEMBLYAI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!assemblyaiApiKey) console.error('❌ ASSEMBLYAI_API_KEY is missing');
if (!openaiApiKey) console.error('❌ OPENAI_API_KEY is missing');
if (!resendApiKey) console.error('❌ RESEND_API_KEY is missing');

// ============================================================
// 3. INITIALIZE AI CLIENTS
// ============================================================
const assemblyai = new AssemblyAI({
  apiKey: assemblyaiApiKey!,
});

const openai = new OpenAI({
  apiKey: openaiApiKey!,
});

const resend = new Resend(resendApiKey!);

// ============================================================
// 4. POST HANDLER
// ============================================================
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Upload request received');

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin is not initialized.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const meetingName = formData.get('meetingName') as string | null;
    const email = formData.get('email') as string | null;

    if (!file || !meetingName || !email) {
      return NextResponse.json(
        { error: 'File, meeting name, and email are required' },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `${randomUUID()}-${file.name}`);
    await writeFile(tempPath, buffer);

    // Transcribe with AssemblyAI
    const transcript = await assemblyai.transcripts.create({
      audio_url: tempPath,
      language_code: 'en',
    });

    let transcriptResult: any = null;
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
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcriptResult) {
      throw new Error('Transcription timed out');
    }

    // Generate summary with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a meeting summarizer. Create a structured summary.
            Format:
            1. Key Discussion Points
            2. Decisions Made
            3. Action Items
            4. Next Steps`,
        },
        {
          role: 'user',
          content: `Meeting: ${meetingName}\n\nTranscript:\n${transcriptResult.text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || '';

    // Save to Firebase
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

    // Send email
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
          View all your summaries at: <a href="https://pulsrix.vercel.app/dashboard/history">Pulsrix Dashboard</a>
        </p>
      `,
    });

    // Clean up
    await unlink(tempPath).catch(() => {});

    return NextResponse.json({
      success: true,
      meetingId: docRef.id,
      message: 'Meeting processed successfully!',
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}