// Use the modular import approach
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Check if Firebase Admin is already initialized
let adminApp;
let adminDb;
let adminAuth;

try {
  // Check if all required environment variables are present
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin environment variables:');
    console.error('FIREBASE_PROJECT_ID:', !!projectId);
    console.error('FIREBASE_CLIENT_EMAIL:', !!clientEmail);
    console.error('FIREBASE_PRIVATE_KEY:', !!privateKey);
    throw new Error('Firebase Admin environment variables are missing');
  }

  // Clean the private key (remove quotes and handle newlines)
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '');

  // Check if already initialized
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: projectId.trim(),
        clientEmail: clientEmail.trim(),
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    adminApp = getApps()[0];
    console.log('✅ Firebase Admin already initialized');
  }

  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);

} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  throw error;
}

export { adminDb, adminAuth };