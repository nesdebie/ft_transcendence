$(document).ready(function(){

    $("#nightCityModeBtn").click(function(){
      $("body").toggleClass("night-city-mode");
    });
  
    $("#logoutBtn").click(function(){
      $("#loginContainer").show();
      $("#loginForm")[0].reset();
      $("#contentContainer").hide();
      $("#pong").hide();
    });

    $("#homeBtn").click(function(){
      $("#loginContainer").hide();
      $("#contentContainer").show();
      $("#pong").hide();
    });

    $("#pongBtn").click(function() {
      $("#pong").show(); // Show the board when P0ng button is clicked
    });
  
  });