document.addEventListener("DOMContentLoaded", () => {
    const nextButton = document.getElementById("next-page-button");
    nextButton.addEventListener("click", e => {
        e.preventDefault();
        navigateToNextView();
    })

    //back to training button
    const backToTrainingButton = document.getElementById("back-to-training-button");
    backToTrainingButton.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = "/training";
    })

    const navButtons = document.querySelectorAll(".dot-indicators button");
    const sections = document.querySelectorAll("section");

    navButtons.forEach((navButton, index) => {
        navButton.addEventListener("click", e => {
            e.preventDefault();

            navButtons.forEach((btn, i) => {
                btn.setAttribute("aria-selected", false);
                sections[i].style.display = "none";
            })

            navButton.setAttribute("aria-selected", true);
            sections[index].style = "block";

            window.scrollTo(0, 0); //jump to start of the page
        })
    })

    const body = document.querySelector("body");
    body.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    body.addEventListener("touchend", e => {
        endX = e.changedTouches[0].clientX;

        const swipeThreshold = 100;

        if (startX - endX > swipeThreshold) {
            navigateToNextView();             // Swipe left, navigate to the next day
        } else if (endX - startX > swipeThreshold) {
            navigateToPreviousView();             // Swipe right, navigate to the previous day
        }
    })

    function navigateToNextView() {
    const selectedButton = document.querySelector(".dot-indicators button[aria-selected='true']");
    const nextButton = selectedButton.nextElementSibling;

        if (nextButton) {
            nextButton.click();
        }
    }

    function navigateToPreviousView() {
        const selectedButton = document.querySelector(".dot-indicators button[aria-selected='true']");
        const previousButton = selectedButton.previousElementSibling;

        if (previousButton) {
            previousButton.click();
        }
    }
}) 