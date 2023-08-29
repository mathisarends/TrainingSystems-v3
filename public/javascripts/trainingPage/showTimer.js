document.addEventListener("DOMContentLoaded", () => {
    //switch on/off the rest pause container
    const hidePauseTimerFields = document.querySelectorAll("caption");
    const restPauseContainers = document.querySelectorAll(".rest-pause-container");
   
    hidePauseTimerFields.forEach((hidePauseTimerField, index) => {
        hidePauseTimerField.addEventListener("click", () => {
            if (restPauseContainers[index].style.display === "block") {
                restPauseContainers[index].style.display = "none";
            } else {
                restPauseContainers[index].style.display = "block";
            }
        } )
    })
})