document.addEventListener("DOMContentLoaded", () => {
    const showExercisesNav = document.querySelector(".tab-list");
    const navButtons = showExercisesNav.querySelectorAll("button");

    const exerciseTables = Array.from(document.querySelectorAll("table:not(:first-of-type)"));
    const mainTables = exerciseTables.slice(0, 3);
    const accesoireTables = exerciseTables.slice(3);

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
})