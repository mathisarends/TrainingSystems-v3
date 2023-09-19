document.addEventListener("DOMContentLoaded", () => {

    // page is used after registration if the user in order to calculate certain fields automatically based on input

        let bodyweight = "";
            let gender = "";
            let total;
    
            const bodyWeightInput = document.getElementById("bodyWeight");
            const genderInput = document.getElementById("gender");
    
            const squatInput = document.getElementById("maxSquat");
            const benchInput = document.getElementById("maxBench");
            const deadliftInput = document.getElementById("maxDeadlift");
    
            bodyWeightInput.addEventListener("change", () => {
                bodyweight = bodyWeightInput.value;
                updateStrengthLevel(bodyweight, total, gender);
            })
    
            genderInput.addEventListener("change", () => {
                gender = genderInput.value;
                updateStrengthLevel(bodyweight, total, gender);
            })
    
            squatInput.addEventListener("change", () => {
                // try to calc total if one of the inputs changes
                total = calcTotal(squatInput.value, benchInput.value, deadliftInput.value);
                updateStrengthLevel(bodyweight, total, gender);
                console.log(total);
            })
    
            benchInput.addEventListener("change", () => {
                // try to calc total if one of the inputs changes
                total = calcTotal(squatInput.value, benchInput.value, deadliftInput.value);
                updateStrengthLevel(bodyweight, total, gender);
                console.log(total);
            })
    
            deadliftInput.addEventListener("change", () => {
                // try to calc total if one of the inputs changes
                total = calcTotal(squatInput.value, benchInput.value, deadliftInput.value);
                updateStrengthLevel(bodyweight, total, gender);
               console.log(total);
            })
    
            const strengtLevelInput = document.getElementById("strengthLevel");
    
            function calcTotal(squat, bench, deadlift) {
                if (squat && bench && deadlift) {
                    const total = parseFloat(squat) + parseFloat(bench) + parseFloat(deadlift);
                    return total;
                }
    
                return null;
            }
    
            const strengthLevels = [
                "Elite",
                "Master",
                "Class 1",
                "Class 2",
                "Class 3",
                "Class 4",
                "Class 5",
            ];
    
            /*  function calcStrenghtLevel() */
            function updateStrengthLevel(bodyweight, total, gender) {
                if (bodyweight && total && gender) {
                    const strengthLevel = calcStrenghtLevel(bodyweight, total, gender);
                    strengtLevelInput.value = strengthLevel;
                }
            }
    
    
    
            // calcs strengthlevel based on bodyweight, total and gender
            function calcStrenghtLevel(bodyweight, total, gender) {
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
})