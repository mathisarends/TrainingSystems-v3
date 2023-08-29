document.addEventListener("DOMContentLoaded", () => {

    //display the desired Training Day;
    const tableSections = document.querySelectorAll(".table-section");
    const navigateBetweenWorkoutsNavigations = document.querySelectorAll(".dot-indicators");
    
    navigateBetweenWorkoutsNavigations.forEach((navigation, index) => {
        const navButtons = navigation.querySelectorAll("button");
        
        navButtons.forEach((navButton, index) => {
            navButton.addEventListener("click", e => {
                e.preventDefault();
                
                tableSections.forEach((tableSection) => {
                    tableSection.style.display = "none";
                })

                tableSections[index].style.display = "block";
            })
        })
    })
})   