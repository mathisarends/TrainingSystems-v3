document.addEventListener("DOMContentLoaded", () => {

    const changeProfilePictureButton = document.getElementById("change-profile-picture-button");
    const changeProfilePictureForm = document.getElementById("change-profile-picture-form");


    changeProfilePictureButton.addEventListener("click", e => {
        e.preventDefault();
        console.log("klcikc s")
        if (changeProfilePictureForm.style.display === "none") {
            changeProfilePictureForm.style.display = "flex";
        } else {
            changeProfilePictureForm.style.display = "none";
        }
    })
})
