(function(){
  // ---------- ENHANCED SONG DATABASE (with moods for AI) ----------
  const songs = [
    { id:1, name:"Ishqa Ve", artist:"Zeeshan Ali", cover:"https://i.ytimg.com/vi/j18MRhEfmPk/maxresdefault.jpg", audio:"song2.mp3", liked:false, mood:"romantic" },
    { id:2, name:"Ranjheya Ve", artist:"Zain Zohaib", cover:"https://i.ytimg.com/vi/55c6IlV7BEo/maxresdefault.jpg", audio:"song1.mp3", liked:false, mood:"romantic" },
    { id:3, name:"Faded", artist:"Alan Walker", cover:"https://i.ytimg.com/vi/60ItHLz5WEA/maxresdefault.jpg", audio:"song3.mp3", liked:false, mood:"sad" },
    { id:4, name:"Mere Mehboob", artist:"Kishore Kumar", cover:"https://img.youtube.com/vi/yIzCBU0_LyY/maxresdefault.jpg", audio:"song4.mp3", liked:false, mood:"romantic" }
  ];

  // Load likes from localStorage
  const storedLikes = JSON.parse(localStorage.getItem("sk_liked") || "[]");
  songs.forEach(song => { if (storedLikes.includes(song.id)) song.liked = true; });

  let currentIndex = 0;
  let isPlaying = false;
  const audioElem = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const currentTitle = document.getElementById("currentTitle");
  const currentArtist = document.getElementById("currentArtist");
  const currentCover = document.getElementById("currentCover");
  const progress = document.getElementById("progress");
  const progressBar = document.getElementById("progressBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeIconBtn = document.getElementById("volumeIconBtn");

  // Helper functions
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updatePlayerUI() {
    const s = songs[currentIndex];
    currentTitle.textContent = s.name;
    currentArtist.textContent = s.artist;
    currentCover.src = s.cover;
  }

  function saveLikedToLocal() {
    localStorage.setItem("sk_liked", JSON.stringify(songs.filter(s => s.liked).map(s => s.id)));
  }

  // Build grid with like buttons
  function buildGridWithLikes(container, songList) {
    if (!container) return;
    container.innerHTML = '';
    songList.forEach((song, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${song.cover}" alt="${song.name}" loading="lazy">
        <div class="info"><h3>${escapeHtml(song.name)}</h3><p>${escapeHtml(song.artist)}</p></div>
        <button class="like-btn ${song.liked ? 'liked' : ''}" data-id="${song.id}"><i class="fas fa-heart"></i></button>
      `;
      const likeButton = card.querySelector('.like-btn');
      likeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(song.id);
      });
      card.addEventListener('click', () => {
        playSong(songs.findIndex(s => s.id === song.id));
      });
      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  function toggleLike(id) {
    const song = songs.find(s => s.id === id);
    if (song) {
      song.liked = !song.liked;
      saveLikedToLocal();
      renderAllSections();
    }
  }

  function playSong(index) {
    if (index === currentIndex && !audioElem.paused) return;
    currentIndex = Math.min(Math.max(0, index), songs.length-1);
    const song = songs[currentIndex];
    audioElem.src = song.audio;
    updatePlayerUI();
    audioElem.load();
    audioElem.play().then(() => {
      isPlaying = true;
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(e => {
      console.log("Autoplay blocked, waiting for user interaction");
      isPlaying = false;
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    audioElem.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audioElem.duration);
    }, { once: true });
  }

  function togglePlay() {
    if (!songs.length) return;
    if (isPlaying) {
      audioElem.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
      isPlaying = false;
    } else {
      audioElem.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
      }).catch(() => {});
    }
  }

  function renderAllSections() {
    buildGridWithLikes(document.getElementById('homeGrid'), songs);
    const discoverGrid = document.getElementById('discoverGrid');
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || "";
    const filtered = searchVal ? songs.filter(s => s.name.toLowerCase().includes(searchVal) || s.artist.toLowerCase().includes(searchVal)) : songs;
    buildGridWithLikes(discoverGrid, filtered);
    buildGridWithLikes(document.getElementById('likedGrid'), songs.filter(s => s.liked));
  }

  // --- Touch & mouse optimized progress seek ---
  function handleProgressSeek(e) {
    const rect = progressBar.getBoundingClientRect();
    let clientX;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      e.preventDefault();
    } else {
      clientX = e.clientX;
    }
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (audioElem.duration) audioElem.currentTime = percent * audioElem.duration;
  }

  progressBar.addEventListener('mousedown', handleProgressSeek);
  progressBar.addEventListener('touchstart', handleProgressSeek);
  // drag for mouse
  let isDragging = false;
  progressBar.addEventListener('mousemove', (e) => {
    if (isDragging) handleProgressSeek(e);
  });
  progressBar.addEventListener('mouseup', () => { isDragging = false; });
  progressBar.addEventListener('mousedown', () => { isDragging = true; });
  // touch drag
  progressBar.addEventListener('touchmove', (e) => {
    handleProgressSeek(e);
  });
  progressBar.addEventListener('touchend', () => {});

  // Volume touch support
  volumeSlider.addEventListener('input', () => {
    audioElem.volume = volumeSlider.value / 100;
    volumeIconBtn.innerHTML = audioElem.volume === 0 ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
  });
  volumeIconBtn.addEventListener('click', () => {
    audioElem.muted = !audioElem.muted;
    volumeIconBtn.innerHTML = audioElem.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    if(!audioElem.muted) volumeSlider.value = audioElem.volume * 100;
  });

  // Audio events
  audioElem.addEventListener('timeupdate', () => {
    if (audioElem.duration) {
      progress.style.width = (audioElem.currentTime / audioElem.duration) * 100 + '%';
      currentTimeEl.textContent = formatTime(audioElem.currentTime);
    }
  });
  audioElem.addEventListener('ended', () => playSong((currentIndex+1) % songs.length));
  audioElem.addEventListener('error', (e) => console.warn("Audio load error, fallback"));

  // Search with debounce
  let debounceTimer;
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = e.target.value.toLowerCase();
      const filtered = songs.filter(s => s.name.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term));
      buildGridWithLikes(document.getElementById('discoverGrid'), filtered);
    }, 200);
  });

  // Navigation & sidebar
  document.querySelectorAll('#navList li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('#navList li').forEach(l=>l.classList.remove('active'));
      li.classList.add('active');
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      document.getElementById(li.dataset.tab).classList.add('active');
      if(li.dataset.tab === 'discover') renderAllSections();
      if(li.dataset.tab === 'liked') buildGridWithLikes(document.getElementById('likedGrid'), songs.filter(s=>s.liked));
      // close sidebar on mobile after click
      if(window.innerWidth <= 820) document.getElementById('sidebar').classList.remove('open');
    });
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('themeToggle').querySelector('i');
    icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
  });

  // AI Modal logic
  const aiModal = document.getElementById('aiModal');
  document.getElementById('aiBtn').addEventListener('click', () => {
    aiModal.style.display = 'flex';
    generateSmartRecommendations();
  });
  document.getElementById('closeModal').addEventListener('click', () => aiModal.style.display = 'none');
  function generateSmartRecommendations() {
    const current = songs[currentIndex];
    const similar = songs.filter(s => s.mood === current.mood && s.id !== current.id).slice(0, 3);
    const fill = similar.length ? similar : songs.slice(0,3);
    buildGridWithLikes(document.getElementById('aiSuggestions'), fill);
  }
  // Mood selection with mood mapping
  document.querySelectorAll('.mood-card').forEach(card => {
    card.addEventListener('click', () => {
      const mood = card.dataset.mood;
      let moodSongs = [];
      if (mood === 'chill') moodSongs = songs.filter(s => s.mood === 'romantic' || s.mood === 'sad');
      else if (mood === 'energy') moodSongs = songs.filter(s => s.name.includes("Ishqa") || s.artist === "Alan Walker");
      else if (mood === 'romantic') moodSongs = songs.filter(s => s.mood === 'romantic');
      else if (mood === 'sad') moodSongs = songs.filter(s => s.mood === 'sad');
      else if (mood === 'party') moodSongs = songs.filter(s => s.name.includes("Faded") || s.name.includes("Ishqa"));
      if (!moodSongs.length) moodSongs = songs.slice(0,3);
      buildGridWithLikes(document.getElementById('moodResults'), moodSongs);
    });
  });
  // Ask Grok
  document.getElementById('askSubmit').addEventListener('click', () => {
    const q = document.getElementById('askInput').value.trim();
    const respDiv = document.getElementById('aiResponse');
    if(!q) return;
    let answer = "🎧 Grok: Based on your library, ";
    if(q.includes("sad")||q.includes("emotional")) answer += "Try 'Faded' for emotional depth. 💔";
    else if(q.includes("party")) answer += "Blasting energetic tracks: Ishqa Ve & Faded! 🎉";
    else if(q.includes("romantic")) answer += "Romantic gems: Mere Mehboob, Ishqa Ve, Ranjheya Ve ❤️";
    else answer += `Explore ${songs.map(s=>s.name).join(', ')}. Enjoy the vibe!`;
    respDiv.innerHTML = `<p><strong>You:</strong> ${escapeHtml(q)}</p><p><strong>Grok AI:</strong> ${answer}</p>`;
    document.getElementById('askInput').value = '';
  });
  document.querySelectorAll('.ai-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ai-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.ai-tab-content').forEach(c=>c.classList.remove('active'));
      document.getElementById(`ai-${tab.dataset.tab}`).classList.add('active');
      if(tab.dataset.tab === 'recommend') generateSmartRecommendations();
    });
  });
  // Initial player controls
  prevBtn.addEventListener('click', () => playSong((currentIndex-1+songs.length)%songs.length));
  nextBtn.addEventListener('click', () => playSong((currentIndex+1)%songs.length));
  playBtn.addEventListener('click', togglePlay);

  audioElem.volume = 0.7;
  volumeSlider.value = 70;
  renderAllSections();
  playSong(0);
})();
