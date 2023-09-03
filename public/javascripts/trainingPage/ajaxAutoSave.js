document.addEventListener("DOMContentLoaded", () => {
  /* Auto Save Function even if the display is locked*/

  const intervalInMilliseconds = 5 * 60 * 1000; // 5 minutes (in ms)

  const timerWorker = new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
  let remainingTime = 0;
  let timerInterval;

  self.addEventListener('message', function (e) {
    const data = e.data;
    if (data.command === 'start') {
      remainingTime = data.duration;
      startTimer();
    }
  });

  function startTimer() {
    const interval = 1000; // 1 Sekunde
    timerInterval = setInterval(function () {
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        self.postMessage({ command: 'complete' });
      } else {
        remainingTime -= interval;
      }
    }, interval);
  }
  // ...

  `,
        ],
        { type: "application/javascript" }
      )
    )
  );

  timerWorker.postMessage({
    command: "start",
    duration: intervalInMilliseconds,
  }); //starts inital timer

  timerWorker.addEventListener("message", function (e) {
    const data = e.data;
    if (data.command === "complete") {
      saveAndRestartTimer(); // timer is called again
    }
  });
  function saveAndRestartTimer() {
    const form = document.querySelector("form");
    form.dispatchEvent(new Event("submit"));
    timerWorker.postMessage({
      command: "start",
      duration: intervalInMilliseconds,
    });
  }

  // DAs funktioniert auch nicht zu hundert prozent es werden fehlerhafte patch anfragen an den server gesendet
  window.addEventListener("beforeunload", () => { //Bei Verlassen der Seite soll der Tinger gestoppt werdne
    timerWorker.postMessage({ command: 'stop' });
  });
  



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
        
        try {
          const errorData = await response.json();
          showMessage(".save-status-failure", "Fehler beim Aktualisieren");
        } catch (error) {
          // Die Antwort ist kein JSON, behandeln Sie sie entsprechend.
          console.error("Fehler beim Aktualisieren ", error);
          document
            .querySelectorAll(".table-section")
            [indexVisibleSection].querySelector(
              ".save-status-failure"
            ).style.display = "block";
        }
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
  const saveAudio = document.getElementById("save-audio");

  weightInputs.forEach((weightInput) => {
    weightInput.addEventListener("change", () => {

      saveAudio.play();

      form.dispatchEvent(new Event("submit"));
    });
  });
});
