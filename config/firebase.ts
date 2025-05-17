import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBeZ01odvvdSuE2-E4aZ1dv5jGYQah66WE",
  authDomain: "shortl-app.firebaseapp.com",
  projectId: "shortl-app",
  storageBucket: "shortl-app.firebasestorage.app",
  messagingSenderId: "1051067207226",
  appId: "1:1051067207226:web:ad3088fd2bb9e3922cef03",
  measurementId: "G-EN00NT0JNX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence
setPersistence(auth, browserLocalPersistence);

export { app, auth, db, storage, analytics };