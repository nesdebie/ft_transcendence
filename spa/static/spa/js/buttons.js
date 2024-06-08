import {register, login, logout} from "./auth.js";
import { redirectToRoute } from "./router.js";

$(document).ready(function(){
    const audio = document.getElementById('nightCityModeMusic');

    $("#nightCityModeBtn").click(function(){
        $("body").toggleClass("night-city-mode");
        console.log("Night city mode toggled. Current state:", $("body").hasClass("night-city-mode"));

        if ($("body").hasClass("night-city-mode")) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    });
    $("#profile-button").click(function(){
        redirectToRoute("/profile");
    });
});

document.body.addEventListener('submit', function(event) {
	
	if (event.target.id === 'register-form') {
		event.preventDefault();
		register(event); }
	else if (event.target.id === 'login-form'){
		event.preventDefault();
		login(event);}
});

document.body.addEventListener('click', function(event) {
	if (event.target.id === 'logout-button') {
		logout(event);
    }
});