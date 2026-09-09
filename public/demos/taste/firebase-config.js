/**
 * Firebase initialization - modular SDK v10 (CDN)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9L1qQkIGwbAbiT8wOcjtIG6y1TezidOo",
    authDomain: "menutest-78a3e.firebaseapp.com",
    projectId: "menutest-78a3e",
    storageBucket: "menutest-78a3e.firebasestorage.app",
    messagingSenderId: "386045461019",
    appId: "1:386045461019:web:2d8bccbabc976e3d3beebe",
    measurementId: "G-H4LWE65HY8"
};

let app = null;
let auth = null;
let db = null;
let isFirebaseReady = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = Boolean(app && auth && db);
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { app, auth, db, isFirebaseReady };
