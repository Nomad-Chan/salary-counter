// service-worker.js

// Function to set up the counter state
const setupCounter = (salary, startTime) => {
  chrome.storage.local.set({
    'isRunning': true,
    'monthlySalary': salary,
    'startTime': startTime
  });
};

// Function to stop and reset the counter state
const stopCounter = () => {
  chrome.storage.local.set({
    'isRunning': false,
    'monthlySalary': 0,
    'startTime': null
  });
};

// Listener for messages from the popup (popup.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "START_COUNTER") {
    setupCounter(request.salary, request.startTime);
    sendResponse({ status: "STARTED" });
  } else if (request.command === "STOP_COUNTER") {
    stopCounter();
    sendResponse({ status: "STOPPED" });
  } else if (request.command === "GET_STATE") {
    // FIX: Provide a default object in chrome.storage.local.get to handle missing keys and prevent TypeError
    chrome.storage.local.get({
        'isRunning': false, 
        'monthlySalary': 0, 
        'startTime': null
    }, (data) => {
        sendResponse(data);
    });
    return true; // Indicates the response is asynchronous
  }
});

// Set initial state on first install
chrome.runtime.onInstalled.addListener(() => {
  // Ensure the state is stopped when the extension is first installed
  chrome.storage.local.get({ 'isRunning': false }, (data) => {
    if (!data.isRunning) {
      stopCounter(); 
    }
  });
});