//weiter Funktionalität show workout title mainly prevent default beahviour of setting submiting formulat

document.addEventListener("DOMContentLoaded", () => {

    console.log("eingebunden")
    const showTitleButton = document.getElementById("show-workout-title-btn");
    const hideTitleButton = document.getElementById("hide-workout-title-btn");
    const workoutTitleInput = document.getElementById("workout-title-input");


showTitleButton.addEventListener("click", e => {
    e.preventDefault();
    console.log("klcik")
    showTitleButton.style.display = "none";
    hideTitleButton.style.display = "block";
    workoutTitleInput.style.display = "block";
})

hideTitleButton.addEventListener("click", e => {
    e.preventDefault();
    console.log("klcik")
    showTitleButton.style.display = "block";
    hideTitleButton.style.display = "none";
    workoutTitleInput.style.display = "none";
})
})

