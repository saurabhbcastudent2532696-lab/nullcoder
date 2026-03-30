// script.js
// ---------- SONG DATABASE (Local MP3) ----------
const songs = [
  {
    id: 1,
    name: "Ishqa Ve",
    artist: "SINGER->Zeeshan Ali",
    cover: "https://i.ytimg.com/vi/j18MRhEfmPk/maxresdefault.jpg",
    audio: "song1.mp3",
    durationText: "0:00"
  },
  {
    id: 2,
    name: "Ranjheya Ve",
    artist: "Zain Zohaib",
    cover: "https://i.ytimg.com/vi/55c6IlV7BEo/maxresdefault.jpg",
    audio: "song2.mp3",
    durationText: "0:00"
  },
  {
    id: 3,
    name: "Alan Walker",
    artist: "Alan Walker - Faded - ",
    cover: "https://i.ytimg.com/vi/60ItHLz5WEA/maxresdefault.jpg",
    audio: "song3.mp3",
    durationText: "0:00"
  }
];

// ----- GLOBALS -----
let currentIndex = 0;
let isPlaying = false;
let audio = document.getElementById("audioPlayer");
let progressSyncInterval = null;

// DOM elements
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentCover = document.getElementById("currentCover");
const progressFill = document.getElementById("progress");
const progressBarContainer = document.getElementById("progressBar");
const currentTimeSpan = document.getElementById("currentTime");
const durationSpan = document.getElementById("duration");
const volumeSlider = document.getElementById("volumeSlider");
const volumeIconBtn = document.getElementById("volumeIcon");
const songGrid = document.getElementById("songList");

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

function highlightActiveCard() {
  document.querySelectorAll('.song-card').forEach((card, idx) => {
    card.classList.toggle('active-song-card', idx === currentIndex);
  });
}

function updatePlayerUI(index) {
  const song = songs[index];
  currentTitle.innerText = song.name;
  currentArtist.innerText = song.artist;
  currentCover.src = song.cover;
  highlightActiveCard();
}

function syncProgress() {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = `${percent}%`;
  currentTimeSpan.innerText = formatTime(audio.currentTime);
}

function startSync() {
  if (progressSyncInterval) clearInterval(progressSyncInterval);
  progressSyncInterval = setInterval(syncProgress, 200);
}

function stopSync() {
  if (progressSyncInterval) {
    clearInterval(progressSyncInterval);
    progressSyncInterval = null;
  }
}

function togglePlayPause() {
  if (isPlaying) {
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audio.play().catch(err => console.log("Play failed:", err));
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

function playSongByIndex(index, autoPlay = true) {
  currentIndex = index;
  const song = songs[currentIndex];

  updatePlayerUI(currentIndex);
  
  audio.src = song.audio;
  audio.load();

  if (autoPlay) {
    audio.play().then(() => {
      isPlaying = true;
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      startSync();
    }).catch(err => console.log("Autoplay failed:", err));
  } else {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    stopSync();
    progressFill.style.width = "0%";
    currentTimeSpan.innerText = "0:00";
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % songs.length;
  playSongByIndex(currentIndex, true);
}

function prevSong() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSongByIndex(currentIndex, true);
}

function seekTo(e) {
  const rect = progressBarContainer.getBoundingClientRect();
  let clickX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const percentage = Math.max(0, Math.min(1, clickX / rect.width));
  audio.currentTime = percentage * audio.duration;
}

function setVolumeLevel(value) {
  audio.volume = value / 100;
  if (value == 0) volumeIconBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  else if (value < 40) volumeIconBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
  else volumeIconBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
}

function buildSongList() {
  songGrid.innerHTML = "";
  songs.forEach((song, idx) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
      <img src="${song.cover}" alt="${song.name}" loading="lazy">
      <div class="play-overlay">
        <i class="fas fa-play" style="font-size: 22px; color: black;"></i>
      </div>
      <div class="song-info">
        <h3>${song.name}</h3>
        <p>${song.artist}</p>
      </div>
    `;
    card.addEventListener("click", () => playSongByIndex(idx, true));
    songGrid.appendChild(card);
  });
  highlightActiveCard();
}

// Audio Event Listeners
audio.addEventListener("timeupdate", syncProgress);

audio.addEventListener("loadedmetadata", () => {
  durationSpan.innerText = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  nextSong();
});

// Button Events
playBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
progressBarContainer.addEventListener("click", seekTo);
progressBarContainer.addEventListener("touchstart", (e) => {
  e.preventDefault();
  seekTo(e);
}, { passive: false });

volumeSlider.addEventListener("input", (e) => {
  setVolumeLevel(parseInt(e.target.value));
});

volumeIconBtn.addEventListener("click", () => {
  const currentVol = audio.volume;
  if (currentVol > 0) {
    audio.volume = 0;
    volumeSlider.value = 0;
  } else {
    audio.volume = 0.8;
    volumeSlider.value = 80;
  }
  setVolumeLevel(volumeSlider.value);
});

// Initialize
buildSongList();
volumeSlider.value = 80;
setVolumeLevel(80);

window.addEventListener('load', () => {
  playSongByIndex(0, false);
});

window.addEventListener('beforeunload', () => {
  stopSync();
  audio.pause();
});