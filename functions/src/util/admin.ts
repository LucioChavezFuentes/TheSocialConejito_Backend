import * as admin from 'firebase-admin';

admin.initializeApp();

const db : FirebaseFirestore.Firestore  = admin.firestore();

export {admin , db}