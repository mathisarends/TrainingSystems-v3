document.addEventListener("DOMContentLoaded", () => {
    console.log("category selector")
    const trainingPlanCategorySelector = document.getElementById("training-mode-selector");
    const trainingPlanCategorysContainer = document.getElementsByClassName("training-plan-view-container");
    
    const initalCategory = trainingPlanCategorySelector.value;
    
    displayTrainingMode(initalCategory); //initial method-call
    

    trainingPlanCategorySelector.addEventListener("change", () => {
        const category = trainingPlanCategorySelector.value;

        displayTrainingMode(category);
    })


    function displayTrainingMode(category) {
        if (category === "custom") {
            console.log("custon new");
            trainingPlanCategorysContainer[0].style.display = "block";
            trainingPlanCategorysContainer[1].style.display = "none";
            trainingPlanCategorysContainer[2].style.display = "none";
        } else if (category === "template") {
            trainingPlanCategorysContainer[0].style.display = "none";
            trainingPlanCategorysContainer[1].style.display = "block";
            trainingPlanCategorysContainer[2].style.display = "none";
            console.log("templates");
        } else if (category === "scratch") {
            trainingPlanCategorysContainer[0].style.display = "none";
            trainingPlanCategorysContainer[1].style.display = "none";
            trainingPlanCategorysContainer[2].style.display = "block";
        }
    }
})