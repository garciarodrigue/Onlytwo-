// upload.js – lógica de autenticación + envío del combatiente
import {
  db,
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Referencias al DOM
const loginBtn       = document.getElementById("loginBtn");
const loginSection   = document.getElementById("loginSection");
const uploadSection  = document.getElementById("uploadSection");
const uploadForm     = document.getElementById("uploadForm");
const uploadMessage  = document.getElementById("uploadMessage");

// Iniciar sesión con Google
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Error de autenticación:", err);
    alert("No se pudo iniciar sesión.");
  }
});

// Escucha cambios de sesión para mostrar/ocultar formulario
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario logueado → mostrar formulario
    loginSection.style.display  = "none";
    uploadSection.classList.remove("hidden");
  } else {
    // No logueado → ocultar formulario
    loginSection.style.display  = "block";
    uploadSection.classList.add("hidden");
  }
});

// Enviar nuevo combatiente
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const url   = document.getElementById("url").value.trim();

  if (!title || !url) {
    return alert("Completa los campos requeridos.");
  }

  try {
    await addDoc(collection(db, "postulants"), {
      title,
      url,
      impulses: 0,
      status: "pending",
      timestamp: serverTimestamp(),
      submitted_by: auth.currentUser.uid
    });

    uploadMessage.textContent = "¡Combatiente enviado con éxito!";
    uploadMessage.classList.remove("hidden");
    uploadForm.reset();
    setTimeout(() => uploadMessage.classList.add("hidden"), 4000);
  } catch (err) {
    console.error("Error al guardar:", err);
    alert("Ocurrió un error al enviar el combatiente.");
  }
});
