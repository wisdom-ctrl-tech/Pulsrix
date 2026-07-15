import admin from 'firebase-admin';

// Initialize Firebase Admin
let adminDb: any;
let adminAuth: any;

// Check if Firebase Admin is already initialized
if (!admin.apps || admin.apps.length === 0) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log('🔑 Firebase Admin environment check:');
    console.log('  - Project ID:', projectId);
    console.log('  - Client Email:', clientEmail);
    console.log('  - Private Key exists:', !!privateKey);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin environment variables');
    }

    // Clean the private key
    privateKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId.trim(),
        clientEmail: clientEmail.trim(),
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
} else {
  console.log('✅ Firebase Admin already initialized');
}

adminDb = admin.firestore();
adminAuth = admin.auth();

export { adminDb, adminAuth };