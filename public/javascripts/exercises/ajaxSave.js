document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("post-form");
  const resetForm = document.getElementById("reset-form");

  
  //TODO: auch bei reset implementieren + in kombination mit dem modal zum funktionieren bringen
/*   resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
  }) */

  // hier muss wirklich eine patch anfrage gemacht werden
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const formDataObject = {}; //convert formData to JSON-Object
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    try {
      const response = await fetch(`${window.location.pathname}`, {
        method: "POST",
        body: JSON.stringify(formDataObject),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("okay");
        showMessage(".save-status-sucess", "Erfolgreich aktualisiert");
      } else {
        const errorData = await response.json();
        showMessage(".save-status-failure", "Fehler beim Aktualisieren", false);
      }
    } catch (err) {
      console.error("Fehler beim aktualisieren auf Client Seite: " + err);
    }
  });




  function showMessage(element, message, success = true, duration = 5000) {
    const messageElement = document.querySelector(element);

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
});
