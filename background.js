chrome.browserAction.onClicked.addListener(function () {
  console.log("Created Popup");
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 300,
    height: 200,
  });
});
