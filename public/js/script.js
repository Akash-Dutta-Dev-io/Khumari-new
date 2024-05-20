document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.querySelector('.previous');
    const playBtn = document.querySelector('.play-pause');
    const nextBtn = document.querySelector('.next');
    const songName = document.querySelector('.song-name');
    const playPauseIcon = document.querySelector('#play-pause-icon');
    const playlist = document.getElementById('playlist');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');

    let songs = [];
    let current = 0;
    let currentSong = null;

    const getPage = () => {
        const page = window.location.pathname.split('/').pop().split('.').shift();
        return page === '' ? 'home' : page;
    };

    const loadSongs = async () => {
        try {
            const page = getPage();
            const response = await fetch(`/api/songs?page=${page}`);
            const songFiles = await response.json();

            if (!Array.isArray(songFiles)) {
                throw new TypeError('Expected an array of song files');
            }

            songs = songFiles.map(file => ({
                ele: new Audio(`/songs/${page}/${file}`),
                audioName: file.replace('.mp3', '')
            }));

            renderPlaylist();
            setCurrentSong(0);
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    const renderPlaylist = () => {
        playlist.innerHTML = songs.map((song, index) => `
            <li data-index="${index}">
                <span class="song-title clickable">${song.audioName}</span>
            </li>
        `).join('');

        const songTitles = playlist.querySelectorAll('.song-title');
        songTitles.forEach(title => {
            title.addEventListener('click', function () {
                const index = parseInt(this.parentNode.getAttribute('data-index'));
                setCurrentSong(index);
                playPauseSong(true);
            });
        });
    };

    const setCurrentSong = (index) => {
        if (currentSong) {
            currentSong.pause();
            currentSong.currentTime = 0;
        }
        current = index;
        currentSong = songs[current].ele;
        songName.textContent = songs[current].audioName;

        currentSong.addEventListener('timeupdate', updateProgressBar);
        currentSong.addEventListener('ended', () => {
            updateSong('next');
            playPauseSong(true);
        });
    };

    const updateSong = (action) => {
        if (action === 'next') {
            current = (current + 1) % songs.length;
        } else if (action === 'prev') {
            current = (current - 1 + songs.length) % songs.length;
        }
        setCurrentSong(current);
    };

    const playPauseSong = (forcePlay = false) => {
        if (forcePlay || currentSong.paused) {
            currentSong.play();
            playPauseIcon.className = 'ph ph-pause';
        } else {
            currentSong.pause();
            playPauseIcon.className = 'ph ph-play';
        }
    };

    const updateProgressBar = () => {
        const progressPercent = (currentSong.currentTime / currentSong.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    };

    progressContainer.addEventListener('click', (e) => {
        const progressBarWidth = progressContainer.offsetWidth;
        const clickPositionX = e.offsetX;
        const seekPercentage = clickPositionX / progressBarWidth;
        currentSong.currentTime = currentSong.duration * seekPercentage;
    });

    playBtn.addEventListener('click', () => {
        if(currentSong.play){
        playPauseSong(true)}else{
        playPauseSong()
        }
    });
    nextBtn.addEventListener('click', () => {
        updateSong('next');
        playPauseSong(true);
    });
    prevBtn.addEventListener('click', () => {
        updateSong('prev');
        playPauseSong(true);
    });

    loadSongs();
});
