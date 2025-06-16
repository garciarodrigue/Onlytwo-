// firebase-config.js
// — carga SDKs como ES Modules y exporta las instancias que usará cualquier otro script —
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:             "AIzaSyD-kpBZZq3E9Etg0m6DZMKtnPQ0azEZudA",
  authDomain:         "onlytwo-2ca52.firebaseapp.com",
  projectId:          "onlytwo-2ca52",
  storageBucket:      "onlytwo-2ca52.appspot.com",      // ← dominio correcto de Storage
  messagingSenderId:  "1077612765605",
  appId:              "1:1077612765605:web:d7befb5b2d8a8d433cc84c",
  measurementId:      "G-H3BFMF6MB2"
};

// Inicializa Firebase
const app  = initializeApp(firebaseConfig);

// Exporta servicios que usarán otros módulos
const db         = getFirestore(app);
const auth       = getAuth(app);
const provider   = new GoogleAuthProvider();

export {
  db,
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
};
