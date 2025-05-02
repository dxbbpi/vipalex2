const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const cors = require('cors');
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

const webhookURL = "https://discord.com/api/webhooks/1367500986007945367/HPBUY-hfMex_cn1Q3r3U8jiREDfrpIM3gJkyVs9nlLSu2cGRZYMx9yfjd9Lu4H0ULaia"; // ใส่ URL ของ Webhook
const botToken = "MTMwODY2NTYwMTY4OTkxNTQ1Mw.GtoHlF.8zo-F38Ze_l_6PCaGPGAnoDnKqgJh2ZziGxuZE";  // ใส่ Token ของบอท

// กำหนด intents ให้กับ Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // ใช้สำหรับข้อมูลเซิร์ฟเวอร์
    GatewayIntentBits.GuildMembers, // ใช้สำหรับข้อมูลสมาชิก
    GatewayIntentBits.GuildMessages, // ใช้สำหรับข้อความในเซิร์ฟเวอร์
    GatewayIntentBits.MessageContent, // ใช้สำหรับการเข้าถึงข้อความ
  ]
});

client.login(botToken);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", upload.single("image"), async (req, res) => {
    const filePath = req.file.path;
    const discordName = req.body.discordName;

    if (!discordName || isNaN(discordName)) {
        return res.status(400).json({ success: false, message: "กรุณาใช้ Discord ID แทนชื่อ Discord" });
    }

    try {
        // ใช้ Tesseract เพื่ออ่านข้อความจากภาพ
        const { data: { text } } = await Tesseract.recognize(filePath, "tha+eng");
        let cleanedText = text.replace(/[^a-zA-Z0-9ก-๙\s]/g, '').toLowerCase();
        cleanedText = cleanedText.replace("สําเร็จ", "สำเร็จ");

        const requiredKeywords = [
            "โอน", "บาท", "เวลา", "บัญชี", "scb", "กรุงไทย", "kbank", "transaction", "จำนวนเงิน", "เงิน", "สำเร็จ"
        ];

        const matched = requiredKeywords.filter(keyword => cleanedText.includes(keyword));

        if (matched.length >= 3) {
            // หลังจากตรวจสอบสลิปสำเร็จ ส่งภาพไปยัง Discord Webhook
            const formData = new FormData();
            formData.append("payload_json", JSON.stringify({
                username: "VIP BOT",
                embeds: [{
                    title: "✅ ตรวจสอบสลิปผ่านแล้ว",
                    color: 65280,
                    description: `ตรวจสอบสำเร็จ: ${matched.join(", ")}`,
                    fields: [{
                        name: "ชื่อ Discord",
                        value: `<@${discordName}>`
                    }],
                    timestamp: new Date().toISOString()
                }]
            }));
            formData.append('file', fs.createReadStream(filePath)); 

            const resp = await axios.post(webhookURL, formData, {
                headers: formData.getHeaders()
            });

            // ส่งข้อมูลไปยัง Discord
            const guild = client.guilds.cache.get("997205757009330216"); // ใส่ ID ของเซิร์ฟเวอร์
            if (!guild) {
                return res.status(400).json({ success: false, message: "ไม่พบเซิร์ฟเวอร์" });
            }

            // ใช้ fetch เพื่อดึงข้อมูลสมาชิก
            const member = await guild.members.fetch(discordName); 

            if (member) {
                // ถ้าเจอผู้ใช้, แอดยศให้
                await member.roles.add("1266072275292262503"); // ใส่ ID ของยศที่ต้องการให้
                res.json({ success: true, message: "ส่งข้อมูลเข้า Discord แล้ว และแอดยศให้สมาชิก" });
            } else {
                res.status(404).json({ success: false, message: "ไม่พบสมาชิกในเซิร์ฟเวอร์" });
            }
        } else {
            res.status(400).json({ success: false, message: "ตรวจไม่พบคำสำคัญในสลิป" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการประมวลผลสลิป" });
    } finally {
        fs.unlinkSync(filePath); // ลบไฟล์ที่อัปโหลดหลังจากใช้แล้ว
    }
});

app.listen(PORT, () => {
    console.log(`Server started on https://vipalex.onrender.com:${PORT}`);
});
