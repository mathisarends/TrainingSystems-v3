document.addEventListener("DOMContentLoaded", () => {
    const googleBTN = document.getElementById("google-btn");

    googleBTN.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/auth/google";
    })

    const loginForm = document.querySelector("form");

    loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Verhindern Sie das Standardverhalten des Formulars, um die Seite nicht neu zu laden.

    // Erfassen Sie Benutzername und Passwort aus dem Formular
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Erstellen Sie ein verschlüsseltes Objekt, um an den Server zu senden
    const encryptedData = {
        username: username,
        password: password, // Hier sollte das Passwort verschlüsselt werden.
    };

    // Senden Sie die verschlüsselten Daten an den Server über HTTPS
    fetch("/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(encryptedData),
})
    .then((response) => {
        if (response.status === 200) {
            // Erfolgreiche Anmeldung
            window.location.href = "/";
        } else if (response.status === 401) {
            const errMessage = "username or password incorrect"; // Nachricht aus der JSON-Antwort
            showFailureFlash(errMessage);
        }
    })
    .catch((error) => {
        console.error("Fehler beim Senden der Anmeldeinformationen:", error);

        const errMessage = "password incorrect"; // Nachricht aus der JSON-Antwort
        showFailureFlash(errMessage);
    });
    });

    function showFailureFlash(errMessage) {
        errContainer = document.getElementById("error-message");
        errContainer.textContent = errMessage;
        errContainer.style.display = "block";
    }
})