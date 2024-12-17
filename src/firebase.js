// ไฟล์ firebase.js กำหนดการเชื่อมต่อกับ Firebase และ export auth, firestore, storage
// รวมถึงผู้ให้บริการ Auth (Google, Facebook)
//
// This firebase.js file configures the Firebase connection and exports auth, firestore, and storage objects.
// Also sets up authentication providers for Google and Facebook.

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyADENCRIQoYRiP-sDgNGRO107_SLGKt6Yg",
    authDomain: "expense-tracker-6bb42.firebaseapp.com",
    projectId: "expense-tracker-6bb42",
    storageBucket: "expense-tracker-6bb42.firebasestorage.app",
    messagingSenderId: "830580631737",
    appId: "1:830580631737:web:886380addc575b47b3d368",
    measurementId: "G-B8FJS9DGCW"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const facebookProvider = new firebase.auth.FacebookAuthProvider();


