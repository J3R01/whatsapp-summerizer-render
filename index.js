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
}); // Ensure client is defined here

client.on("qr", async (qr) => {
  console.log("📲 Generating QR code for browser...");

  // Generate a PNG-based QR code and save it as a file
  qrCodePath = path.join(__dirname, "qr-code.png");
  await qrcode.toFile(qrCodePath, qr);

  const renderUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  console.log(`QR code is available at ${renderUrl}/qr`);
});
 {
client.on("ready", async () => {fully!");
  console.log("✅ WhatsApp client is ready.");});

  const CHAT_NAME = "Tech Stocks";
  console.error("❌ Authentication failed:", msg);
});E);
  if (!targetChat) return console.log("❌ Chat not found");

  console.error("❌ Client disconnected:", reason);
  const messageBodies = messages.map((m) => m.body).filter(Boolean);
  if (messageBodies.length === 0) return console.log("⚠️ No messages to summarize");

  const summary = await summarizeWithGemini(messageBodies.join("\n"));  console.log("✅ WhatsApp client is ready.");

  // Post to Discord webhook
  await fetch(process.env.DISCORD_WEBHOOK_URL, {it client.getChats();
    method: "POST",AT_NAME);
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `📈 Summary for *${CHAT_NAME}*:\n\n${summary}` })
  });onst messages = await targetChat.fetchMessages({ limit: 50 });
  const messageBodies = messages.map((m) => m.body).filter(Boolean);});
  if (messageBodies.length === 0) return console.log("⚠️ No messages to summarize");
client.initialize();
  const summary = await summarizeWithGemini(messageBodies.join("\n"));

  // Post to Discord webhook
From the messages below, extract up to 20 concise bullet points summarizing key stock mentions, catalysts, trends, or warnings.
Avoid small talk. End with: "Market Sentiment: X% Bullish / Y% Bearish".
Messages:\n\n${text}`;    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `📈 Summary for *${CHAT_NAME}*:\n\n${summary}` })
  });
    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [{ role: "user", content: prompt }]nitialize();
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,App group chat focused on tech stocks. 
        "Content-Type": "application/json"e messages below, extract up to 20 concise bullet points summarizing key stock mentions, catalysts, trends, or warnings.
      }mall talk. End with: "Market Sentiment: X% Bullish / Y% Bearish".
    });
ta.choices[0].message.content;
  } catch (err) {
    const fallbackError = (err.response && err.response.data) ? JSON.stringify(err.response.data) : err.message;/completions", {
    console.error("❌ Gemini summarization failed:", fallbackError);.5-pro-exp-03-25:free",
      messages: [{ role: "user", content: prompt }] return "Summary failed.";
  }   }, {
}      headers: {












}  }    return "Summary failed.";    console.error("❌ Gemini summarization failed:", fallbackError);    const fallbackError = (err.response && err.response.data) ? JSON.stringify(err.response.data) : err.message;  } catch (err) {    return res.data.choices[0].message.content;    });      }        "Content-Type": "application/json"        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,