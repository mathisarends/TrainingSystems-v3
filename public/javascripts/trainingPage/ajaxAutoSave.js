document.addEventListener("DOMContentLoaded", () => {
  
  //implements autosaving after there was a change event to a weight input
  //also after a certain time interval through service worker

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
        // server may get restarted or time out so the get an error here because we fetch to the wrong url:
        // against login for example if the session is closed
        
        showMessage(".save-status-sucess", "Fehler beim aktualisieren");
      }
    } catch (error) {
      //aufpassen Netzwerkfehler ist nicht der einzigste Fehler der auftreten kann:
      showMessage(".save-status-sucess", "Offline Mode: Erfolgreich aktualisert!");
    }
  });

  /*TRIGGER submit for all weight changes*/
  const weightInputs = document.querySelectorAll(".weight");
  const setInputs = document.querySelectorAll(".sets");
  const saveAudio = document.getElementById("save-audio");

  weightInputs.forEach((weightInput, index) => {
    weightInput.addEventListener("change", () => {

      let input = weightInput.value;
      if (input === "" || input === 0) { //new value is not valid
        weightInput.value = "";
        return;
      }
      input = input.replace(/,/g, "."); //replace commas with points
      let numbers = input.split(";").map(Number);
      numbers.forEach((number) => {
        if (isNaN(number)) { //on of the given weight values is not a number return empty string
          weightInput.value = "";
          return;
        }
      })

      if (numbers.length == setInputs[index].value || number.length === 1) {

        const sum = numbers.reduce((acc, num) => acc + num + 0);
        const average = sum / numbers.length;

        const roundedAverage = Math.round(average / 2.5) * 2.5;
        // Ensure that the rounded average is always a multiple of 2.5
        if (roundedAverage % 2.5 !== 0) {
            roundedAverage = Math.round(roundedAverage / 2.5) * 2.5;
        }
        weightInput.value = roundedAverage;

        saveAudio.play();
        form.dispatchEvent(new Event("submit"));
      } else {
        //do nothing:
      }



    });
  });
});
