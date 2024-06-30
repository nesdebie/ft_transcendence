document.addEventListener('DOMContentLoaded', function() {
    const audio_night = document.getElementById('nightCityModeMusic');
    const audio_day = document.getElementById('dayModeMusic');
    const controlButton = document.getElementById('controlButton');
    let audioPlaying = false; // Flag to track audio state
  
    // Function to toggle audio playback
    function toggleAudio() {
      if (audioPlaying) {
        audio_night.pause();
        audio_day.pause();
        audioPlaying = false;
      } else {
        if ($("body").hasClass("night-city-mode")) {
          audio_day.pause();
          audio_day.currentTime = 0;
          audio_night.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        } else {
          audio_night.pause();
          audio_night.currentTime = 0;
          audio_day.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        }
        audioPlaying = true;
      }
    }
  
    // Event listener for control button click
    controlButton.addEventListener('click', function() {
      toggleAudio();
    });
  
    // Automatically toggle audio when switching to night-city-mode
    $("body").on("click", "#nightCityModeBtn", function() {
      $("body").toggleClass("night-city-mode");
      console.log("Night city mode toggled. Current state:", $("body").hasClass("night-city-mode"));
  
      if (audioPlaying) {
        toggleAudio();
      }
    });
  });
  

document.addEventListener('DOMContentLoaded', function() {
    // Get the audio elements for day and night
    const hoverDayAudio = document.getElementById('hover_day');
    const clickDayAudio = document.getElementById('click_day');
    const hoverNightAudio = document.getElementById('hover_night');
    const clickNightAudio = document.getElementById('click_night');

    // Get all <a> elements inside the nav
    const navLinks = document.querySelectorAll('#main-nav a');

    // Add event listeners to each nav link
    navLinks.forEach(function(link) {
        link.addEventListener('mouseover', function() {
            if ($("body").hasClass("night-city-mode")) {
                hoverNightAudio.play();
            } else {
                hoverDayAudio.play();
            }
        });

        link.addEventListener('click', function() {
            if ($("body").hasClass("night-city-mode")) {
                clickNightAudio.play();
            } else {
                clickDayAudio.play();
            }
        });
    });
});