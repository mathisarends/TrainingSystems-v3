document.addEventListener("DOMContentLoaded", () => {
    const showExercisesNav = document.querySelector(".tab-list");
    const navButtons = showExercisesNav.querySelectorAll("button");

    const exerciseTables = Array.from(document.querySelectorAll("table:not(:first-of-type)"));
    const mainTables = exerciseTables.slice(0, 3);
    const accesoireTables = exerciseTables.slice(3);

    // display certain categories according to the section navigated to
    navButtons.forEach((navButton, index) => {
      navButton.addEventListener("click", e => {
        e.preventDefault();

        navButtons.forEach((btn) => {
          btn.setAttribute("aria-selected", false);
        })

        navButton.setAttribute("aria-selected", true);

        if (index === 0) {
          showTables(exerciseTables);
        } else if (index === 1) {
          showTables(mainTables);
          hideTables(accesoireTables);
        } else if (index === 2) {
          showTables(accesoireTables);
          hideTables(mainTables);
        }

        window.scrollTo(0, 0); //jump to start of the page

      })
    })

    function showTables(tables) {
      tables.forEach((table) => {
        table.removeAttribute("hidden");
      })
    }

    function hideTables(tables) {
      tables.forEach((table) => {
        table.setAttribute("hidden", true);
      })
    }

    //swipe logic
    const swipeBody = document.querySelector("form");
    let startX;
    let endX;
  
    swipeBody.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    })
  
    swipeBody.addEventListener("touchend", e => {
      endX = e.changedTouches[0].clientX;
  
      const swipeThreshold = 110;
  
      if (startX - endX > swipeThreshold) {
                  navigateToNextDay();             // Swipe left, navigate to the next day
      } else if (endX - startX > swipeThreshold) {
                  navigateToPreviousDay();             // Swipe right, navigate to the previous day
      }

      function navigateToNextDay() {
        const selectedButton = document.querySelector(".tab-list button[aria-selected='true']");
        const nextButton = selectedButton.nextElementSibling || navButtons[0];

        if (nextButton) {
            nextButton.click();
        }
      }

      function navigateToPreviousDay() {
          const selectedButton = document.querySelector(".tab-list button[aria-selected='true']");
          const previousButton = selectedButton.previousElementSibling || navButtons[navButtons.length - 1];

          if (previousButton) {
              previousButton.click();
          }
      }
  
    })
})