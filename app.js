//--------------------------------------------------------------------
// app.js  –  Coliseo principal (trono + retador) – versión completa
//--------------------------------------------------------------------
import {
  db, auth, provider,
  signInWithPopup, onAuthStateChanged
} from './firebase-config.js';

import {
  doc, getDoc, updateDoc, arrayUnion
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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

// Estado global
let user = null;
let data = {
  champion:  { title:'', url:'', votes:0, wins:0 },
  challenger:{ title:'', url:'', votes:0 },
  graveyard: [],
  voted_champion:   [],
  voted_challenger: []
};

//------------------------------------------------------------
// util: convierte cualquier URL de YouTube a formato embed
//------------------------------------------------------------
function toEmbed(url = '') {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/))([\w\-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

//------------------------------------------------------------
// Login Google
//------------------------------------------------------------
loginBtn.onclick = () => signInWithPopup(auth, provider);

onAuthStateChanged(auth, u => {
  user = u;
  fetchBattle();         // solo cargamos datos después de auth
});

//------------------------------------------------------------
// Leer datos de Firestore
//------------------------------------------------------------
async function fetchBattle() {
  const ref  = doc(db, 'arena', 'battle');
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.warn('⚠️  Documento arena/battle no encontrado');
    return;
  }
  data = snap.data();
  renderArena();         // pintamos la UI
}

//------------------------------------------------------------
// Renderizar UI y corregir URLs si es necesario
//------------------------------------------------------------
async function renderArena() {

  //--- Campeón ------------------------------------------------
  const champUrl = toEmbed(data.champion.url);
  elTronoVideo.src          = champUrl;
  elTronoTitle.textContent  = data.champion.title;
  elTronoStats.textContent  = `${data.champion.votes} impulsos · ${data.champion.wins} coronas`;

  // Si la URL estaba mal, la actualizamos en Firestore
  if (champUrl !== data.champion.url) {
    data.champion.url = champUrl;
    await updateDoc(doc(db, 'arena', 'battle'), { champion: data.champion });
  }

  //--- Retador ------------------------------------------------
  const retUrl  = toEmbed(data.challenger.url);
  elRetVideo.src         = retUrl;
  elRetTitle.textContent = data.challenger.title;
  elRetStats.textContent = `${data.challenger.votes} impulsos`;

  if (retUrl !== data.challenger.url) {
    data.challenger.url = retUrl;
    await updateDoc(doc(db, 'arena', 'battle'), { challenger: data.challenger });
  }

  //--- Cementerio --------------------------------------------
  elGraveyard.innerHTML = '';
  data.graveyard.forEach(v => {
    const fixedUrl = toEmbed(v.url);
    const div = document.createElement('div');
    div.className = 'bg-gray-800 p-2 rounded';

    div.innerHTML = `
      <iframe src="${fixedUrl}" class="w-full h-24" allowfullscreen></iframe>
      <p class="text-xs text-center mt-1">${v.title} – ${v.date ? v.date : 'Sin fecha'}</p>
    `;
    elGraveyard.appendChild(div);
  });

  // Habilitar / deshabilitar botones según login
  const logged = !!user;
  elBtnTrono.disabled   = !logged;
  elBtnRetador.disabled = !logged;
}

//------------------------------------------------------------
// Votar por campeón o retador
//------------------------------------------------------------
async function vote(side) {
  if (!user) return alert('Debes iniciar sesión para votar');

  const votedKey = `voted_${side}`;
  const yaVoto   = data[votedKey]?.includes(user.uid);

  if (yaVoto) return alert('Ya votaste por este combatiente');

  // Sumamos voto
  data[side].votes++;
  await updateDoc(doc(db, 'arena', 'battle'), {
    [side]: data[side],
    [votedKey]: arrayUnion(user.uid)
  });

  // Actualizamos estado local y UI
  data[votedKey] = [...(data[votedKey] || []), user.uid];
  renderArena();
}

//------------------------------------------------------------
// Listeners de botones
//------------------------------------------------------------
elBtnTrono.onclick   = () => vote('champion');
elBtnRetador.onclick = () => vote('challenger');
