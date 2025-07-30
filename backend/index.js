import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from "openai";

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.post("/summarize", async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image)
      return res.status(400).json({ error: "Image is required." });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You're an AI assistant helping users quickly understand long research papers, blogs, and articles without reading them fully. Summarize the visible text and the screenshot together, focusing on: - Key points and insights - Statistics or numerical data - Key facts or evidence - Any conclusions or recommendations,Use short, clear bullet points. Avoid fluff.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const summary = response.choices[0].message.content;
    console.log(summary);
    res.json({
      summary: summary
        ?.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);
