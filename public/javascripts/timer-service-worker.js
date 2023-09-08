
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
    console.log("keepAlive") //vllt brauchen wir hier wirklich keine konsolenausgabe:
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

      //Nachrichten senden
      self.registration.showNotification('TTS', {
        body: 'Your timer has expired!',
        tag: 'timer-notification',
      });


    } else {
      remainingTime -= interval;

      const currentTime = remainingTime / 1000;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      self.registration.showNotification('TTS', {
        body: `Remaining time: ${formattedTime}`,
        tag: 'timer-notification',
      })
      
      // Senden Sie die verbleibende Zeit in jeder Iteration an das Frontend
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            command: "currentTime",
            currentTime: remainingTime,
            formattedTime: formattedTime,
          });
        });
      });
    }
  }, interval);
}

// Hinzufügen eines Fetch-Event-Handlers für das Caching von Seiten
/* self.addEventListener('fetch', function(event) {

  console.log("Request URL:", event.request.url);
  console.log("Request Pathname:", new URL(event.request.url).pathname);

  console.log("Request: ", )

  const requestType = getRequestType(event.request);

  if (requestType.isOnline) {
    if (requestType.isTrainingPlan) {
      event.respondWith(networkRevalidateAndCache(event));
    } else {
      event.respondWith(staleWhileRevalidate(event)); //ist nicht optimal da jedes mal geupdated wird aber egal;
    }
  } else if (!requestType.isOnline) {
    console.log("offline");
    event.respondWith(cacheOnly(event));
  }
}); */




/*CACHING strategies*/

const version = 2;
const cacheName = `pages-cache-${version}`;

function cacheOnly(ev) {   //only return what is in the cache);
  return caches.match(ev.request);
}

function cacheFirst(ev) {
  //return from cache or fetch if not in cache
    return caches.match(ev.request).then(cacheResponse => {
        //return cacheResponse if not null
        return cacheResponse || fetch(ev.request);
    })
}

function networkOnly(ev) {
  console.log("through network")
  //only return fetch response
  return fetch(ev.request);
}

function networkFirst(ev) {
  return fetch(ev.request).then(fetchResponse => {
    if (fetchResponse.ok) {
        return fetchResponse;
    } else {
        return caches.match(ev.request);
    }
  })
}

function staleWhileRevalidate(ev) {
  //check cache and fallback on fetch for response
  //always attempt to fetch a new copy and update the cache
  return caches.match(ev.request).then(cacheResponse => {

    let fetchResponse = fetch(ev.request).then(response  => {
        return caches.open(cacheName).then(cache => {
            cache.put(ev.request, response.clone());
            return response;
        })
    })

    return cacheResponse || fetchResponse;
  })
}

function networkRevalidateAndCache(ev) {
  console.log("Request ist TrainingPlan")
  //try fetch first and fallback on cache
  //update cache if fetch was successful
  return fetch(ev.request).then(fetchResponse => {
    if (fetchResponse.ok) {
        return caches.open(cacheName).then(cache => {
            cache.put(ev.request, fetchResponse.clone());
            return fetchResponse;
        })
    } else {
        return caches.match(ev.request);
    }

  })
}

function getRequestType(request) {
  const url = new URL(request.url);

  const isOnline = self.navigator.onLine;
  const isImage = url.pathname.includes(".png") || url.pathname.includes(".jpg");
  const isCSS = url.pathname.endsWith(".css") || url.hostname.includes("googleapis.com");
  const isJS = url.pathname.endsWith(".js");
  const isFont = url.hostname.includes("gstatic") || url.pathname.endsWith(".woff2");
  const isManifest = url.pathname.endsWith(".manifest") || url.pathname.endsWith(".webmanifest");
  const isHTML = url.pathname.endsWith(".html"); // Überprüfen, ob es sich um eine HTML-Datei handelt
  const isEJS = url.pathname.endsWith(".ejs");
  const isTrainingPlan = url.href.includes("/training/template") || url.href.includes("/training/custom");
  const selfUrl = new URL(self.location);
  const isExternal = request.mode === "cors" || selfUrl.hostname !== url.hostname;

  return {
    isOnline,
    isImage,
    isCSS,
    isJS,
    isFont,
    isManifest,
    isHTML,
    isEJS,
    isTrainingPlan,
    isExternal,
  };
}