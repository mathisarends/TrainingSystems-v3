
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

self.addEventListener('message', function(event) {
  const data = event.data;
  if (data.command === 'keepAlive') {
    // Keine Aktion erforderlich, dies dient nur dazu, den Service Worker aktiv zu halten
    console.log("keepAlive")
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
      self.registration.showNotification('Timer abgelaufen', {
        body: 'Ihr Timer ist abgelaufen!',
      });


    } else {
      remainingTime -= interval;
      
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

self.addEventListener('message', function(event) {
  const data = event.data;
  if (data.command === 'startBackgroundSync') {
    // Starten Sie die Timer-Logik für die Hintergrund-Synchronisation
    startTimer(data.duration);
  }
});
