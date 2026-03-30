// Songs Data
const songs = [
  {
    id: 1,
    name: "Ranjheya Ve",
    artist: "Zain Zohaib",
    cover: "https://i.ytimg.com/vi/55c6IlV7BEo/maxresdefault.jpg",
    videoId: "55c6IlV7BEo",
    duration: "4:12"
  },
  {
    id: 2,
    name: "Ishqa Ve",
    artist: "Zeeshan Ali",
    cover: "https://i.ytimg.com/vi/j18MRhEfmPk/maxresdefault.jpg",
    videoId: "j18MRhEfmPk",
    duration: "3:28"
  }
];

let currentIndex = 0;
let isPlaying = false;

// DOM Elements
const playBtn = document.getElementById("play");
const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentCover = document.getElementById("currentCover");
const progress = document.getElementById("progress");
const songListContainer = document.getElementById("songList");

// Load Song List with Cards
function loadSongList() {
  songListContainer.innerHTML = "";

  songs.forEach((song, index) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
      <img src="${song.cover}" alt="${song.name}">
      <div class="play-overlay">
        <i class="fas fa-play" style="font-size: 24px; color: black;"></i>
      </div>
      <div class="song-info">
        <h3>${song.name}</h3>
        <p>${song.artist}</p>
      </div>
    `;

    card.addEventListener("click", () => playSong(index));
    songListContainer.appendChild(card);
  });
}

// Play Selected Song
function playSong(index) {
  currentIndex = index;
  const song = songs[index];

  // Update Player UI
  currentTitle.textContent = song.name;
  currentArtist.textContent = song.artist;
  currentCover.src = song.cover;

  // Hide all iframes and show only current one
  document.querySelectorAll('iframe').forEach(iframe => {
    iframe.style.display = 'none';
  });

  const activePlayer = document.getElementById(`player${song.id}`);
  activePlayer.style.display = 'block';
  activePlayer.src = `https://www.youtube.com/embed/${song.videoId}?autoplay=1&controls=0`;

  isPlaying = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';

  // Simulate Progress Bar
  progress.style.width = "0%";
  let progressWidth = 0;

  const progressInterval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(progressInterval);
      return;
    }
    progressWidth += 1.8;
    if (progressWidth >= 100) progressWidth = 100;
    progress.style.width = progressWidth + "%";
  }, 900);
}

// Toggle Play / Pause
playBtn.addEventListener("click", () => {
  if (isPlaying) {
    // Pause
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
    });
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    // Play
    const song = songs[currentIndex];
    const activePlayer = document.getElementById(`player${song.id}`);
    activePlayer.src = `https://www.youtube.com/embed/${song.videoId}?autoplay=1&controls=0`;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
});

// Next Button
document.getElementById("next").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % songs.length;
  playSong(currentIndex);
});

// Previous Button
document.getElementById("prev").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
});

// Initialize the App
loadSongList();
playSong(1);   // Ishqa Ve से शुरू होगा