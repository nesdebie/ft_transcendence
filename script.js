// script.js

function toggleNightMode() {
    var element = document.body;
    element.classList.toggle("night-mode");

    var button = document.getElementById("night-mode-btn");
    var buttonText = element.classList.contains("night-mode") ? "🌞" : "🌜";
    button.textContent = buttonText;
}

function toggleSidebar() {
    var sidebarMenu = document.getElementById("sidebar-menu");
    var sidebarToggleButton = document.getElementById("sidebar-toggle-btn");
    if (sidebarMenu.style.left === "-250px") {
        sidebarMenu.style.left = "0";
        sidebarToggleButton.textContent = "✕"; // Change button icon
    } else {
        sidebarMenu.style.left = "-250px";
        sidebarToggleButton.textContent = "☰"; // Change button icon
    }
}

function hideSidebar() {
    var sidebarMenu = document.getElementById("sidebar-menu");
    sidebarMenu.style.left = "-250px";
    var sidebarToggleButton = document.getElementById("sidebar-toggle-btn");
    sidebarToggleButton.textContent = "☰"; // Change button icon
}
