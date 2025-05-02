// bot.js
const { Client, GatewayIntentBits } = require("discord.js");
const botToken = "MTMwODY2NTYwMTY4OTkxNTQ1Mw.GtoHlF.8zo-F38Ze_l_6PCaGPGAnoDnKqgJh2ZziGxuZE"; // ใส่ Token ของบอท

// สร้าง Discord client ใหม่พร้อมตั้งค่า intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// เข้าสู่ระบบด้วย Token ของบอท
client.login(botToken);

module.exports = client;
