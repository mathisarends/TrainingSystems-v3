document.addEventListener("DOMContentLoaded", () => {
  // Diese Seite zeigt auf der TrainingsIndex Seite die richtigen Titel
  const trainingPlanTitles = document.querySelectorAll(".training-plan-title");
  const sessionTitles = document.querySelectorAll(".session-title");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({
          command: "getTrainingEditPatches",
        });
      }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.command === "offlineTrainingEdits") {
        const editedEntries = message.data;

        if (editedEntries) {
          for (const entry of editedEntries) {
            if (entry.url.includes("custom-A-edit")) {
              trainingPlanTitles[0].textContent = entry.body.training_title;
            } else if (entry.url.includes("custom-B-edit")) {
              trainingPlanTitles[1].textContent = entry.body.training_title;
            } else if (entry.url.includes("custom-c-edit")) {
              trainingPlanTitles[2].textContent = entry.body.training_title;
            } else if (entry.url.includes("session-edit-1")) {
              sessionTitles[0].textContent = entry.body.training_title;
            } else if (entry.url.includes("session-edit-2")) {
              sessionTitles[1].textContent = entry.body.training_title;
            } else if (entry.url.includes("session-edit-3")) {
              sessionTitles[2].textContent = entry.body.training_title;
            } else {
            }
          }
        }
      }
    });
  }
});
