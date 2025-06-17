// firebase-config.js (modular, CDN 9.23.0, full funcional)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuración de tu proyecto (CORREGIDA)
const firebaseConfig = {
  apiKey:             "AIzaSyD-kpBZZq3E9Etg0m6DZMKtnPQ0azEZudA",
  authDomain:         "onlytwo-2ca52.firebaseapp.com",
  projectId:          "onlytwo-2ca52",
  storageBucket:      "onlytwo-2ca52.appspot.com", // corregido aquí
  messagingSenderId:  "1077612765605",
  appId:              "1:1077612765605:web:d7befb5b2d8a8d433cc84c",
  measurementId:      "G-H3BFMF6MB2"
};

// Inicializar Firebase
const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();
const db       = getFirestore(app);

// Exponer para uso externo
export {
  app,
  auth,
  provider,
  db,
  signInWithPopup,
  onAuthStateChanged
};
