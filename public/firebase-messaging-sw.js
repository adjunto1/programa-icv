importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAuva1NIWiRO29jluYKrgjuUnGSgbAgObs",
  authDomain: "programa-icv.firebaseapp.com",
  databaseURL: "https://programa-icv-default-rtdb.firebaseio.com",
  projectId: "programa-icv",
  storageBucket: "programa-icv.firebasestorage.app",
  messagingSenderId: "532656820853",
  appId: "1:532656820853:web:f703c9c61ccbc438619e3c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
  });
});
