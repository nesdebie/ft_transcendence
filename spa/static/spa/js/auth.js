import { getCookie } from './utils.js';
import { showSection, loginSection, mainContentSection, registerSection } from './sections.js';

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/users_api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        showSection(mainContentSection);
    } else {
        alert('Login failed');
    }
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const level = document.getElementById('register-level').value;

    const response = await fetch('/users_api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ username, password, level })
    });

    if (response.ok) {
        showSection(mainContentSection);
    } else {
        alert('Registration failed');
    }
}

async function logout() {
    const response = await fetch('/users_api/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    });

    if (response.ok) {
        showSection(loginSection);
    } else {
        alert('Logout failed');
    }
}

async function checkAuthentication() {
    const response = await fetch('/users_api/check_authentication/');
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

document.getElementById('login-form').addEventListener('submit', login);
document.getElementById('register-form').addEventListener('submit', register);
document.getElementById('logout-button').addEventListener('click', logout);


document.getElementById('register-btn').addEventListener('click', function() {
    showSection(registerSection);
});

// Initial check
checkAuthentication();
