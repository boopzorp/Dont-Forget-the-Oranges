
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "grocerease-i6os2",
  appId: "1:463813304850:web:a7eea631f87866a79e6ecb",
  storageBucket: "grocerease-i6os2.firebasestorage.app",
  apiKey: "AIzaSyD2TPShn9TzdsWpvuFLLjj6PrtARH6GzoA",
  authDomain: "grocerease-i6os2.firebaseapp.com",
  messagingSenderId: "463813304850",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
