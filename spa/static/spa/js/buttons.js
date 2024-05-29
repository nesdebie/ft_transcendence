import {register} from "./auth.js";

$(document).ready(function(){
		$("#nightCityModeBtn").click(function(){
			$("body").toggleClass("night-city-mode");
		});
});

document.body.addEventListener('submit', function(event) {
	
	if (event.target.id === 'register-form') {
		event.preventDefault();
		register(event); }
	else if (event.target.id === 'login-form'){
		event.preventDefault();
		login(event);}
	else if (event.target.id === 'logout-button') {
		logout(event); }
});