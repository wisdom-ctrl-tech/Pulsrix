import * as admin from 'firebase-admin';

// Initialize Firebase Admin
let adminDb: any;
let adminAuth: any;

try {
  // Check if all required environment variables are present
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin environment variables');
    throw new Error('Firebase Admin environment variables are missing');
  }

  // Clean the private key (remove quotes and handle newlines)
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '');

  // Check if already initialized (using getApps() instead of apps)
  if (admin.getApps().length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId.trim(),
        clientEmail: clientEmail.trim(),
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('✅ Firebase Admin already initialized');
  }

  adminDb = admin.firestore();
  adminAuth = admin.auth();

} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  throw error;
}

export { adminDb, adminAuth };