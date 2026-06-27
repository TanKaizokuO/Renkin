chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return;

  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['styles.css']
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Content script might need a moment to set up listener
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_AUDIT' });
    }, 50);
  } catch (err) {
    console.error("Failed to inject script: ", err);
  }
});
