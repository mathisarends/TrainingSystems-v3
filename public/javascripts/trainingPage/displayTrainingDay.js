document.addEventListener("DOMContentLoaded", () => {

    //display the desired Training Day;
    const tableSections = document.querySelectorAll(".table-section");
    const navButtons = document.querySelectorAll(".dot-indicators button");

    //show the currently selected one the selected day is required from backend
    const selectedButton = document.querySelector(".dot-indicators button[aria-selected='true']");

    
    navButtons.forEach((navButton, index) => {
        navButton.addEventListener("click", e => {
            e.preventDefault();

            tableSections.forEach((tableSection) => {
                tableSection.style.display = "none";
            })

            navButtons.forEach((btn) => {
                btn.setAttribute("aria-selected", false);
            })

            tableSections[index].style.display = "block";
            navButton.setAttribute("aria-selected", true);

            window.scrollTo(0, 0); //jump to start of the page
        })
    })

    if (selectedButton) { // click on the button so that the display styles are applied correctly
        selectedButton.click();
    } else {
        navButtons[0].setAttribute("aria-selected", true);
    }

    //logic for swiping
    const workoutTable = document.querySelectorAll(".workout-table");
    let startX;
    let endX;

    const body = document.querySelector("body");

    body.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    body.addEventListener("touchend", e => {
        endX = e.changedTouches[0].clientX;

        const swipeThreshold = 100;

        if (startX - endX > swipeThreshold) {
            navigateToNextDay();             // Swipe left, navigate to the next day
        } else if (endX - startX > swipeThreshold) {
            navigateToPreviousDay();             // Swipe right, navigate to the previous day
        }
    })

    function navigateToNextDay() {
        const selectedButton = document.querySelector(".dot-indicators button[aria-selected='true']");
        const nextButton = selectedButton.nextElementSibling || navButtons[0];

        if (nextButton) {
            nextButton.click();
        }
    }

    function navigateToPreviousDay() {
        const selectedButton = document.querySelector(".dot-indicators button[aria-selected='true']");
        const previousButton = selectedButton.previousElementSibling || navButtons[navButtons.length - 1];

        if (previousButton) {
            previousButton.click();
        }
    }

    //navigate to right trainin day from statsPage
    const anchor = window.location.hash.substring(1);
    console.log(anchor);
    if (anchor) {
        const navigateButton = navButtons[anchor];
    
        if (navigateButton) {
            navigateButton.click();
        }
    
    }




})   