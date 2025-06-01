const tabStatus = {};

chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) return;

  const tabId = tab.id;
  const isRunning = tabStatus[tabId] || false;

  chrome.scripting.executeScript({
    target: { tabId },
    function: (running) => {
      if (!running) {
        window.dispatchEvent(new Event("START_SUBTITLE"));
      } else {
        window.dispatchEvent(new Event("STOP_SUBTITLE"));
      }
      window.__SUBTITLE_RUNNING__ = !running;
    },
    args: [isRunning],
  });

  tabStatus[tabId] = !isRunning;
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ toggleSubtitle: false });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (tabStatus[tabId]) {
      chrome.scripting.executeScript({
        target: { tabId },
        function: () => {
          window.dispatchEvent(new Event("START_SUBTITLE"));
          window.__SUBTITLE_RUNNING__ = true;
        },
      });
    }
  }
});
