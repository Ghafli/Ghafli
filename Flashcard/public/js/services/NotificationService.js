import { 
    getMessaging, 
    getToken, 
    onMessage 
} from 'firebase/messaging';
import { db, auth } from '../../config/firebase';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    arrayUnion, 
    Timestamp 
} from 'firebase/firestore';

class NotificationService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.messaging = getMessaging();
        this.userNotificationsRef = collection(db, 'user_notifications');
        this.initializeMessaging();
    }

    /**
     * Initialize Firebase Cloud Messaging
     */
    async initializeMessaging() {
        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // Get FCM token
                const token = await getToken(this.messaging, {
                    vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key
                });

                // Save token to user's document
                await this.saveUserToken(token);

                // Listen for messages when app is in foreground
                onMessage(this.messaging, (payload) => {
                    this.handleForegroundMessage(payload);
                });
            }
        } catch (error) {
            console.error('Error initializing messaging:', error);
        }
    }

    /**
     * Save user's FCM token
     * @param {string} token - FCM token
     */
    async saveUserToken(token) {
        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
                notificationSettings: {
                    enabled: true,
                    types: {
                        dueCards: true,
                        achievements: true,
                        challenges: true,
                        updates: true
                    }
                }
            });
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    /**
     * Handle foreground messages
     * @param {Object} payload - Message payload
     */
    handleForegroundMessage(payload) {
        // Create and show notification
        const notification = new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
            data: payload.data
        });

        // Handle notification click
        notification.onclick = () => {
            if (payload.data.url) {
                window.open(payload.data.url, '_blank');
            }
        };

        // Store notification in history
        this.storeNotification(payload);
    }

    /**
     * Store notification in user's history
     * @param {Object} notification - Notification data
     */
    async storeNotification(notification) {
        try {
            const userNotificationsRef = doc(this.userNotificationsRef, this.currentUser.uid);
            await updateDoc(userNotificationsRef, {
                notifications: arrayUnion({
                    id: Date.now().toString(),
                    title: notification.notification.title,
                    body: notification.notification.body,
                    timestamp: Timestamp.now(),
                    read: false,
                    data: notification.data
                })
            });
        } catch (error) {
            console.error('Error storing notification:', error);
        }
    }

    /**
     * Get user's notification settings
     * @returns {Promise<Object>} Notification settings
     */
    async getNotificationSettings() {
        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            return userDoc.data()?.notificationSettings || {
                enabled: true,
                types: {
                    dueCards: true,
                    achievements: true,
                    challenges: true,
                    updates: true
                }
            };
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            throw error;
        }
    }

    /**
     * Update notification settings
     * @param {Object} settings - New notification settings
     */
    async updateNotificationSettings(settings) {
        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userRef, {
                notificationSettings: settings
            });
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }

    /**
     * Get user's notification history
     * @param {number} limit - Number of notifications to retrieve
     * @returns {Promise<Array>} Notification history
     */
    async getNotificationHistory(limit = 50) {
        try {
            const userNotificationsRef = doc(this.userNotificationsRef, this.currentUser.uid);
            const notificationsDoc = await getDoc(userNotificationsRef);
            
            if (notificationsDoc.exists()) {
                const notifications = notificationsDoc.data().notifications || [];
                return notifications
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Error fetching notification history:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     */
    async markAsRead(notificationId) {
        try {
            const userNotificationsRef = doc(this.userNotificationsRef, this.currentUser.uid);
            const notificationsDoc = await getDoc(userNotificationsRef);
            
            if (notificationsDoc.exists()) {
                const notifications = notificationsDoc.data().notifications;
                const updatedNotifications = notifications.map(notification => {
                    if (notification.id === notificationId) {
                        return { ...notification, read: true };
                    }
                    return notification;
                });

                await updateDoc(userNotificationsRef, {
                    notifications: updatedNotifications
                });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Clear notification history
     */
    async clearHistory() {
        try {
            const userNotificationsRef = doc(this.userNotificationsRef, this.currentUser.uid);
            await updateDoc(userNotificationsRef, {
                notifications: []
            });
        } catch (error) {
            console.error('Error clearing notification history:', error);
            throw error;
        }
    }
}

export default NotificationService;
