document.getElementById("captureBtn").addEventListener("click", async () => {
  const summaryDiv = document.getElementById("summary");
  summaryDiv.textContent = "⏳ Capturing, please wait...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["capture.js"],
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SUMMARY_RESULT") {
    const summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = message.data;

    // Scroll to bottom as new content arrives
    summaryDiv.scrollTop = summaryDiv.scrollHeight;
  }
});
