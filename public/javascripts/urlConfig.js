const isProduction = window.location.hostname === 'www.meine-anwendung.com';

window.BASE_URL = isProduction
  ? 'https://www.meine-anwendung.com'
  : 'http://localhost:3000';

  console.log("eingebunden")