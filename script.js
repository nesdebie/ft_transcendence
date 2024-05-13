// script.js
function toggleNightMode() {
    var element = document.body;
    element.classList.toggle("night-mode");

    var button = document.getElementById("night-mode-btn");
    var buttonText = element.classList.contains("night-mode") ? "🌞" : "🌜";
    button.textContent = buttonText;
}
