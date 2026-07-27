let playlistData = [];
let currentPlaylistIndex = 0;
let currentTrackIndex = 0;

const selector = document.getElementById('playlist-selector');
const trackList = document.getElementById('track-list');
const audioPlayer = document.getElementById('audio-player');
const currentTitle = document.getElementById('current-title');

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
        `<option value="${idx}">${pl.name}</option>`
    ).join('');

    renderPlaylist(0);

    // Event Listeners
    selector.addEventListener('change', (e) => {
        currentPlaylistIndex = parseInt(e.target.value, 10);
        renderPlaylist(currentPlaylistIndex);
    });

    audioPlayer.addEventListener('ended', playNextTrack);

    // Register Media Session API Action Handlers for Mobile Lock Screen / Notification Center
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
        navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
        navigator.mediaSession.setActionHandler('previoustrack', playPrevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
    }
}

function renderPlaylist(index) {
    const playlist = playlistData[index];
    trackList.innerHTML = playlist.tracks.map((track, tIdx) => `
        <li class="track-item" onclick="playTrack(${tIdx})">
            ${tIdx + 1}. ${track.title}
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

    // Update Player & Play
    audioPlayer.src = track.file;
    currentTitle.innerText = track.title;
    audioPlayer.play().catch(err => console.log('Autoplay blocked or playback error:', err));

    // Update Native Mobile Controls
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            album: playlist.name
        });
    }
}

function playNextTrack() {
    const currentPlaylist = playlistData[currentPlaylistIndex];
    if (currentTrackIndex + 1 < currentPlaylist.tracks.length) {
        playTrack(currentTrackIndex + 1);
    } else {
        // Loop back to start of playlist
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