import { redirectToRoute } from "./router";

$(document).ready(function() {

    // CSRF token setup for AJAX requests
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
    const csrftoken = getCookie('csrftoken');

    // Update Profile Picture
    $('#updateProfilePictureForm').on('submit', function(e) {
        e.preventDefault();
        const image = document.getElementById('profilePicture').files[0];

        if (image && image.type !== 'image/png') {
            alert('Profile picture must be a PNG file.');
            return;
        }

        const formData = new FormData(this);
        $.ajax({
            url: updateProfilePictureUrl,  // This should be defined in your Django context
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: {'X-CSRFToken': csrftoken},
            success: function(response) {
                alert('Profile picture updated successfully!');
            },
            error: function(response) {
                alert('Error updating profile picture.');
            }
        });
        redirectToRoute('/profile')
    });

    // Change Password
    $('#changePasswordForm').on('submit', function(e) {
        e.preventDefault();
        const formData = $(this).serialize();
        $.ajax({
            url: changePasswordUrl,  // This should be defined in your Django context
            type: "POST",
            data: formData,
            headers: {'X-CSRFToken': csrftoken},
            success: function(response) {
                alert('Password changed successfully!');
            },
            error: function(response) {
                alert('Error changing password.');
            }
        });
    });
});