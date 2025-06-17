// upload.js
import { db, auth, provider, signInWithPopup, onAuthStateChanged } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const loginBtn      = document.getElementById('loginBtn');
const loginSection  = document.getElementById('loginSection');
const uploadSection = document.getElementById('uploadSection');
const uploadForm    = document.getElementById('uploadForm');
const uploadMessage = document.getElementById('uploadMessage');

// === Iniciar sesión con Google ===
loginBtn.onclick = () => signInWithPopup(auth, provider);

onAuthStateChanged(auth, user => {
  if (user) {
    loginSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
  }
});

// === Subida de combatiente ===
uploadForm.onsubmit = async e => {
  e.preventDefault();

  const title = uploadForm.title.value.trim();
  const url   = uploadForm.url.value.trim();

  if (!title || !url) return alert('Completa todos los campos');

  const ytID = url.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1];
  if (!ytID) return alert('URL de YouTube inválida');

  try {
    await addDoc(collection(db, 'postulants'), {
      title,
      url: `https://www.youtube.com/embed/${ytID}`,
      created: serverTimestamp()
    });
    uploadMessage.classList.remove('hidden');
    uploadForm.reset();
  } catch (err) {
    console.error('❌ Error al subir:', err);
    alert('Error al subir combatiente.');
  }
};
