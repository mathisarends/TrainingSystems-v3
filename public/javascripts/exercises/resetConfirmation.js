document.addEventListener("DOMContentLoaded", () => {
    const resetExercisesButton = document.getElementById("reset-exercises-button");
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");
    const cancelResetButton = document.getElementById("cancelResetButton");

    const postForm = document.querySelector("form");
    const resetForm = document.getElementById("reset-form");
    console.log(resetForm);

    resetExercisesButton.addEventListener("click", e => {
      e.preventDefault();
      confirmationModal.style.display = "block";
    });

    cancelResetButton.addEventListener("click", () => {
      confirmationModal.style.display = "none";
    });

    confirmResetButton.addEventListener("click", () => {
      resetForm.submit()
      confirmationModal.style.display = "none";
    });
})