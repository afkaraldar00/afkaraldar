// Firebase Cloud Messaging Background Service Worker for Afkar Aldar / Eftikad Admin
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase with real web app configuration (eftikad-kh)
firebase.initializeApp({
  apiKey: "AIzaSyCXSI9_4Z_3xlcV_KA2tkLwk-VaI6BvnHo",
  authDomain: "eftikad-kh.firebaseapp.com",
  projectId: "eftikad-kh",
  storageBucket: "eftikad-kh.firebasestorage.app",
  messagingSenderId: "688601388193",
  appId: "1:688601388193:web:6bfabdd1d3eac93dea4ce0",
  measurementId: "G-FS1XNHS0X5",
});

const messaging = firebase.messaging();

// Handle Background Push Notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification?.title || '🎁 Afkar AlDar Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'A new custom box request has arrived in Concierge Admin.',
    icon: '/icon.png',
    badge: '/icon.png',
    data: {
      url: payload.data?.click_action || payload.data?.actionUrl || '/admin/notifications',
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/admin/notifications')
  );
});
