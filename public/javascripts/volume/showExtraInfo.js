document.addEventListener("DOMContentLoaded", () => {
    const showExtraInfoButton = document.getElementsByClassName("trainingPlan-headline")[0];
    const moreInfoContainer = document.getElementsByClassName("more-training-info-container")[0];
  
  
    showExtraInfoButton.addEventListener("click", e => {
      e.preventDefault();
      if (moreInfoContainer.style.display === "block") {
        moreInfoContainer.style.display = "none";
      } else {
        moreInfoContainer.style.display = "block";
      }
    })
})