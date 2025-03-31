// index.js - WhatsApp summarizer bot with Gemini via OpenRouter (Render-ready)
const fs = require("fs");
const qrcode = require("qrcode"); // Ensure this is the correct package for PNG QR codes
const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");
const express = require("express");
const fetch = require("node-fetch");
const qrcodeImage = require("qrcode");
const path = require("path");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => {
  const renderUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  console.log(`🌐 Web server running at ${renderUrl}`);onsole.log(`QR code will be available at ${renderUrl}/qr`);
});});

client.on("qr", async (qr) => {
  console.log("📲 Generating QR code for browser...");  console.log("📲 Generating QR code for browser...");

  // Generate a PNG-based QR code and save it as a file
  const qrCodePath = path.join(__dirname, "qr-code.png");  const qrCodeImage = await qrcode.toDataURL(qr);
  await qrcode.toFile(qrCodePath, qr);
ge
  // Serve the QR code as a static file', (req, res) => {
  app.use('/qr', express.static(qrCodePath));(`

  const renderUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";<title>Scan QR Code</title></head>
  console.log(`QR code is available at ${renderUrl}/qr`);
});
src="${qrCodeImage}" alt="QR Code" />
client.on("ready", async () => {y>
  console.log("✅ WhatsApp client is ready.");/html>
);
  const CHAT_NAME = "Tech Stocks";  });
  const chats = await client.getChats();
  const targetChat = chats.find((c) => c.name === CHAT_NAME);ttp://localhost:3000";
  if (!targetChat) return console.log("❌ Chat not found");onsole.log(`QR code is available at ${renderUrl}/qr`);
});
  const messages = await targetChat.fetchMessages({ limit: 50 });
  const messageBodies = messages.map((m) => m.body).filter(Boolean);
  console.log("✅ WhatsApp client is ready.");
  if (messageBodies.length === 0) return console.log("⚠️ No messages to summarize");

  const summary = await summarizeWithGemini(messageBodies.join("\n"));
E);
  // Post to Discord webhook  if (!targetChat) return console.log("❌ Chat not found");
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },  const messageBodies = messages.map((m) => m.body).filter(Boolean);
    body: JSON.stringify({ content: `📈 Summary for *${CHAT_NAME}*:\n\n${summary}` })
  });  if (messageBodies.length === 0) return console.log("⚠️ No messages to summarize");
});
  const summary = await summarizeWithGemini(messageBodies.join("\n"));
client.initialize();

async function summarizeWithGemini(text) {ss.env.DISCORD_WEBHOOK_URL, {
  const prompt = `You're analyzing a WhatsApp group chat focused on tech stocks. 
From the messages below, extract up to 20 concise bullet points summarizing key stock mentions, catalysts, trends, or warnings.
Avoid small talk. End with: "Market Sentiment: X% Bullish / Y% Bearish".ody: JSON.stringify({ content: `📈 Summary for *${CHAT_NAME}*:\n\n${summary}` })
);
Messages:\n\n${text}`;});

  try {client.initialize();
    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [{ role: "user", content: prompt }]
    }, {ing key stock mentions, catalysts, trends, or warnings.
      headers: {Avoid small talk. End with: "Market Sentiment: X% Bullish / Y% Bearish".
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"Messages:\n\n${text}`;
      }
    });
.ai/api/v1/chat/completions", {
    return res.data.choices[0].message.content;,
  } catch (err) {ssages: [{ role: "user", content: prompt }]
    const fallbackError = (err.response && err.response.data) ? JSON.stringify(err.response.data) : err.message;
    console.error("❌ Gemini summarization failed:", fallbackError);
    return "Summary failed.";.env.OPENROUTER_API_KEY}`,
  } "Content-Type": "application/json"
}
