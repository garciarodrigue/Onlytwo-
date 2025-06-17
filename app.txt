// app.js (IDs 100 % alineados con index.html)
import { db, auth, provider, signInWithPopup, onAuthStateChanged } from './firebase-config.js';
import {
  doc, getDoc, setDoc, updateDoc,
  arrayUnion, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let user = null;
let data = { champion: {}, challenger: {}, graveyard: [] };

// === DOM refs corregidos ===
const elTronoVideo   = document.getElementById('tronoVideo');
const elTronoTitle   = document.getElementById('tronoTitle');
const elTronoStats   = document.getElementById('tronoStats');
const elBtnTrono     = document.getElementById('btnTrono');

const elRetVideo     = document.getElementById('retadorVideo');
const elRetTitle     = document.getElementById('retadorTitle');
const elRetStats     = document.getElementById('retadorStats');
const elBtnRetador   = document.getElementById('btnRetador');

const elGraveyard    = document.getElementById('graveyard');
const elUploadForm   = document.getElementById('uploadForm');

// === Leer datos de Firestore ===
async function fetchData() {
  const snap = await getDoc(doc(db, 'arena', 'battle'));
  if (snap.exists()) {
    data = snap.data();
    updateUI();
  } else {
    console.warn('⚠️  No existe arena/battle en Firestore');
  }
}

// === Pintar UI ===
function updateUI() {
  // Campeón
  elTronoVideo.src       = data.champion.url;
  elTronoTitle.textContent = data.champion.title;
  elTronoStats.textContent = `${data.champion.votes} impulsos · ${data.champion.wins} coronas`;

  // Retador
  elRetVideo.src       = data.challenger.url;
  elRetTitle.textContent = data.challenger.title;
  elRetStats.textContent = `${data.challenger.votes} impulsos`;

  // Cementerio
  elGraveyard.innerHTML = '';
  data.graveyard.forEach(v => {
    const card = document.createElement('div');
    card.className = 'bg-gray-900 border border-gray-700 p-2 rounded';
    card.innerHTML = `
      <iframe src="${v.url}" class="w-full h-24" allowfullscreen muted></iframe>
      <p class="text-xs text-center mt-1">${v.title} – ${v.date}</p>`;
    elGraveyard.appendChild(card);
  });
}

// === Votar ===
async function vote(side) {
  if (!user) return alert('Debes iniciar sesión para impulsar');
  const votedKey = `voted_${side}`;
  const votedArr = data[votedKey] || [];
  if (votedArr.includes(user.uid)) return alert('Ya impulsaste este video');

  data[side].votes++;
  data[votedKey] = [...votedArr, user.uid];

  await updateDoc(doc(db, 'arena', 'battle'), {
    [side]: data[side],
    [votedKey]: arrayUnion(user.uid)
  });

  updateUI();
}

// Eventos de voto
elBtnTrono   .addEventListener('click', () => vote('champion'));
elBtnRetador .addEventListener('click', () => vote('challenger'));

// === Login Google ===
document.getElementById('loginBtn').addEventListener('click', () => signInWithPopup(auth, provider));

onAuthStateChanged(auth, u => {
  user = u;
  fetchData();
});

// — Resto del código (finalizar batalla, subir postulante, etc.) se mantiene igual —
