import { getCookie } from "./utils.js"
import { redirectToRoute } from "./router.js"

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
        
        if (response.ok) {
            console.log("Response ok");
            // 2FA -->
            if (data.two_factor_enabled) {
                // Affichez le QR code si 2FA est activée
                const qrCodeContainer = document.getElementById('qr-code-container');
                const qrCodeElement = document.getElementById('qr-code');
                qrCodeContainer.style.display = 'block';
                qrCodeElement.innerHTML = `<img src="data:image/png;base64,${data.qr_code_base64}" alt="QR Code">`;
                
                // Ajoutez un événement pour soumettre le code OTP
                document.getElementById('otp-form').addEventListener('submit', function(event) {
                    event.preventDefault();
                    verifyOtp(data.username).then(result => {
                        if (result) {
							redirectToRoute('/');
                            updateSidebar();
							return true;
                        }
                    });
                });
            } else { // <-- 2FA
				// aut with no 2FA
                redirectToRoute('/');
                updateSidebar();
                return true;
            }
        } else {
            handleErrors(data);
            return false;
        }
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    }
}

// 2FA , fonction ajouter pour vérifier OPT si le code est bien scanné et le code bien rentré 
async function verifyOtp(username) {
    const otp = document.getElementById('otp').value;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('otp_code', otp);

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
			await checkAuthentication();
            return true;
        } else {
            alert('Invalid OTP. Please try again.');
            return false;
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return false;
    }
}

async function register(event) {
	event.preventDefault();
	const username = document.getElementById('register-username').value;
	const password = document.getElementById('register-password').value;
	const password2 = document.getElementById('register-password2').value;
	const email = document.getElementById('register-email').value;
	const image = document.getElementById('register-image').files[0];
    // 2FA
	const two_factor_auth = document.getElementById('register-2fa').checked;


	const formData = new FormData();
	formData.append('username', username);
	formData.append('password', password);
	formData.append('password2', password2);
	formData.append('email', email);
	formData.append('image', image);
	// 2FA
    formData.append('two_factor_auth', two_factor_auth ? 'on' : '');

	const response = await fetch('/users_api/register/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken')
		},
		body: formData

	});
	const data = await response.json(); 
	if (response.ok) {
		redirectToRoute('/');
		updateSidebar();
	} else {
		redirectToRoute('/register');
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
	redirectToRoute('/login');
	updateSidebar();
}

async function checkAuthentication() {
    const response = await fetch('/users_api/check_authentication/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    });

    if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
			console.log("CheckAuthentification OK : ", data);
            return true;
        } else {
			console.log("CheckAuthentification NOK : ", data);
            return false;
        }
    } else {
        console.error('Error checking authentication');
        return false;
    }
}

function handleErrors(data) {
	console.log("going to print errors:");
	console.log(data);
	for (const key in data.errors) {
		const errorElement = document.getElementById(`${key}-error`);
		if (errorElement) {
			const errorMessages = Array.isArray(data.errors[key]) 
				? data.errors[key].join('\n') 
				: data.errors[key];
			errorElement.textContent = errorMessages;
		}
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
			console.log("find_user gave back not 200");
			handleErrors(data);
		}
	} catch (error) {
		console.error('Error during connection to server:', error);
	}
}


// A séparer du auth.js
async function updateSidebar() {
    const isAuthenticated = await checkAuthentication();
	document.getElementById('profile-button').style.display = isAuthenticated ? 'block' : 'none';
    //document.getElementById('nav-logout').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-home').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-pong').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-shifumi').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-about').style.display = isAuthenticated ? 'block' : 'none';
	document.getElementById('nav-profile').style.display = isAuthenticated ? 'block' : 'none';
	document.getElementById('nav-chat').style.display = isAuthenticated ? 'block' : 'none';
	document.getElementById('logout-button').style.display = isAuthenticated ? 'block' : 'none';
	if (isAuthenticated)
		document.getElementById('profile-button-logo').src = await fetchUserData('profile_picture.url');
}

export { register, login, logout, fetchUserData, fetchUserProfilePicture, updateSidebar, find_user, checkAuthentication, handleErrors };