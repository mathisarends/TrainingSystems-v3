document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll(".dot-indicators button");
    const volumeRecommandationContainers = document.querySelectorAll(".volume-recommandation-container");

    const initialSelectedPhaseIndex = localStorage.getItem("selectedPhaseIndex") || 0;

    switchView(volumeRecommandationContainers, navButtons, initialSelectedPhaseIndex);

    
    navButtons.forEach((button, index) => {
      button.addEventListener("click", e => {
        console.log("klickckck")
        e.preventDefault();

        switchView(volumeRecommandationContainers, navButtons, index);

        localStorage.setItem("selectedPhaseIndex", index);
      })
    })
    

    function switchView(contentContainers, navButtons, targetIndex) {
      for (let i = 0; i < contentContainers.length; i++) {
        contentContainers[i].style.display = "none";
        navButtons[i].setAttribute("aria-selected", false);
      }

      contentContainers[targetIndex].style.display = "block";
      navButtons[targetIndex].setAttribute("aria-selected", true);

    }
})