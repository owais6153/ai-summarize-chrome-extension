const captureBtn = document.getElementById("captureBtn");
const summaryDiv = document.getElementById("summary");
const askQuestions = document.getElementById("ask-questions");
const chatMessages = document.getElementById("chat-messages");

function diableCaptureButton() {
  captureBtn.disabled = true;
  captureBtn.textContent = "Summarizing...";
}
function enableCaptureButton() {
  captureBtn.disabled = false;
}
function hideCaptureButton() {
  captureBtn.style.display = "none";
}
function displayCaptureButton() {
  captureBtn.style.display = "block";
  captureBtn.textContent = "Summarize Page";
}

function displayAskQuestions() {
  askQuestions.style.display = "block";
}

function hideAskQuestions() {
  askQuestions.style.display = "none";
}

function resetChatMessages() {
  chatMessages.innerHTML = "";
}

captureBtn.addEventListener("click", async () => {
  summaryDiv.textContent = "⏳ Capturing, please wait...";
  diableCaptureButton();
  hideAskQuestions();
  resetChatMessages();

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

  if (message.type === "SUMMARY_DONE") {
    hideCaptureButton();
    displayAskQuestions();
  }

  if (message.type === "SUMMARY_ERROR") {
    summaryDiv.innerHTML = message.data;

    enableCaptureButton();
    displayCaptureButton();
    hideAskQuestions();
  }
});
