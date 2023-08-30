document.addEventListener("DOMContentLoaded", () => {
    
    console.log("Ajax ready");

    const form = document.querySelector("form");
    /* const submitButton = document.querySelector('form button[type="submit"]');
    console.log(submitButton);
    console.log(form); */

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
                method: 'PATCH',
                body: JSON.stringify(formDataObject), // Sende das JSON-Objekt
                headers: {
                    'Content-Type': 'application/json', // Setze den Content-Type auf application/json
                }
            });

            if (response.ok) {
                console.log("Erfolgreich aktualisiert");
            } else {
                console.error("Fehler beim Aktualisieren");
            }
        } catch (error) {
            console.error("Fehler beim Aktualisieren ", error);
        }
    });

    const weightInputs = document.querySelectorAll(".weight");

    weightInputs.forEach((weightInput) => {
        weightInput.addEventListener("change", () => {
            form.dispatchEvent(new Event("submit"));
        })
    })

    window.addEventListener("beforeunload", (event) => {
        event.preventDefault();

        const confirmationModal = document.getElementById("confirmationModal");
        confirmationModal.querySelector('input[type="text"]').value = "Willst du deine Änderungen speichern?";
        confirmationModal.querySelector("#confirmResetButton").textContent = "JA";
        confirmationModal.querySelector("#cancelResetButton").textContent = "NEIN";

        confirmationModal.style.display = "block";

        
    })
});

/*    res.status(200).json({}); das hier muss vom server als antwort kommen:*/