document.addEventListener("DOMContentLoaded", () => {

  //used for further options directly after the user has registered

    const navigateFurtherButtons = document.querySelectorAll(".navigate-further-btn"); //
    const pageIndicators = document.querySelectorAll(".dot-indicators button");
    const contentPages = document.querySelectorAll(".content-page");

    const form = document.querySelector("form");

    navigateFurtherButtons.forEach((button, index) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            if (index === contentPages.length - 1) { // wenn es der letzte ist
                form.dispatchEvent(new Event("submit"));

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

            for (let i = 0; i < pageIndicators.length; i++) {
                pageIndicators[i].setAttribute("aria-selected", false);
                contentPages[i].style.display = "none";
            }
            pageIndicators[index].setAttribute("aria-selected", true);
            contentPages[index].style.display = "block";

        })
    })


    const relativeURL = window.location.pathname + window.location.search;

    // ajax saving in order to tell the user whether the data was saved sucessfully or not
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const formData = new FormData(event.target);
    
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
    
        try {
          const response = await fetch(`${relativeURL}`, {
            method: "POST",
            body: JSON.stringify(formDataObject), 
            headers: {
              "Content-Type": "application/json", 
            },
          });
    
          if (response.ok) {
            showMessage(".save-status-sucess", "Erfolgreich gespeichert");
            const lastButton = navigateFurtherButtons[navigateFurtherButtons.length - 1];

            prepareLastButton(lastButton); //shows the navigate to login button

          } else {
            
            try {
              showMessage(".save-status-failure", "Trage bitte alle Werte ein!");
            } catch (error) {
              console.error("Error while saving ", error);
              showMessage(".save-status-failure", "Fehler beim Aktualisieren");
            } finally {
                // always navigate futher
                const lastButton = navigateFurtherButtons[navigateFurtherButtons.length - 1];

                prepareLastButton(lastButton);
            }
          }
        } catch (error) {
          console.error("Error while saving ", error);
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
    
        setTimeout(() => { //smoother transition with animated class hidden
          messageElement.classList.remove("hidden");
        }, 250); 
    
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