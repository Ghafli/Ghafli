import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './config';

const messaging = getMessaging(app);

export const messagingService = {
    // Request permission and get FCM token
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // Get FCM token
                const token = await getToken(messaging, {
                    vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key
                });
                return token;
            }
            throw new Error('Notification permission denied');
        } catch (error) {
            throw new Error(`Failed to get notification permission: ${error.message}`);
        }
    },

    // Listen for foreground messages
    onMessageReceived(callback) {
        return onMessage(messaging, (payload) => {
            callback(payload);
        });
    }
};

// Service worker registration for background messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}
