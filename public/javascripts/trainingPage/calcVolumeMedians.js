document.addEventListener("DOMContentLoaded", () => {
  
  const squatMEVs = document.getElementsByClassName("squatmev");
  const squatMRVs = document.getElementsByClassName("squatmrv");
  const squatMedianResultFields = document.getElementsByClassName(
    "squat-median-volume-result"
  );
  const benchMEVs = document.getElementsByClassName("benchmev");
  const benchMRVs = document.getElementsByClassName("benchmrv");
  const benchMedianResultFields = document.getElementsByClassName(
    "bench-median-volume-result"
  );
  const deadliftMEVs = document.getElementsByClassName("deadliftmev");
  const deadliftMRVs = document.getElementsByClassName("deadliftmrv");
  const deadliftMedianResultFields = document.getElementsByClassName(
    "deadlift-median-volume-result"
  );

  function calcAlleVolumeMedians() {
    for (let i = 0; i < squatMEVs.length; i++) {
      squatMedianResultFields[i].value =
        (parseInt(squatMEVs[i].value) + parseInt(squatMRVs[i].value)) / 2;
      benchMedianResultFields[i].value =
        (parseInt(benchMEVs[i].value) + parseInt(benchMRVs[i].value)) / 2;
      deadliftMedianResultFields[i].value =
        (parseInt(deadliftMEVs[i].value) + parseInt(deadliftMRVs[i].value)) / 2;
    }
  }

  calcAlleVolumeMedians();
  

});


