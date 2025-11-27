
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChlDdZA2F8bUZEcSBQKrV43s7Wb-EuXrI",
  authDomain: "medimindfinal.firebaseapp.com",
  projectId: "medimindfinal",
  storageBucket: "medimindfinal.firebasestorage.app",
  messagingSenderId: "1006817753068",
  appId: "1:1006817753068:web:15379bb332ca9713d2b2c9",
  measurementId: "G-E7PXZTNSZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
