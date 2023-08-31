document.addEventListener("DOMContentLoaded", () => {
  // for showing the failure and sucess messages
  let indexVisibleSection = findIndexOfVisibleSection();
  const navButtons = document.querySelectorAll(".dot-indicators button");

  navButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      indexVisibleSection = index;
    });
  });

  function findIndexOfVisibleSection() {
    const tableSections = document.querySelectorAll(".table-section");
    let indexOfVisibleSection = -1;

    for (let i = 0; i < tableSections.length; i++) {
      const section = tableSections[i];
      const displayStyle = window
        .getComputedStyle(section)
        .getPropertyValue("display");

      if (displayStyle === "block") {
        indexOfVisibleSection = i;
        break;
      }
    }

    return indexOfVisibleSection;
  }

  function showMessage(element, message, success = true, duration = 5000) {
    const messageElement = document
      .querySelectorAll(".table-section")
      [indexVisibleSection].querySelector(element);

    messageElement.classList.remove("hidden");
    messageElement.textContent = message;

    setTimeout(() => {
      messageElement.classList.add("hidden");
      messageElement.textContent = "";
    }, duration);

    if (success) {
      console.log(message);
    } else {
      console.error(message);
    }
  }

  const form = document.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Wandele die FormData in ein JavaScript-Objekt um
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    try {
      const response = await fetch(`${window.location.pathname}`, {
        method: "PATCH",
        body: JSON.stringify(formDataObject), // Sende das JSON-Objekt
        headers: {
          "Content-Type": "application/json", // Setze den Content-Type auf application/json
        },
      });

      if (response.ok) {
        showMessage(".save-status-sucess", "Erfolgreich aktualisiert");
      } else {
        const errorData = await response.json();
        showMessage(".save-status-failure", "Fehler beim Aktualisieren", false);
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren ", error);
      document
        .querySelectorAll(".table-section")
        [indexVisibleSection].querySelector(
          ".save-status-failure"
        ).style.display = "block";
    }
  });

  /*TRIGGER submit for all weight changes*/
  const weightInputs = document.querySelectorAll(".weight");

  weightInputs.forEach((weightInput) => {
    weightInput.addEventListener("change", () => {
      form.dispatchEvent(new Event("submit"));
    });
  });

  /*SAVE unchanged settings*/


});
