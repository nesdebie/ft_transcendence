import { getCookie } from "./utils.js"

async function login(event) {
	event.preventDefault();
	const username = document.getElementById('login-username').value;
	const password = document.getElementById('login-password').value;

	const formData = new FormData();
	formData.append('username', username);
	formData.append('password', password);

	const response = await fetch('/users_api/login/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken')
		},
		body: formData
	});

	const data = await response.json(); 
	if (response.ok) {
		alert(data.message);
	} else {
		alert(data.error);
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
		alert(data.message);
	} else {
		alert(data.error);
	}
}

async function logout() {
	const response = await fetch('/users_api/logout/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken')
		},
	});

	if (response.ok) {
		alert('Logout ok');
	} else {
		alert('Logout failed');
	}
}

async function checkAuthentication() {
	const response = await fetch('/users_api/check_authentication/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCookie('csrftoken')
		}
	});
	console.log(response);
	if (response.ok) {
		const data = await response.json();
		if (data.authenticated == true) {
			showSection(mainContentSection);
		} else {
			showSection(loginSection);
		}
	} else {
		showSection(loginSection);
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

export { register, login, logout, fetchUserProfilePicture};