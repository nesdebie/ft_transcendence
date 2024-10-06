import { logout, updateSidebar } from "./auth.js";
import { redirectToRoute } from "./router.js";
import { getCookie } from "./utils.js";

async function updateProfilePicture(event) {
    event.preventDefault();
    const image = document.getElementById('profilePicture').files[0];

    if (!image) {
        alert('Please select a profile picture.');
        return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(image.type)) {
        alert('Profile picture must be a PNG, JPEG, or JPG file.');
        return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
        const response = await fetch('/users_api/update_profile_picture/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            let profilePictureElement = document.getElementById('currentProfilePicture');
            if (!profilePictureElement) {
                profilePictureElement = document.createElement('img');
                profilePictureElement.id = 'currentProfilePicture';
                profilePictureElement.width = 200;
                profilePictureElement.height = 200;
                profilePictureElement.alt = `${data.username}'s Profile Picture`;
            }
            profilePictureElement.src = data.profile_picture + '?t=' + new Date().getTime();
            updateSidebar();
        } else {
            handleErrors(data);
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Error updating profile picture.');
    }
}

async function setPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
        const response = await fetch('/users_api/change_password/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(formData).toString()
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            const data = await response.json();
            if (response.ok) {
                await logout(event);
            } else {
                console.error('Error changing password:', data);
                alert('Error changing password.');
            }
        } else {
            const text = await response.text();
            console.error('Unexpected response format:', text);
            alert('Unexpected response from server.');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password.');
    }
}

export { updateProfilePicture, setPassword }