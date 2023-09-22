document.addEventListener("DOMContentLoaded", () => {
  // this script shows the right titles on the training index page if they were edited while offline or in offline mode
  // also shows the 

  const trainingPlanTitles = document.querySelectorAll(".training-plan-title");
  const sessionTitles = document.querySelectorAll(".session-title");

  const trainingPlanContainers = document.querySelectorAll(".training-plan-container");

  const userID = document.getElementById("userIdentification").value;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({
          command: "getOfflineEditedTrainingTitles",
          userID: userID,
        });

        //dont show deleted Trainings
        registration.active.postMessage({
          //hier die deletes anfragen:
          command: "getOFflineDeletedTrainings",
          userID: userID,
        })
      }
    });

    // das hier unbedingt refactoren vllt auch die ganze redirect page:
    navigator.serviceWorker.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "sendDeletedTrainings") {
        const deletedTrainings = message.data;
        console.log(deletedTrainings);

        if (deletedTrainings) {
          for (const deletedTraining of deletedTrainings) {
            if (deletedTraining.trainingPlanType === "custom-training") {
              const allCustomTrainings = trainingPlanContainers[0].querySelectorAll(".custom-training-container");
              allCustomTrainings[deletedTraining.deleteIndex].style.display = "none";


            } else if (deletedTraining.trainingPlanType === "session-training") {
              const allCustomSessions = trainingPlanContainers[1].querySelectorAll(".custom-training-container");
              allCustomSessions[deletedTraining.deleteIndex].style.display = "none";

            } else if (deletedTraining.trainingPlanType === "template-training") {
              // hier eigentlich nichts weiter machen: //vllt das hier gar nicht zulassen oder überlegen was man da machen kann.
              // alte daten würden ja noch angezeigt werden ^^:
            }
          }
        }
      }
    })

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
