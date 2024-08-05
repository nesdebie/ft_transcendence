import { redirectToRoute } from "./router.js";
import { updateSidebar } from "./auth.js";
import { getCookie } from "./utils.js";

$(document).ready(function() {
    const csrftoken = getCookie('csrftoken');

    $('#updateProfilePictureForm').on('submit', function(e) {
        e.preventDefault();
        const image = document.getElementById('profilePicture').files[0];

        if (!image) {
            alert('Please select a profile picture.');
            return;
        }

        if (image.type !== 'image/png') {
            alert('Profile picture must be a PNG file.');
            return;
        }
        console.log("avant");
        const formData = new FormData();
        formData.append('image', image);
        console.log("apres");
        $.ajax({
            url: '/users_api/update_profile_picture/',
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            headers: {'X-CSRFToken': csrftoken},
            success: function() {
                alert('Profile picture updated successfully!');
                updateSidebar();
                redirectToRoute('/profile_editor');
            },
            error: function() {
                alert('Error updating profile picture.');
            }
        });
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
            success: function() {
                alert('Password changed successfully!');
            },
            error: function() {
                alert('Error changing password.');
            }
        });
    });
});