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
        })
    })

    console.log(selectedButton);

    if (selectedButton) {
        selectedButton.click();
    } else {
        navButtons[0].setAttribute("aria-selected", true);
    }


})   