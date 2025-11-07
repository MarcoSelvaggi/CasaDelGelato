importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCEtjAs4cTJbpji4dXnb_bGxRUaK2D2tsA",
  authDomain: "casadelgelato-e6fbf.firebaseapp.com",
  projectId: "casadelgelato-e6fbf",
  messagingSenderId: "446810619113",
  appId: "1:446810619113:web:1f25c3a16586c81c8a0478"
});

const messaging = firebase.messaging();

// ✅ Notifica quando l’app è chiusa o in background
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification("📣 Cliente chiama!", {
    body: "Un tavolo ha bisogno di te 🍨",
    icon: "icon-192.png" // ✅ Mostra icona tua
  });
});