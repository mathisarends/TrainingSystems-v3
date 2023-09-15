// das hier macht gar nihts mehr alles in redirect

document.addEventListener("DOMContentLoaded", () => {
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");
    const cancelResetButton = document.getElementById("cancelResetButton");

    //Das hier noch in allen Dokumenten ändern
    const deleteTrainingButtons = document.getElementsByClassName("delete-training-button");
    const deleteForms = document.getElementsByClassName("delete-form");

    for (let i = 0; i < deleteTrainingButtons.length; i++) {
        deleteTrainingButtons[i].addEventListener("click", e => {
            e.preventDefault();
            confirmationModal.style.display = "block";

            confirmResetButton.addEventListener("click", () => {
                deleteForms[i].submit();
                confirmationModal.style.display = "none";
            });
        })
    }


    cancelResetButton.addEventListener("click", () => {
        confirmationModal.style.display = "none";
    });

    console.log(deleteForms);

    
})