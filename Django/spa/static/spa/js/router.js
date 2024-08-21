import { fetchUserProfilePicture } from "./auth.js"
import { initChat } from "./chat.js";
import { applyNightCityMode } from './audio.js'; // Import applyNightCityMode function
import { initShifumi } from "./shifumi.js";
import { closeWebSocket } from "./websocketManager.js";


const route = (event, url = null) => {
   // If an event is provided, prevent default behavior

    event = event || window.event;
    event.preventDefault();

    if (url == null)
        window.history.pushState({}, "", event.target.href);
    else
        window.history.pushState({}, "", url);

    handleLocation();
};

const routes_suffixes = [
    { paths: ['/'], suffix: 'home.html'},
    { paths: ['/about', '/pong', '/logout', '/register', '/login', '/shifumi/pve'], suffix: '.html' },
    { paths: ['/profile', '/friend_requests', '/chat', '/shifumi' ,'/profile_editor'], suffix: '' }
];

function update_path(path) {
    if (path == '/')
        return '/pages' + path + routes_suffixes[0].suffix;
    for (let i = 1; i < routes_suffixes.length; i++) {
        const route = routes_suffixes[i];
        for (let j = 0; j < route.paths.length; j++) {
            if (path.startsWith(route.paths[j])) {
                return '/pages' + path + route.suffix; // /profile/aminjauw => /pages/profile/aminjauw
            }
        }
    }
    return 'pages/404.html'; // Path does not match any prefix, so it's "not in"
}

const handleLocation = async () => {
    closeWebSocket();

    const path = window.location.pathname;
    const route = update_path(path);
    console.log("Handle location : " + path + "\n to route = " + route); // Debug statement
    try {
        const response = await fetch(route);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${route}: ${response.statusText}`);
        }
        const html = await response.text();
        document.getElementById("main-page").innerHTML = html;
        call_page_functions(path);
    } catch (error) {
        console.error('Error fetching the route:', error);
    }
};

// Permet de call des fonctions Js specifiques 
// pour des element apparaissant dans le HTML 
function call_page_functions(path) {
    if (document.getElementById('user-profile-picture'))
        fetchUserProfilePicture();
    if (path.startsWith('/chat/') && path !== '/chat/') {
        initChat();
    }
    if (document.body.classList.contains("cyberpunk")) {
        applyNightCityMode();
    }
    if (path.startsWith('/shifumi/') && path !== '/shifumi/') { // /shifumi/room_name need to add here a function for shifumi against AI on the /shifumi page
        const roomName = path.split('/')[2];
        initShifumi(roomName);
    }
    // if (document.getElementById('user-username'))
    //  fetchUserProfileData();
    //if ...
}

// Function to reapply cyberpunk mode if it was active
function reapplyNightCityModeIfNecessary() {
    if (document.body.classList.contains("cyberpunk")) {
        applyNightCityMode();
    }
}

export const redirectToRoute = async(path) => {
    window.history.replaceState({}, "", path);
    await handleLocation();
    reapplyNightCityModeIfNecessary();
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();