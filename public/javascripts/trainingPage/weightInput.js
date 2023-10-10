document.addEventListener("DOMContentLoaded", () => {
    // hier jegliche logik aus ajaxAutoSave reintuen die mit den weight inputs und recommandations zu tun hat.

    const form = document.querySelector("form");

    form.addEventListener("change", e => {
        const target = e.target;
        if (target && target.classList.contains("weight")) {
          handleWeightInputChange(target);
        }
      })

      form.addEventListener("change", e => {
        const target = e.target;
    
        if (target && (target.classList.contains("exercise-name-selector")) || target.classList.contains("exercise-category-selector")) {
          const parentRow = target.closest("tr");
          getWeightRecommandation(parentRow);
        }
      })

      // diese funktion auch aufrufen wenn sich die rep anzahl oder die targetRPE ändert TODO:
      function getWeightRecommandation(row) {
        const category = row.querySelector(".exercise-category-selector").value;
        const weightInput = row.querySelector(".weight");
    
        if ((category === "Squat" || category === "Bench" || category === "Deadlift") && !weightInput.value) {
          const exerciseName = row.querySelector('.exercise-name-selector:not([style*="display: none"])').value;
          const maxAdjustmentFactor = maxFactors[exerciseName];
    
          const reps = row.querySelector(".reps").value;
          const planedRPE = row.querySelector(".targetRPE").value;
    
          if (reps && planedRPE) {
            const totalReps = parseInt(reps) +  (10 - parseFloat(planedRPE)); //reps + reps in reserve = totalreps
            let percentage = //regression forumula
            (0.484472 * totalReps * totalReps -
              33.891 * totalReps +
              1023.67) *
              0.001;
    
            const estMaxByCategory = getMaxByCategory(category) * maxAdjustmentFactor;
            let result = estMaxByCategory * percentage;
    
            //TOOD: nur wenn kein placeholder gerendert wurde
            result = Math.ceil(result / 2.5) * 2.5;
            const lowerLimit = result - 2.5;
            const upperLimit = result + 2.5;
            const resultString = lowerLimit + "-" + upperLimit;
    
            if (weightInput.placeholder === "") {
              weightInput.placeholder = resultString;
            }
    
          }
        }
    
      }

      const exerciseTableRows = document.querySelectorAll(".table-row.mainExercise");
      exerciseTableRows.forEach((tableRow) => {
        getWeightRecommandation(tableRow);
      })

    function handleWeightInputChange(weightInput) {
        let input = weightInput.value;
        if (input === "" || input === 0) {
          weightInput.value = "";
          return;
        }
      
        input = input.replace(/,/g, ".");
        let numbers = input.split(";").map(Number);
        numbers.forEach((number) => {
          if (isNaN(number)) {
            weightInput.value = "";
            return;
          }
        });
    
        const parentRow = weightInput.closest("tr");
        const setInput = parentRow.querySelector(".sets");
      
        if (numbers.length == setInput.value || numbers.length === 1) {
          const sum = numbers.reduce((acc, num) => acc + num + 0);
          const average = sum / numbers.length;
      
          let roundedAverage = Math.round(average / 2.5) * 2.5;
          if (roundedAverage % 2.5 !== 0) {
            roundedAverage = Math.round(roundedAverage / 2.5) * 2.5;
          }
          weightInput.value = roundedAverage;
      
          saveAudio.play();
          form.dispatchEvent(new Event("submit")); //hier soll auch nicht immer das submit event dispatched werden sondenr nur wenn alle eingaben valide sind also der input ein int ist. sonst synchro fehler:
        } else {
          // Do nothing
        }
      }

      function getMaxByCategory(category) {
        if (category === "Squat") {
          return document.getElementById("userMaxSquat").value;
        } else if (category === "Bench") {
          return document.getElementById("userMaxBench").value;
        } else if (category === "Deadlift") {
          return document.getElementById("userMaxDeadlift").value;
        }
      }

})