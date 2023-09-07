
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
        self.registration.showNotification('Timer', {
          title: "Timer",
          body: 'Ihr Timer ist abgelaufen!',
          tag: 'timer-notification', // Eindeutiger Tag für die Benachrichtigung
          requireInteraction: true,
          vibrate: [200, 100, 200] // Eine Vibration von 200 ms, eine Pause von 100 ms und dann wieder 200 ms Vibration
     
        });
      } else {
        remainingTime -= interval;
        //for push notification: 
                //for push notification: 
                const remainingTimeInSeconds = remainingTime / 1000;
                const minutes = Math.floor(remainingTimeInSeconds / 60);
                const seconds = Math.floor(remainingTimeInSeconds % 60);
                const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
                  seconds
                ).padStart(2, "0")}`;

                console.log(formattedTime);
        
                self.registration.showNotification('Timer', {
                  title: "Timer",
                  body: `Verbleibende Zeit: ${formattedTime} Sekunden`,
                  tag: 'timer-notification', // Eindeutiger Tag für die Benachrichtigung
                });
  
        
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
  

