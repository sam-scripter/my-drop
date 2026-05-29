// firebase.service.js — Firebase Admin SDK setup
//
// The Admin SDK runs on the SERVER (not the app).
// It has full access to Firebase services — we use it to:
// 1. Send FCM push notifications to riders
// 2. (Future) verify Firebase auth tokens
//
// This is different from the Firebase SDK in the Flutter app,
// which runs on the CLIENT (the phone).

const admin = require('firebase-admin');

// Only initialize once — prevent duplicate app error on hot reload
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes from .env as a string with literal \n
      // We replace them with real newlines so the key is valid
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const messaging = admin.messaging();

/**
 * Sends a push notification to a single device via FCM
 *
 * @param {string} fcmToken - The device token stored on the User record
 * @param {string} title - Notification title e.g. "New delivery assigned"
 * @param {string} body - Notification body e.g. "Mary Wanjiku, Kilimani"
 * @param {object} data - Extra data sent with the notification
 *                        Available in the app even when notification is tapped
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
  if (!fcmToken) {
    console.warn('sendPushNotification: no FCM token provided, skipping');
    return;
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      // data must be string values only
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        // HIGH priority wakes the device even in doze mode
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('FCM notification sent:', response);
    return response;
  } catch (err) {
    // Don't throw — a failed notification should never break order flow
    console.error('FCM notification failed:', err.message);
  }
}

module.exports = { sendPushNotification };