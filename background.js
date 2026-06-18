// Background Service Worker
console.log("🚀 Background service worker started at:", new Date().toLocaleTimeString());

// CREATE ALARM IMMEDIATELY
function createAlarm() {
    console.log("🔄 Creating alarm...");

    chrome.alarms.clear('waterReminder', () => {
        console.log("✅ Cleared existing alarm");

        chrome.alarms.create('waterReminder', {
            delayInMinutes: 0.5,
            periodInMinutes: 5
        });

        console.log("⏰ Alarm created!");
        console.log("   - First notification in: 30 seconds");
        console.log("   - Then every: 5 minutes");

        chrome.alarms.get('waterReminder', (alarm) => {
            if (alarm) {
                console.log("✅ Alarm verified!");
                console.log("   Scheduled for:", new Date(alarm.scheduledTime).toLocaleTimeString());
            } else {
                console.error("❌ Alarm creation failed!");
            }
        });
    });
}

createAlarm();

chrome.runtime.onInstalled.addListener(() => {
    console.log("📦 Extension installed/updated at:", new Date().toLocaleTimeString());

    chrome.notifications.getPermissionLevel((level) => {
        console.log("🔔 Notification permission level:", level);

        if (level !== 'granted') {
            console.log("⚠️ Requesting notification permission...");
            chrome.notifications.requestPermission((granted) => {
                console.log("📨 Permission granted:", granted);
            });
        }
    });
});

chrome.runtime.onStartup.addListener(() => {
    console.log("🖥️ Browser started at:", new Date().toLocaleTimeString());
    createAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("⏰ ALARM FIRED at:", new Date().toLocaleTimeString());
    console.log("   - Alarm name:", alarm.name);

    if (alarm.name === "waterReminder") {
        console.log("💧 Water reminder alarm fired!");
        sendNotification();
    }
});

// ✅ FUNCTION WITH MULTIPLE ICON FALLBACKS
function sendNotification() {
    console.log("📨 Attempting to send notification at:", new Date().toLocaleTimeString());

    chrome.storage.local.get(['waterAmount', 'goal'], (result) => {
        const consumed = result.waterAmount || 0;
        const goal = result.goal || 3000;
        const remaining = Math.max(goal - consumed, 0);
        const progress = Math.floor((consumed / goal) * 100);

        console.log("📊 Current stats:", { consumed, goal, remaining, progress });

        // ✅ TRY MULTIPLE ICON SOURCES
        // First try: local icon
        let iconUrl = chrome.runtime.getURL('icons/icon128.png');

        // Second try: if that fails, use web icon
        // We'll use a simple approach - just try both

        console.log("📸 Using icon URL:", iconUrl);

        const notificationOptions = {
            type: "basic",
            iconUrl: iconUrl,
            title: "💧 HydraFlow - Time to Drink Water!",
            message: `You've had ${consumed}ml (${progress}% of goal). ${remaining}ml remaining!`,
            priority: 2,
            buttons: [
                { title: "💧 +250ml" },
                { title: "🔄 Reset" }
            ],
            requireInteraction: true,
            silent: false
        };

        console.log("📨 Creating notification with options:", JSON.stringify(notificationOptions, null, 2));

        // Try to create notification
        chrome.notifications.create('waterReminder', notificationOptions, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Notification error with local icon:", chrome.runtime.lastError);

                // ✅ RETRY WITH WEB ICON
                console.log("🔄 Retrying with web icon...");
                const retryOptions = {
                    type: "basic",
                    iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png",
                    title: "💧 HydraFlow - Time to Drink Water!",
                    message: `You've had ${consumed}ml (${progress}% of goal). ${remaining}ml remaining!`,
                    priority: 2,
                    buttons: [
                        { title: "💧 +250ml" },
                        { title: "🔄 Reset" }
                    ],
                    requireInteraction: true,
                    silent: false
                };

                chrome.notifications.create('waterReminder', retryOptions, (retryId) => {
                    if (chrome.runtime.lastError) {
                        console.error("❌ Notification error with web icon:", chrome.runtime.lastError);

                        // ✅ FINAL RETRY - NO BUTTONS
                        console.log("🔄 Final retry without buttons...");
                        const finalOptions = {
                            type: "basic",
                            iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png",
                            title: "💧 HydraFlow - Time to Drink Water!",
                            message: `You've had ${consumed}ml (${progress}% of goal). ${remaining}ml remaining!`,
                            priority: 2,
                            requireInteraction: true,
                            silent: false
                        };

                        chrome.notifications.create('waterReminder', finalOptions, (finalId) => {
                            if (chrome.runtime.lastError) {
                                console.error("❌ All notification attempts failed:", chrome.runtime.lastError);
                            } else {
                                console.log("✅ Notification sent (without buttons)! ID:", finalId);
                            }
                        });
                    } else {
                        console.log("✅ Notification sent with web icon! ID:", retryId);
                    }
                });
            } else {
                console.log("✅ Notification sent with local icon! ID:", notificationId);
                console.log("📨 Check your system notifications now!");
            }
        });
    });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    console.log("🔘 Notification button clicked:", notificationId, "Button:", buttonIndex);

    if (notificationId === 'waterReminder') {
        if (buttonIndex === 0) {
            chrome.storage.local.get(['waterAmount'], (result) => {
                const current = result.waterAmount || 0;
                const newAmount = current + 250;
                chrome.storage.local.set({ waterAmount: newAmount });
                console.log(`✅ Added 250ml. New total: ${newAmount}ml`);

                chrome.notifications.create('quickAdd', {
                    type: "basic",
                    iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png",
                    title: "✅ Water Logged!",
                    message: `Added 250ml. Total: ${newAmount}ml`,
                    priority: 1
                });
            });
        } else if (buttonIndex === 1) {
            chrome.storage.local.set({ waterAmount: 0 });
            console.log('🔄 Reset water intake');

            chrome.notifications.create('quickReset', {
                type: "basic",
                iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png",
                title: "🔄 Reset Complete",
                message: "Water intake has been reset to 0ml",
                priority: 1
            });
        }
    }
});

chrome.notifications.onClicked.addListener((notificationId) => {
    console.log("👆 Notification clicked:", notificationId);
    chrome.action.openPopup();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📨 Message received from popup:", message);

    if (message.action === 'updateInterval') {
        console.log("⏰ Updating interval...");
        createAlarm();
        sendResponse({ success: true });
    } else if (message.action === 'testNotification') {
        console.log("🧪 Test notification requested");
        sendNotification();
        sendResponse({ success: true });
    } else if (message.action === 'checkAlarm') {
        chrome.alarms.get('waterReminder', (alarm) => {
            if (alarm) {
                const seconds = Math.floor((alarm.scheduledTime - Date.now()) / 1000);
                sendResponse({
                    exists: true,
                    secondsUntilFire: seconds,
                    period: alarm.periodInMinutes
                });
            } else {
                sendResponse({ exists: false });
            }
        });
        return true;
    }
});

console.log("✅ Background service worker fully initialized");
console.log(`🕐 Current time: ${new Date().toLocaleTimeString()}`);