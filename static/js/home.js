// static/js/home.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("Home.js loaded ✅");

    // Example: Highlight overdue deadlines in red
    const overdueItems = document.querySelectorAll(".deadline-item.overdue");
    overdueItems.forEach(item => {
        item.style.borderLeft = "5px solid red";
    });

    // Example: Quick action click logging
    const actionCards = document.querySelectorAll(".action-card");
    actionCards.forEach(card => {
        card.addEventListener("click", () => {
            console.log(`Clicked: ${card.querySelector("h3").innerText}`);
        });
    });
});
