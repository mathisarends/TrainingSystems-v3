document.addEventListener("DOMContentLoaded", () => {

    console.log("change Title ajax");

    const backToTrainingPageBTN = document.querySelector(".form-button");
    backToTrainingPageBTN.addEventListener("click", e => {
        e.preventDefault();

        window.location.href = "/training";
    })

    const submitButton = document.querySelector(".form-button-2");

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
            const response = await fetch(`${window.location.pathname}`, {
                method: "PATCH",
                body: JSON.stringify(formDataObject), // Sende das JSON-Objekt
                headers: {
                    "Content-Type": "application/json", // Setze den Content-Type auf application/json
                },
            });

            if (response.ok) {
                console.log("GEPATCHED");
                showMessage(".save-status-sucess", "Erfolgreich aktualisiert");

            } else {
                showMessage(".save-status-failure", "Fehler beim aktualisieren");
            }
        } catch (err) {
            console.error("Fehler beim aktualisieren", err);
            showMessage(".save-status-failure", "Keine Internetverbindung deine Daten werden später aktualisiert!");
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