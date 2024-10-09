import { getCookie } from "./utils.js"
import { redirectToRoute } from "./router.js"
import {login_user_after_otp} from "./buttons.js"


// 2FA 
async function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await fetch('/users_api/login/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const data = await response.json();
        console.log("DEBUG :");
        console.log(data);
        if (response.ok) {
            // 2FA
            if (data.two_factor_enabled) {

                // Afficher uniquement le formulaire pour entrer le code OTP
                const otpFormContainer = document.getElementById('otp-form-container');
                otpFormContainer.style.display = 'block';

                // Utilisation d'async/await pour s'assurer que la promesse est résolue avant de continuer
                const otpForm = document.getElementById('otp-form');
                otpForm.addEventListener('submit', async function(event) {
                    event.preventDefault();
                    const result = await verifyOtp(data.username);
                    if (result == true) {
                        console.log("OTP verification succeeded");
                        const loginSuccess = await login_user_after_otp(data.username);
                        if (loginSuccess) {
                            console.log("User logged in successfully after OTP verification.");
                            return true;
                        } else {
                            console.log("Failed to log in user after OTP verification.");
                            return false;
                        }
                    } else {
                        // Gérer le cas où la vérification OTP échoue
                        console.log("OTP verification failed");
                    }
                });
            } else {
                // Authentification sans 2FA
                await redirectToRoute('/');
                updateSidebar();
            }
        } else {
            await redirectToRoute('/login');
            handleErrors(data);
        }
    } catch (error) {
        console.log("error during login");
        //console.error('Error during login:', error);
    }
}



// Écouteur pour les événements de changement sur le document
document.body.addEventListener('change', async function(event) {

    let target = event.target;

    if (target.id === 'register-2fa') {
        event.preventDefault();

        if (target.checked) {
            try {
                const response = await fetch('/users_api/generate_qr_code/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    const qrCodeContainer = document.getElementById('qr-code-container');
                    const qrCodeElement = document.getElementById('qr-code');
                    qrCodeContainer.style.display = 'block';
                    qrCodeElement.innerHTML = `<img src="data:image/png;base64,${data.qr_code_base64}" alt="QR Code" width="250" height="250">`; // Adjusted size
					/********** LOCAL STORAGE FOR 2FA secret */
					// Stocker le secret dans localStorage
					localStorage.setItem('2fa_secret', data.secret);
					/********** */

                } else {
                    console.error('Error generating QR code:', data);
                }
            } catch (error) {
                console.log("error during generation QR code");
                //console.error('Error:', error);
            }
        } else {
            document.getElementById('qr-code-container').style.display = 'none';
        }
    }
});



async function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const password2 = document.getElementById('register-password2').value;
    const email = document.getElementById('register-email').value;
    const image = document.getElementById('register-image').files[0];
    const two_factor_auth = document.getElementById('register-2fa').checked;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (image && !allowedTypes.includes(image.type)) {
        alert('Profile picture must be a PNG, JPEG, or JPG file.');
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('password2', password2);
    formData.append('email', email);
    formData.append('image', image);
    formData.append('two_factor_auth', two_factor_auth ? 'on' : '');

    /*********** Vérifier si l'utilisateur est connecté via 42 AUTH ***********/
    const isConnectedWith42 = localStorage.getItem('is_connected_with_42');
    console.log("is connected with 42 == " + isConnectedWith42);
    if (isConnectedWith42 == 'true') {
        formData.append('auth_42', 'true');
        // Supprimer l'indicateur de connexion via 42 AUTH après utilisation
        localStorage.removeItem('is_connected_with_42');
    }
    /*************************************************************************/

	/*********** test local storage 2FA secret  */
    // Récupérer le secret 2FA depuis localStorage
    if (two_factor_auth) {
        const secret = localStorage.getItem('2fa_secret');
        formData.append('2fa_secret', secret);
    }
	/**************************************** */

    const response = await fetch('/users_api/register/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    });

    const data = await response.json();

    if (response.ok) {
        if (data.status === '2fa') {

            // Affiche le QR code à l'utilisateur
            const qrCodeContainer = document.getElementById('qr-code-container');
            const qrCodeElement = document.getElementById('qr-code');
            qrCodeContainer.style.display = 'block';
            qrCodeElement.innerHTML = `<img src="data:image/png;base64,${data.qr_code_base64}" alt="QR Code">`;

            // Ajoute un événement pour soumettre le code OTP
            document.getElementById('otp-form').addEventListener('submit', async function(event) {
                event.preventDefault();
                const otp = document.getElementById('otp').value;
                const verifyResponse = await verifyOtp(data.username, otp);
                if (verifyResponse) {
                    await redirectToRoute('/');
                    updateSidebar();

					/********* test local storage */
					// Supprimer le secret du localStorage après enregistrement réussi
					if (two_factor_auth) {
						localStorage.removeItem('2fa_secret');
					}
					/***************************** */

                } else {
                    alert('Invalid OTP. Please try again.');
                }
            });
        } else {
            await redirectToRoute('/');
            updateSidebar();
			/********* test local storage */
			// Supprimer le secret du localStorage après enregistrement réussi
			if (two_factor_auth) {
				localStorage.removeItem('2fa_secret');
			}
			/***************************** */
        }
    } else {
        handleErrors(data);
    }
}


async function logout() {
    const response = await fetch('/users_api/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
    });
    closeLoggingWebSocket();
    await redirectToRoute('/login');
    updateSidebar();
}

// 2FA , fonction ajouter pour vérifier OPT si le code est bien scanné et le code bien rentré 
export async function verifyOtp(username) {
    const otp = document.getElementById('otp').value;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('otp_code', otp);

    console.log("*** Verify otp");

	try {
		const response = await fetch('/users_api/verify_otp/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: formData
		});
		
        const data = await response.json();

		if (response.ok) {

			if (checkAuthentication() == false)
			{
				console.log('Check authentification failed');
				return false;
			}
			return true;
		} else {
			alert('Invalid OTP. Please try again.');
			return false;
		}
	} catch (error) {
		//console.error('Error during OTP verification:', error);
		return false;
	}
}

export async function change_nickname() {
    const nickname = document.getElementById('change-nickname').value.trim().replace(/\s+/g, '_'); // Remove spaces and replace them with '_'

    const formData = new FormData();
    formData.append('nickname', nickname); // Append the value, not the element

    fetch('/users_api/change_nickname/', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                handleErrors(data); // Handle errors if response is not ok
            });
        } else {
            redirectToRoute('/pong_lobby'); // Redirect after successful update
        }
        return response.json(); // Return the response data if ok
    })
    .catch(error => {
        console.error('Error during nickname change:', error); // Handle any fetch errors
    });
}

let isAuthenticated = false;
let Logging_socket = null;

async function checkAuthentication() {
    try {
        const response = await fetch('/users_api/check_authentication/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (response.ok) {
            const data = await response.json();
            const currentlyAuthenticated = data.authenticated;

            if (isAuthenticated === false || currentlyAuthenticated == false) {
                // First time checking authentication
                isAuthenticated = currentlyAuthenticated;
                if (isAuthenticated) {
                    console.log("CheckAuthentification OK : ", data);
                    // Call function to create websocket
                    createLoggingWebSocket(data.user_id);
                }
            }
            return currentlyAuthenticated;
        } else {
            console.error('Error checking authentication');
            return false;
        }
    } catch (error) {
        console.error('Error during authentication check:', error);
        return false;
    }    
}

// Placeholder functions for websocket management
function createLoggingWebSocket(user_id) {
    Logging_socket = new WebSocket(`wss://${window.location.host}/ws/online_status/`)

    Logging_socket.onopen = function(e) {
        console.log('Logging websocket made')
        Logging_socket.send(JSON.stringify({
            'user_id' : user_id
        }))
    }
    Logging_socket.onclose = function(e) {
        console.log('Logging socket closed')
    }
}

function closeLoggingWebSocket() {
    console.log("WebSocket closed.");
    if (Logging_socket != null) {
        Logging_socket.close();
        Logging_socket = null;
    }

}

function handleErrors(data) {
    console.log("going to print errors:");
    console.log(data);
    if (data.errors) {
        for (const key in data.errors) {
            const errorElement = document.getElementById(`${key}-error`);
            console.log(errorElement);
            if (errorElement) {
                const errorMessages = Array.isArray(data.errors[key]) 
                    ? data.errors[key].join('\n') 
                    : data.errors[key];
                errorElement.textContent = errorMessages;
            }
        }
    } else if (data.error) {
        alert(data.error);
    }
}

async function fetchUserProfilePicture(){
    const response = await fetch('/users_api/user_profile_picture/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
    });

    if (response.ok) {
        const data = await response.json();
        const imgElement = document.getElementById('user-profile-picture');
        imgElement.src = data.profile_picture;
        imgElement.style.display = 'block';
    } else {
        console.log("Error fetching user picture")
        imgElement.style.display = 'none';
    }
}

async function fetchUserData(field = undefined, username = ''){
    const response = await fetch('/users_api/user_data/' + username, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (field !== undefined && data.hasOwnProperty(field)) {
            console.log(data[field]);
            return data[field];
        } else {
            return data; // Return the entire data object if field is not specified or not found
        }
    } else {
        console.log("Error fetching user data");
    }
}

async function find_user(event) {
    event.preventDefault();
    const username = document.getElementById('find-user-username').value;

    const formData = new FormData();
    formData.append('username', username);

    try {
        const response = await fetch('/users_api/find_user/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });
        
        const data = await response.json()
        if (response.ok) {
            redirectToRoute('/profile/' + username);
        } else {
            await redirectToRoute('/404')
            handleErrors(data);
        }
    } catch (error) {
        console.error('Error during connection to server:', error);
    }
}

async function updateSidebar() {
    const isAuthenticated = await checkAuthentication();
    document.getElementById('profile-button').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-home').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-pong').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-shifumi').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-profile').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-chat').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-history').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nightCityModeBtn').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('logout-button').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('audioButton').style.display = isAuthenticated ? 'block' : 'none';
    if (isAuthenticated)
        document.getElementById('profile-button-logo').src = await fetchUserData('profile_picture.url');
}

export { register, login, logout, fetchUserData, fetchUserProfilePicture, updateSidebar, find_user, checkAuthentication, handleErrors };