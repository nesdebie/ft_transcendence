$(document).ready(function(){
    $("#nightCityModeBtn").click(function(){
      $("body").toggleClass("night-city-mode");
    });
});

document.getElementById('register-form').addEventListener('submit', async function(event) {
  await register(event);
  route(event);
});

document.getElementById('login-form').addEventListener('submit', async function(event) {
  await login(event);
  route(event);
});