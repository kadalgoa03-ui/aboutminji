document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playBtn = document.getElementById("play-btn");
    const playIcon = document.getElementById("play-icon");
    const progressContainer = document.getElementById("progress-container");
    const progressFill = document.getElementById("progress-fill");
    const currentTimeEl = document.getElementById("current-time");
    const durationTimeEl = document.getElementById("duration-time");
    const albumCover = document.getElementById("album-cover");

    let isPlaying = false;

    // Toggle Play/Pause
    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playIcon.textContent = "play_arrow";
            albumCover.classList.remove("playing");
        } else {
            audio.play().catch(e => console.log("Audio play failed:", e));
            playIcon.textContent = "pause";
            albumCover.classList.add("playing");
        }
        isPlaying = !isPlaying;
    }

    playBtn.addEventListener("click", togglePlay);

    // Format time from seconds to M:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update duration once metadata loads
    audio.addEventListener("loadedmetadata", () => {
        durationTimeEl.textContent = formatTime(audio.duration);
    });

    // Update progress bar as audio plays
    audio.addEventListener("timeupdate", () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    // Seek functionality
    progressContainer.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percent = clickX / width;
        
        audio.currentTime = percent * audio.duration;
        
        // If not playing, automatically start playing on seek
        if (!isPlaying) {
            togglePlay();
        }
    });

    // Handle end of audio
    audio.addEventListener("ended", () => {
        isPlaying = false;
        playIcon.textContent = "play_arrow";
        albumCover.classList.remove("playing");
        progressFill.style.width = "0%";
        audio.currentTime = 0;
    });
});
