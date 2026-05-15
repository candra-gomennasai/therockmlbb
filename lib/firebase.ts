import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVZknmUPgIrcFYXBozmyhrDNjPcX3Mv38",
  authDomain: "studio-9225483331-f0a66.firebaseapp.com",
  projectId: "studio-9225483331-f0a66",
  storageBucket: "studio-9225483331-f0a66.firebasestorage.app",
  messagingSenderId: "390942239031",
  appId: "1:390942239031:web:9a8376f67e4e69e61192b2"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
