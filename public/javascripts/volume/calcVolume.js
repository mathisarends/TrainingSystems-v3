// Automatische Berechnung des Estimated Totals
let sqWeightInput = document.getElementById("squat-weight");
let sqRepsInput = document.getElementById("squat-reps");
let bWeightInput = document.getElementById("bench-weight");
let bRepsInput = document.getElementById("bench-reps");
let dlWeightInput = document.getElementById("deadlift-weight");
let dlRepsInput = document.getElementById("deadlift-reps");

// Auswahl und Volumenanzeige
const volumeAdjustmentResult = document.getElementById("volumeAdjustmentField");
const totalResult = document.getElementById("total-result");

const genderSelector = document.getElementById("gender-selector");
const genderResultField = document.getElementById("gender-result-field");

const bodyWeightInputField = document.getElementById("bodyweight-input-field");
const bodyWeightResultField = document.getElementById("bodyweight-result-field");

const bodyHeightInputField = document.getElementById("bodyHeight-input-field");
const bodyHeightResultField = document.getElementById("bodyHeight-result-field");

const trainingExperienceSelector = document.getElementById("training-experience-selector");
const trainingExperienceResultField = document.getElementById("training-experience-result-field");

const ageInputField = document.getElementById("age-input-field");
const ageResultField = document.getElementById("age-result-field");

const nutritionSelector = document.getElementById("nutrition-selector");
const nutritionResultField = document.getElementById("nutrition-result-field");

const sleepSelector = document.getElementById("sleep-selector");
const sleepResultField = document.getElementById("sleep-result-field");

const stressSelector = document.getElementById("stress-selector");
const stressResultField = document.getElementById("stress-result-field");

const steroidSelector = document.getElementById("steroid-selector");
const steroidResultField = document.getElementById("steroid-result-field");

const regenerationSelector = document.getElementById("regeneration-selector");
const regenerationResultField = document.getElementById("regeneration-result-field");

const strengthLevelInput = document.getElementById("strength-level-input");
const strengthLevelResult = document.getElementById("strength-level-result");

//HypertrophieFelder für Volumenanzeige
const squatMinVolumeField = document.getElementById("squat-mev");
const squatMaxVolumeField = document.getElementById("squat-mrv");
const squatMedianVolumeResult = document.getElementById("squat-median-volume-result");

const benchMinVolumeField = document.getElementById("bench-mev");
const benchMaxVolumeField = document.getElementById("bench-mrv");
const benchMedianVolumeResult = document.getElementById("bench-median-volume-result");

const deadliftMinVolumeField = document.getElementById("deadlift-mev");
const deadliftMaxVolumeField = document.getElementById("deadlift-mrv");
const deadliftMedianVolumeResult = document.getElementById("deadlift-median-volume-result");

//KraftFelder für Volumenanzeige
const squatMinVolumeFieldStrength = document.getElementById("squat-mev-strength");
const squatMaxVolumeFieldStrength = document.getElementById("squat-mrv-strength");
const squatMedianVolumeResultStrength = document.getElementById("squat-median-volume-result-strength");

const benchMinVolumeFieldStrength = document.getElementById("bench-mev-strength");
const benchMaxVolumeFieldStrength = document.getElementById("bench-mrv-strength");
const benchMedianVolumeResultStrength = document.getElementById("bench-median-volume-result-strength");

const deadliftMinVolumeFieldStrength = document.getElementById("deadlift-mev-strength");
const deadliftMaxVolumeFieldStrength = document.getElementById("deadlift-mrv-strength");
const deadliftMedianVolumeResultStrength = document.getElementById("deadlift-median-volume-result-strength");

//PeakingFelder für Volumenanzeige
const squatMinVolumeFieldPeaking = document.getElementById("squat-mev-peaking");
const squatMaxVolumeFieldPeaking = document.getElementById("squat-mrv-peaking");
const squatMedianVolumeResultPeaking = document.getElementById("squat-median-volume-result-peaking");

const benchMinVolumeFieldPeaking = document.getElementById("bench-mev-peaking");
const benchMaxVolumeFieldPeaking = document.getElementById("bench-mrv-peaking");
const benchMedianVolumeResultPeaking = document.getElementById("bench-median-volume-result-peaking");

const deadliftMinVolumeFieldPeaking = document.getElementById("deadlift-mev-peaking");
const deadliftMaxVolumeFieldPeaking = document.getElementById("deadlift-mrv-peaking");
const deadliftMedianVolumeResultPeaking = document.getElementById("deadlift-median-volume-result-peaking");

// Zur Einordnung der jeweiligen Kraftniveaus (für den Volumenrechner)
let strengthLevels = [
  "Elite",
  "Master",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
];

let estTotalInputFields = [
  sqWeightInput,
  sqRepsInput,
  bWeightInput,
  bRepsInput,
  dlWeightInput,
  dlRepsInput,
];

// Automatische Berechnung des Estimated Totals
estTotalInputFields.forEach((inputField) => {
  inputField.addEventListener("change", calcEstMaxTotal);
});

// Event-Listener zur Berechnung des Volumens
genderSelector.addEventListener("change", () => {
  let selectedGender = genderSelector.value;
  if (selectedGender === "männlich") {
    genderResultField.value = 0;
  } else if (selectedGender === "weiblich") {
    genderResultField.value = 5;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

bodyWeightInputField.addEventListener("change", () => {
  let weight = bodyWeightInputField.value;
  let gender = genderSelector.value;

  if (gender === "männlich") {
    if (weight < 74) {
      bodyWeightResultField.value = 4;
    } else if (weight < 105) {
      bodyWeightResultField.value = 2;
    } else if (weight <= 120) {
      bodyWeightResultField.value = -2;
    } else {
      bodyWeightResultField.value = -4;
    }
  } else {
    //weiblich
    if (weight < 57) {
      bodyWeightResultField.value = 4;
    } else if (weight < 72) {
      bodyWeightResultField.value = 2;
    } else if (weight <= 84) {
      bodyWeightResultField.value = -2;
    } else {
      bodyWeightResultField.value = -4;
    }
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

bodyHeightInputField.addEventListener("change", () => {
  let height = bodyHeightInputField.value;
  let gender = genderSelector.value;
  if (gender === "männlich") {
    if (height < 170) {
      bodyHeightResultField.value = 2;
    } else if (height < 182) {
      bodyHeightResultField.value = 1;
    } else if (height < 195) {
      bodyHeightResultField.value = -1;
    } else {
      bodyHeightResultField.value = -2;
    }
  } else {
    if (height < 160) {
      bodyHeightResultField.value = 2;
    } else if (height < 167) {
      bodyHeightResultField.value = 1;
    } else if (height < 175) {
      bodyHeightResultField.value = -1;
    } else {
      bodyHeightResultField.value = -2;
    }
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

trainingExperienceSelector.addEventListener("change", () => {
  let trainingsExperience = trainingExperienceSelector.value;
  if (trainingsExperience === "beginner") {
    trainingExperienceResultField.value = 1;
  } else if (trainingsExperience === "fortgeschritten") {
    trainingExperienceResultField.value = 0;
  } else if (trainingsExperience === "sehrFortgeschritten") {
    trainingExperienceResultField.value = -1;
  } else {
    trainingExperienceResultField.value = -3;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

ageInputField.addEventListener("change", () => {
  let age = ageInputField.value;
  if (age < 15) {
    ageResultField.value = 2;
  } else if (age < 25) {
    ageResultField.value = 1;
  } else if (age < 35) {
    ageResultField.value = 0;
  } else if (age < 45) {
    ageResultField.value = -2;
  } else {
    ageResultField.value = -4;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

nutritionSelector.addEventListener("change", () => {
  let nutritionLevel = nutritionSelector.value;
  if (nutritionLevel === "schlecht") {
    nutritionResultField.value = -3;
  } else if (nutritionLevel === "gut") {
    nutritionResultField.value = 0;
  } else {
    nutritionResultField.value = 1;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

sleepSelector.addEventListener("change", () => {
  let sleepLevel = sleepSelector.value;
  if (sleepLevel === "schlecht") {
    sleepResultField.value = -3;
  } else if (sleepLevel === "gut") {
    sleepResultField.value = 0;
  } else {
    sleepResultField.value = 1;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

stressSelector.addEventListener("change", () => {
  let stressLevel = stressSelector.value;
  if (stressLevel === "hoch") {
    stressResultField.value = -3;
  } else if (stressLevel === "mittel") {
    stressResultField.value = 0;
  } else {
    stressResultField.value = 1;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

steroidSelector.addEventListener("change", () => {
  let steroidLevel = steroidSelector.value;
  if (steroidLevel === "ja") {
    steroidResultField.value = 3;
  } else {
    steroidResultField.value = 0;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

regenerationSelector.addEventListener("change", () => {
  let regLevel = regenerationSelector.value;
  if (regLevel === "schlecht") {
    regenerationResultField.value = -2;
  } else if (regLevel === "unterdurchschnittlich") {
    regenerationResultField.value = -1;
  } else if (regLevel === "durchschnittlich") {
    regenerationResultField.value = 0;
  } else if (regLevel === "gut") {
    regenerationResultField.value = 1;
  } else {
    regenerationResultField.value = 2;
  }
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

bodyWeightInputField.addEventListener("change", function () {
  const bodyweight = parseFloat(bodyWeightInputField.value);
  const total = parseFloat(totalResult.value);
  const gender = genderSelector.value;

  updateStrengthLevel(bodyweight, total, gender);
});

totalResult.addEventListener("change", function () {
  const bodyweight = parseFloat(bodyWeightInputField.value);
  const total = parseFloat(totalResult.value);
  const gender = genderSelector.value;

  updateStrengthLevel(bodyweight, total, gender);
});

genderSelector.addEventListener("change", function () {
  const bodyweight = parseFloat(bodyWeightInputField.value);
  const total = parseFloat(totalResult.value);
  const gender = genderSelector.value;

  updateStrengthLevel(bodyweight, total, gender);
});

// Initial alle Werte ausrechenn
document.addEventListener("DOMContentLoaded", () => {
  const event = new Event("change");
  genderSelector.dispatchEvent(event);
  bodyWeightInputField.dispatchEvent(event);
  bodyHeightInputField.dispatchEvent(event);
  strengthLevelInput.dispatchEvent(event);
  trainingExperienceSelector.dispatchEvent(event);
  ageInputField.dispatchEvent(event);
  nutritionSelector.dispatchEvent(event);
  sleepSelector.dispatchEvent(event);
  stressSelector.dispatchEvent(event);
  steroidSelector.dispatchEvent(event);
  regenerationSelector.dispatchEvent(event);
  calcVolumeAdjustment();
  calcIndividualizedVolume();
});

// Funktionen
function calcIndividualizedVolume() {
  let volumeAdjust = parseInt(volumeAdjustmentResult.value);

  squatMinVolumeField.value = 7.5 + volumeAdjust;
  squatMaxVolumeField.value = 14 + volumeAdjust;
  squatMedianVolumeResult.value =
    (parseInt(squatMinVolumeField.value) +
      parseInt(squatMaxVolumeField.value)) /
    2;
  benchMinVolumeField.value = 9 + volumeAdjust;
  benchMaxVolumeField.value = 17 + volumeAdjust;
  benchMedianVolumeResult.value =
    (parseInt(benchMinVolumeField.value) +
      parseInt(benchMaxVolumeField.value)) /
    2;
  deadliftMinVolumeField.value = 5.5 + volumeAdjust;
  deadliftMaxVolumeField.value = 11 + volumeAdjust;
  deadliftMedianVolumeResult.value =
    (parseInt(deadliftMinVolumeField.value) +
      parseInt(deadliftMaxVolumeField.value)) /
    2;

  squatMinVolumeFieldStrength.value = 5.5 + volumeAdjust;
  squatMaxVolumeFieldStrength.value = 9 + volumeAdjust;
  squatMedianVolumeResultStrength.value =
    (parseInt(squatMinVolumeFieldStrength.value) +
      parseInt(squatMaxVolumeFieldStrength.value)) /
    2;
  benchMinVolumeFieldStrength.value = 8 + volumeAdjust;
  benchMaxVolumeFieldStrength.value = 11 + volumeAdjust;
  benchMedianVolumeResultStrength.value =
    (parseInt(benchMinVolumeFieldStrength.value) +
      parseInt(benchMaxVolumeFieldStrength.value)) /
    2;
  deadliftMinVolumeFieldStrength.value = 4.5 + volumeAdjust;
  deadliftMaxVolumeFieldStrength.value = 7 + volumeAdjust;
  deadliftMedianVolumeResultStrength.value =
    (parseInt(deadliftMinVolumeFieldStrength.value) +
      parseInt(deadliftMaxVolumeFieldStrength.value)) /
    2;

  squatMinVolumeFieldPeaking.value = 4.5 + volumeAdjust;
  squatMaxVolumeFieldPeaking.value = 6 + volumeAdjust;
  squatMedianVolumeResultPeaking.value =
    (parseInt(squatMinVolumeFieldPeaking.value) +
      parseInt(squatMaxVolumeFieldPeaking.value)) /
    2;
  benchMinVolumeFieldPeaking.value = 6.5 + volumeAdjust;
  benchMaxVolumeFieldPeaking.value = 8.5 + volumeAdjust;
  benchMedianVolumeResultPeaking.value =
    (parseInt(benchMinVolumeFieldPeaking.value) +
      parseInt(benchMaxVolumeFieldPeaking.value)) /
    2;
  deadliftMinVolumeFieldPeaking.value = 2.5 + volumeAdjust;
  deadliftMaxVolumeFieldPeaking.value = 4.5 + volumeAdjust;
  deadliftMedianVolumeResultPeaking.value =
    (parseInt(deadliftMinVolumeFieldPeaking.value) +
      parseInt(deadliftMaxVolumeFieldPeaking.value)) /
    2;
}

function calcEstMaxTotal() {
  let sqEstMaxResultField = document.getElementById("squat-estmax");
  let sqWeight = document.getElementById("squat-weight").value;
  let sqReps = document.getElementById("squat-reps").value;
  let sqEstmax = Math.round(sqWeight * (1 + sqReps / 30) * 2) / 2;
  if (sqWeight !== "" && sqReps !== "") {
    sqEstMaxResultField.value = sqEstmax;
  }

  let benchMaxResultField = document.getElementById("bench-estmax");
  let bWeight = document.getElementById("bench-weight").value;
  let bReps = document.getElementById("bench-reps").value;
  let bEstMax = Math.round(bWeight * (1 + bReps / 30) * 2) / 2;
  if (bWeight !== "" && bReps !== "") {
    benchMaxResultField.value = bEstMax;
  }

  let deadliftMaxResultField = document.getElementById("deadlift-estmax");
  let dlWeight = document.getElementById("deadlift-weight").value;
  let dlReps = document.getElementById("deadlift-reps").value;
  let dlEstMax = Math.round(dlWeight * (1 + dlReps / 30) * 2) / 2;
  if (dlWeight !== "" && dlReps !== "") {
    deadliftMaxResultField.value = dlEstMax;
  }

  if (
    sqWeight !== "" &&
    sqReps !== "" &&
    bWeight !== "" &&
    bReps !== "" &&
    dlWeight !== "" &&
    dlReps !== ""
  ) {
    let totalResultField = document.getElementById("total-result");
    totalResultField.value = sqEstmax + bEstMax + dlEstMax;

    //TODO: Diese Logik noch in Funktion kapsel wird hier bestimmt 5 mal in der Form aufgerufen ist nicht gerade effizient
    const bodyweight = parseFloat(bodyWeightInputField.value);
    const total = parseFloat(totalResult.value);
    const gender = genderSelector.value;

    updateStrengthLevel(bodyweight, total, gender);
  }
}

function setStrengthLevel(strengthLevel) {
  strengthLevelInput.value = strengthLevel;
}

function setNumericValueOfStrengthLevel(strengthLevel) {
  if (strengthLevel === "Elite") {
    strengthLevelResult.value = -3;
  } else if (strengthLevel === "Master") {
    strengthLevelResult.value = -3;
  } else if (strengthLevel === "Class 1") {
    strengthLevelResult.value = -1;
  } else if (strengthLevel === "Class 2") {
    strengthLevelResult.value = 0;
  } else if (strengthLevel === "Class 3") {
    strengthLevelResult.value = 0;
  } else if (strengthLevel === "Class 4") {
    strengthLevelResult.value = 1;
  } else {
    strengthLevelResult.value = 1;
  }
}

function updateStrengthLevel(bodyweight, total, gender) {
  if (!isNaN(bodyweight) && !isNaN(total) && gender !== "undefined") {
    const strengthLevel = calcStrenghtLevel(bodyweight, total, gender);
    setStrengthLevel(strengthLevel);
    setNumericValueOfStrengthLevel(strengthLevel);
  }
}

//Funktion wird immer aufgerufen wenn sich eines der relevanten Felder ändert || DOMCONTENTLOADED
function calcVolumeAdjustment() {
  const genderVal = genderResultField.value
    ? parseInt(genderResultField.value)
    : 0;
  const bwVal = bodyWeightResultField.value
    ? parseInt(bodyWeightResultField.value)
    : 0;
  const bhVal = bodyHeightResultField.value
    ? parseInt(bodyHeightResultField.value)
    : 0;
  const strengthLevelVal = strengthLevelResult.value
    ? parseInt(strengthLevelResult.value)
    : 0;
  const trainingExpVal = trainingExperienceResultField.value
    ? parseInt(trainingExperienceResultField.value)
    : 0;
  const ageVal = ageResultField.value ? parseInt(ageResultField.value) : 0;
  const nutritionVal = nutritionResultField.value
    ? parseInt(nutritionResultField.value)
    : 0;
  const sleepVal = sleepResultField.value
    ? parseInt(sleepResultField.value)
    : 0;
  const stressVal = stressResultField.value
    ? parseInt(stressResultField.value)
    : 0;
  const steroidVal = steroidResultField.value
    ? parseInt(steroidResultField.value)
    : 0;
  const regVal = regenerationResultField.value
    ? parseInt(regenerationResultField.value)
    : 0;

  let result =
    genderVal +
    bwVal +
    bhVal +
    strengthLevelVal +
    trainingExpVal +
    ageVal +
    nutritionVal +
    sleepVal +
    stressVal +
    steroidVal +
    regVal;

  volumeAdjustmentResult.value = result;
}

function calcStrenghtLevel(bodyweight, total, gender) {
  //gender wird als String übergeben weil es zur Anwendungsglogik passt
  if (gender === "männlich") {
    if (bodyweight <= 53) {
      if (total >= 455) {
        return strengthLevels[0];
      } else if (total >= 384) {
        return strengthLevels[1];
      } else if (total >= 355) {
        return strengthLevels[2];
      } else if (total >= 303) {
        return strengthLevels[3];
      } else if (total >= 250) {
        return strengthLevels[4];
      } else if (total >= 204) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 59) {
      if (total >= 519) {
        return strengthLevels[0];
      } else if (total >= 492) {
        return strengthLevels[1];
      } else if (total >= 439) {
        return strengthLevels[2];
      } else if (total >= 410) {
        return strengthLevels[3];
      } else if (total >= 351) {
        return strengthLevels[4];
      } else if (total >= 293) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      } //hier fertig
    } else if (bodyweight <= 66) {
      if (total >= 567) {
        return strengthLevels[0];
      } else if (total >= 536) {
        return strengthLevels[1];
      } else if (total >= 481) {
        return strengthLevels[2];
      } else if (total >= 450) {
        return strengthLevels[3];
      } else if (total >= 386) {
        return strengthLevels[4];
      } else if (total >= 324) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 74) {
      if (total >= 616) {
        return strengthLevels[0];
      } else if (total >= 584) {
        return strengthLevels[1];
      } else if (total >= 525) {
        return strengthLevels[2];
      } else if (total >= 490) {
        return strengthLevels[3];
      } else if (total >= 421) {
        return strengthLevels[4];
      } else if (total >= 356) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 83) {
      if (total >= 666) {
        return strengthLevels[0];
      } else if (total >= 632) {
        return strengthLevels[1];
      } else if (total >= 568) {
        return strengthLevels[2];
      } else if (total >= 529) {
        return strengthLevels[3];
      } else if (total >= 465) {
        return strengthLevels[4];
      } else if (total >= 392) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 93) {
      if (total >= 714) {
        return strengthLevels[0];
      } else if (total >= 679) {
        return strengthLevels[1];
      } else if (total >= 611) {
        return strengthLevels[2];
      } else if (total >= 570) {
        return strengthLevels[3];
      } else if (total >= 498) {
        return strengthLevels[4];
      } else if (total >= 421) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 105) {
      if (total >= 765) {
        return strengthLevels[0];
      } else if (total >= 726) {
        return strengthLevels[1];
      } else if (total >= 653) {
        return strengthLevels[2];
      } else if (total >= 612) {
        return strengthLevels[3];
      } else if (total >= 536) {
        return strengthLevels[4];
      } else if (total >= 454) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 120) {
      if (total >= 819) {
        return strengthLevels[0];
      } else if (total >= 779) {
        return strengthLevels[1];
      } else if (total >= 700) {
        return strengthLevels[2];
      } else if (total >= 660) {
        return strengthLevels[3];
      } else if (total >= 578) {
        return strengthLevels[4];
      } else if (total >= 494) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else {
      if (total >= 874) {
        return strengthLevels[0];
      } else if (total >= 830) {
        return strengthLevels[1];
      } else if (total >= 747) {
        return strengthLevels[2];
      } else if (total >= 705) {
        return strengthLevels[3];
      } else if (total >= 618) {
        return strengthLevels[4];
      } else if (total >= 528) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    }
  } else {
    //WEIBLICH
    if (bodyweight <= 43) {
      if (total >= 275) {
        return strengthLevels[0];
      } else if (total >= 263) {
        return strengthLevels[1];
      } else if (total >= 241) {
        return strengthLevels[2];
      } else if (total >= 228) {
        return strengthLevels[3];
      } else if (total >= 203) {
        return strengthLevels[4];
      } else if (total >= 178) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 47) {
      if (total >= 310) {
        return strengthLevels[0];
      } else if (total >= 296) {
        return strengthLevels[1];
      } else if (total >= 270) {
        return strengthLevels[2];
      } else if (total >= 253) {
        return strengthLevels[3];
      } else if (total >= 233) {
        return strengthLevels[4];
      } else if (total >= 193) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 52) {
      if (total >= 333) {
        return strengthLevels[0];
      } else if (total >= 318) {
        return strengthLevels[1];
      } else if (total >= 287) {
        return strengthLevels[2];
      } else if (total >= 269) {
        return strengthLevels[3];
      } else if (total >= 236) {
        return strengthLevels[4];
      } else if (total >= 202) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 57) {
      if (total >= 358) {
        return strengthLevels[0];
      } else if (total >= 341) {
        return strengthLevels[1];
      } else if (total >= 308) {
        return strengthLevels[2];
      } else if (total >= 288) {
        return strengthLevels[3];
      } else if (total >= 251) {
        return strengthLevels[4];
      } else if (total >= 213) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 63) {
      if (total >= 381) {
        return strengthLevels[0];
      } else if (total >= 362) {
        return strengthLevels[1];
      } else if (total >= 326) {
        return strengthLevels[2];
      } else if (total >= 303) {
        return strengthLevels[3];
      } else if (total >= 263) {
        return strengthLevels[4];
      } else if (total >= 222) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 72) {
      if (total >= 406) {
        return strengthLevels[0];
      } else if (total >= 385) {
        return strengthLevels[1];
      } else if (total >= 345) {
        return strengthLevels[2];
      } else if (total >= 321) {
        return strengthLevels[3];
      } else if (total >= 277) {
        return strengthLevels[4];
      } else if (total >= 232) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else if (bodyweight <= 84) {
      if (total >= 439) {
        return strengthLevels[0];
      } else if (total >= 417) {
        return strengthLevels[1];
      } else if (total >= 372) {
        return strengthLevels[2];
      } else if (total >= 345) {
        return strengthLevels[3];
      } else if (total >= 296) {
        return strengthLevels[4];
      } else if (total >= 246) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    } else {
      if (total >= 479) {
        return strengthLevels[0];
      } else if (total >= 452) {
        return strengthLevels[1];
      } else if (total >= 401) {
        return strengthLevels[2];
      } else if (total >= 372) {
        return strengthLevels[3];
      } else if (total >= 317) {
        return strengthLevels[4];
      } else if (total >= 262) {
        return strengthLevels[5];
      } else {
        return strengthLevels[6];
      }
    }
  }
}
