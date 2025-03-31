// index.js - WhatsApp summarizer bot with Gemini via OpenRouter (Render-ready)
const fs = require("fs");
const qrcode = require("qrcode"); // Ensure this is the correct package for PNG QR codes
const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");
const express = require("express");
const fetch = require("node-fetch");
const qrcodeImage = require("qrcode");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => console.log("🌐 Web server running on port 3000"));

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  console.log("📲 Scan this QR code in the browser:");

  // Generate a PNG-based QR code
  const qrCodeImage = await qrcode.toDataURL(qr);

  // Serve the QR code as an image
  app.get('/qr', (req, res) => {
    res.send(`
      <html>
        <body>
          <h1>Scan the QR Code</h1>
          <img src="${qrCodeImage}" alt="QR Code" />
        </body>
      </html>
    `);
  });

  console.log('QR code is available at http://localhost:3000/qr');
});

client.on("ready", async () => {
  console.log("✅ WhatsApp client is ready.");

  const CHAT_NAME = "Tech Stocks";
  const chats = await client.getChats();
  const targetChat = chats.find((c) => c.name === CHAT_NAME);
  if (!targetChat) return console.log("❌ Chat not found");

  const messages = await targetChat.fetchMessages({ limit: 50 });
  const messageBodies = messages.map((m) => m.body).filter(Boolean);

  if (messageBodies.length === 0) return console.log("⚠️ No messages to summarize");

  const summary = await summarizeWithGemini(messageBodies.join("\n"));

  // Post to Discord webhook
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `📈 Summary for *${CHAT_NAME}*:\n\n${summary}` })
  });
});

client.initialize();

async function summarizeWithGemini(text) {
  const prompt = `You're analyzing a WhatsApp group chat focused on tech stocks. 
From the messages below, extract up to 20 concise bullet points summarizing key stock mentions, catalysts, trends, or warnings.
Avoid small talk. End with: "Market Sentiment: X% Bullish / Y% Bearish".

Messages:\n\n${text}`;

  try {
    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    return res.data.choices[0].message.content;
  } catch (err) {
    const fallbackError = (err.response && err.response.data) ? JSON.stringify(err.response.data) : err.message;
    console.error("❌ Gemini summarization failed:", fallbackError);
    return "Summary failed.";
  }
}
