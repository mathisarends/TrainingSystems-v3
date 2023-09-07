// service-worker.js
const version = 22;

const staticCache = `static-assets-${version}-new`; //html files etc.
const dynamicCache = `dynamic-assets-${version}`; //for api 

//der stylesheet pfad funktioniert der ejs leider noch nicht liegt wohl am path ja:


// wenn es wochen oder pläne nicht gibt kann ich da nicht andere statuscodes wie 302 oder so verwenden um die fehler zu umgehen?
const cacheListTraining = [
  /*     "/training/custom-A1",
    "/training/custom-A2",
    "/training/custom-A3",
    "/training/custom-A4",
    "/training/custom-A5",
    "/training/custom-A6",
    "/training/custom-B1",
    "/training/custom-B2",
    "/training/custom-B3",
    "/training/custom-B4",
    "/training/custom-B5",
    "/training/custom-B6",
    "/training/custom-C1",
    "/training/custom-C2",
    "/training/custom-C3",
    "/training/custom-C4",
    "/training/custom-C5",
    "/training/custom-C6", */

 /*    "training/custom-A1-edit",
    "training/custom-A2-edit",
    "training/custom-A3-edit",
    "training/custom-A4-edit",
    "training/custom-A5-edit",
    "training/custom-A6-edit",
    "training/custom-B1-edit",
    "training/custom-B2-edit",
    "training/custom-B3-edit",
    "training/custom-B4-edit",
    "training/custom-B5-edit",
    "training/custom-B6-edit",
    "training/custom-C1-edit",
    "training/custom-C2-edit",
    "training/custom-C3-edit",
    "training/custom-C4-edit",
    "training/custom-C5-edit",
    "training/custom-C6-edit",

    "training/template-A1",
    "training/template-A2",
    "training/template-A3",
    "training/template-A4",
    "training/template-B1",
    "training/template-B2",
    "training/template-B3",
    "training/template-B4",
    "training/reset-template-training",
    
    "training/session-edit-1",
    "training/session-edit-2",
    "training/session-edit-3",
    "training/session-edit-4",
    "training/session-edit-5",
 */
]

const cacheList = [ //everything that should be cached initally

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

    //js files
    "/javascripts/exercises/ajaxSave.js",
    "/javascripts/exercises/resetConfirmation.js",
    "/javascripts/exercises/showRightTabFromStart.js",
    "/javascripts/exercises/showSection.js",

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
    "/javascripts/trainingPage/navigateWeeks.js",
    "/javascripts/trainingPage/notePrompts.js",
    "/javascripts/trainingPage/pauseTimer.js",
    "/javascripts/trainingPage/removePlaceholder.js",
    "/javascripts/trainingPage/rpeInput.js",
    "/javascripts/trainingPage/showTimer.js",
    "/javascripts/trainingPage/showTrainingDays.js",
    "/javascripts/trainingPage/weightInput.js",
    "/javascripts/volume/calcVolume.js",
    "/javascripts/header.js",

    "/manifest/manifest.webmanifest",
    "/manifest/icon-192x192.png",
    "/manifest/icon-256x256.png",
    "/manifest/icon-384x384.png",
    "/manifest/icon-512x512.png",


    "/",
    "/login",
    "/login/reset",
    "/exercises",
    "/tools/volume",
    "/register",

    "/training",
    "/training/create-training-plan",
    "/training/createTraining",
    
]

self.addEventListener('activate', (ev) => {
  // when the service worker has been activated to replace an old one.
  //Extendable Event
  console.log('activated');
  // delete old versions of caches.
  ev.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key != staticCache).map((key) => caches.delete(key))
      );
    })
  );
});


self.addEventListener('install', (ev) => {
  ev.waitUntil(
    Promise.all([
      caches.open(staticCache).then(cache => {
        return cache.addAll(cacheList).catch(error => {
          // Hier können Sie den Fehler detailliert ausgeben
          console.error('Fehler beim Hinzufügen von Dateien zum Cache:', error);
        });
      })
    ])
  );
  console.log("service worker installed");
});
//


  
self.addEventListener('fetch', (event) => {

/*   console.log("fetch request for", event.request.url);
 */
  const requestType = getRequestType(event.request);

  let cachingStrategy;

  if (requestType.isImage || requestType.isCSS || requestType.isFont || requestType.isJS || requestType.isManifest) {
    cachingStrategy = cacheFirst;
  } else if (requestType.isHTML || requestType.isEJS) {
    cachingStrategy = cacheFirst; // Oder eine andere geeignete Strategie
  } else {
    cachingStrategy = networkOnly;
  }
  
  event.respondWith(cachingStrategy(event));

//
});

/*CACHING strategies*/

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
    isExternal,
  };
}
