document.addEventListener("DOMContentLoaded", () => {
        // navigate.js
        const navToTrainingBTNs = document.querySelectorAll(".training-plan-button");
        const navToEditBTNs = document.querySelectorAll(".edit-training-plan-button");
        const backBTNs = document.querySelectorAll(".back-button");
        const lastTrainingWeek = document.getElementById("lastTrainingWeek").value;
    
        const pathName = window.location.pathname; ///training/custom-A-stats
        const trainingType = pathName.substring(0, pathName.lastIndexOf("-"));
    
        const url = window.location.href;
    
        navToTrainingBTNs.forEach((trainingButton) => {
            trainingButton.addEventListener("click", e => {
                e.preventDefault();
                
                if (url.includes("/training/archive/stats")) { //archive stats page
                    const trainingPlanObjectId = url.slice(-24);
                    const firstTrainingWeekId = document.getElementById("firstTrainingWeekId").value;
                    const redirectUrl = `/training/archive/plan/${trainingPlanObjectId}/week/${firstTrainingWeekId}`;
                    window.location.href = redirectUrl;

                } else { //normal stats page
                    window.location.href = `${trainingType}${lastTrainingWeek}`;
                }
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