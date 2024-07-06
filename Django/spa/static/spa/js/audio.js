document.addEventListener('DOMContentLoaded', function() {
  const audio_night = document.getElementById('nightCityModeMusic');
  const audio_day = document.getElementById('dayModeMusic');
  const audioButton = document.getElementById('audioButton');
  let audioPlaying = false; // Flag to track audio state
  let currentAudio = null; // Track the currently playing audio

  // Function to play the correct audio based on the mode
  function playAudioBasedOnMode() {
      if ($("body").hasClass("night-city-mode")) {
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

  // Event listener for control button click
  audioButton.addEventListener('click', function() {
      toggleAudio();
  });

  $("body").on("click", "#nightCityModeBtn", function() {
    $("body").toggleClass("night-city-mode");
    console.log("Night city mode toggled. Current state:", $("body").hasClass("night-city-mode"));

    // Check if night-city-mode is enabled
    if ($("body").hasClass("night-city-mode")) {
        $(".btn.btn-dark").each(function() {
            $(this).attr("data-original-class", $(this).attr("class")); // Save the original class as a custom attribute
            $(this).removeClass("btn btn-dark").addClass("cyberpunk"); // Change to cyberpunk
        });
    } else {
        $(".cyberpunk").each(function() {
            var originalClass = $(this).attr("data-original-class"); // Retrieve the original class
            $(this).attr("class", originalClass); // Restore the original class
        });
    }

    if (audioPlaying) {
        playAudioBasedOnMode(); // Switch to the correct audio while keeping it playing
    }
  });
});


document.addEventListener('DOMContentLoaded', function() {
  // Get the audio elements for day and night
  const hoverDayAudio = document.getElementById('hover_day');
  const clickDayAudio = document.getElementById('click_day');
  const hoverNightAudio = document.getElementById('hover_night');
  const clickNightAudio = document.getElementById('click_night');

  // Get all <a> and <button> elements
  const elements = document.querySelectorAll('a');

  // Add event listeners to each element
  elements.forEach(function(element) {
      element.addEventListener('mouseover', function() {
          if (document.body.classList.contains("night-city-mode")) {
              hoverNightAudio.play();
          } else {
              hoverDayAudio.play();
          }
      });

      element.addEventListener('click', function() {
          if (document.body.classList.contains("night-city-mode")) {
              clickNightAudio.play();
          } else {
              clickDayAudio.play();
          }
      });
  });
});
