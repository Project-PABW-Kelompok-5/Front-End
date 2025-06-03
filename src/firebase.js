import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
    apiKey: "AIzaSyAIFHyOyJbHoTOR6NLSRQpMStkIoaIilmo",
    authDomain: "blessing-store-pabw.firebaseapp.com",
    projectId: "blessing-store-pabw",
    storageBucket: "blessing-store-pabw.firebasestorage.app",
    messagingSenderId: "135890577598",
    appId: "1:135890577598:web:bd4be1c8a42d676ba816ef",
    measurementId: "G-HGNCWZRJYX"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app); 
const db = firestore; // Alias for Firestore instance

export { app, auth, getAuth, firestore, db }; // Export Firestore