(async () => {
  const SLEEP = 800;
  const scrollStep = window.innerHeight;
  const totalHeight = document.body.scrollHeight;
  const totalSteps = Math.ceil(totalHeight / scrollStep);
  const captures = [];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < totalSteps; i++) {
    window.scrollTo(0, i * scrollStep);
    await sleep(SLEEP);

    const dataUrl = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "capture" }, resolve);
    });

    captures.push(dataUrl);
  }

  window.scrollTo(0, 0);

  // Stitch all screenshots
  const canvas = document.createElement("canvas");
  const imgSample = new Image();
  imgSample.src = captures[0];
  await new Promise((r) => (imgSample.onload = r));

  const width = imgSample.width;
  const height = imgSample.height * captures.length;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  let y = 0;

  for (const imgSrc of captures) {
    const img = new Image();
    img.src = imgSrc;
    await new Promise((r) => (img.onload = r));
    ctx.drawImage(img, 0, y);
    y += img.height;
  }

  const finalImage = canvas.toDataURL("image/png");

  const base64Data = finalImage.split(",")[1];

  chrome.runtime.sendMessage({
    type: "SUMMARY_RESULT",
    data: "⏳ Summarizing...",
  });

  const response = await fetch("https://webdistrict021.com/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image: base64Data }),
  });

  const result = await response.json();

  function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  }

  const blob = dataURLtoBlob(finalImage);
  const blobUrl = URL.createObjectURL(blob);

  chrome.runtime.sendMessage({
    type: "SUMMARY_RESULT",
    data: result.summary,
  });

  // window.open(blobUrl, "_blank");
})();
