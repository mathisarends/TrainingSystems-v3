document.addEventListener("DOMContentLoaded", () => {
    console.log("Before unload eingebunden");

    const selects = document.querySelectorAll("select");
    const inputs = document.querySelectorAll("input");

    let unsavedChanges = false;

    selects.forEach((select) => {
      select.addEventListener("change", () => {
        unsavedChanges = true;
      })
    })

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        unsavedChanges = true;
      })
    })


  window.addEventListener("beforeunload", (event) => {
    event.preventDefault();

    // wenn es ungeädnerte changes gibt dann warnung anzeigen.
    if (unsavedChanges) {
      event.returnValue = "Sie haben ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?";

    }
  })

  })