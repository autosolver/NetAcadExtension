console.log("background.js RUNNING");

chrome.runtime.onInstalled.addListener(function(details) {
    // Turn ON all features by default.
    setStorageValue("IS_POWER_ON", true);
    setStorageValue("IS_SELECT_ON", true);
});

function setStorageValue(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, function (e) {
      resolve(value);
    });
  });
}
