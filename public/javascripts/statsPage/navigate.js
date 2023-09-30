document.addEventListener("DOMContentLoaded", () => {
        // navigate.js
        const navToTrainingBTNs = document.querySelectorAll(".training-plan-button");
        const navToEditBTNs = document.querySelectorAll(".edit-training-plan-button");
        const backBTNs = document.querySelectorAll(".back-button");
    
        const pathName = window.location.pathname; ///training/custom-A-stats
        const trainingType = pathName.substring(0, pathName.lastIndexOf("-"));
        console.log(trainingType);
    
    
        navToTrainingBTNs.forEach((trainingButton) => {
            trainingButton.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = `${trainingType}1`; // immer an erste woche eigentlich an zuletzt trainierte TODO:
            })
        })
    
        navToEditBTNs.forEach((editButton) => {
            editButton.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = `${trainingType}-edit`;
            })
        })
    
        backBTNs.forEach((backButton) => {
            backButton.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = "/training";
            })
        })
})