import { register, login, logout, updateSidebar, find_user, checkAuthentication } from "./auth.js";
import { redirectToRoute } from "./router.js";
import { sendFriendRequest, acceptFriendRequest, denyFriendRequest, block_user, unblock_user } from "./friend_managment.js";
import { setPassword, updateProfilePicture } from "./profile_editor.js"
$(document).ready(function() {
    $("#profile-button").click(function() {
      redirectToRoute("/profile");
    });
  
    updateSidebar();
  });
  

document.body.addEventListener('submit', function(event) { //
    if (event.target.id === 'register-form') {
        event.preventDefault();
        register(event);
    } else if (event.target.id === 'login-form') {
        event.preventDefault();
        login(event);
    } else if (event.target.id == 'find-user-form') {
        event.preventDefault();
        find_user(event);
    } else if (event.target.id == 'updateProfilePictureForm') {
        event.preventDefault();
        updateProfilePicture(event);
    }
    else if (event.target.id == 'changePasswordForm') {
        event.preventDefault();
        setPassword(event);
    }
    updateSidebar();
});

document.body.addEventListener('click', function(event) {
    let target = event.target;

    while (target && target.tagName !== 'BUTTON') {
        target = target.parentElement;
    }

    if (!target) {
        return;
    }

    if (target.id === 'logout-button') {
        logout(event);
    } else if (target.id === 'sendFriendRequestButton') {
        const username = target.getAttribute('data-username');
        console.log("sending friend request to " + username);
        sendFriendRequest(username);
    } else if (target.id === 'accept-friend-request-button') {
        const id = target.getAttribute('data-id');
        acceptFriendRequest(id);
    } else if (target.id === 'deny-friend-request-button') {
        const id = target.getAttribute('data-id');
        denyFriendRequest(id);
    } else if (target.id === 'friend-profile-button') {
        const username = target.getAttribute('data-username');
        redirectToRoute("/profile/" + username);
    } else if (target.id == 'blockUserButton') {
        const username = target.getAttribute('data-username');
        block_user(username);
    } else if (target.id == 'unblockUserButton') {
        const username = target.getAttribute('data-username');
        unblock_user(username);
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

  