// service-worker.js
const version = 22;

const staticCache = `static-assets-${version}-new`; //html files etc.
const dynamicCache = `dynamic-assets-${version}`;
const imageCache = `imageCache-${version}`;

let DB = null;
let isSynced = true;
let defaultNetworkMode = true; //true = default behaviour, false = offline mode to save data

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

];

//activates service worker, deltes old cache versions, opensDB
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

//adds contents for caching initially
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

  const isImage = url.hostname.includes("picsum.photos") || url.pathname.endsWith(".png") || url.pathname.endsWith(".jpg");
  const isCSS = url.pathname.endsWith(".css") || url.hostname.includes("googleapis.com");
  const isJS = url.pathname.endsWith(".js");
  const isManfifest = url.pathname.endsWith(".manifest") || url.pathname.endsWith(".webmanifest");
  const isAudio = url.pathname.endsWith(".mp3");
  const isFont = url.hostname.includes("gstatic") || url.pathname.endsWith("woff2");
  const isPage = event.request.mode === "navigate"; 

  if (isCSS | isJS || isManfifest || isImage || isAudio || isFont) {
    event.respondWith(staleNoRevalidate(event)); 
  } else if (event.request.method === "POST" && event.request.url.includes("/login")) {
    event.respondWith(changeThroughNetworkOfflineFallback(event));

    //bei sonstigen patch/post/delete requests entscheided der ausgewählte modus darüber (netzwerk oder lokal zwischenspeichern)
  } else if (event.request.method === "PATCH" || event.request.method === "POST" || event.request.method === "DELETE") {
    
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

  //bestimmte pages sollen auch immer nur über das netzwerk accessed werden wegen authentication und zugriff auf google api
  } else if (isPage && (url.pathname.includes("/logout") || url.pathname.includes("/login") || url.pathname.includes("/auth/google"))) {
    event.respondWith(networkOnlyAuthentication(event));

  } else if (isPage) {
    if (defaultNetworkMode) {
      event.respondWith(networkRevalidateAndCache(event));
    } else {
      event.respondWith(staleNoRevalidate(event)); //änderungen der seiten sind ja entsprechend in der indexDB datenbank gespeichert:
    }
    
  } else {
    console.log("sonstiges fetch event:", event.request.url);
    event.respondWith(staleWhileRevalidate(event));
  }
});

async function isOnline() {
  try {
    if (!self.navigator.onLine) { //false is always reliable that no network. true might lie
      return false;
    }

    const request = new URL(self.location.origin); // avoid CORS errors with a request to your own origin
    request.searchParams.set("rand", Date.now().toString()); // random value to prevent cached responses
    const response = await fetch(request.toString(), {
      method: "HEAD",
      cache: "no-store",
    }); 
    return response.ok;
  } catch {
    return false;
  }
}

// if the mode is switched to online show the sync button if there are requests pending: also is triggered initially then the page loads first
self.addEventListener("message", async (event) => {
  if (event.data === "switchToDefaultMode") {
    defaultNetworkMode = true;

    if (isOnline()) {
      try {
        const requestPending = await isOfflineRequestPending();
        const onlineStatus = await isOnline();

        if (requestPending && onlineStatus) {
          event.source.postMessage({
            type: "showSyncButton",
          });
        }
      } catch (err) {
        console.error("Error while looking for offline changes", err);
      }
    }
  }
});

// trys to syncOfflineData while in default mode and network connection on. 
self.addEventListener("message", async (event) => {
  if (event.data === "syncOfflineData") {

    const onlineStatus = await isOnline();

    if (onlineStatus) {
      try {
        const requestPending = await isOfflineRequestPending();
        await executeSavedRequests();
        if (requestPending) { //this triggers confirmation modal in the frontend
          event.source.postMessage({
            type: "offlineSync",
          });
        }
      } catch (err) {
        console.error("Fehler beim automatischen aktualisieren der offline daten:", err);

        // this shows a failure modal in the frontend
        event.source.postMessage({
          type: "offlineSyncFailure",
        })
      }
    }
  }
});

//switch to Offline mode and set global variable accordingly
self.addEventListener("message", async (event) => {
  if (event.data === "switchToOfflineMode") {
    defaultNetworkMode = false;
  }
});

// retrives offlineData while data isnt synced for a certain url and sends it back to the client
self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "getOfflineData") {
    const url = message.data;

    if (!isSynced) { //if the data was not synced then
      isOfflineDataAvailable(url)
        .then((offlineData) => {
          event.source.postMessage({
            command: "offlineData",
            data: offlineData,
          });
        })
        .catch((error) => {
          console.log("Error while trying to retrieve the offline Data", error);
        });
    }

  }
});

// the client can request the isSynced status in order to decide wheter offline data shall be disp
self.addEventListener

// client sends a request when trying to access certain routes => this eventListener sends back the current networkMode and the current online Status
self.addEventListener("message", async (event) => {
  const message = event.data;

  const onlineStatus = await isOnline(); // true = online, false = offline
  if (message.command === "networkModeRequest") {
    event.source.postMessage({
      command: "networkModeResponse",
      networkMode: defaultNetworkMode, // global variable. true = default behaviour while fetching, false = the data is saved locally in indexDB storage in order to save data. data may be synced then online and default network mode
      onlineStatus: onlineStatus,
    })
  }
})

self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "getOfflineEditedTrainingTitles") {
      returnTrainingTitlesEdited()
        .then((editedEntries) => {
          event.source.postMessage({
            command: "offlineTrainingEdits",
            data: editedEntries,
          });
        })
        .catch((error) => {
          // no changes there detected => ignore
        });
  }
});

// while !defaultNetworkMode the user can delete trainings offline. in order to make them not visible to the user once they are "deleted" this information has to be retrieved
self.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command === "getOFflineDeletedTrainings") {

    returnDeletedTrainings()
      .then((deletedTrainings) => {
        event.source.postMessage({
          command: "sendDeletedTrainings",
          data: deletedTrainings,
        })
      })
      .catch((error) => {
        // no trainings were deleted => ignore
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

    request.onsuccess = () => {
      const result = request.result;

      if (result.length === 0) {
        reject(); //no deleted plans => reject
      } else {
        resolve(result); //send back the contents that there deleted (fetchRequestData)
      }
    }

    request.onerror = (error) => {
      reject("Error while trying to access data from delete store", error);
    }

  })
}



// used on trainingIndexPage | this method returns locally saved data in offlineMode in order to show the user changes in meta data (title, frequenncy etc)
async function returnTrainingTitlesEdited() {
  if (!DB) {
    await openDB();
  }
  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    const request = patchStore.getAll();

    request.onsuccess = () => {
      const result = request.result;

      const editedEntries = result.filter((entry) => entry.url.includes("edit")); //keep all the entrys that have edit included

      if (editedEntries.length === 0) {
        reject(); //no entries were found => reject
      } else {
        resolve(editedEntries);
      }
    };

    request.onerror = (error) => {
      reject("Error while trying to access entries in offlinePatches store", err);
    };
  });
}

// this function looks for offline data for a specific url in the local database and returns it to the client
async function isOfflineDataAvailable(url) {
  if (!DB) {
    await openDB();
  }
  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    const request = patchStore.get(url);

    request.onsuccess = () => {
      const data = request.result ? request.result.body : false;

      if (data) {
        resolve(data);
      } else {
        reject("No Offline Data available");
      }
    };

    request.onerror = (error) => {
      reject("Error while requesting offline data", error);
    };
  });
}

// creates database and upgrades it as needed
async function openDB(callback) {
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
}

// checks whether there are any offline requests pending - counts from all stroes and if there is a single entry return true else false;
async function isOfflineRequestPending() {
  if (!DB) {
    await openDB();
  }

  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const postTransaction = DB.transaction("offlinePosts", "readonly");
    const deleteTransaction = DB.transaction("offlineDeletes", "readonly"); 
    const patchStore = patchTransaction.objectStore("offlinePatches");
    const postStore = postTransaction.objectStore("offlinePosts");
    const deleteStore = deleteTransaction.objectStore("offlineDeletes"); 

    const patchCountRequest = patchStore.count();
    const postCountRequest = postStore.count();
    const deleteCountRequest = deleteStore.count(); 

    // Auf die Ergebnisse der count-Anfragen warten
    patchCountRequest.onsuccess = () => {
      postCountRequest.onsuccess = () => {
        deleteCountRequest.onsuccess = () => {
          const totalRequests =
            patchCountRequest.result + postCountRequest.result + deleteCountRequest.result; 

          if (totalRequests > 0) {
            resolve(true); 
          } else {
            resolve(false); 
          }
        };

        deleteCountRequest.onerror = (err) => { 
          reject("Error while counting in offlineDeletes", err);
        };
      };

      postCountRequest.onerror = (err) => {
        reject("Error while counting in offlinePosts", err);
      };
    };

    patchCountRequest.onerror = (err) => {
      reject("Error while couting in offlinePatches", err);
    };
  });
}

// executes all saved requests (patches, post, deletes), if there is an error give it back to the calling function
async function executeSavedRequests() {
  return new Promise(async (resolve, reject) => {
    const patchesTransaction = DB.transaction("offlinePatches", "readonly");
    const patchesStore = patchesTransaction.objectStore("offlinePatches");

    //iterate over all entries and try to send the requests to server in order to synchronize offline data
    //if therer is an error reject
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
          reject(error);
          return;
        }
      }

      // handle Offline Posts the same way
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
              reject(error);
              return;
            }
          }

        };
      };
    };
    // All requests were handled properly resolve() and set isSynced flag
    isSynced = true;
    resolve();
  });
}

async function sendSavedRequestToServer(requestData) {
  let objectStoreName = "";

  // determine the objectStore based on method:
  if (requestData.method === "PATCH") {
    objectStoreName = "offlinePatches";
  } else if (requestData.method === "POST") {
    objectStoreName = "offlinePosts";
  } else if (requestData.method === "DELETE") {
    objectStoreName = "offlineDeletes";
  }

  if (objectStoreName) {
    try {
      // fetch to the url and wait for response => react accordingly
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      if (!response.ok) {
        throw new Error(`Error while requesting to server: Status ${response.status}`);
      }

      const transaction = DB.transaction(objectStoreName, "readwrite");
      const store = transaction.objectStore(objectStoreName);
      //clear out the offline data when the data was synced 

      // store.delete(requestData.url); //leads to inconsistend behaviour if the user syncs and continues in offline mode: just keep the data: TODO: check wheter this leads to problems:

      console.log("Data was send to server and is currently not deleted from indexDB");
    } catch (error) {
      console.error("Error while requesting the server", error);
      //wenn ein fehler auftritt an den aufrufer weiterleiten
      throw error;
    }
  }
}

// is called intially in the offline mode or as a fallback then the user has no internet connection
// writes patch, post, delete request locally to the database
async function handleOfflineChange(request, objectStore) {

  if (!DB) {
    await openDB();
  }

  await addToIndexDB(request, objectStore);
}

async function addToIndexDB(request, objectStore) {
  const formDataObject = await request.json(); // us the data that was send with the request in order to store it
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
    console.log("Existing data for this url deleted");
  }

  const addRequest = store.add({
    url: request.url,
    method: method,
    headers: headers,
    body: formDataObject,
  });

  addRequest.onsuccess = () => {
    console.log("Data was sucessfully saved to indexDB store", objectStore);
    isSynced = false; //not synchronised because new offline data was saved:
    
  };
  addRequest.onerror = (event) => {
    console.error("Error while trying to save data in indexDB", event.target.error);
  };
}

/*CACHING strategies -----------------------*/

//only for authentication purposes => always fetch over network
function networkOnlyAuthentication(ev) {
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

  //check cache and fallback on fetch for response - always attempt to fetch a new copy and update the cache

function staleWhileRevalidate(ev) {
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

// for static static files (css, js, image, manifest) and pages in offline mode
function staleNoRevalidate(ev) {
  return caches.match(ev.request).then((cacheResponse) => {
    if (cacheResponse) {
      return cacheResponse; // if the ressource is in cache return 
    } else {
      // if not try to fetch it and put it in the cache for later requests
      return fetch(ev.request).then((response) => {
        return caches.open(dynamicCache).then((cache) => {
          cache.put(ev.request, response.clone());
          return response;
        });
      });
    }
  });
}

function networkRevalidateAndCache(ev) {
  return fetch(ev.request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        // if the network response is okay save in cache
        return caches.open(staticCache).then((cache) => {
          cache.put(ev.request, networkResponse.clone());
          return networkResponse;
        });
      } else {
        // if network requests fail try to cache Response => fallback on offlinepage
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
        // if network requests fail try to cache Response => fallback on offlinepage
      return caches.match(ev.request).then((cacheResponse) => {
        if (cacheResponse) {
          return cacheResponse;
        } else {
          return caches.match("/offline");
        }
      });
    });
}

// for post, patch, delete requests try other network and fallback to offline saving solution
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

/*BACKGROUND TIMER AUTO SAVE: --------------------------------------*/

let remainingAutoSaveTime = 0;
let timerInterval;
let restartMode = true;

self.addEventListener("message", function (event) {
  const data = event.data;

  if (data.command === "startAutoSaveTimer") {
    restartMode = true;
    remainingAutoSaveTime = data.duration;
    startAutoSaveTimer(event); // duration as a second parameter for new Start
  }
})


self.addEventListener("message", function (event) {
  const data = event.data;

  // stops the autoSaveTimer (for example: when the page is left)
  if (data.command === "stopAutoSaveTimer") {
    restartMode = false;
    clearInterval(timerInterval);
    remainingAutoSaveTime = 0;
  }

})

function startAutoSaveTimer(event) {
  console.log("neuer aufruf der methode:")
  const interval = 1000; // 1 second

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(function () {
    if (remainingAutoSaveTime <= 0) {
      clearInterval(timerInterval);

      event.source.postMessage({
        command: "autoSaveTimerCompleted",
      });

      if (restartMode) {
        //reset the remainingTime and clear start the timer again
        console.log("Auto save timer restarted");
        remainingAutoSaveTime = event.data.duration;
        startAutoSaveTimer(event)
      };
      
    } else {
      remainingAutoSaveTime -= interval
    }
  }, interval)
}

/*BACKGROUND TIMER REST PAUSE ------------------------------------- */

let remainingTime = 0;
let timer;
let isTimerPaused = false;
let pausedTime = 0;


self.addEventListener("message", function (event) {
  const data = event.data;
  if (data.command === "start") {
    startTimer(data.duration);
  }
});

self.addEventListener("message", function(event) {
  const data = event.data;

  if (data.command === "stop") {
    stopTimer();
    
      // close all notifications
      self.registration.getNotifications({ tag: "timer-notification" })
      .then((notifications) => {
        notifications.forEach((notification) => {
          notification.close();
        });
      });

  }
})

self.addEventListener("message", function(event) {
  const data = event.data;

  if (data.command === "pauseTimer") {
    pauseTimer();
  }
})

self.addEventListener("message", function(event) {
  const data = event.data;

  if (data.command === "continueTimer") {
    continueTimer();
  }
})

self.addEventListener("message", function (event) {
  const data = event.data;
  if (data.command === "keepAlive") {
  }
});

self.addEventListener("message", function (event) {
  const data = event.data;

  if (data.command === "addRestTime") {
    remainingTime = remainingTime + 30000; //add 30 seconds to timer
  }
})

function startTimer(duration) {
  remainingTime = duration;
  const interval = 1000; // 1 second

  if (timer) {
    clearInterval(timer); // if there is already a timer clear it
  }

  timer = setInterval(function () {
    if (remainingTime <= 0) {
      clearInterval(timer);

      // send push notification to client that the timer has exproed
      self.registration.showNotification("TTS", {
        body: "Your timer has expired!",
        tag: "timer-notification",
        vibrate: [200, 100, 200],
      });
    } else {
      remainingTime -= interval;

      // formatt remaining time to mm:ss
      const currentTime = remainingTime / 1000;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      // display remaining time in push-notification
      self.registration.showNotification("TTS", {
        body: `Remaining time: ${formattedTime}`,
        tag: "timer-notification",
      });

      // send the remaining time to frontend for timer display
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

function stopTimer() {
  clearInterval(timer);
  remainingTime = 0;
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        command: 'timerStopped',
      });
    });
  });
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    pausedTime = remainingTime;
    isTimerPaused = true;
  }
}

function continueTimer() {
  if (isTimerPaused) {
    startTimer(pausedTime);
  }
}