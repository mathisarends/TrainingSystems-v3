document.addEventListener("DOMContentLoaded", () => {
    const navigateFurtherButtons = document.querySelectorAll(".navigate-further-btn");
    const pageIndicators = document.querySelectorAll(".dot-indicators button");
    const contentPages = document.querySelectorAll(".content-page");

    const form = document.querySelector("form");


    navigateFurtherButtons.forEach((button, index) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            if (index === contentPages.length - 1) { // wenn es der letzte ist
                form.dispatchEvent(new Event("submit"));

                /* window.location.href = "/login"; */
            } else {
                pageIndicators[index].setAttribute("aria-selected", false);
                pageIndicators[(index + 1) % pageIndicators.length].setAttribute("aria-selected", true);

                contentPages[index].style.display = "none";
                contentPages[(index + 1) % pageIndicators.length].style.display = "block";
            }
        })
    })

    pageIndicators.forEach((pageIndicator, index) => {
        pageIndicator.addEventListener("click", e => {
            e.preventDefault();
            console.log(index);

            for (let i = 0; i < pageIndicators.length; i++) {
                pageIndicators[i].setAttribute("aria-selected", false);
                contentPages[i].style.display = "none";
            }
            pageIndicators[index].setAttribute("aria-selected", true);
            contentPages[index].style.display = "block";

        })
    })


    const relativeURL = window.location.pathname + window.location.search;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const formData = new FormData(event.target);
    
        // Wandele die FormData in ein JavaScript-Objekt um
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
    
        try {
          const response = await fetch(`${relativeURL}`, {
            method: "POST",
            body: JSON.stringify(formDataObject), // Sende das JSON-Objekt
            headers: {
              "Content-Type": "application/json", // Setze den Content-Type auf application/json
            },
          });
    
          if (response.ok) {
            showMessage(".save-status-sucess", "Erfolgreich gespeichert");

            const lastButton = navigateFurtherButtons[navigateFurtherButtons.length - 1];

            prepareLastButton(lastButton);

          } else {
            
            try {
              const errorData = await response.json();
              showMessage(".save-status-failure", "Trage bitte alle Werte ein!");
            } catch (error) {
              // Die Antwort ist kein JSON, behandeln Sie sie entsprechend.
              console.error("Fehler beim Aktualisieren ", error);
              showMessage(".save-status-failure", "Fehler beim Aktualisieren");
            } finally {
                // es soll immer ein weiter
                const lastButton = navigateFurtherButtons[navigateFurtherButtons.length - 1];

                prepareLastButton(lastButton);
            }
          }
        } catch (error) {
          console.error("Fehler beim Aktualisieren ", error);
          showMessage(".save-status-failure", "Fehler beim Aktualisieren");
        }
      });



      
      function prepareLastButton(button) {
        button.textContent = "EINLOGGEN";

        button.addEventListener("click", e => {
            e.preventDefault();
            window.location.href = "/login";
        })
      }

      function showMessage(element, message, success = true, duration = 7500) {
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