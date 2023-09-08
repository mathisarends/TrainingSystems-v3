
// Timer-Service-Worker (timer-service-worker.js)

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // Hier können Sie alte Caches löschen, falls erforderlich
    // Zum Beispiel: caches.delete('old-cache').then(...);

    // Hier können Sie die Kontrolle über die Seite übernehmen
    clients.claim()
  );

  console.log("activated");
});

self.addEventListener('message', function(event) {
  const data = event.data;
  if (data.command === 'start') {
    startTimer(data.duration);
  }
});

let remainingTime = 0;
let timer;

function startTimer(duration) {
  remainingTime = duration;
  const interval = 1000; // 1 Sekunde

  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(function() {
    if (remainingTime <= 0) {
      clearInterval(timer);
      console.log("Timer abgelaufen");
      // Hier können Sie die Nachricht senden, wenn der Timer abgelaufen ist
      // Selbst wenn der Bildschirm gesperrt ist oder das Handy im Energiesparmodus ist
      const notification = self.registration.showNotification('Timer abgelaufen', {
        body: 'Ihr Timer ist abgelaufen!',
      });

      setTimeout(() => {
        notification.close();
      }, 15000)
    } else {
      remainingTime -= interval;

      if (remainingTime % 15000 == 0) {

        const timeStampSeconds = remainingTime / 1000;
        const minutes = Math.floor(timeStampSeconds / 60);
        const seconds = Math.floor(timeStampSeconds % 60);
        const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`;

        const notification = self.registration.showNotification('Verbleibende Zeit', {
          body: `Verbleibende Zeit: ${formattedTime} Sekunden`,
        });

        setTimeout(() => {
          notification.close();
        }, 1000);
      }


      
      // Senden Sie die verbleibende Zeit in jeder Iteration an das Frontend
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            command: "currentTime",
            currentTime: remainingTime,
          });
        });
      });
    }
  }, interval);
}

/*   self.addEventListener('message', function(event) {
  const data = event.data;
  if (data.command === 'stop') {
    console.log("stop command")
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
}); */

