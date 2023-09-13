// service-worker.js
const version = 15;

const staticCache = `static-assets-${version}-new`; //html files etc.
const dynamicCache = `dynamic-assets-${version}`;
const imageCache = `imageCache-${version}`;

let DB = null;
let online = isOnline(); //Verfolgen des online status - TODO: funktioniert nicht ganz

const imageAssets = [
  "/manifest/manifest.webmanifest",
  "/manifest/icon-192x192.png",
  "/manifest/icon-256x256.png",
  "/manifest/icon-384x384.png",
  "/manifest/icon-512x512.png",

  "/images/backgrounds/background-destination-desktop.jpg",
  "/images/backgrounds/background-destination-mobile.jpg",
  "/images/backgrounds/background-destination-tablet.jpg",
  "/images/backgrounds/background-technology-desktop.jpg",
  "/images/backgrounds/background-technology-mobile.jpg",
  "/images/backgrounds/background-technology-tablet.jpg",
];

const assets = [
  //font
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700&family=Bellefair&family=Barlow:wght@400;700&display=swap",

  //css files
  "/stylesheets/shared/index.css",
  "/stylesheets/shared/button.css",
  "/stylesheets/shared/confirmation-modal.css",
  "/stylesheets/shared/progressBars.css",
  "/stylesheets/shared/select.css",
  "/stylesheets/shared/tablesNew.css",
  "/stylesheets/shared/trainingNew.css",
  "/stylesheets/exercises.css",
  "/stylesheets/login.css",
  "/stylesheets/main.css",

  //audio files:
  "/audio/newTimer.mp3",
  "/audio/save_sound.mp3",
  "/audio/saveSound.mp3",
  "/audio/tts_training_audio.mp3",

  //js files
  "/javascripts/displayOfflineData.js",

  "/javascripts/exercises/ajaxSave.js",
  "/javascripts/exercises/resetConfirmation.js",
  "/javascripts/exercises/showRightTabFromStart.js",
  "/javascripts/exercises/showSection.js",
  "/javascripts/exercises/beforeUnload.js",

  "/javascripts/header/header.js",
  "/javascripts/homepage/pwaBanner.js",

  "/javascripts/register/navigation.js",
  "/javascripts/register/volumeCalculations.js",

  "/javascripts/trainingIndexPage/deleteTrainingConfirmation.js",
  "/javascripts/trainingIndexPage/redirect.js",
  "/javascripts/trainingIndexPage/showRightTabFromStart.js",
  "/javascripts/trainingIndexPage/trainingPlanCategorySelector.js",

  "/javascripts/trainingPage/ajaxAutoSave.js",
  "/javascripts/trainingPage/calcBackoffMax.js",
  "/javascripts/trainingPage/calcMax.js",
  "/javascripts/trainingPage/calculateSetsTonnage.js",
  "/javascripts/trainingPage/calcVolumeMedians.js",
  "/javascripts/trainingPage/changeExerciseName.js",
  "/javascripts/trainingPage/displayCalculatedVolumes.js",
  "/javascripts/trainingPage/displayDefaultSetSchema.js",
  "/javascripts/trainingPage/displayTrainingDay.js",
  "/javascripts/trainingPage/notePrompts.js",
  "/javascripts/trainingPage/pauseTimer.js",
  "/javascripts/trainingPage/removePlaceholder.js",
  "/javascripts/trainingPage/rpeInput.js",
  "/javascripts/trainingPage/showTimer.js",
  "/javascripts/trainingPage/weightInput.js",
  "/javascripts/volume/calcVolume.js",
  "/javascripts/volume/switchViews.js",
  "/javascripts/volume/offlineChanges.js",
  "/javascripts/header.js",

  "/javascripts/scratch/pauseTimer.js",

  //diese dynamic files hier auch einfügen:

  //TODO: weiterhin:
  // die post anfragen offline und online synchroniseren:
  // alles auch auf die trainingsPages ausweiten:
];

//aktiviert den serviceworker erstellt die Datenbank und löscht alte cache-versionen
self.addEventListener("activate", (ev) => {
  console.log("activated");
  ev.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => {
              if (
                key != staticCache &&
                key != imageCache &&
                key != dynamicCache
              ) {
                return true;
              }
            })
            .map((key) => caches.delete(key))
        ).then((empties) => {
          //empties is an array of boolean values
          return openDB();
        });
      })
      .then((DB) => {
        return clients.claim();
      })
  );
});

//adds the cacheList && imageList
self.addEventListener("install", (ev) => {
  console.log(`Version ${version} installed`);

  ev.waitUntil(
    caches
      .open(staticCache)
      .then((cache) => {
        cache.addAll(assets).then(
          () => {},
          (err) => {
            console.warn(`failed to update ${staticCache}`);
          }
        );
      })
      .then(() => {
        caches.open(imageCache).then((cache) => {
          cache.addAll(imageAssets).then(
            () => {
              console.log(`${imageCache} has been updated`);
            },
            (err) => {
              console.warn(`failed to update ${staticCache}`);
            }
          );
        });
      })
  );
});

self.addEventListener("fetch", async (event) => {
  /* const isOnline = self.navigator.onLine; */ //zuverlässigen weg als diesen gefunden.
  const url = new URL(event.request.url);

  const isImage =
    url.hostname.includes("picsum.photos") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg");

  const isCSS =
    url.pathname.endsWith(".css") || url.hostname.includes("googleapis.com");
  const isJS = url.pathname.endsWith(".js");
  const isManfifest =
    url.pathname.endsWith(".manifest") || url.pathname.endsWith(".webmanifest");
  const isAudio = url.pathname.endsWith(".mp3");

  const isFont =
    url.hostname.includes("gstatic") || url.pathname.endsWith("woff2");
  const selfUrl = new URL(self.location);
  const isExternal =
    event.request.mode === "cors" || selfUrl.host !== url.hostname;

  const isPage = event.request.mode === "navigate"; // Prüfen, ob es sich um eine Seite handelt

  //das mit dem online status ist schwerer als gedacht hier muss man schon sagen:
  //versuch bevor eine solche anfrage geschickt wird einmal die oben genannte methode aufrufen und
  //damit den online status ermitteln:
  if (online) {
    if (isCSS || isJS || isManfifest || isImage || isAudio || isFont) {
      event.respondWith(staleNoRevalidate(event));
    } else if (
      event.request.method === "PATCH" ||
      event.request.method === "POST"
    ) {
      event.respondWith(networkOnly(event));
    } else {
      event.respondWith(fetchAndCache(event));
    }
  } else if (!online) {
    if (event.request.method === "PATCH") {
      console.log("OFFLINE PATCH")
      handleOfflineChange(event.request, "offlinePatches");
    } else if (event.request.method === "POST") {
      console.log("POST Request wie soll ich damit umgehen?");
      handleOfflineChange(event.request, "offlinePosts");
    } else {
      event.respondWith(cacheOnly(event));
    }
  }
});

self.addEventListener("message", async (event) => {
  if (event.data.type === "requestOnlineStatus") {
    try {
      const onlineStatus = await isOnline();

      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "requestedOnlineStatus",
            isOnline: onlineStatus,
          });
        });
      });
    } catch (error) {
      console.error("Fehler beim Überprüfne des Online Status:");
    }
  }
});

self.addEventListener("message", async (event) => {
  if (event.data === "online") {
    online = true;
    console.log("online status:", online);

    try {
      const requestsPending = await isOfflineRequestPending();
      if (requestsPending) {
        executeSavedRequests();

        self.registration.showNotification("TTS", {
          body: "Offline Daten synchronisiert",
          tag: "connection",
          vibrate: [200, 100, 200],
        });
      }
    } catch (err) {
      console.error("Fehler beim Überprüfen der gespeicherten Anfragen:", err);
    }
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "offline") {
    online = false;
    console.log("online status:", online);

  }
});

self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "getOfflineData") {
    const url = message.data;

    // nur ausführen wenn nicht online:
    if (!online) {
      isOfflineDataAvailable(url)
        .then((offlineData) => {
          // Senden Sie die offline Daten an den Client
          event.source.postMessage({
            command: "offlineData",
            data: offlineData,
          });
        })
        .catch((error) => {
          //Fehlermeldung ignorieren.
        });
    }
  }
});

function isOfflineDataAvailable(url) {
  if (!DB) {
    return Promise.reject("Datenbank nicht verfügbar");
  }
  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    const request = patchStore.get(url);

    request.onsuccess = (event) => {
      const data = request.result ? request.result.body : false;

      if (data) {
        resolve(data);
      } else {
        reject("Keine Offline Daten verfügbar!");
      }
    };

    request.onerror = (event) => {
      reject("Fehler beim Abrufen der offline Daten");
    };
  });
}

const openDB = (callback) => {
  return new Promise((resolve, reject) => {
    let req = indexedDB.open("trainingDB", version);
    req.onerror = (err) => {
      console.warn(err);
      DB = null;
      reject(err);
    };
    req.onupgradeneeded = (ev) => {
      let db = ev.target.result;

      if (!db.objectStoreNames.contains("offlinePatches")) {
        db.createObjectStore("offlinePatches", {
          keyPath: "url",
        });
      }

      if (!db.objectStoreNames.contains("offlinePosts")) {
        db.createObjectStore("offlinePosts", {
          keyPath: "url",
        });
      }

    };

    req.onsuccess = (ev) => {
      DB = ev.target.result;
      console.log("db opened and upgraded as needed");
      if (callback) {
        callback();
      }
      resolve(DB);
    };
  });
};

/*SUPPORTING FUNCTIONS*/
function isOfflineRequestPending() {
  if (!DB) {
    return Promise.reject("Datenbank nicht verfügbar");
  }

  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const postTransaction = DB.transaction("offlinePosts", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");
    const postStore = postTransaction.objectStore("offlinePosts");

    const patchCountRequest = patchStore.count();
    const postCountRequest = postStore.count();

    // Auf die Ergebnisse der count-Anfragen warten
    patchCountRequest.onsuccess = () => {
      postCountRequest.onsuccess = () => {
        const totalRequests =
          patchCountRequest.result + postCountRequest.result;

        if (totalRequests > 0) {
          resolve(true); // Gespeicherte Anfragen vorhanden
        } else {
          resolve(false); // Keine gespeicherten Anfragen vorhanden
        }
      };

      postCountRequest.onerror = () => {
        reject("Fehler beim Zählen der offlinePosts");
      };
    };

    patchCountRequest.onerror = () => {
      reject("Fehler beim Zählen der offlinePatches");
    };
  });
}

async function isOnline() {
  try {
    if (!self.navigator.onLine) {
      //false is always reliable that no network. true might lie
      return false;
    }

    const request = new URL(self.location.origin); // avoid CORS errors with a request to your own origin
    request.searchParams.set("rand", Date.now().toString()); // random value to prevent cached responses
    const response = await fetch(request.toString(), { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendSavedRequestToServer(requestData) {
  let objectStoreName = "";

  if (requestData.method === "PATCH") {
    objectStoreName = "offlinePatches";
  } else if (requestData.method === "POST") {
    objectStoreName = "offlinePosts";
  }

  if (objectStoreName) {
    fetch(requestData.url, {
      method: requestData.method,
      headers: requestData.headers,
      body: requestData.body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fehler bei der Anfrage an den Server!");
        }
        return response.json();
      })
      .then((data) => {
        const transaction = DB.transaction(objectStoreName, "readwrite");
        const store = transaction.objectStore(objectStoreName);

        store.delete(requestData.url);
      })
      .catch((error) => {
        console.error("Fehler beim Senden der Anfrage an den Server:", error);
      });
  }
}

async function executeSavedRequests() {
  // handleOfflinePatches
  const patchesTransaction = DB.transaction("offlinePatches", "readonly");
  const patchesStore = patchesTransaction.objectStore("offlinePatches");

  const allPatches = patchesStore.getAll();
  allPatches.onsuccess = function () {
    for (const patch of allPatches.result) {
      const requestData = {
        method: patch.method,
        url: patch.url,
        headers: patch.headers,
        body: JSON.stringify(patch.body),
      };
      sendSavedRequestToServer(requestData);
    }

    // handle Offline Posts
    const postsTransaction = DB.transaction("offlinePosts", "readonly");
    const postsStore = postsTransaction.objectStore("offlinePosts");

    const allPosts = postsStore.getAll();
    allPosts.onsuccess = function () {
      for (const post of allPosts.result) {
        const requestData = {
          method: post.method,
          url: post.url,
          headers: post.headers,
          body: JSON.stringify(post.body),
        };
        sendSavedRequestToServer(requestData);
      }
    };
  };
}

// writes request in indexDB
async function handleOfflineChange(request, objectStore) {
  if (DB) {
    const formDataObject = await request.json();
    const method = request.method;
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const transaction = DB.transaction(objectStore, "readwrite");
    const store = transaction.objectStore(objectStore);

    const existingRecord = await store.get(request.url);

    if (existingRecord) {
      store.delete(request.url);
      console.log("Bestehender Datensatz gelöscht");
    }

    const addRequest = store.add({
      url: request.url,
      method: method,
      headers: headers,
      body: formDataObject,
    });

    addRequest.onsuccess = (event) => {
      console.log("Daten erfolgreich in der IndexDB gespeichert");
      self.registration.showNotification("TTS", {
        body: "Keine Internetverbindung. Daten werden bei erneuter Verbindung gespeichert.",
        tag: "connection",
      });
    };
    addRequest.onerror = (event) => {
      console.error(
        "Fehler beim Speichern der Daten in der IndexedDB",
        event.target.error
      );
    };
  }
}

/*CACHING strategies -- bisher alle für den dynamic cache gedacht. da alle statischen ressourcen ja initial geladen werden müssten: */
function cacheOnly(ev) {
  return caches.match(ev.request) || caches.match("/offline"); //funktioniert auch nicht genau:
}

function cacheFirst(ev) {
  //return from cache or fetch if not in cache
  return caches.match(ev.request).then((cacheResponse) => {
    l;
    return cacheResponse || fetch(ev.request);
  });
}

function networkOnly(ev) {
  return fetch(ev.request);
}

function fetchAndCache(ev) {
  //only return fetch response
  return fetch(ev.request)
    .then((response) => {
      const responseClone = response.clone();
      caches.open(staticCache).then((cache) => {
        cache.put(ev.request, responseClone);
      });
      return response;
    })
    .catch((err) => {
      console.error(err);
    });
}

//TODO: failed to execute put on cache: request method patch is unsupported:
function networkFirst(ev) {
  return fetch(ev.request).then((fetchResponse) => {
    if (fetchResponse.ok) {
      return fetchResponse;
    } else {
      return caches.match(ev.request);
    }
  });
}

function staleWhileRevalidate(ev) {
  //check cache and fallback on fetch for response
  //always attempt to fetch a new copy and update the cache
  return caches.match(ev.request).then((cacheResponse) => {
    let fetchResponse = fetch(ev.request).then((response) => {
      return caches.open(dynamicCache).then((cache) => {
        cache.put(ev.request, response.clone());
        return response;
      });
    });

    return cacheResponse || fetchResponse;
  });
}

function staleNoRevalidate(ev) {
  return caches.match(ev.request).then((cacheResponse) => {
    // Überprüfen, ob die Response im Cache vorhanden ist
    if (cacheResponse) {
      // Wenn sie im Cache vorhanden ist, geben Sie sie zurück
      return cacheResponse;
    } else {
      // Wenn sie nicht im Cache ist, eine neue Anfrage an das Netzwerk senden
      return fetch(ev.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        // Die Response im Cache speichern, damit sie bei zukünftigen Anfragen verfügbar ist
        return caches.open(dynamicCache).then((cache) => {
          cache.put(ev.request, response.clone());
          return response;
        });
      });
    }
  });
}

function networkRevalidateAndCache(ev) {
  //try fetch first and fallback on cache
  //update cache if fetch was successful
  return fetch(ev.request).then((fetchResponse) => {
    if (fetchResponse.ok) {
      return caches.open(staticCache).then((cache) => {
        cache.put(ev.request, fetchResponse.clone());
        return fetchResponse;
      });
    } else {
      return caches.match(ev.request);
    }
  });
}

/*BACKGROUND TIMER*/

self.addEventListener("message", function (event) {
  const data = event.data;
  if (data.command === "start") {
    startTimer(data.duration);
  }
});

self.addEventListener("message", function (event) {
  const data = event.data;
  if (data.command === "keepAlive") {
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

  timer = setInterval(function () {
    if (remainingTime <= 0) {
      clearInterval(timer);
      console.log("Timer abgelaufen");

      //Nachrichten senden
      self.registration.showNotification("TTS", {
        body: "Your timer has expired!",
        tag: "timer-notification",
        vibrate: [200, 100, 200],
      });
    } else {
      remainingTime -= interval;

      const currentTime = remainingTime / 1000;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      self.registration.showNotification("TTS", {
        body: `Remaining time: ${formattedTime}`,
        tag: "timer-notification",
      });

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
