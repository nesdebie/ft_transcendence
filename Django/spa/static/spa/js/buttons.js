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
    
    if (event.target.id === 'register-form') {
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

    let target = event.target;

    while (target && target.tagName !== 'BUTTON') {
        target = target.parentElement;
    }

    if (!target) {
        return;
    }

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
    
        // Ouvrir l'authentification 42 dans un nouvel onglet
        const authWindow = window.open('/users_api/login_42/', '_blank'); 
    
        // Vérifier localStorage pour récupérer les informations
        const checkLocalStorage = setInterval(() => {
            const storedUserInfo = localStorage.getItem('user_info');
            if (storedUserInfo) {    
                const userInfo = JSON.parse(storedUserInfo);
                document.getElementById('register-username').value = userInfo.username;
                document.getElementById('register-email').value = userInfo.email;
                document.getElementById('register-nickname').value = userInfo.nickname;
    
                localStorage.removeItem('user_info'); // Nettoyer après utilisation
                clearInterval(checkLocalStorage); // Arrêter de vérifier

                /********************* */
                triggerFormCheck() ; // used to see if we can detect changes with use of 42 AUTH
                /********************* */
            }
        }, 500);
    
        // Arrêter de vérifier localStorage après 10 secondes si rien n'est trouvé
        setTimeout(() => {
            clearInterval(checkLocalStorage);
            localStorage.removeItem('user_info'); // Suppression finale des données sensibles
        }, 10000);
    }
});


/**  try to detect input */
/**** donc j'ai ajouté les fonctions ci dessous pour détecter si les champs du registre à part la photo de profile sont bien remplis, cette fonction de 
 * vérification est appellé après l'authentification 42 
 */

document.body.addEventListener('input', function(event) {
    handleInputEvent(event);
});

document.body.addEventListener('change', function(event) {
    handleInputEvent(event);
});

function handleInputEvent(event) {
    const target = event.target;

    const fieldsToCheck = {
        'register-username': 'Username',
        'register-password': 'Password',
        'register-password2': 'Password confirmation',
        'register-nickname': 'Nickname',
        'register-email': 'Email'
    };

    // Appel correct à checkAllFieldsFilled
    checkAllFieldsFilled(fieldsToCheck);
}

// Fonction à appeler manuellement après l'insertion automatique par l'API 42
function triggerFormCheck() {
    const formFields = [
        { id: 'register-username', label: 'Username' },
        { id: 'register-password', label: 'Password' },
        { id: 'register-password2', label: 'Password confirmation' },
        { id: 'register-nickname', label: 'Nickname' },
        { id: 'register-email', label: 'Email' }
    ];

    // Appel correct à checkAllFieldsFilled
    checkAllFieldsFilled(formFields.reduce((acc, field) => {
        acc[field.id] = field.label;
        return acc;
    }, {}));

}

function checkAllFieldsFilled(fieldsToCheck) {
    let allFilled = true;

    for (let id in fieldsToCheck) {
        const field = document.getElementById(id);
        if (field && field.value.trim() === "") {
            allFilled = false;
            break;
        }
    }

    const twoFASection = document.getElementById('2fa-section');
    const registerWith42Button = document.getElementById('register-with-42');

    if (allFilled) {
        // Affiche un message ou effectue une action
        // Rendre visible la case à cocher 2FA
        if (twoFASection) {
            twoFASection.style.display = 'block';
        }
        // Masquer le bouton "Register with 42" si la section 2FA est visible
        if (registerWith42Button) {
            registerWith42Button.style.display = 'none';
        }

    } else {
        // Affiche un message ou effectue une action différente
        // Masquer la case à cocher 2FA
        if (twoFASection) {
            twoFASection.style.display = 'none';
        }
        // Afficher le bouton "Register with 42" si la section 2FA est masquée
        if (registerWith42Button) {
            registerWith42Button.style.display = 'block';
        }
    }
}

/********************************************* */

document.addEventListener('DOMContentLoaded', function() {

    first_connection();

});

async function first_connection() {
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated == false)
        redirectToRoute('/login');
}
