import {register, login, logout, updateSidebar, fetchUserData} from "./auth.js";
import { redirectToRoute } from "./router.js";

$(document).ready(function(){
    const audio_night = document.getElementById('nightCityModeMusic');
    const audio_day = document.getElementById('dayModeMusic');
    $("#nightCityModeBtn").click(function(){
        $("body").toggleClass("night-city-mode");
        console.log("Night city mode toggled. Current state:", $("body").hasClass("night-city-mode"));

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
    });

    const hoverSound = document.getElementById('hover_day');
    const clickSound = document.getElementById('click_day');

    // Attach hover and click event listeners to links and buttons
    $('.nav-link, .nav-button').hover(function() {
            console.log("hover");
            hoverSound.currentTime = 0;
            hoverSound.play().catch(error => {
                console.error('Error playing sound:', error);
            });
    });
    $('.nav-link, .nav-button').click(function() {
        console.log("clic");
        clickSound.currentTime = 0;
        clickSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    });
    
    updateSidebar();
});


document.body.addEventListener('submit', function(event) {
	if (event.target.id === 'register-form') {
		event.preventDefault();
		register(event); }
	else if (event.target.id === 'login-form'){
		event.preventDefault();
		login(event);}
    updateSidebar();
});

document.body.addEventListener('click', function(event) {
	if (event.target.id === 'logout-button') {
		logout(event);
    }
});


function handleProfileButtonClick(event) {
    event.preventDefault();
    username = fetchUserData(username);
    const route = '/profile/' + username;
    redirectToRoute(route);
}

export {handleProfileButtonClick};