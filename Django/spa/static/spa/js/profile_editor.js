import { updateSidebar } from "./auth.js";
import { redirectToRoute } from "./router.js";
import { getCookie } from "./utils.js";

async function updateProfilePicture(event) {
    event.preventDefault();
    const image = document.getElementById('profilePicture').files[0];

    if (!image) {
        alert('Please select a profile picture.');
        return;
    }

    if (image.type !== 'image/png') {
        alert('Profile picture must be a PNG file.');
        return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
        const response = await fetch('/pages/update_profile_picture/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Profile picture updated successfully!');
            redirectToRoute('/profile_editor');
            updateSidebar();
        } else {
            handleErrors(data);
        }
    } catch (error) {
        alert('Error updating profile picture.');
    }
}

async function setPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
        const response = await fetch(changePasswordUrl, {  // Make sure changePasswordUrl is defined in your context
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
            alert('Password changed successfully!');
        } else {
            alert('Error changing password.');
        }
    } catch (error) {
        alert('Error changing password.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const csrftoken = getCookie('csrftoken');

    document.getElementById('updateProfilePictureForm').addEventListener('submit', updateProfilePicture);
    document.getElementById('changePasswordForm').addEventListener('submit', setPassword);
});

export { updateProfilePicture, setPassword }