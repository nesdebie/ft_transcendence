function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function displayUserLevel() {
    const response = await fetch('/users_api/user_level/');
    if (response.ok) {
        const data = await response.json();
        const userLevel = data.level;
        document.getElementById('user-level').textContent = `Your Level: ${userLevel}`;
    } else {
        console.error('Failed to fetch user level');
    }
}

export { getCookie, displayUserLevel };
