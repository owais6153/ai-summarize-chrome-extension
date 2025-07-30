import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from "openai";
import { createWorker } from "tesseract.js";

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.post("/ocr", async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) return res.status(400).json({ error: "Image required" });

    const worker = await createWorker("eng");
    const { data } = await worker.recognize(Buffer.from(base64Image, "base64"));
    await worker.terminate();

    res.json({ text: "📌 Section: " + data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR failed" });
  }
});

app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "user",
        content: `You're an AI assistant helping users quickly understand webpages without reading them, act has you have viewed it. Summarize text from Webpage screenshot OCR, focusing on: - Key points and insights - Statistics or numerical data - Key facts or evidence - Any conclusions or recommendations,Use short, clear bullet points. Avoid fluff. Summarize the following text: from webpage\n\n${text}`,
      },
    ],
  });

  res.setHeader("Content-Type", "text/plain");
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) res.write(content);
  }
  res.end();
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);
