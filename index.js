const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Discord OAuth2 Configuration
const CLIENT_ID = '1367595537049845850';
const CLIENT_SECRET = '-00iN34UEG9AusqVwwzdJmQ0G2TD5Hrz';
const REDIRECT_URI = 'https://vipalex2.onrender.com/callback';

app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรกที่แสดงปุ่มล็อกอิน Discord
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Callback หลังจากที่ Discord ส่งข้อมูลกลับมาหลังจากล็อกอิน
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('ไม่พบโค้ดจาก Discord');

  try {
    // ส่ง POST ไปที่ Discord OAuth2 Token Endpoint
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // ดึงข้อมูลผู้ใช้จาก Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userResponse.data;

    // ส่งข้อมูลผู้ใช้ไปยังหน้า /home
    res.redirect(`/home?username=${encodeURIComponent(user.username)}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send('เกิดข้อผิดพลาดในการล็อกอิน');
  }
});

// หน้า home แสดงข้อมูลผู้ใช้ที่ล็อกอิน
app.get('/home', (req, res) => {
  const username = req.query.username;
  if (!username) return res.send('ไม่พบข้อมูลผู้ใช้');
  
  // ส่งข้อมูลผู้ใช้ไปที่หน้า /home.html
  res.sendFile(path.join(__dirname, 'home.html'));
});

// เริ่มเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
