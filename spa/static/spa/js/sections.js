import { displayUserLevel } from './utils.js';

const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const mainContentSection = document.getElementById('main-content-section');

function showSection(section) {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    mainContentSection.classList.add('hidden');
    section.classList.remove('hidden');
    if (section == mainContentSection) {
        displayUserLevel();
    }
}

export { showSection, loginSection, registerSection, mainContentSection };
