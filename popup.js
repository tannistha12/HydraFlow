// Get DOM elements
const waterDisplay = document.getElementById('waterAmount');
const goalDisplay = document.getElementById('goal');
const remainingDisplay = document.getElementById('remaining');
const progressDisplay = document.getElementById('progress');
const progressBarFill = document.getElementById('progressBarFill');
const progressPercent = document.getElementById('progressPercent');
const addButton = document.getElementById('addWaterBtn');
const resetButton = document.getElementById('resetBtn');

// Constants
const DAILY_GOAL = 3000;

// Function to update ALL displays
function updateAllDisplays(consumed) {
    console.log("Updating display with:", consumed);

    // Update large number display
    waterDisplay.textContent = consumed;

    // Calculate remaining - NEVER go below 0
    let remaining = DAILY_GOAL - consumed;
    if (remaining < 0) {
        remaining = 0;
    }
    remainingDisplay.textContent = remaining;

    // Calculate progress percentage - CAP at 100%
    let progress = (consumed / DAILY_GOAL) * 100;
    let progressRounded = Math.floor(progress);
    if (progressRounded > 100) {
        progressRounded = 100;
    }

    // Update progress text
    progressDisplay.textContent = progressRounded;
    progressPercent.textContent = `${progressRounded}% Complete`;

    // Update progress bar width (cap at 100%)
    let barWidth = Math.min(progress, 100);
    progressBarFill.style.width = `${barWidth}%`;

    // Add text inside progress bar if wide enough
    if (barWidth > 15) {
        progressBarFill.textContent = `${progressRounded}%`;
    } else {
        progressBarFill.textContent = '';
    }

    // Change progress bar color based on progress
    if (progress >= 100) {
        progressBarFill.style.background = "linear-gradient(90deg, #2196F3, #00BCD4)";
    } else if (progress >= 50) {
        progressBarFill.style.background = "linear-gradient(90deg, #4CAF50, #8BC34A)";
    } else {
        progressBarFill.style.background = "linear-gradient(90deg, #FF9800, #FFC107)";
    }

    // show goal met message
    const goalMetMessage = document.getElementById('goalMetMessage');
    if (consumed >= DAILY_GOAL) {
        goalMetMessage.style.display = 'block';
    } else {
        goalMetMessage.style.display = 'none';
    }
}

// Function to save to storage
function saveWaterAmount(value) {
    console.log("Saving:", value);
    chrome.storage.local.set({ waterAmount: value });
}

// Load saved value
function loadSavedValue() {
    chrome.storage.local.get(['waterAmount'], (result) => {
        const savedAmount = result.waterAmount || 0;
        console.log("Loaded:", savedAmount);
        updateAllDisplays(savedAmount);
    });
}

// Add 250ml when button clicked
addButton.addEventListener('click', () => {
    console.log("Button clicked!");

    // Get current value from the display
    const currentValue = parseInt(waterDisplay.textContent) || 0;
    console.log("Current value:", currentValue);

    let newValue = currentValue + 250;
    console.log("New value:", newValue);

    // Check if this will exceed the goal
    if (newValue > DAILY_GOAL) {
        const extra = newValue - DAILY_GOAL;
        const userConfirmed = confirm(
            `You're about to go ${extra}ml over your daily goal of ${DAILY_GOAL}ml.\n\nContinue anyway?`
        );

        console.log("User confirmed:", userConfirmed);

        if (userConfirmed) {
            // Update display with the NEW value
            updateAllDisplays(newValue);
            // Save to storage
            saveWaterAmount(newValue);
            console.log("Updated to:", newValue);
        } else {
            console.log("Update cancelled");
        }
    } else {
        // Within goal - just update normally
        updateAllDisplays(newValue);
        saveWaterAmount(newValue);
        console.log("Updated to:", newValue);
    }
});

// Reset with confirmation
resetButton.addEventListener('click', () => {
    if (confirm("Reset today's water intake? This cannot be undone.")) {
        updateAllDisplays(0);
        saveWaterAmount(0);
        console.log("Reset to 0");
    }
});

// Test notification button
const testNotificationBtn = document.getElementById('testNotificationBtn');
if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'testNotification' }, (response) => {
            if (response && response.success) {
                alert('Test notification sent! Check your system notifications.');
            }
        });
    });
}
// Load saved value when popup opens
loadSavedValue();