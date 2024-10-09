import { register, login, logout, updateSidebar, find_user, checkAuthentication, verifyOtp, change_nickname, handleErrors } from "./auth.js";
import { redirectToRoute } from "./router.js";
import { sendFriendRequest, removeFriendRequest, acceptFriendRequest, denyFriendRequest, removeFriend, block_user, unblock_user } from "./friend_managment.js";
import { updateProfilePicture, setPassword } from "./profile_editor.js";
import { getCookie } from "./utils.js"
import { createTournament, join_tournament_game, resgign_tournament_match } from "./tournament.js";
import { startMatchmaking, stopMatchmaking } from "./matchmaking.js";

$(document).ready(function() {
    $("#profile-button").click(function() {
      redirectToRoute("/profile");
    });
  
    updateSidebar();
  });
  

document.body.addEventListener('submit', async function(event) {
    if (event.target.id === 'register-form') {
        event.preventDefault();
        try {
            await register(event);
        } catch (error) {
            console.error('Error during registration:', error);
        }
    } else if (event.target.id === 'login-form') {
        event.preventDefault();
        try {
            await login(event);
        } catch (error) {
            console.error('Error during login:', error);
        }
    } else if (event.target.id == 'find-user-form') {
        event.preventDefault();
        try {
            await find_user(event);
        } catch (error) {
            console.error('Error during find user:', error);
        }
    } else if (event.target.id == 'updateProfilePictureForm') {
        event.preventDefault();
        try {
            await updateProfilePicture(event);
        } catch (error) {
            console.error('Error updating profile picture:', error);
            alert('Error updating profile picture.');
        }
    } else if (event.target.id == 'changePasswordForm') {
        event.preventDefault();
        try {
            await setPassword(event);
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Error changing password.');
        }
    } else if (event.target.id == "nickname_change_form") {
        event.preventDefault();
        try {
            await change_nickname(event);
        } catch (error) {
            console.error('Error during nickname change:', error);
        }
    }
    if (event.target.id !== 'login-form') {
        updateSidebar();
    } 
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
    } else if (target.id == 'matchmaking-btn') {
        console.log("starting matchmaking");
        const game_type = target.getAttribute('data-game_type')
        const matchmakingId = target.getAttribute('data-matchmaking-id'); // Assuming you store matchmaking ID in the button

        if (target.textContent === 'Find a Match') {
            console.log("starting matchmaking");
            startMatchmaking(game_type, target); // Pass the button to change its text
        } else {
            console.log("stopping matchmaking");
            stopMatchmaking(matchmakingId, target); // Call the stop function
        }
    } else if (target.id == 'create-tournament-btn') {
        createTournament();
    } else if (target.id == 'join-tournament-game') {
        const username = target.getAttribute('data-currentUser');
        const tournamentGameData = JSON.parse(target.getAttribute('data-tournament-game'));
        console.log('button info:',username,tournamentGameData);
        join_tournament_game(username, tournamentGameData);
    }  else if (target.id == 'resign-tournament-game'){
        const tournamentGameData = JSON.parse(target.getAttribute('data-tournament-game'));
        console.log('give up the game', tournamentGameData)
        resgign_tournament_match(tournamentGameData);
    } else if (target.id == 'register-with-42') {
        // Gestion de l'authentification 42 dans un nouvel onglet
        event.preventDefault();
    
        // Ouvrir l'authentification 42 dans un nouvel onglet
        const authWindow = window.open('/users_api/login_42/', '_blank'); 
    
        // Vérifier localStorage pour récupérer les informations
        const checkLocalStorage = setInterval(() => {
            const storedUserInfo = localStorage.getItem('user_info');
            if (storedUserInfo) {    
                const userInfo = JSON.parse(storedUserInfo);
                const usernameField = document.getElementById('register-username');
                const emailField = document.getElementById('register-email');
                const nicknameField = document.getElementById('register-nickname');
                const passwordField = document.getElementById('register-password');
                const password2Field = document.getElementById('register-password2');
                
                if (usernameField) usernameField.value = userInfo.username;
                if (emailField) emailField.value = userInfo.email;
                if (nicknameField) nicknameField.value = userInfo.nickname;
                if (passwordField) passwordField.value = userInfo.password;
                if (password2Field) password2Field.value = userInfo.password;

                // set password
                // Remplir les champs de mot de passe avec le mot de passe généré
                document.getElementById('register-password').value = userInfo.password;
                document.getElementById('register-password2').value = userInfo.password;
                //document.getElementById('register-image').value = userInfo.profile_image

                // Télécharge l'image de profil et la convertit en PNG
                if (userInfo.profile_image) {
                    fetch(userInfo.profile_image)
                        .then(response => response.blob())
                        .then(blob => {
                            const img = document.createElement('img');
                            img.src = URL.createObjectURL(blob);

                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);

                                canvas.toBlob((blob) => {
                                    const file = new File([blob], "profile.png", { type: "image/png" });
                                    const dataTransfer = new DataTransfer();
                                    dataTransfer.items.add(file);
                                    document.getElementById('register-image').files = dataTransfer.files;
                                }, 'image/png');
                            };
                        })
                        .catch(error => console.error('Error fetching image:', error));
                }
    
                localStorage.removeItem('user_info'); // Nettoyer après utilisation
                clearInterval(checkLocalStorage); // Arrêter de vérifier

                /********************* */
                triggerFormCheck() ; // used to see if we can detect changes with use of 42 AUTH
                /********************* */

                /***************************************/
                // Cacher les champs après remplissage
                hideUserInfoFields();
                // Afficher le message de bienvenue
                //showWelcomeMessage(userInfo.username);
                showWelcomeMessage(userInfo.username, userInfo.profile_image);
                /***************************************/
            }
        }, 500);
    
        // Arrêter de vérifier localStorage après 10 secondes si rien n'est trouvé
        setTimeout(() => {
            clearInterval(checkLocalStorage);
            localStorage.removeItem('user_info'); // Suppression finale des données sensibles
        }, 10000);
    }
});

/************** login with 42 AUTH login-with-42 */
export async function login_user_after_otp(username) {
    try {
        // Créer un objet FormData pour envoyer les données
        const formData = new FormData();
        formData.append('username', username);

        // Appel à l'endpoint pour login l'utilisateur
        const response = await fetch('/users_api/login_user/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message); // message de succès
            await redirectToRoute('/');
            updateSidebar();
            return true; // Indique que le login a réussi
        } else {
            //console.error('Error during login:', response.statusText);
            return false; // Indique que le login a échoué
        }
    } catch (error) {
        //console.error('Error during login:', error);
        return false;
    }
}

function hideUsernameAndPassword() {
    const fieldsToHide = [
        'username-container',
        'password-container',  
        'login_button'
    ];

    fieldsToHide.forEach(function(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none'; // Hide the container of the field
        }
    });

    // Ensure the error message span remains visible
    const errorMessage = document.getElementById('login-error');
    if (errorMessage) {
        errorMessage.style.display = 'block'; // Show the error message if needed
    }
}
document.body.addEventListener('click', async function(event) {
    let target = event.target;

    if (target.id === 'login-with-42') {
        
        hideUsernameAndPassword();

        event.preventDefault();

        const authWindow = window.open('/users_api/login_42/', '_blank'); 

        let user_name;
        const checkLocalStorage = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const storedUserInfo = localStorage.getItem('user_info');
                // jwt 
                const jwtToken = localStorage.getItem('jwt_token');

                if (storedUserInfo && jwtToken) {
                    const userInfo = JSON.parse(storedUserInfo);
                    console.log(userInfo);
                    user_name = userInfo.username;
                    localStorage.removeItem('user_info');
                    clearInterval(interval);
                    resolve({ user_name, jwtToken });
                }
            }, 500);

            setTimeout(() => {
                clearInterval(interval);
                localStorage.removeItem('user_info');
                reject('No user info found');
            }, 10000);
        });

        try {
            const { user_name, jwtToken } = await checkLocalStorage;
            console.log("Username retrieved:", user_name);
            console.log("JWT Token:", jwtToken)

            const formData = new FormData();
            formData.append('username', user_name);

            const response = await fetch('/users_api/find_user_for_login_with_username/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user_exists) {
                    if (data.two_factor_enabled) {
                        const otpFormContainer = document.getElementById('otp-form-container');
                        otpFormContainer.style.display = 'block';

                        const otpForm = document.getElementById('otp-form');
                        otpForm.addEventListener('submit', async function(event) {
                            event.preventDefault();
                            const result = await verifyOtp(user_name);

                            if (result == true) {
                                const loginSuccess = await login_user_after_otp(user_name);
                                if (loginSuccess) {
                                    console.log("User logged in successfully after OTP verification.");
                                    return true;
                                } else {
                                    console.log("Failed to log in user after OTP verification.");
                                    return false;
                                }
                            } else {
                                console.log("OTP verification failed");
                            }
                        });
                    } else {
                        console.log("Two-factor authentication is not enabled.");
                        await redirectToRoute('/');
                        updateSidebar();
                    }
                } else {
                    console.log("User does not exist.");
                    await redirectToRoute('/login');
                }
            } else {
                handleErrors(data);
            }
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    }
});

/******************************************************************** */

/************************* fonction pour ajouter un message et cacher les info du user */
// Fonction pour cacher les champs d'informations utilisateur
function hideUserInfoFields() {
    const fieldsToHide = [
        'register-username',
        'register-password',
        'register-password2',
        'register-nickname',
        'register-email', 
        'register-image'
    ];

    fieldsToHide.forEach(function(id) {
        const element = document.getElementById(id);
        if (element) {
            element.parentElement.style.display = 'none'; // Cacher le conteneur du champ
        }
    });
}

function showWelcomeMessage(username, profileImageUrl) {
    const form = document.getElementById('register-form');
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'alert alert-success';
    
    // Inclure la photo de profil si elle est disponible
    let profileImageHtml = '';

    if (profileImageUrl) {
        profileImageHtml = `<img src="${profileImageUrl}" alt="Profile Picture" style="max-width: 100px; border-radius: 50%; margin-right: 10px;">`;
    }

    welcomeMessage.innerHTML = `
        ${profileImageHtml}
        Welcome, ${username} ! Check the box below to enable 2FA and then click Register, or just click Register to continue.
        <br/><span id="email-error" class="error-message text-danger"></span>
    `;
    
    form.insertBefore(welcomeMessage, form.firstChild);
}

/******************************************************************************** */


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
        // if (twoFASection) {
        //     twoFASection.style.display = 'block';
        // }
        // Masquer le bouton "Register with 42" si la section 2FA est visible
        if (registerWith42Button) {
            registerWith42Button.style.display = 'none';
        }

    } else {
        // Affiche un message ou effectue une action différente
        // Masquer la case à cocher 2FA
        // if (twoFASection) {
        //     twoFASection.style.display = 'none';
        // }
        // Afficher le bouton "Register with 42" si la section 2FA est masquée
        if (registerWith42Button) {
            registerWith42Button.style.display = 'block';
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    first_connection();
});

async function first_connection() {
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated == false)
        redirectToRoute('/login');
}

