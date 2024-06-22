import {register, login, logout, updateSidebar, find_user, checkAuthentication } from "./auth.js";
import { redirectToRoute } from "./router.js";
import { sendFriendRequest, acceptFriendRequest, block_user } from "./friend_managment.js"


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

    $("#profile-button").click(function(){
        redirectToRoute("/profile");
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
    else if (event.target.id == 'find-user-form') {
        event.preventDefault();
        find_user(event);
    }
    updateSidebar();
});

document.body.addEventListener('click', function(event) {
	if (event.target.id === 'logout-button') {
		logout(event);
    }
    else if (event.target.id === 'sendFriendRequestButton') {
        const username = event.target.getAttribute('data-username')
        console.log("sending friend request to " + username);
        sendFriendRequest(username);
    }
    else if (event.target.id === 'accept-friend-request-button') {
        const id = event.target.getAttribute('data-id')
        console.log('accepting friend request id: ' + id);
        acceptFriendRequest(id);
    }
    else if (event.target.id === 'deny-friend-request-button') {
        const id = event.target.getAttribute('data-id')
        console.log('denying friend request id: ' + id);
        denyFriendRequest(id);
    }
    else if (event.target.id === 'block-user-button') {
        const username = event.target.getAttribute('data-username')
        console.log('blocking: ' + username);
        block_user(username);
    }
    else if (event.target.id === 'friend-profile-button') {
        const username = event.target.getAttribute('data-username');
        console.log('clicked on the friend ' + username);
        redirectToRoute("/profile/" + username);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    first_connection();
});

async function first_connection() {
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated == false)
      redirectToRoute('/login');
}