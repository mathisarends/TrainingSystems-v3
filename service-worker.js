// service-worker.js
const version = 24;

const staticCache = `static-assets-${version}-new`; //html files etc.
const dynamicCache = `dynamic-assets-${version}`;
const imageCache = `imageCache-${version}`;

let DB = null;
let isSynced = true; //TODO: testen ob das problme macht
let defaultNetworkMode = true; //true = default behaviour, false = offline mode to save data

const imageAssets = [
  "/manifest/manifest.webmanifest",
  "/manifest/manifest_light.webmanifest",

  "/manifest/icon-192x192.png",
  "/manifest/icon-256x256.png",
  "/manifest/icon-384x384.png",
  "/manifest/icon-512x512.png",

  "/manifest/icon-192x192-modified.png",
  "/manifest/icon-256x256-modified.png",
  "/manifest/icon-384x384-modified.png",
  "/manifest/icon-512x512-modified.png",

  //dark mode
  "/images/backgrounds/background-destination-desktop.jpg",
  "/images/backgrounds/background-destination-mobile.jpg",
  "/images/backgrounds/background-destination-tablet.jpg",
  "/images/backgrounds/background-technology-desktop.jpg",
  "/images/backgrounds/background-technology-mobile.jpg",
  "/images/backgrounds/background-technology-tablet.jpg",

  //white mode
  "/images/backgrounds/background-destination-desktop-modified.jpg",
  "/images/backgrounds/background-destination-mobile-modified.jpg",
  "/images/backgrounds/background-destination-tablet-modified.jpg",
  "/images/backgrounds/background-technology-desktop-modified.jpg",
  "/images/backgrounds/background-technology-mobile-modified.jpg",
  "/images/backgrounds/background-technology-tablet-modified.jpg",

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

  //js files
  "/javascripts/displayOfflineData.js",
  "/javascripts/themeSwitcher.js",
  "/javascripts/pwaBanner.js",
  "/javascripts/syncThroughSW.js",

  "/javascripts/exercises/ajaxSave.js",
  "/javascripts/exercises/showRightTabFromStart.js",
  "/javascripts/exercises/showSection.js",

  "/javascripts/header/header.js",

  "/javascripts/register/navigation.js",
  "/javascripts/register/volumeCalculations.js",

  "/javascripts/trainingIndexPage/showRightTabFromStart.js",
  "/javascripts/trainingIndexPage/trainingPlanCategorySelector.js",
  "/javascripts/trainingIndexPage/showOfflineEditedTrainingNames.js",
  "/javascripts/trainingIndexPage/ajaxDelete.js",
  "/javascripts/trainingIndexPage/handleCustomRedirects.js",
  "/javascripts/trainingIndexPage/handleTemplateRedirects.js",
  "/javascripts/trainingIndexPage/handleSessionRedirects.js",
  "/javascripts/trainingIndexPage/archiveLogic.js",
  "/javascripts/trainingIndexPage/archiveRedirectAndRestore.js",

  "/javascripts/trainingPage/ajaxAutoSave.js",
  "/javascripts/trainingPage/calcBackoffMax.js",
  "/javascripts/trainingPage/calculateSetsTonnage.js",
  "/javascripts/trainingPage/calcVolumeMedians.js",
  "/javascripts/trainingPage/changeExerciseName.js",
  "/javascripts/trainingPage/displayDefaultSetSchema.js",
  "/javascripts/trainingPage/displayTrainingDay.js",
  "/javascripts/trainingPage/notePrompts.js",
  "/javascripts/trainingPage/pauseTimer.js",
  "/javascripts/trainingPage/removePlaceholder.js",
  "/javascripts/trainingPage/rpeInput.js",
  "/javascripts/trainingPage/handleDeloadWeek.js",
  "/javascripts/trainingPage/changeTitleAjax.js",
  "/javascripts/trainingPage/addNewExercise.js",
  "/javascripts/trainingPage/weightInput.js",
  "/javascripts/trainingPage/automaticProgression.js",
  "/javascripts/trainingPage/editTrainingPage.js",
  "/javascripts/trainingPage/archivePlanView.js",

  "/javascripts/volume/calcVolume.js",
  "/javascripts/volume/switchViews.js",

  "/javascripts/statsPage/illustrateStats.js",
  "/javascripts/statsPage/navigate.js",
  "/javascripts/statsPage/showStatsTab.js",
  "/javascripts/statsPage/navigateToWeekHighlight.js",
  "/javascripts/statsPage/switchViews.js",

  "/javascripts/login/handleLogin.js",

  "/javascripts/session/pauseTimer.js",
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
            // Hier können Sie den Inhalt von 'assets' loggen, um festzustellen,
            // welche Datei das Problem verursacht hat
            console.log('Failed to add these assets to the cache:', assets);
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
  const url = new URL(event.request.url);

  // determine the type of request
  const isImage = url.hostname.includes("picsum.photos") || url.pathname.endsWith(".png") || url.pathname.endsWith(".jpg");
  const isCSS = url.pathname.endsWith(".css") || url.hostname.includes("googleapis.com");
  const isJS = url.pathname.endsWith(".js");
  const isManfifest = url.pathname.endsWith(".manifest") || url.pathname.endsWith(".webmanifest");
  const isAudio = url.pathname.endsWith(".mp3");
  const isFont = url.hostname.includes("gstatic") || url.pathname.endsWith("woff2");
  const isPage = event.request.mode === "navigate";

  let response = undefined;
  let responseSet = false;

// These responses are always the same whether in offline or online mode
if (!responseSet) {
  if (isCSS || isJS || isManfifest || isImage || isFont) {
    response = staleNoRevalidate(event);
    responseSet = true;
  } else if (isPage && (url.pathname.includes("/logout") || url.pathname.includes("/login") || url.pathname.includes("/auth/google"))) {
    response = networkOnlyAuthentication(event);
    responseSet = true;
  } else if (event.request.method === "POST" && event.request.url.includes("/login")) {
    defaultNetworkMode = true;
    response = changeThroughNetworkOfflineFallback(event);
    responseSet = true;
  }
}

if (!responseSet && defaultNetworkMode) {
  if (isAudio) {
    response = staleNoRevalidate(event);
    responseSet = true;
  } else if (event.request.method === "PATCH" || event.request.method === "POST" || event.request.method === "DELETE") {
    response = changeThroughNetworkOfflineFallback(event);
    responseSet = true;
  } else if (isPage) {
    response = networkRevalidateAndCache(event);
    responseSet = true;
  } else {
    response = staleWhileRevalidate(event);
    responseSet = true;
  }
}

if (!responseSet && !defaultNetworkMode) { // When in offline mode
  if (isAudio) {
    response = cacheOnly(event);
    responseSet = true;
  } else if (event.request.method === "PATCH" || event.request.method === "POST" || event.request.method === "DELETE") {
    const objectStore = determineObjectStoreByMethod(event.request.method);
    response = handleOfflineChange(event.request, objectStore);
    responseSet = true;
  } else if (isPage) {
    response = staleNoRevalidate(event);
    responseSet = true;
  } else {
    response = staleNoRevalidate(event);
    responseSet = true;
  }
}

event.respondWith(response); // Respond with the chosen response
});

function determineObjectStoreByMethod(method) {
  let objectStore;

  if (method === "PATCH") {
    objectStore = "offlinePatches";
  } else if (method === "POST") {
    objectStore = "offlinePosts";
  } else if (method === "DELETE") {
    objectStore = "offlineDeletes";
  }

  return objectStore;
}

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

//the frontend can ask whetere the service worker is online
self.addEventListener("message", async (event) => {
  if (event.data.command === "getOnlineStatus") {
    const onlineStatus = await isOnline();

    event.source.postMessage({
      type: "swOnlineStatus",
      onlineStatus: onlineStatus, 
    })
  }
})

self.addEventListener("message", event => {
  if (event.data.command === "simpleSwitchToDefaultMode") {
    console.log("simple switch to default");
    defaultNetworkMode = true;

    event.source.postMessage({
      type: "switchToDefaultSucess"
    });
  }
})

// if the mode is switched to online show the sync button if there are requests pending: also is triggered initially then the page loads first
self.addEventListener("message", async (event) => {
  if (event.data.command === "switchToDefaultMode") {

    defaultNetworkMode = true;
    
    const userID = event.data.registratedUser;
    console.log(userID, "switched to default mode");
    const onlineStatus = await isOnline();

    if (onlineStatus) {
      try {
        const requestPending = await isOfflineRequestPending(userID); //for the certain user:

        if (requestPending && onlineStatus) { //is synced initially to false
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
  if (event.data.command === "syncOfflineData") {

    const userID = event.data.registratedUser;

    const onlineStatus = await isOnline();

    event.source.postMessage({
      type: "showWaitForSyncModal",
    })

    if (onlineStatus) {
      try {
        const requestPending = await isOfflineRequestPending(userID); //for the currently registered user:
        await executeSavedRequests(userID);
        if (requestPending) { //this triggers confirmation modal in the frontend
          event.source.postMessage({
            type: "offlineSync",
          });
        }
      } catch (err) {
        console.error("Error while trying to update offline data:", err);

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
    const url = message.url;
    const userID = message.user;

    console.log("userID", userID);
    console.log("isSynced", isSynced);

    // is synced flag not used anymore because entries are deleted then synced_
      isOfflineDataAvailable(url, userID)
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
});

// client sends a request when trying to access certain routes (redirect on training index) => this eventListener sends back the current networkMode and the current online Status
self.addEventListener("message", async (event) => {
  const message = event.data;

  const onlineStatus = await isOnline(); // true = online, false = offline
  if (message.command === "networkModeRequest") {
    event.source.postMessage({
      command: "networkModeResponse",
      networkMode: defaultNetworkMode, // global variable. true = default behaviour while fetching, false = the data is saved locally in indexDB storage in order to save data. data may be synced then online and default network mode
      onlineStatus: onlineStatus,
      isSynced: isSynced,
    })
  }
})

self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.command === "getOfflineEditedTrainingTitles") {

    const userID = message.userID;

      returnTrainingTitlesEdited(userID)
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

    const userID = message.userID;

    returnDeletedTrainings(userID)
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

async function returnDeletedTrainings(userID) {
  if (!DB) {
    await openDB();
  }

  return new Promise((resolve, reject) => {
    const deleteTransaction = DB.transaction("offlineDeletes", "readonly");
    const delteStore = deleteTransaction.objectStore("offlineDeletes");

    const request = delteStore.getAll();

    let deletedTrainings = [];

    request.onsuccess = (event) => {
      const allDeletes = event.target.result;

      for (const del of allDeletes) {
        if (del.userIdentification === userID) {
          deletedTrainings.push(del.body);
        }
      }

      if (deletedTrainings.length === 0) {
        reject(); //no deleted plans => reject
      } else {
        resolve(deletedTrainings); //send back the contents that there deleted (fetchRequestData)
      }
    }

    request.onerror = (error) => {
      reject("Error while trying to access data from delete store", error);
    }

  })
}

// used on trainingIndexPage | this method returns locally saved data in offlineMode in order to show the user changes in meta data (title, frequenncy etc)
async function returnTrainingTitlesEdited(userID) {
  if (!DB) {
    await openDB();
  }
  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    const request = patchStore.getAll();

    request.onsuccess = () => {
      const result = request.result;

      // filter entries by userID
      const editedEntries = result.filter((entry) => entry.url.includes("edit") && entry.userIdentification === userID); //keep all the entrys that have edit included

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
async function isOfflineDataAvailable(url, userID) {
  if (!DB) {
    await openDB();
  }
  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    const request = patchStore.getAll();
    let matchingResult;

    request.onsuccess = (event) => {
      const allPatches = event.target.result;
      for (const patch of allPatches) {
        if (patch.url === url && patch.userIdentification === userID) {
          matchingResult = patch;
        }
      }

      const data = matchingResult ? matchingResult.body : false;
  
      if (data) {
        resolve(data);
      } else {
        reject("No Offline Data available");
      }
    }
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
async function isOfflineRequestPending(userID) {
  if (!DB) {
    await openDB();
  }

  return new Promise((resolve, reject) => {
    const patchTransaction = DB.transaction("offlinePatches", "readonly");
    const patchStore = patchTransaction.objectStore("offlinePatches");

    let found = false;

    patchTransaction.oncomplete = async function () {
      if (found) {
        resolve(true);
      } else {
        const postTransaction = DB.transaction("offlinePosts", "readonly");
        const postStore = postTransaction.objectStore("offlinePosts");

        postTransaction.oncomplete = async function () {
          if (found) {
            resolve(true);
          } else {
            const deleteTransaction = DB.transaction("offlineDeletes", "readonly");
            const deleteStore = deleteTransaction.objectStore("offlineDeletes");

            deleteTransaction.oncomplete = async function () {
              if (found) {
                resolve(true);
              } else {
                reject(false);
              }
            };

            const allDeletes = deleteStore.getAll();
            allDeletes.onsuccess = async function () {
              for (const del of allDeletes.result) {
                if (del.userIdentification === userID) {
                  found = true;
                  break;
                }
              }
            };
          }
        };

        const allPosts = postStore.getAll();
        allPosts.onsuccess = async function () {
          for (const post of allPosts.result) {
            if (post.userIdentification === userID) {
              found = true;
              break;
            }
          }
        };
      }
    };

    const allPatches = patchStore.getAll();
    allPatches.onsuccess = async function () {
      for (const patch of allPatches.result) {
        if (patch.userIdentification === userID) {
          found = true;
          break;
        }
      }
    };
  });
}

// executes all saved requests (patches, post, deletes), if there is an error give it back to the calling function
async function executeSavedRequests(userID) {
  return new Promise(async (resolve, reject) => {
    const patchesTransaction = DB.transaction("offlinePatches", "readonly");
    const patchesStore = patchesTransaction.objectStore("offlinePatches");

    const patchPromises = [];

    const allPatches = patchesStore.getAll();
    allPatches.onsuccess = async function () {
      for (const patch of allPatches.result) {
        if (patch.userIdentification === userID) {
          const requestData = {
            method: patch.method,
            url: patch.url,
            headers: patch.headers,
            body: JSON.stringify(patch.body),
          };

          const patchPromise = sendSavedRequestToServer(requestData);
          patchPromises.push(patchPromise);
        }
      }

      // Handle Offline Posts the same way
      const postsTransaction = DB.transaction("offlinePosts", "readonly");
      const postsStore = postsTransaction.objectStore("offlinePosts");

      const postPromises = [];

      const allPosts = postsStore.getAll();
      allPosts.onsuccess = async function () {
        for (const post of allPosts.result) {
          if (post.userIdentification === userID) {
            const requestData = {
              method: post.method,
              url: post.url,
              headers: post.headers,
              body: JSON.stringify(post.body),
            };
            const postPromise = sendSavedRequestToServer(requestData);
            postPromises.push(postPromise);
          }
        }

        // Handle Offline Deletes
        const deletesTransaction = DB.transaction("offlineDeletes", "readonly");
        const deletesStore = deletesTransaction.objectStore("offlineDeletes");

        const deletePromises = [];

        const allDeletes = deletesStore.getAll();
        allDeletes.onsuccess = async function () {
          for (const del of allDeletes.result) {
            if (del.userIdentification === userID) {
              const requestData = {
                method: del.method,
                url: del.url,
                headers: del.headers,
                body: JSON.stringify(del.body),
              };
              const deletePromise = sendSavedRequestToServer(requestData);
              deletePromises.push(deletePromise);
            }
          }

          // Wait for all promises to resolve
          try {
            await Promise.all([...patchPromises, ...postPromises, ...deletePromises]);
            // All requests were handled properly, resolve() and set isSynced flag
            isSynced = true;
            resolve();
          } catch (error) {
            // If any promise rejects, propagate the error
            reject(error);
          }
        };
      };
    };
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

      store.delete(requestData.url); //leads to inconsistend behaviour if the user syncs and continues in offline mode: just keep the data: TODO: check wheter this leads to problems:

      try {
        // Die Seite abrufen
        const newVersionOfPage = await fetch(requestData.url);
      
        const urlObject = new URL(requestData.url);
        const relativePath = urlObject.pathname;
      
        // html content of currentpage
        const htmlContent = await newVersionOfPage.text();
      
        // set the response header to html
        const responseHeaders = new Headers({
          "Content-Type": "text/html", // Hier setzen Sie den HTML-Header
        });
      
        // cache html so that the user sees the changes directly while still in offline mode:
        caches.open(staticCache).then((cache) => {
          cache.put(relativePath, new Response(htmlContent, { headers: responseHeaders }));
        });
      
        console.log("Page successfully cached:", relativePath);
      
      } catch (error) {
        console.error("Error caching page:", error);
      }


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
  const userID = formDataObject.userIdentification;
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
    userIdentification: userID, // for not accidently syncing data from another account when changed
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

function cacheOnlyAudio(ev) {
  return caches.match(ev.request).then((cacheResponse) => {
    if (cacheResponse) {
      return cacheResponse;
    } else {
      // Hier kannst du eine Fehlerbehandlung durchführen, wenn die Ressource nicht im Cache ist.
      return null;
    }
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

//TODO:
// for static static files (css, js, image, manifest) and pages in offline mode: TODO im offline mode wird das hier zweimal aufgerufen mit einem fehler: wahrscheinlich wegen mp3
function staleNoRevalidate(ev) {
  return caches.match(ev.request).then((cacheResponse) => {
    if (cacheResponse) {
      return cacheResponse; // if the ressource is in cache return 
    } else {
      return fetch(ev.request).then((response) => {
        return caches.open(dynamicCache).then((cache) => {
          cache.put(ev.request, response.clone());
          return response;
        });
      });
    }
  });
}

function cacheOnly(ev) {
  return caches.match(ev.request);
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
    console.log(err);
    const objectStore = determineObjectStoreByMethod(ev.request.method);

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

    if (!isTimerPaused) {
      restartRestPauseTimer(data.duration - 1000); //1 sekunde direkt abziehen:
    }
  }
});

function restartRestPauseTimer(newDuration) {
  clearInterval(timer);
  remainingTime = newDuration;
  startTimer(newDuration);
}

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
    clearInterval(timer); // Wenn bereits ein Timer läuft, stoppe ihn
  }

  // Direkte Aktualisierung der Timer-Anzeige beim Start
  updateTimerDisplay(remainingTime);

  timer = setInterval(function () {
    if (remainingTime <= 0) {
      clearInterval(timer);

      // Sende Push-Benachrichtigung an den Client, dass der Timer abgelaufen ist
      self.registration.showNotification("TTS", {
        body: "Your timer has expired!",
        tag: "timer-notification",
        vibrate: [200, 100, 200],
      });
    } else {
      remainingTime -= interval;

      // Formatiere die verbleibende Zeit auf mm:ss
      const currentTime = remainingTime / 1000;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      let formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      // Zeige die verbleibende Zeit in der Push-Benachrichtigung an
      self.registration.showNotification("TTS", {
        body: `Remaining time: ${formattedTime}`,
        tag: "timer-notification",
      });

      // Sende die verbleibende Zeit an die Frontend-Anwendung zur Anzeige
      updateTimerDisplay(remainingTime, formattedTime);
    }
  }, interval);
}


function updateTimerDisplay(time, formattedTime) {

  if (!formattedTime) {
    const currentTime = time / 1000;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }


  // Aktualisiere die Timer-Anzeige in der Benutzeroberfläche
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        command: "currentTime",
        currentTime: time,
        formattedTime: formattedTime,
      });
    });
  });
}

function stopTimer() {
  clearInterval(timer);
  remainingTime = 0;
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