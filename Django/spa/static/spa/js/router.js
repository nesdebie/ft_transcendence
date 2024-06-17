import { fetchUserProfilePicture } from "./auth.js"

const route = (event, url_precision = null) => {
   // If an event is provided, prevent default behavior
   let newPath = window.location.pathname;
   let custom_url = false;

   if (event) {
        event = event || window.event;
        event.preventDefault();
        newPath = event.target.href;
    }

    if (url_precision) {
        newPath += '/' + url_precision;
        custom_url = true;
    }
    window.history.pushState({}, "", newPath);
    handleLocation(custom_url);
};


const routes_suffixes = [
    { paths: ['/'], suffix: 'home.html' },
    { paths: ['/home', '/about', '/shifoumi', '/pong', '/logout', '/register', '/login'], suffix: '.html' },
    { paths: ['/profile', '/friend_requests'], suffix: '' }
];


function update_path(path) {

    for (let i = 1; i < routes_suffixes.length; i++) {
        const route = routes_suffixes[i];
        for (let j = 0; j < route.paths.length; j++) {
            if (path.startsWith(route.paths[j])) {
                return 'pages/' + path + route.suffix       // /profile/aminjauw => /pages/profile/aminjauw
            }
        }
    }
    return 'pages/404.html'; // Path does not match any prefix, so it's "not in"
}

const handleLocation = async (custom_url = false) => {
    const path = window.location.pathname;
    const route = page_routes[path] || page_routes[404];
    if (custom_url)
        route = path;
    const html = await fetch(route).then((data) => data.text());
    document.getElementById("main-page").innerHTML = html;
	call_page_functions()
};

// Permet de call des fonctions Js specifiques 
// pour des element apparaissant dans le HTML 
function call_page_functions() {
	if (document.getElementById('user-profile-picture'))
		fetchUserProfilePicture();
    // if (document.getElementById('user-username'))
	// 	fetchUserProfileData();
	//if ...
}

export const redirectToRoute = (path) => {
    window.history.replaceState({}, "", path);
    handleLocation();
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
