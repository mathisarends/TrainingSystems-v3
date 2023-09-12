document.addEventListener("DOMContentLoaded", () => {
  const resetExercisesButton = document.getElementById(
    "reset-exercises-button"
  );
  const confirmationModal = document.getElementById("confirmationModal");
  const confirmResetButton = document.getElementById("confirmResetButton");
  const cancelResetButton = document.getElementById("cancelResetButton");

  const postForm = document.querySelector("form");
  const resetForm = document.getElementById("reset-form");

  //TODO: auch bei reset implementieren + in kombination mit dem modal zum funktionieren bringen
  resetForm.addEventListener("customSubmit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    try {
      const response = await fetch(`${window.location.pathname}/reset`, {
        method: "POST",
        body: JSON.stringify(formDataObject),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showMessage(".save-status-sucess", "Erfolgreich zurückgesetzt");
      } else {
        const errorData = await response.json();
        showMessage(".save-status-failure", "Fehler beim Zurücksetzen");
      }
    } catch (err) {
      console.error("Fehler beim Zurücksetzen auf Client Seite");
    }
  });

  resetExercisesButton.addEventListener("click", (e) => {
    e.preventDefault();
    confirmationModal.style.display = "block";
  });

  cancelResetButton.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });

  confirmResetButton.addEventListener("click", () => {
    const event = new Event("customSubmit", {
      bubbles: true,
      cancelable: true,
    });

    resetForm.dispatchEvent(event);
    confirmationModal.style.display = "none";
  });

  //to display the saveStatus for the user:
  function showMessage(element, message, duration = 5000) {
    const messageElement = document.querySelector(element);

    messageElement.classList.remove("hidden");
    messageElement.textContent = message;

    setTimeout(() => {
      messageElement.classList.add("hidden");
      messageElement.textContent = "";
    }, duration);

  }

});
