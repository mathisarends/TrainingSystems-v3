// timer-worker.js
console.log("bin eingebunden")


let remainingTime = 0;

self.addEventListener('message', function (e) {
  const data = e.data;
  if (data.command === 'start') {
    remainingTime = data.duration;
    startTimer();
  }
});

function startTimer() {
  const interval = 1000; // 1 Sekunde
  const timer = setInterval(function () {
    if (remainingTime <= 0) {
      clearInterval(timer);
      // Timer abgelaufen, Benachrichtigung senden oder andere Aktion ausführen
      self.postMessage({ command: 'complete' });
    } else {
      remainingTime -= interval;
    }
  }, interval);
}