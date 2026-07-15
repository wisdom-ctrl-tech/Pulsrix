const admin = require('firebase-admin');

let adminDb;
let adminAuth;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin environment variables are missing');
  }

  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '');

  // Use getApps() which exists in CommonJS
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId.trim(),
        clientEmail: clientEmail.trim(),
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  }

  adminDb = admin.firestore();
  adminAuth = admin.auth();

} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  throw error;
}

module.exports = { adminDb, adminAuth };