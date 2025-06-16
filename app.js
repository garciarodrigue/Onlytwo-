// app.js
import { db, auth, provider, signInWithPopup, onAuthStateChanged } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

let user = null;
let data = { champion: {}, challenger: {}, graveyard: [] };
const usersVoted = { champion: [], challenger: [] };

// DOM refs
const elChampionVideo = document.getElementById('championVideo');
const elChampionTitle = document.getElementById('championTitle');
const elChampionStats = document.getElementById('championStats');
const elBtnChampion = document.getElementById('btnChampion');

const elChallengerVideo = document.getElementById('challengerVideo');
const elChallengerTitle = document.getElementById('challengerTitle');
const elChallengerStats = document.getElementById('challengerStats');
const elBtnChallenger = document.getElementById('btnChallenger');

const elGraveyard = document.getElementById('graveyard');
const elUploadForm = document.getElementById('uploadForm');

// Cargar datos desde Firebase
async function fetchData() {
  const docSnap = await getDoc(doc(db, "arena", "battle"));
  if (docSnap.exists()) {
    data = docSnap.data();
    updateUI();
  }
}

// Actualiza la UI
function updateUI() {
  // Campeón
  elChampionVideo.src = data.champion.url;
  elChampionTitle.textContent = data.champion.title;
  elChampionStats.textContent = `${data.champion.votes} impulsos · ${data.champion.wins} coronas`;

  // Retador
  elChallengerVideo.src = data.challenger.url;
  elChallengerTitle.textContent = data.challenger.title;
  elChallengerStats.textContent = `${data.challenger.votes} impulsos`;

  // Cementerio
  elGraveyard.innerHTML = "";
  data.graveyard.forEach(v => {
    const card = document.createElement("div");
    card.className = "bg-gray-900 border border-gray-700 p-2 rounded";
    card.innerHTML = `<iframe src="${v.url}" class="w-full h-24" allowfullscreen muted></iframe>
                      <p class="text-xs text-center mt-1">${v.title} – ${v.date}</p>`;
    elGraveyard.appendChild(card);
  });
}

// Impulsar video
async function vote(type) {
  if (!user) return alert("Debes iniciar sesión para impulsar");
  const votedList = data[`voted_${type}`] || [];

  if (votedList.includes(user.uid)) {
    return alert("Ya impulsaste a este video");
  }

  data[type].votes++;
  data[`voted_${type}`] = [...votedList, user.uid];

  await updateDoc(doc(db, "arena", "battle"), {
    [type]: data[type],
    [`voted_${type}`]: arrayUnion(user.uid)
  });

  updateUI();
}

// Finalización automática (Domingo 12pm UTC)
function checkBattleReset() {
  const now = new Date();
  const isSunday = now.getUTCDay() === 0;
  const isMidday = now.getUTCHours() === 12;

  if (isSunday && isMidday) {
    finalizeBattle();
  }
}

async function finalizeBattle() {
  const champWins = data.challenger.votes <= data.champion.votes;
  const nowDate = new Date().toLocaleDateString();

  if (champWins) {
    data.champion.wins++;
    data.graveyard.push({ ...data.challenger, date: nowDate });
  } else {
    data.graveyard.push({ ...data.champion, date: nowDate });
    data.challenger.wins = (data.champion.wins || 0) + 1;
    data.champion = { ...data.challenger };
  }

  // Nuevo retador desde la cola
  const queueSnap = await getDoc(doc(db, "arena", "queue"));
  let queue = queueSnap.exists() ? queueSnap.data().list : [];
  const nextChallenger = queue.shift();

  data.challenger = { ...nextChallenger, votes: 0 };
  data.champion.votes = 0;
  data.challenger.votes = 0;

  await setDoc(doc(db, "arena", "battle"), {
    ...data,
    voted_champion: [],
    voted_challenger: []
  });
}

// Subir nuevo postulante
if (elUploadForm) {
  elUploadForm.addEventListener("submit", async e => {
    e.preventDefault();
    const title = e.target.elements.title.value.trim();
    const url = e.target.elements.url.value.trim();

    if (!title || !url) return alert("Campos vacíos");

    await addDoc(collection(db, "postulants"), {
      title,
      url,
      created: serverTimestamp()
    });

    e.target.reset();
    alert("Video enviado correctamente a la cola del Coliseo.");
  });
}

// Iniciar sesión
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
    document.getElementById('loginSection').style.display = 'none';
  } catch (err) {
    console.error("Auth error", err);
  }
});

elBtnChampion.addEventListener("click", () => vote("champion"));
elBtnChallenger.addEventListener("click", () => vote("challenger"));

// Inicializar
onAuthStateChanged(auth, currentUser => {
  user = currentUser;
  fetchData();
  setInterval(checkBattleReset, 60000); // Checa cada minuto
});
