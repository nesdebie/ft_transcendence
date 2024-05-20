// Navigation function
function navigate(page) {
    // Update the content
    const content = document.getElementById('content');
    switch (page) {
        case 'home':
            content.innerHTML = 'Welcome to the Home page!';
            break;
        case 'about':
            content.innerHTML = 'Learn more About us.';
            break;
        case 'contact':
            content.innerHTML = 'Contact us for more information.';
            break;
        default:
            content.innerHTML = 'Welcome to the Home page!';
    }
    // Update the URL and history state
    history.pushState({ page: page }, page, `#${page}`);
}

// Handle the popstate event
window.onpopstate = function(event) {
    if (event.state) {
        updateContent(event.state.page);
    } else {
        updateContent('home');
    }
}

// Initial load - handle URL directly
document.addEventListener('DOMContentLoaded', () => {
    const initialPage = location.hash.replace('#', '') || 'home';
    navigate(initialPage);
});

// Update content without pushing to history
function updateContent(page) {
    const content = document.getElementById('content');
    switch (page) {
        case 'home':
            content.innerHTML = 'Welcome to the Home page!';
            break;
        case 'about':
            content.innerHTML = 'Learn more About us.';
            break;
        case 'contact':
            content.innerHTML = 'Contact us for more information.';
            break;
        default:
            content.innerHTML = 'Welcome to the Home page!';
    }
}
