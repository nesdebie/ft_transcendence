import { fetchUserProfilePicture } from "./auth.js";
import { applyNightCityMode } from './audio.js'; // Import applyNightCityMode function

const route = (event, url_precision = null) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

const routes_suffixes = [
    { paths: ['/'], suffix: 'home.html'},
    { paths: ['/about', '/shifumi', '/pong', '/logout', '/register', '/login'], suffix: '.html' },
    { paths: ['/profile', '/friend_requests', '/profile_editor'], suffix: '' }
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
    const path = window.location.pathname;
    const route = update_path(path);
    console.log("Handle location : " + path + "\n to route = " + route);
    const html = await fetch(route).then((data) => data.text());
    document.getElementById("main-page").innerHTML = html;
    //call_page_functions();
    reapplyNightCityModeIfNecessary(); // Reapply cyberpunk mode if necessary
};

// Function to reapply cyberpunk mode if it was active
function reapplyNightCityModeIfNecessary() {
    if (document.body.classList.contains("cyberpunk")) {
        applyNightCityMode();
    }
}

// // Permet de call des fonctions Js specifiques 
// // pour des element apparaissant dans le HTML 
// function call_page_functions() {
//     if (document.getElementById('user-profile-picture'))
//         fetchUserProfilePicture();
//     // if (document.getElementById('user-username'))
//     //  fetchUserProfileData();
//     //if ...
// }

export const redirectToRoute = (path) => {
    window.history.replaceState({}, "", path);
    handleLocation();
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
