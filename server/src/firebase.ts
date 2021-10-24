// Initialize Firebase Admin resources
// Calling 'initializeApp()' tells firebase SDK to look for the ENV with the service-account
import * as firebaseAdmin from 'firebase-admin';
firebaseAdmin.initializeApp();

export const db = firebaseAdmin.firestore(); //firestore SDK ref
export const auth = firebaseAdmin.auth(); //auth SDK ref
