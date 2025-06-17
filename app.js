import { db, auth, provider, signInWithPopup, onAuthStateChanged } from './firebase-config.js';
import {
  doc, getDoc, updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// === Referencias DOM ===
const elTronoVideo   = document.getElementById('tronoVideo');
const elTronoTitle   = document.getElementById('tronoTitle');
const elTronoStats   = document.getElementById('tronoStats');
const elBtnTrono     = document.getElementById('btnTrono');

const elRetVideo     = document.getElementById('retadorVideo');
const elRetTitle     = document.getElementById('retadorTitle');
const elRetStats     = document.getElementById('retadorStats');
const elBtnRetador   = document.getElementById('btnRetador');

const elGraveyard    = document.getElementById('graveyard');
const loginBtn       = document.getElementById('loginBtn');

let user = null;
let data = {
  champion: { title: '', url: '', votes: 0, wins: 0 },
  challenger: { title: '', url: '', votes: 0 },
  graveyard: [],
  voted_champion: [],
  voted_challenger: []
};

// === Login ===
loginBtn.onclick = () => signInWithPopup(auth, provider);
onAuthStateChanged(auth, u => {
  user = u;
  fetchBattle();
});

// === Obtener batalla ===
async function fetchBattle() {
  const ref = doc(db, 'arena', 'battle');
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.warn('⚠️ Documento arena/battle no encontrado');
    return;
  }

  data = snap.data();
  renderArena();
}

// === Render de UI ===
function renderArena() {
  // Trono
  elTronoVideo.src = data.champion.url;
  elTronoTitle.textContent = data.champion.title;
  elTronoStats.textContent = `${data.champion.votes} impulsos · ${data.champion.wins} coronas`;

  // Retador
  elRetVideo.src = data.challenger.url;
  elRetTitle.textContent = data.challenger.title;
  elRetStats.textContent = `${data.challenger.votes} impulsos`;

  // Cementerio
  elGraveyard.innerHTML = '';
  data.graveyard.forEach(v => {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 p-2 rounded';
    div.innerHTML = `
      <iframe src="${v.url}" class="w-full h-24" allowfullscreen muted></iframe>
      <p class="text-xs text-center mt-1">${v.title} – ${v.date || '???'}</p>
    `;
    elGraveyard.appendChild(div);
  });
}

// === Votar ===
async function vote(side) {
  if (!user) return alert('Debes iniciar sesión para votar');

  const votedKey = `voted_${side}`;
  const alreadyVoted = data[votedKey]?.includes(user.uid);

  if (alreadyVoted) return alert('Ya votaste por este combatiente');

  data[side].votes++;
  data[votedKey] = [...(data[votedKey] || []), user.uid];

  await updateDoc(doc(db, 'arena', 'battle'), {
    [side]: data[side],
    [votedKey]: arrayUnion(user.uid)
  });

  renderArena();
}

// === Listeners de botones ===
elBtnTrono.onclick   = () => vote('champion');
elBtnRetador.onclick = () => vote('challenger');
