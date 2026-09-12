// Shared Firebase client configuration for public pages.
window.__firebase_config = JSON.stringify({
  apiKey: "AIzaSyAt0NRbbszX8MSikgsYJngdmWzdfYLoBB0",
  authDomain: "jeoahs1-max-03326376-49b27.firebaseapp.com",
  projectId: "jeoahs1-max-03326376-49b27",
  storageBucket: "jeoahs1-max-03326376-49b27.appspot.com",
  messagingSenderId: "893693678979",
  appId: "1:893693678979:web:3243772acee2fde171d2b6"
});
window.__app_id = "jeoahs1-max-03326376-49b27";

if (typeof document !== 'undefined' && document.body && document.body.dataset.config === '__FIREBASE_CONFIG__') {
  document.body.dataset.config = btoa(window.__firebase_config);
}
