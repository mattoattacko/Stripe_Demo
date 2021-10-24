// This is just another way to access the DB and auth SDK's to use in the Front End

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAmqeFovCrE1hApx1j07vw_DaQ5Im-0uwc",
  authDomain: "stripe-fireshiptutorial.firebaseapp.com",
  projectId: "stripe-fireshiptutorial",
  storageBucket: "stripe-fireshiptutorial.appspot.com",
  messagingSenderId: "198416918455",
  appId: "1:198416918455:web:a563dbe5a02ff93e732a32"
};

firebase.initializeApp(firebaseConfig)

export const db = firebase.firestore();
export const auth = firebase.auth();
