// The code below closes all other popup windows when a new one is opened

// Function to send a message to all other content scripts
function sendMessageToOtherContentScripts(m) {
  chrome.runtime.sendMessage({ message: m });
}

// Send a message to all other content scripts
sendMessageToOtherContentScripts("New Window Opened");

// Function to handle the message received in the background script
function handleMessage(request, sender, sendResponse) {
  window.close();
}

// Add a listener for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener(handleMessage);

// this is the actial logic for the html page
