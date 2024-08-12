import { register, login, logout, updateSidebar, find_user, checkAuthentication } from "./auth.js";
import { redirectToRoute } from "./router.js";
import { sendFriendRequest, removeFriendRequest, acceptFriendRequest, denyFriendRequest, removeFriend, block_user, unblock_user } from "./friend_managment.js";

$(document).ready(function() {

    $("#profile-button").click(function() {
        redirectToRoute("/profile");
    });
    
    updateSidebar();
});


document.body.addEventListener('submit', function(event) {
    
    console.log('SUBMIT');

    if (event.target.id === 'register-form') {
        console.log("REGISTER");
        event.preventDefault();
        register(event);
    } else if (event.target.id === 'login-form') {
        event.preventDefault();
        login(event);
    } else if (event.target.id == 'find-user-form') {
        event.preventDefault();
        find_user(event);
    }
    updateSidebar();
});


// 42 AUTH 
document.body.addEventListener('click', async function(event) {

    console.log("CLICK");

    let target = event.target;

    while (target && target.tagName !== 'BUTTON') {
        target = target.parentElement;
    }

    console.log('CLICK 1');

    if (!target) {
        return;
    }

    console.log('CLICK 2');

    if (target.id === 'logout-button') {
        logout(event);
    } else if (target.id === 'send-friend-request-button') {
        const username = target.getAttribute('data-username');
        console.log("sending friend request to " + username);
        sendFriendRequest(username);
    } else if (target.id === 'remove-friend-request-button') {
        const username = target.getAttribute('data-username');
        console.log("removing friend request to " + username);
        removeFriendRequest(username);
    } else if (target.id === 'accept-friend-request-button') {
        const id = target.getAttribute('data-id');
        acceptFriendRequest(id);
    } else if (target.id === 'deny-friend-request-button') {
        const id = target.getAttribute('data-id');
        denyFriendRequest(id);
    } else if (target.id === 'remove-friend-button') {
        const username = target.getAttribute('data-username');
        console.log("removing friend " + username);
        removeFriend(username);
    } else if (target.id === 'friend-profile-button') {
        const username = target.getAttribute('data-username');
        redirectToRoute("/profile/" + username);
    } else if (target.id == 'block-user-button') {
        const username = target.getAttribute('data-username');
        block_user(username);
    } else if (target.id == 'unblock-user-button') {
        const username = target.getAttribute('data-username');
        unblock_user(username);
    }  else if (target.id == 'register-with-42') {
        // Gestion de l'authentification 42 dans un nouvel onglet
        event.preventDefault();
        console.log("AUTH 42");
    
        // Ouvrir l'authentification 42 dans un nouvel onglet
        const authWindow = window.open('/users_api/login_42/', '_blank'); 
    
        // Vérifier localStorage pour récupérer les informations
        const checkLocalStorage = setInterval(() => {
            const storedUserInfo = localStorage.getItem('user_info');
            if (storedUserInfo) {
                console.log("Received data from 42 AUTH via localStorage");
    
                const userInfo = JSON.parse(storedUserInfo);
                document.getElementById('register-username').value = userInfo.username;
                document.getElementById('register-email').value = userInfo.email;
                document.getElementById('register-nickname').value = userInfo.nickname;
    
                localStorage.removeItem('user_info'); // Nettoyer après utilisation
                clearInterval(checkLocalStorage); // Arrêter de vérifier
            }
        }, 500);
    
        // Arrêter de vérifier localStorage après 10 secondes si rien n'est trouvé
        setTimeout(() => {
            clearInterval(checkLocalStorage);
            localStorage.removeItem('user_info'); // Suppression finale des données sensibles
            console.log("Les informations sensibles ont été supprimées du localStorage.");
        }, 10000);
    }


    console.log("Button has passed til here ");
});


document.addEventListener('DOMContentLoaded', function() {
    first_connection();
});

async function first_connection() {
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated == false)
        redirectToRoute('/login');
}

  