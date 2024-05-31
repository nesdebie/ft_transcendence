const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

const routes = {
    404: "pages/404.html",
    "/": "pages/home.html",
    "/about": "pages/about.html",
    "/shifumi": "pages/shifumi.html",
    "/pong": "pages/pong.html",
    "/logout": "pages/logout.html",
    "/register": "pages/register.html",
    "/login": "pages/login.html",
};

const handleLocation = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes[404];
    const html = await fetch(route).then((data) => data.text());
    document.getElementById("main-page").innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
