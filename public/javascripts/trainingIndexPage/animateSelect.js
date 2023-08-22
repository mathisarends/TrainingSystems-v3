document.addEventListener("DOMContentLoaded", () => {
    console.log("eingebunden");
    
    const trainingPlanCategorySelector = document.getElementById("training-mode-selector");
    const selectSVGs = document.getElementsByClassName("svg-container");

    trainingPlanCategorySelector.addEventListener("focus", () => {
        console.log("newpage focus")
            selectSVGs[0].style.display = "block";
            selectSVGs[1].style.display = "none";
        })

        trainingPlanCategorySelector.addEventListener("change", () => {
            selectSVGs[0].style.display = "none";
            selectSVGs[1].style.display = "block";
        })

        trainingPlanCategorySelector.addEventListener("blur", () => {
            selectSVGs[0].style.display = "none";
            selectSVGs[1].style.display = "block";
        })
})