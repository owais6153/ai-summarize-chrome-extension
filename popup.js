const captureBtn = document.getElementById("captureBtn");
const summaryDiv = document.getElementById("summary");

captureBtn.addEventListener("click", async () => {
  summaryDiv.textContent = "⏳ Capturing, please wait...";
  captureBtn.disabled = true;
  captureBtn.textContent = "Summarizing...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["capture.js"],
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SUMMARY_RESULT") {
    summaryDiv.innerHTML = message.data;
    summaryDiv.scrollTop = summaryDiv.scrollHeight;
  }

  // ✅ Re-enable on done or error
  if (message.type === "SUMMARY_DONE" || message.type === "SUMMARY_ERROR") {
    if (message.type === "SUMMARY_ERROR") summaryDiv.innerHTML = message.data;

    captureBtn.disabled = false;
    captureBtn.textContent = "Summarize Page";
  }
});
