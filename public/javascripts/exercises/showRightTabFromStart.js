document.addEventListener("DOMContentLoaded", () => {
    function triggerClick(selectedTab) {
        const clickEvent = new Event('click', {
            bubbles: true,
            cancelable: true,
        });
        selectedTab.dispatchEvent(clickEvent);
    }

    const navButtons = document.querySelectorAll(".tab-list button");

    // save the current selection of tab in localstorage
    navButtons.forEach((button) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            localStorage.setItem("selectedExerciseTab", button.id);
        })
    })

    // automatically display the last selected tab first when the page is loaded
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