  document.addEventListener('DOMContentLoaded', function() {
    // Get all the table rows in the table
    const tableRows = document.querySelectorAll('.workout-table tr');
  
    function updateSets() {
      let squatSets = 0;
      let benchSets = 0;
      let deadliftSets = 0;
      let squatTonnage = 0;
      let benchTonnage = 0;
      let deadliftTonnage = 0;
  
      tableRows.forEach((row) => {
        const categorySelector = row.querySelector('.exercise-category-selector');
        const setInput = row.querySelector('.sets');
        const repInput = row.querySelector('.reps');
        const weightInput = row.querySelector('.weight');
  
        if (categorySelector && setInput && repInput && weightInput) {
          const exerciseCategory = categorySelector.value;
          const sets = parseInt(setInput.value, 10) || 0; // Parse the value to an integer or default to 0
          const reps = parseInt(repInput.value, 10) || 0;
          const weight = parseFloat(weightInput.value) || 0; // Parse the value to a floating-point number or default to 0
  
          if (exerciseCategory === 'Squat') {
            squatSets += sets;
            squatTonnage += sets * reps * weight;
          } else if (exerciseCategory === 'Bench') {
            benchSets += sets;
            benchTonnage += sets * reps * weight;
          } else if (exerciseCategory === 'Deadlift') {
            deadliftSets += sets;
            deadliftTonnage += sets * reps * weight;
          }
        }
      });
  
      let squatSetsDone = document.getElementsByClassName("squat-sets-done");
      let benchSetsDone = document.getElementsByClassName("bench-sets-done");
      let deadliftSetsDone = document.getElementsByClassName("deadlift-sets-done");
      let squatTonnageFields = document.getElementsByClassName("squat-tonnage");
      let benchTonnageFields = document.getElementsByClassName("bench-tonnage");
      let deadliftTonnageFields = document.getElementsByClassName("deadlift-tonnage");
  
      for (let i = 0; i < squatSetsDone.length; i++) {
        squatSetsDone[i].value = squatSets;
        squatTonnageFields[i].value = squatTonnage.toFixed(2); // Runde auf 2 Dezimalstellen
      }
  
      for (let i = 0; i < benchSetsDone.length; i++) {
        benchSetsDone[i].value = benchSets;
        benchTonnageFields[i].value = benchTonnage.toFixed(2); // Runde auf 2 Dezimalstellen
      }
  
      for (let i = 0; i < deadliftSetsDone.length; i++) {
        deadliftSetsDone[i].value = deadliftSets;
        deadliftTonnageFields[i].value = deadliftTonnage.toFixed(2); // Runde auf 2 Dezimalstellen
      }
    }
  
    // Initial update of sets
    updateSets();
  
    // Add event listeners for exercise category, set, reps, and weight inputs
    const exerciseCategorySelectors = document.querySelectorAll(".exercise-category-selector");
    const setSelectors =  document.querySelectorAll(".sets");
    const repSelectors = document.querySelectorAll(".reps");
    const weightSelectors = document.querySelectorAll(".weight");
  
    exerciseCategorySelectors.forEach(selector => {
      selector.addEventListener('change', updateSets);
    });
  
    setSelectors.forEach(selector => {
      selector.addEventListener('input', updateSets);
    });
  
    repSelectors.forEach(selector => {
      selector.addEventListener('input', updateSets);
    });
  
    weightSelectors.forEach(selector => {
      selector.addEventListener('input', updateSets);
    });
  });