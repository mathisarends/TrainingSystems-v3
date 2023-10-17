document.addEventListener("DOMContentLoaded", () => {
  
  //implements autosaving after there was a change event to a weight input
  //also after a certain time interval through service worker
  const url = window.location.href;

  const autoSaveIntervall = 10 * 60 * 1000; // 5 minutes (in ms)

  // everything that has to do with the auto save in this branch
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {

      //starts timer initially
      if (registration.active) {
        registration.active.postMessage({
          command: "startAutoSaveTimer",
          duration: autoSaveIntervall
        })
      }

      //before the page is left the timer is reset: 
      window.addEventListener("beforeunload", () => {
        registration.active.postMessage({
          command: "stopAutoSaveTimer",
        });
      })
    })

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      // if the timer is complet => try to send form to server - timer is restartet in sw file
      if (data.command === "autoSaveTimerCompleted") {
        const form = document.querySelector("form");
        form.dispatchEvent(new Event("submit"));
      }
    })
  }

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

        // Überprüfen, ob das Nachrichten-Element die Klasse "hidden" hat
      if (!messageElement.classList.contains("hidden")) {
        messageElement.classList.add("hidden");
      }

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
      const response = await fetch(`${event.target.action}`, {
        method: "PATCH",
        body: JSON.stringify(formDataObject), // Sende das JSON-Objekt
        headers: {
          "Content-Type": "application/json", // Setze den Content-Type auf application/json
        },
      });

      if (response.ok) {
        showMessage(".save-status-sucess", "Erfolgreich aktualisiert");
      } else {
        // server may get restarted or time out so the get an error here because we fetch to the wrong url:
        // against login for example if the session is closed
        
        showMessage(".save-status-sucess", "Fehler beim aktualisieren");
      }
    } catch (error) {
      //aufpassen Netzwerkfehler ist nicht der einzigste Fehler der auftreten kann:
      showMessage(".save-status-sucess", "Offline Mode: Erfolgreich aktualisert!");
    }
  });
  
  //für SESSION ONLY
  if (url.includes("session-train")) {
    const finishSessionButton = document.getElementById("finishSessionButton");
    const modal = document.getElementById("confirmationModal");

    //customSubmit for creating new entry in trainingPlans
    const customSubmitEvent = new CustomEvent("customSubmit");

    finishSessionButton.addEventListener("click", e => {
        e.preventDefault();
        modal.style.display = "block";

        const confirmBTN = modal.querySelectorAll("button")[0];
        const cancelBTN = modal.querySelectorAll("button")[1];

        confirmBTN.addEventListener("click", e => {
            e.preventDefault();

            console.log("custom event happening");
            form.dispatchEvent(new CustomEvent("customSubmit"));
        })

        cancelBTN.addEventListener("click", e => {
            e.preventDefault();

            modal.style.display = "none";
        })
    })

    // eventlistener for custom submit
    form.addEventListener("customSubmit", async event => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        // Wandele die FormData in ein JavaScript-Objekt um
        const formDataObject = {};
        formData.forEach((value, key) => {
        formDataObject[key] = value;
        });

        formDataObject["isSessionComplete"] = true;

        try {
            const reponse = await fetch(`${window.location.pathname}`, {
                method: "PATCH", 
                body: JSON.stringify(formDataObject),
                headers: {
                    "Content-Type": "application/json", // Setze den Content-Type auf application/json
                },
            });

            if (response.ok) {
              showMessage(".save-status-sucess", "Erfolgreich aktualisiert");
            } else {
              showMessage(".save-status-sucess", "Fehler beim aktualisieren");
            }
          } catch (error) {
            //aufpassen Netzwerkfehler ist nicht der einzigste Fehler der auftreten kann:
            showMessage(".save-status-sucess", "Offline Mode: Erfolgreich aktualisert!");
          } finally {
            window.location.href = "/training"; //zur trainingsoverview navigieren
          }
        

    })
  }


});
