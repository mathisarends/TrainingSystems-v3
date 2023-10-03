document.addEventListener("DOMContentLoaded", () => {
  const patchForm = document.getElementById("post-form");
  const resetForm = document.getElementById("reset-form");

  const resetExercisesButton = document.getElementById("reset-exercises-button"); // this button triggers a delete confirmation modal
  const confirmationModal = document.getElementById("confirmationModal");
  const confirmResetButton = document.getElementById("confirmResetButton"); // this button sends the form
  const cancelResetButton = document.getElementById("cancelResetButton"); // this button cancels th event

  function handleSubmit(event, url, method, successMessage, failureMessage) {
    event.preventDefault();
    const formData = new FormData(event.target);
  
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
  
    fetch(url, {
      method: method, 
      body: JSON.stringify(formDataObject),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          showMessage(".save-status-sucess", successMessage);

          // wenn es ein reset war dann die seite neuladen
          if (method === "POST") {
            window.location.reload();
          }

        } else {
          showMessage(".save-status-failure", failureMessage);
        }
      })
      .catch((err) => {
        console.error(`Fehler aufgetreten: ${err}`);
        showMessage(".save-status-sucess", `Offline Mode: ${successMessage}`);
      });
  }

  patchForm.addEventListener("submit", (event) => {
    handleSubmit(
      event,
      window.location.pathname,
      "PATCH",
      "Erfolgreich aktualisiert",
      "Fehler beim Aktualisieren"
    );
  });
  
  resetForm.addEventListener("customSubmit", (event) => {
    handleSubmit(
      event,
      `${window.location.pathname}/reset`,
      "POST",
      "Erfolgreich zurückgesetzt",
      "Fehler beim Zurücksetzen"
    );
  });


  // handle the confirmation modal
  resetExercisesButton.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("reset button wurde geklickt es liegt am modal")
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

  // displays the failure/sucess message (using animation css class) for 5 seconds
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
