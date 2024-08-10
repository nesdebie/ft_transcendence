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
            // Update the profile picture on the page
            let profilePictureElement = document.getElementById('currentProfilePicture');
            if (!profilePictureElement) {
                // If the element doesn't exist, create it
                profilePictureElement = document.createElement('img');
                profilePictureElement.id = 'currentProfilePicture';
                profilePictureElement.width = 200;
                profilePictureElement.height = 200;
                profilePictureElement.alt = `${data.username}'s Profile Picture`;
                // Append the new image element to the appropriate place in the DOM
                //document.querySelector('.page-container.align-center').insertBefore(profilePictureElement, document.getElementById('user-username'));
            }
            profilePictureElement.src = data.profile_picture + '?t=' + new Date().getTime();
            updateSidebar();
        } else {
            handleErrors(data);
        }
    } catch (error) {
        console.error('Error updating profile picture:', error); // Log the error to the console
        alert('Error updating profile picture.');
    }
}

async function setPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    try {
        const response = await fetch('/pages/change_password/', {
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
                //alert('Password changed successfully!');
                logout(event);
            } else {
                console.error('Error changing password:', data); // Log the error details
                alert('Error changing password.');
            }
        } else {
            const text = await response.text();
            console.error('Unexpected response format:', text); // Log the unexpected response
            alert('Unexpected response from server.');
        }
    } catch (error) {
        console.error('Error changing password:', error); // Log the error to the console
        alert('Error changing password.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const csrftoken = getCookie('csrftoken');

    document.getElementById('updateProfilePictureForm').addEventListener('submit', updateProfilePicture);
    document.getElementById('changePasswordForm').addEventListener('submit', setPassword);
});

export { updateProfilePicture, setPassword }