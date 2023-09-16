// service-worker.js
const version = 22;

const staticCache = `static-assets-${version}-new`; //html files etc.
const dynamicCache = `dynamic-assets-${version}`;
const imageCache = `imageCache-${version}`;

let DB = null;
let defaultNetworkMode = true; //offline-online modus zum daten sparen:
//wird aus dem frontend heraus gesteuert!

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
  "/javascripts/handleOfflineModal.js",

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
  "/javascripts/trainingIndexPage/showOfflineEditedTrainingNames.js",

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
  "/javascripts/trainingPage/changeTitleAjax.js",

  "/javascripts/volume/calcVolume.js",
  "/javascripts/volume/switchViews.js",

  "/javascripts/scratch/pauseTimer.js",
  "/offline",
  "/",

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
        /* return clients.claim(); */
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
          () => {
            console.log(`${staticCache} has been updated`);
          },
          (err) => {
            console.warn(`failed to update ${staticCache}`);
            console.error(err);
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

  const isPage = event.request.mode === "navigate"; // Prüfen, ob es sich um eine Seite handelt GET

  if (isCSS | isJS || isManfifest || isImage || isAudio || isFont) {
    event.respondWith(staleNoRevalidate(event)); //static ressources
  } else if ( //beim login immmer über das netzwerk
    event.request.method === "POST" &&
    event.request.url.includes("/login")
  ) {
    event.respondWith(changeThroughNetworkOfflineFallback(event));
  } else if ( //bei sonstigen patch/post/delete requests entscheided der ausgewählte modus darüber (netzwerk oder lokal zwischenspeichern)
    event.request.method === "PATCH" ||
    event.request.method === "POST" ||
    event.request.method === "DELETE"
  ) {
    if (defaultNetworkMode) {
      event.respondWith(changeThroughNetworkOfflineFallback(event));
    } else {
      let objectStore;

      if (event.request.method === "PATCH") {
        objectStore = "offlinePatches";
      } else if (event.request.method === "POST") {
        objectStore = "offlinePosts";
      } else if (event.request.method === "DELETE") {
        objectStore = "offlineDeletes";
      }

      event.respondWith(handleOfflineChange(event.request, objectStore));
    }
  } else if ( //bestimmte pages sollen auch immer nur über das netzwerk accessed werden wegen authentication und zugriff auf google api
    isPage &&
    (url.pathname.includes("/logout") ||
      url.pathname.includes("/login") ||
      url.pathname.includes("/auth/google"))
  ) {
    event.respondWith(fetchOnlyFallBackOnOfflinePage(event));
  } else if (isPage) {
    //for pages etc.

    if (defaultNetworkMode) {
      event.respondWith(fetchFirstThenCache(event));
    } else {
      event.respondWith(staleNoRevalidate(event)); //änderungen der seiten sind ja entsprechend in der indexDB datenbank gespeichert:
    }
  } else {
    console.log("wann wird dieser else else zweig überhaupt getriggert?");
    //hier muss eigentlich auch eine trennung der modi stattfinden?
    console.log(event.request.url);
    event.respondWith(staleWhileRevalidate(event));
  }
});

async function isOnline() {
  try {
    if (!self.navigator.onLine) {
      //false is always reliable that no network. true might lie
      return false;
    }

    const request = new URL(self.location.origin); // avoid CORS errors with a request to your own origin
    request.searchParams.set("rand", Date.now().toString()); // random value to prevent cached responses
    const response = await fetch(request.toString(), {
      method: "HEAD",
      cache: "no-store",
    }); //falls die ressource gecached ist kann das ergebnis verfälscht werden deswegen searchparams und no-store cache stratgie
    return response.ok;
  } catch {
    return false;
  }
}

self.addEventListener("message", async (event) => {
  if (event.data === "switchToDefaultMode") {
    defaultNetworkMode = true;

    if (isOnline()) {
      //try to sync data:

      try {
        const requestPending = await isOfflineRequestPending();
        if (requestPending && isOnline()) { //todo: das hier nochmal prüfen
          event.source.postMessage({
            type: "showSyncButton",
          });
        }
      } catch (err) {
        console.error(
          "Fehler beim automatischen synchroniseren der offline Daten",
          err
        );
      }
    }
  }
});

self.addEventListener("message", async (event) => {
  if (event.data === "syncOfflineData") {
    if (isOnline()) {
      try {
        const requestPending = await isOfflineRequestPending();
        await executeSavedRequests();
        if (requestPending) {
          event.source.postMessage({
            //löst im frontend ein bestätigungsmodal aus - das jetzt auch nur noch auf der hauptseite zu sein braucht: TODO:
            type: "offlineSync",
          });
        }
      } catch (err) {
        console.error(
          "Fehler beim automatischen aktualisieren der offline daten:",
          err
        );

        // zeigt ein failureModal an
        event.source.postMessage({
          type: "offlineSyncFailure",
        })
      }
    }
  }
});

self.addEventListener("message", async (event) => {
  if (event.data === "switchToOfflineMode") {
    defaultNetworkMode = false;
    console.log("default network mode", defaultNetworkMode);
  }
});

self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "getOfflineData") {
    const url = message.data;

    // immer ausführen wenn es denn welche gibt:
      isOfflineDataAvailable(url)
        .then((offlineData) => {
          // Senden Sie die offline Daten an den Client
          event.source.postMessage({
            command: "offlineData",
            data: offlineData,
          });
        })
        .catch((error) => {
          /* console.error("Fehler beim abrufen der offline data:") */
        });
  }
});

// client kann den netzwerkstatus anfragen: -benutz um zugriff auf bestimmte seiten zu verhindern (create-training) wenn offline mode oder offline
self.addEventListener("message", async (event) => {
  const message = event.data;

  const onlineStatus = await isOnline(); // true wenn online fallse wenn nicht:

  if (message.command === "networkModeRequest") {
    event.source.postMessage({
      command: "networkModeResponse",
      networkMode: defaultNetworkMode, // true oder false:
      onlineStatus: onlineStatus,
    })
  }
})

self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "getOfflineEditedTrainingTitles") {
    //aktion soll nur stattfidnen wenn die seite auch offline ist:f
      returnTrainingTitlesEdited()
        .then((editedEntries) => {
          event.source.postMessage({
            command: "offlineTrainingEdits",
            data: editedEntries,
          });
        })
        .catch((error) => {
          console.log("keine editedEntries zum zurückschicken");
        });
  }
});

self.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command === "getOFflineDeletedTrainings") {

    console.log("ich wurde angesprochen ja")

    returnDeletedTrainings()
      .then((deletedTrainings) => {
        event.source.postMessage({
          command: "sendDeletedTrainings",
          data: deletedTrainings,
        })
      })
      .catch((error) => {
        console.log("keine deletedTrainings zum zurückschicken");
      });
  }
})

async function returnDeletedTrainings() {
  if (!DB) {
    await openDB();
  }

  return new Promise((resolve, reject) => {
    const deleteTransaction = DB.transaction("offlineDeletes", "readonly");
    const delteStore = deleteTransaction.objectStore("offlineDeletes");

    const request = delteStore.getAll();

    request.onsuccess = (event) => {
      const result = request.result;

      if (result.length === 0) {
        console.log("keine gelöschten pläne vorhanden => reject");
        reject();
      } else {
        resolve(result);
      }
    }

    request.onerror = (event) => {
      reject("Fehler beim Abrufen der Einträge aus dem DeleteStore");
    }

  })
}



// this method returns training meta data patches (trainingTitle etc. if they are edited);
async function returnTrainingTitlesEdited() {
  //is any trainingTitle edited?

  if (!DB) {
    await openDB();
  }

  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    const request = patchStore.getAll();

    request.onsuccess = (event) => {
      const result = request.result;

      const editedEntries = result.filter((entry) =>
        entry.url.includes("edit")
      );

      if (editedEntries.length === 0) {
        console.log("keine passenden einträge gefunden reject");
        reject();
      } else {
        console.log("passende einträge gefunden!");
        resolve(editedEntries);
      }
    };

    request.onerror = (event) => {
      reject("Fehler beim Abrufen der Einträge aus dem offlinePatches Store");
    };
  });
}

// das ding hier soll unbedingt auch noch die posts berücksichtigen (exercises reset:);
async function isOfflineDataAvailable(url) {
  if (!DB) {
    await openDB();
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

      if (!db.objectStoreNames.contains("offlineDeletes")) {
        db.createObjectStore("offlineDeletes", {
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
async function isOfflineRequestPending() {
  if (!DB) {
    await openDB();
  }

  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const postTransaction = DB.transaction("offlinePosts", "readonly");
    const deleteTransaction = DB.transaction("offlineDeletes", "readonly"); // Hinzugefügt
    const patchStore = patchTransaction.objectStore("offlinePatches");
    const postStore = postTransaction.objectStore("offlinePosts");
    const deleteStore = deleteTransaction.objectStore("offlineDeletes"); // Hinzugefügt

    const patchCountRequest = patchStore.count();
    const postCountRequest = postStore.count();
    const deleteCountRequest = deleteStore.count(); // Hinzugefügt

    // Auf die Ergebnisse der count-Anfragen warten
    patchCountRequest.onsuccess = () => {
      postCountRequest.onsuccess = () => {
        deleteCountRequest.onsuccess = () => { // Hinzugefügt
          const totalRequests =
            patchCountRequest.result + postCountRequest.result + deleteCountRequest.result; // Hinzugefügt

          if (totalRequests > 0) {
            resolve(true); // Gespeicherte Anfragen vorhanden
          } else {
            resolve(false); // Keine gespeicherten Anfragen vorhanden
          }
        };

        deleteCountRequest.onerror = () => { // Hinzugefügt
          reject("Fehler beim Zählen der offlineDeletes"); // Hinzugefügt
        };
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

async function sendSavedRequestToServer(requestData) {
  let objectStoreName = "";

  if (requestData.method === "PATCH") {
    objectStoreName = "offlinePatches";
  } else if (requestData.method === "POST") {
    objectStoreName = "offlinePosts";
  } else if (requestData.method === "DELETE") {
    objectStoreName = "offlineDeletes";
  }

  if (objectStoreName) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      if (!response.ok) {
        throw new Error(`Fehler bei der Anfrage an den Server! Statuscode: ${response.status}`);
      }

      const transaction = DB.transaction(objectStoreName, "readwrite");
      const store = transaction.objectStore(objectStoreName);

      store.delete(requestData.url);
      console.log("Daten wurden aus der indexDB gelöscht!");
    } catch (error) {
      console.error("Fehler beim Senden der Anfrage an den Server:", error);
      //wenn ein fehler auftritt an den aufrufer weiterleiten
      throw error;
    }
  }
}

async function executeSavedRequests() {
  return new Promise(async (resolve, reject) => {
    // handleOfflinePatches
    const patchesTransaction = DB.transaction("offlinePatches", "readonly");
    const patchesStore = patchesTransaction.objectStore("offlinePatches");

    const allPatches = patchesStore.getAll();
    allPatches.onsuccess = async function () {
      for (const patch of allPatches.result) {
        const requestData = {
          method: patch.method,
          url: patch.url,
          headers: patch.headers,
          body: JSON.stringify(patch.body),
        };
        try {
          await sendSavedRequestToServer(requestData);
        } catch (error) {
          // Wenn ein Fehler auftritt, leiten Sie ihn weiter
          reject(error);
          return;
        }
      }

      // handle Offline Posts
      const postsTransaction = DB.transaction("offlinePosts", "readonly");
      const postsStore = postsTransaction.objectStore("offlinePosts");

      const allPosts = postsStore.getAll();
      allPosts.onsuccess = async function () {
        for (const post of allPosts.result) {
          const requestData = {
            method: post.method,
            url: post.url,
            headers: post.headers,
            body: JSON.stringify(post.body),
          };
          try {
            await sendSavedRequestToServer(requestData);
          } catch (error) {
            // Wenn ein Fehler auftritt, leiten Sie ihn weiter
            reject(error);
            return;
          }
        }

        // handleOfflineDeletes
        const deletesTransaction = DB.transaction("offlineDeletes", "readonly");
        const deletesStore = deletesTransaction.objectStore("offlineDeletes");

        const allDeletes = deletesStore.getAll();
        allDeletes.onsuccess = async function () {
          for (const del of allDeletes.result) {
            const requestData = {
              method: del.method,
              url: del.url,
              headers: del.headers,
              body: JSON.stringify(del.body),
            };
            try {
              await sendSavedRequestToServer(requestData);
            } catch (error) {
              // Wenn ein Fehler auftritt, leiten Sie ihn weiter
              reject(error);
              return;
            }
          }

          // Alle gespeicherten Anfragen wurden erfolgreich verarbeitet
          resolve();
        };
      };
    };
  });
}

// writes request in indexDB
async function handleOfflineChange(request, objectStore) {
  if (DB) {
    addToIndexDB(request, objectStore);
  } else {
    console.log("diese verzweigung testen!");
    openDB(async () => {
      addToIndexDB(request, objectStore);
    });
  }
}

async function addToIndexDB(request, objectStore) {
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
  };
  addRequest.onerror = (event) => {
    console.error(
      "Fehler beim Speichern der Daten in der IndexedDB",
      event.target.error
    );
  };
}

/*CACHING strategies -- bisher alle für den dynamic cache gedacht. da alle statischen ressourcen ja initial geladen werden müssten: */

//new Strategies

//only for logout -> hier ein fallback einfügen der bitte dann auch nicht gecached wird:
function fetchOnlyFallBackOnOfflinePage(ev) {
  return fetch(ev.request)
    .then((fetchResponse) => {
      if (fetchResponse) {
        return fetchResponse;
      } else {
        return caches.match("/offline");
      }
    })
    .catch(() => {
      return caches.match("/offline");
    });
}

function staleWhileRevalidate(ev) {
  //check cache and fallback on fetch for response
  //always attempt to fetch a new copy and update the cache
  return caches.match(ev.request).then((cacheResponse) => {
    let fetchResponse = fetch(ev.request).then((response) => {
      return caches.open(staticCache).then((cache) => {
        cache.put(ev.request, response.clone());
        return response;
      });
    });

    return cacheResponse || fetchResponse;
  });
}

// for static static files (css, js, image, manifest)
function staleNoRevalidate(ev) {
  return caches.match(ev.request).then((cacheResponse) => {
    // Überprüfen, ob die Response im Cache vorhanden ist
    if (cacheResponse) {
      // Wenn sie im Cache vorhanden ist, geben Sie sie zurück
      return cacheResponse;
    } else {
      // Wenn sie nicht im Cache ist, eine neue Anfrage an das Netzwerk senden
      return fetch(ev.request).then((response) => {
        // Die Response im Cache speichern, damit sie bei zukünftigen Anfragen verfügbar ist
        return caches.open(dynamicCache).then((cache) => {
          cache.put(ev.request, response.clone());
          return response;
        });
      });
    }
  });
}

function fetchFirstThenCache(ev) {
  return fetch(ev.request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        // Wenn die Netzwerkanfrage erfolgreich ist, speichern Sie sie im Cache und geben Sie die Antwort zurück
        return caches.open(staticCache).then((cache) => {
          cache.put(ev.request, networkResponse.clone());
          return networkResponse;
        });
      } else {
        // Wenn die Netzwerkanfrage fehlschlägt, versuchen Sie, die Antwort aus dem Cache abzurufen
        return caches.match(ev.request).then((cacheResponse) => {
          if (cacheResponse) {
            return cacheResponse;
          } else {
            return caches.match("/offline");
          }
        });
      }
    })
    .catch((err) => {
      // Bei einem Fetch-Fehler versuchen Sie, die Antwort aus dem Cache abzurufen

      return caches.match(ev.request).then((cacheResponse) => {
        if (cacheResponse) {
          return cacheResponse;
        } else {
          return caches.match("/offline");
        }
      });
    });
}

async function changeThroughNetworkOfflineFallback(ev) {
  const requestClone = ev.request.clone(); //für stream already read fehler:

  try {
    const response = await fetch(ev.request);

    return response;
  } catch (err) {
    let objectStore;

    if (ev.request.method === "PATCH") {
      objectStore = "offlinePatches";
    } else if (ev.request.method === "POST") {
      objectStore = "offlinePosts";
    } else {
      objectStore = "offlineDeletes";
    }

    await handleOfflineChange(requestClone, objectStore);
  }
}

function networkOnly(ev) {
  return fetch(ev.request);
}

function cacheOnly(ev) {
  return caches.match(ev.request) || caches.match("/offline"); //funktioniert auch nicht genau:
}

function cacheFirst(ev) {
  //return from cache or fetch if not in cache
  return caches.match(ev.request).then((cacheResponse) => {
    return cacheResponse || fetch(ev.request);
  });
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
