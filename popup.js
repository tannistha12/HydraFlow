// Get DOM elements
const waterDisplay = document.getElementById('waterAmount');
const addButton = document.getElementById('addWaterBtn');

// Function to update display AND save to storage
function updateDisplayAndSave(value) {
    waterDisplay.textContent = value;
    // SAVE: Use set() when button is clicked
    chrome.storage.local.set({ waterAmount: value });
}

// Function to load saved value
function loadSavedValue() {
    // LOAD: Use get() when popup opens
    chrome.storage.local.get(['waterAmount'], (result) => {
        const savedAmount = result.waterAmount || 0;
        waterDisplay.textContent = savedAmount;
    });
}

// Add 250ml when button is clicked
addButton.addEventListener('click', () => {
    // Get current value, add 250, save and display
    const currentValue = parseInt(waterDisplay.textContent) || 0;
    const newValue = currentValue + 250;
    updateDisplayAndSave(newValue);
});

// Load saved value when popup opens
loadSavedValue();