document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  const toggle = document.getElementById("toggle-subtitle");

  chrome.storage.local.get(["toggleSubtitle"], async (result) => {
    const isChecked = result.toggleSubtitle ?? false;
    toggle.checked = isChecked;

    if (isChecked) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.dispatchEvent(new Event("START_SUBTITLE")),
      });
    }
  });

  toggle.addEventListener("change", async () => {
    const isChecked = toggle.checked;
    chrome.storage.local.set({ toggleSubtitle: isChecked });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) return;

    if (isChecked) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.dispatchEvent(new Event("START_SUBTITLE")),
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.dispatchEvent(new Event("STOP_SUBTITLE")),
      });
    }
  });

  async function triggerSubtitleEvent(isChecked) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) return;

    if (isChecked) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.dispatchEvent(new Event("START_SUBTITLE")),
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.dispatchEvent(new Event("STOP_SUBTITLE")),
      });
    }
  }
});
