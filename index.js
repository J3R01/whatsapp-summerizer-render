const fs = require("fs");
const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => {
  const renderUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  console.log(`🌐 Web server running at ${renderUrl}`);
  console.log(`QR code will be available at ${renderUrl}/qr`);
});

let qrCodePath = null; // Variable to store the QR code file path

app.get('/qr', (req, res) => {
  if (qrCodePath && fs.existsSync(qrCodePath)) {
    res.sendFile(qrCodePath);
  } else {
    res.status(404).send("QR code not generated yet. Please wait and refresh.");
  }
});

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "/usr/bin/google-chrome-stable", // Explicitly set the Chromium path
  },
});

client.on("qr", async (qr) => {
  console.log("📲 Generating QR code for browser...");

  // Generate a PNG-based QR code and save it as a file
  qrCodePath = path.join(__dirname, "qr-code.png");
  await qrcode.toFile(qrCodePath, qr);

  const renderUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  console.log(`QR code is available at ${renderUrl}/qr`);
});

client.on("authenticated", () => {
  console.log("✅ Client authenticated successfully!");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication failed:", msg);
});

client.on("disconnected", (reason) => {
  console.error("❌ Client disconnected:", reason);
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