$(document).ready(function(){
    $("#loginForm").submit(function(event) {
      event.preventDefault();
      
      // Get input values
      var username = $("#username").val();
      var password = $("#password").val();
      
      // Check if username and password match default credentials
      if (username === "admin" && password === "admin") {
        // Hide the login container and show the content container
        $("#loginContainer").hide();
        $("#contentContainer").show();
      } else {
        alert("Invalid username or password. Please try again.");
      }
    });
  });
  