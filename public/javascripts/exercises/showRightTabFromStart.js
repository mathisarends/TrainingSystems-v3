document.addEventListener("DOMContentLoaded", () => {
    function triggerClick(selectedTab) {
        const clickEvent = new Event('click', {
            bubbles: true,
            cancelable: true,
        });
        selectedTab.dispatchEvent(clickEvent);
    }

    const navButtons = document.querySelectorAll(".tab-list button");

    navButtons.forEach((button) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            localStorage.setItem("selectedExerciseTab", button.id);
        })
    })

    const lastSelectedTab = localStorage.getItem("selectedExerciseTab");
    if (lastSelectedTab) {
        const tabToSelect = document.getElementById(lastSelectedTab);
            if (tabToSelect) {
                tabToSelect.setAttribute("aria-selected", true);
                triggerClick(tabToSelect);
            }
    } else {
        navButtons[0].setAttribute("aria-selected", true);
        triggerClick(navButtons[0]);
    }

})