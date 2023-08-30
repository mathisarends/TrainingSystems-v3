document.addEventListener("DOMContentLoaded", () => {
    console.log("Alles klar?")
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");
    const cancelResetButton = document.getElementById("cancelResetButton"); 
    
    //Das hier noch in allen Dokumenten ändern
    const saveTrainingButton = document.getElementById("save-training-button");

    saveTrainingButton.addEventListener("click", e => {
        e.preventDefault();
        confirmationModal.style.display = "block";
    })

    cancelResetButton.addEventListener("click", () => {
            confirmationModal.style.display = "none";
        });

    confirmResetButton.addEventListener("click", () => {
            document.forms["editTraining"].submit();
            confirmationModal.style.display = "none";
            window.location.href = "/training";
    });

})