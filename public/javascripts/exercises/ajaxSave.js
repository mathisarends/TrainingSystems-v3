document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("post-form");

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
        method: "PATCH",
        body: JSON.stringify(formDataObject),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showMessage(".save-status-sucess", "Erfolgreich aktualisiert");
      } else {
        const errorData = await response.json();
        showMessage(".save-status-failure", "Fehler beim Aktualisieren");
      }
    } catch (err) {
      console.error("Fehler beim aktualisieren auf Client Seite: " + err);
    }
  });


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
