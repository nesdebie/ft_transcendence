import { getCookie } from './utils.js';
import { showSection, loginSection, mainContentSection, registerSection } from './sections.js';

document.getElementById('register-form').addEventListener('submit', async function(event) {
    console.log("event");
    await register(event);
    route(event);
  });
  
  document.getElementById('login-form').addEventListener('submit', async function(event) {
    await login(event);
    route(event);
  });

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
    console.log("default");
    event.preventDefault();
    console.log("getters");
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const nickname = document.getElementById('register-nickname').value;
    const age = document.getElementById('register-age').value;
    const email = document.getElementById('register-email').value;
    console.log("fetch");
    const response = await fetch('/users_api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ username, password, nickname, age, email })

    });
    console.log("end");
    if (response.ok) {
        //showSection(mainContentSection);
    
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
