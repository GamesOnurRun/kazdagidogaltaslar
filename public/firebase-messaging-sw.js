// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.17.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBbzi3yjPjrwya_bF_wA-gYcaybxHRuIjg",
  authDomain: "kazdagidogaltaslar.firebaseapp.com",
  projectId: "kazdagidogaltaslar",
  storageBucket: "kazdagidogaltaslar.firebasestorage.app",
  messagingSenderId: "531559401226",
  appId: "1:531559401226:web:2683c9040e2601871fdcf3",
  measurementId: "G-KTNRP151DF"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
