document.addEventListener("DOMContentLoaded", () => {
        //switchViews.js
        const allTonnageContainers = document.querySelectorAll(".training-plan-container");
        const allBestSetContainers = document.querySelectorAll(".alternative-stats-container")
    
        const statsDisplaySwitcher = document.querySelector(".stats-display-switcher");
        const switchSVG = statsDisplaySwitcher.querySelector("svg");
    
        let count = 0;
        let isRotated = false;
    
        statsDisplaySwitcher.addEventListener("click", e => {
            e.preventDefault();
    
            if (count % 2 === 0) {
                allTonnageContainers.forEach((container, index) => {
                    allTonnageContainers[index].style.display = "none";
                    allBestSetContainers[index].style.display = "flex";
                })
            } else {
                allTonnageContainers.forEach((container, index) => {
                    allTonnageContainers[index].style.display = "flex";
                    allBestSetContainers[index].style.display = "none";
                })
            }
    
            if (isRotated) {
                switchSVG.style.transform = "rotate(0deg)";
                isRotated = false;
            } else {
                switchSVG.style.transform = "rotate(180deg)";
                isRotated = true;
            }
    
            count++;
        })
})