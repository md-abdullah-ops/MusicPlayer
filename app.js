let playlistData = [];
let currentPlaylistIndex = 0;
let currentTrackIndex = 0;

// Loop modes: 'playlist' | 'track'
let currentLoopMode = 'playlist'; 

const selector = document.getElementById('playlist-selector');
const trackList = document.getElementById('track-list');
const audioPlayer = document.getElementById('audio-player');
const currentTitle = document.getElementById('current-title');

const btnLoopTrack = document.getElementById('btn-loop-track');
const btnLoopPlaylist = document.getElementById('btn-loop-playlist');

// Fetch playlists.json on load
fetch('playlists.json')
    .then(res => res.json())
    .then(data => {
        playlistData = data.playlists;
        initApp();
    })
    .catch(err => console.error('Error loading playlists:', err));

function initApp() {
    // Populate Playlist Dropdown
    selector.innerHTML = playlistData.map((pl, idx) => 
        `<option value="${idx}">📁 ${pl.name}</option>`
    ).join('');

    renderPlaylist(0);

    // Dropdown Change
    selector.addEventListener('change', (e) => {
        currentPlaylistIndex = parseInt(e.target.value, 10);
        renderPlaylist(currentPlaylistIndex);
    });

    // Track ended logic
    audioPlayer.addEventListener('ended', handleTrackEnded);

    // Loop Mode Buttons
    btnLoopTrack.addEventListener('click', () => setLoopMode('track'));
    btnLoopPlaylist.addEventListener('click', () => setLoopMode('playlist'));

    // Register Mobile Media Session API
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
        navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
        navigator.mediaSession.setActionHandler('previoustrack', playPrevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
    }
}

function setLoopMode(mode) {
    currentLoopMode = mode;
    if (mode === 'track') {
        btnLoopTrack.classList.add('active');
        btnLoopPlaylist.classList.remove('active');
    } else {
        btnLoopPlaylist.classList.add('active');
        btnLoopTrack.classList.remove('active');
    }
}

function renderPlaylist(index) {
    const playlist = playlistData[index];
    trackList.innerHTML = playlist.tracks.map((track, tIdx) => `
        <li class="track-item ${tIdx === currentTrackIndex ? 'active' : ''}" onclick="playTrack(${tIdx})">
            <span>> ${tIdx + 1}.</span> ${track.title}
        </li>
    `).join('');
}

function playTrack(tIdx) {
    currentTrackIndex = tIdx;
    const playlist = playlistData[currentPlaylistIndex];
    const track = playlist.tracks[tIdx];

    // Highlight active UI track
    const items = document.querySelectorAll('.track-item');
    items.forEach(el => el.classList.remove('active'));
    if (items[tIdx]) {
        items[tIdx].classList.add('active');
    }

    // Play Audio
    audioPlayer.src = track.file;
    currentTitle.innerText = `${playlist.name} / ${track.title}`;
    audioPlayer.play().catch(err => console.log('Playback blocked:', err));

    // Update Mobile Notification / Lockscreen
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            album: playlist.name
        });
    }
}

function handleTrackEnded() {
    if (currentLoopMode === 'track') {
        // Replay current song
        playTrack(currentTrackIndex);
    } else {
        // Play Next in Playlist
        playNextTrack();
    }
}

function playNextTrack() {
    const currentPlaylist = playlistData[currentPlaylistIndex];
    if (currentTrackIndex + 1 < currentPlaylist.tracks.length) {
        playTrack(currentTrackIndex + 1);
    } else {
        // Loop back to top of playlist
        playTrack(0);
    }
}

function playPrevTrack() {
    if (currentTrackIndex - 1 >= 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        const currentPlaylist = playlistData[currentPlaylistIndex];
        playTrack(currentPlaylist.tracks.length - 1);
    }
}