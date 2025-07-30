(async () => {
  // const ENDPOINT = "https://webdistrict021.com/";
  const ENDPOINT = "http://localhost:3000/";
  const scrollStep = window.innerHeight;
  const totalHeight = document.body.scrollHeight;
  const totalSteps = Math.ceil(totalHeight / scrollStep);
  let allText = "";

  for (let i = 0; i < totalSteps; i++) {
    window.scrollTo(0, i * scrollStep);

    const dataUrl = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "capture" }, resolve);
    });

    const base64 = dataUrl.split(",")[1];
    const res = await fetch(ENDPOINT + "ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image: base64 }),
    });

    const result = await res.json();
    allText += result.text + "\n";
  }

  window.scrollTo(0, 0);

  chrome.runtime.sendMessage({
    type: "SUMMARY_RESULT",
    data: "⏳ Summarizing...",
  });

  const response = await fetch(ENDPOINT + "summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: allText }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;

    chrome.runtime.sendMessage({
      type: "SUMMARY_RESULT",
      data: fullText
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>"),
    });
  }
})();
