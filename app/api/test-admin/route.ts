import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    // Test connection
    const test = await adminDb.collection('test').limit(1).get();
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin is working!',
      hasData: !test.empty 
    });
  } catch (error: any) {
    console.error('Firebase Admin test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        envVars: {
          projectId: !!process.env.FIREBASE_PROJECT_ID,
          clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        }
      },
      { status: 500 }
    );
  }
}