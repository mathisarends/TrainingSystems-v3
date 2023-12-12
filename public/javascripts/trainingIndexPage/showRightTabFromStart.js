document.addEventListener("DOMContentLoaded", () => {
  //Speichern des geklickten buttons im localstorage

  function triggerClick(selectedTab) {
    const clickEvent = new Event("click", {
      bubbles: true,
      cancelable: true
    });
    selectedTab.dispatchEvent(clickEvent);
  }

  const tabButtons = document.querySelectorAll('[role="tab"]');

  tabButtons.forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      localStorage.setItem("selectedTab", button.id);
    });
  });

  const lastSelectedTab = localStorage.getItem("selectedTab");
  if (lastSelectedTab) {
    const tabToSelect = document.getElementById(lastSelectedTab);
    if (tabToSelect) {
      tabToSelect.setAttribute("aria-selected", true);
      triggerClick(tabToSelect);
    }
  } else {
    tabButtons[0].setAttribute("aria-selected", true);
    triggerClick(tabButtons[0]);
  }
});
