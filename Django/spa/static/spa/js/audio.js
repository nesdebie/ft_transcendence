// Function to apply night city mode
function applyNightCityMode() {
    document.body.classList.add("cyberpunk");
    document.querySelector('.cp_animations').style.display = 'flex';

    // Handle btn btn-dark
    document.querySelectorAll(".btn.btn-dark").forEach(function(element) {
        if (!element.getAttribute("data-original-class")) {
            element.setAttribute("data-original-class", element.getAttribute("class")); // Save the original class as a custom attribute
        }
        element.classList.remove("btn", "btn-dark");
        element.classList.add("cyberpunk"); // Change to cyberpunk
    });

    // Handle btn btn-light
    document.querySelectorAll(".btn.btn-light").forEach(function(element) {
        if (!element.getAttribute("data-original-class")) {
            element.setAttribute("data-original-class", element.getAttribute("class")); // Save the original class as a custom attribute
        }
        element.classList.remove("btn", "btn-light");
        element.classList.add("cyberpunk", "purple"); // Change to cyberpunk blue
    });
}

// Function to remove night city mode
function removeNightCityMode() {
    document.body.classList.remove("cyberpunk");
    document.querySelector('.cp_animations').style.display = 'none';

    // Restore original class for .cyberpunk elements
    document.querySelectorAll(".cyberpunk").forEach(function(element) {
        var originalClass = element.getAttribute("data-original-class"); // Retrieve the original class
        if (originalClass) {
            element.setAttribute("class", originalClass); // Restore the original class
            element.removeAttribute("data-original-class");
        }
    });

    // Restore original class for .cyberpunk.blue elements
    document.querySelectorAll(".cyberpunk.purple").forEach(function(element) {
        var originalClass = element.getAttribute("data-original-class"); // Retrieve the original class
        if (originalClass) {
            element.setAttribute("class", originalClass); // Restore the original class
            element.removeAttribute("data-original-class");
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const audio_night = document.getElementById('nightCityModeMusic');
    const audio_day = document.getElementById('dayModeMusic');
    const audioButton = document.getElementById('audioButton');
    let audioPlaying = false; // Flag to track audio state
    let currentAudio = null; // Track the currently playing audio

    // Function to play the correct audio based on the mode
    function playAudioBasedOnMode() {
        if (document.body.classList.contains("cyberpunk")) {
            audio_day.pause();
            audio_day.currentTime = 0;
            currentAudio = audio_night;
        } else {
            audio_night.pause();
            audio_night.currentTime = 0;
            currentAudio = audio_day;
        }
        currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        audioPlaying = true;
    }

    // Function to toggle audio playback
    function toggleAudio() {
        if (audioPlaying) {
            currentAudio.pause();
            audioPlaying = false;
        } else {
            playAudioBasedOnMode();
        }
    }

    let amongUsAudio = false;
    // Event listener for control button click
    audioButton.addEventListener('click', function() {
        toggleAudio();
        amongUsAudio = true;
    });


    document.querySelector("#nightCityModeBtn").addEventListener('click', function() {
        if (document.body.classList.contains("cyberpunk")) {
            removeNightCityMode();
            localStorage.setItem('cyberpunk', 'false');
        } else {
            applyNightCityMode();
            localStorage.setItem('cyberpunk', 'true');
        }

        if (audioPlaying) {
            playAudioBasedOnMode(); // Switch to the correct audio while keeping it playing
        }
    });

    // Get the audio elements for day and night
    const hoverDayAudio = document.getElementById('hover_day');
    const clickDayAudio = document.getElementById('click_day');
    const hoverNightAudio = document.getElementById('hover_night');
    const clickNightAudio = document.getElementById('click_night');

    // Get all <a> elements
    const elements = document.querySelectorAll('a');

    // Add event listeners to each element
    elements.forEach(function(element) {
        element.addEventListener('mouseover', function() {
            if (!amongUsAudio)
                return;
            if (document.body.classList.contains("cyberpunk")) {
                hoverNightAudio.play();
            } else {
                hoverDayAudio.play();
            }
        });

        element.addEventListener('click', function() {
            if (!amongUsAudio)
                return;
            if (document.body.classList.contains("cyberpunk")) {
                clickNightAudio.play();
            } else {
                clickDayAudio.play();
            }
        });
    });
});

// Export the functions
export { applyNightCityMode, removeNightCityMode };
