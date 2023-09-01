document.addEventListener("DOMContentLoaded", () => {

    const weightInput = document.getElementsByClassName("weight");

    for (let i = 0; i < weightInput.length; i++) {
        weightInput[i].addEventListener("change", () => {
          let input = weightInput[i].value;
          if (input === "") { 
            weightInput[i].value = "";
            return;
          }
          // Ersetze Kommas durch Punkte, um den Wert in einem Dezimalformat zu halten
          input = input.replace(/,/g, ".");
          let numbers = input.split(";").map(Number);
          for (let k = 0; k < numbers.length; k++) {
            if (isNaN(numbers[k])) {
              weightInput[i].value = "";
              return;
            }
          }
      
          const sum = numbers.reduce((acc, num) => acc + num + 0);
          const average = sum / numbers.length;
      
          const gerundeteraverage = Math.ceil(average / 2.5) * 2.5;
      
          weightInput[i].value = gerundeteraverage;
        });
      }



})