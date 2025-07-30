window.stitchScreenshots = async function (images, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  let y = 0;

  for (const imgSrc of images) {
    const img = new Image();
    img.src = imgSrc;
    await new Promise((r) => (img.onload = r));
    ctx.drawImage(img, 0, 0);
    y += img.height;
  }

  const finalImage = canvas.toDataURL("image/png");
  window.open(finalImage, "_blank");
};
