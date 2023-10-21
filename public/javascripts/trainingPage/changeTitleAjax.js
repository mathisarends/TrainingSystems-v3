document.addEventListener("DOMContentLoaded", () => {

    // changes the title of the training edit page while not refreshing - used in order to catch fetch events in service worker

    const submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", e => {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
    })

    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {

        const formData = new FormData(event.target);
        const formDataObject = {};

        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        try {
            const response = await fetch(`${form.action}`, {
                method: "PATCH",
                body: JSON.stringify(formDataObject), // send json object
                headers: {
                    "Content-Type": "application/json", // set contennt type accordingly
                },
            });

            if (response.ok) {
                showMessage(".save-status-sucess", "Erfolgreich aktualisiert");

            } else {
                showMessage(".save-status-failure", "Fehler beim aktualisieren");
            }
        } catch (err) {
            console.error("Fehler beim aktualisieren", err);
            showMessage(".save-status-failure", "Offline Modus: Daten erfolgreich aktualisert!");
        }

    })

    function showMessage(element, message, success = true, duration = 5000) {
        const messageElement = document.querySelector(element);

        setTimeout(() => { //weicherer übergang damit animation zeit hat
            messageElement.classList.remove("hidden");
        }, 250); // Verzögerung von 10 Millisekunden

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
})