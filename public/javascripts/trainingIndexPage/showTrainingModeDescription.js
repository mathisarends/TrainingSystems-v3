document.addEventListener("DOMContentLoaded", () => {
    console.log("eingebunden")
    const showMoreTrainingInfoButtons = document.getElementsByClassName("show-more-training-information-button");
    const moreTrainingInfoContainers = document.getElementsByClassName("more-training-info-container");

    for (let i = 0; i < showMoreTrainingInfoButtons.length; i++) {
        showMoreTrainingInfoButtons[i].addEventListener("click", () => {
            if (moreTrainingInfoContainers[i].style.display === "none") {
                moreTrainingInfoContainers[i].style.display = "flex";
            } else {
                moreTrainingInfoContainers[i].style.display = "none";
            }
        })
    }
})