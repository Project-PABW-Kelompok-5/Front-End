import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCAOvzGJat0Sw82RRHsDshY0jxBHPRUZ1E",
    authDomain: "pabw-kel-5.firebaseapp.com",
    projectId: "pabw-kel-5",
    storageBucket: "pabw-kel-5.firebasestorage.app",
    messagingSenderId: "874185015872",
    appId: "1:874185015872:web:d6543f65c800d91f8395a5",
    measurementId: "G-W3C7Z6J1JL",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app); 
const db = firestore; // Alias for Firestore instance

export { app, auth, getAuth, firestore, db }; // Export Firestore