import { getCookie } from "./utils.js"
import { redirectToRoute } from "./router.js"

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

		if (response.ok) {
			redirectToRoute('/');
			updateSidebar();
			return true;
		} else {
			return false;
		}
	} catch (error) {
		console.error('Error during login:', error);
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

	const formData = new FormData();
	formData.append('username', username);
	formData.append('password', password);
	formData.append('password2', password2);
	formData.append('email', username);
	formData.append('image', image);

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
		handleErrors(data)
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
            return true;
        } else {
            redirectToRoute('/login'); // Redirect to login page if not authenticated
            return false;
        }
    } else {
        console.error('Error checking authentication');
        return false;
    }
}

function handleErrors(data) {
	for (const key in data.errors) {
		const errorElement = document.getElementById(`${key}-error`);
		if (errorElement) {
			errorElement.textContent = data.errors[key];
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
		imgElement.src = data.user_picture;
		imgElement.style.display = 'block';
	} else {
		console.log("Error fetching user picture")
		imgElement.style.display = 'none';
	}
}

// async function fetchUserProfileData(){
//     const response = await fetch('/users_api/user_profile_data/', {
//         method: 'GET',
//         headers: {
//             'X-CSRFToken': getCookie('csrftoken')
//         },
//     });

//     if (response.ok) {
//         const data = await response.json();
//         const usernameElement = document.getElementById('username');
//         usernameElement.innerText = data.username; // Assuming data contains the username
//         usernameElement.style.display = 'block';
//     } else {
//         console.log("Error fetching user profile data");
//         usernameElement.style.display = 'none';
//     }
// }


async function updateSidebar() {
    const isAuthenticated = await checkAuthentication();
	document.getElementById('profile-button').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-logout').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-home').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-pong').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-shifumi').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-about').style.display = isAuthenticated ? 'block' : 'none';
	document.getElementById('nav-profile').style.display = isAuthenticated ? 'block' : 'none';
}

export { register, login, logout, fetchUserProfilePicture, updateSidebar};