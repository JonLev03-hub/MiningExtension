console.log("Background Running");
// Function to handle the message received in the background script
function handleMessage(request, sender, sendResponse) {
  console.log("Message received in background script:", request.message);
}

// Add a listener for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener(handleMessage);
