const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = '1367595537049845850';
const CLIENT_SECRET = '-00iN34UEG9AusqVwwzdJmQ0G2TD5Hrz';
const REDIRECT_URI = 'https://vipalex2.onrender.com/callback';

// เสิร์ฟไฟล์ static จากโฟลเดอร์ 'public'
app.use(express.static('public'));

// หน้าแรกที่แสดงปุ่มให้ล็อกอินด้วย Discord
app.get('/', (req, res) => {
  res.send(`
    <h1>เข้าสู่ระบบด้วย Discord</h1>
    <a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify">
      <button>ล็อกอินด้วย Discord</button>
    </a>
  `);
});

// เส้นทาง callback ที่ Discord ส่งกลับมาหลังจาก login
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('ไม่พบโค้ดจาก Discord');

  try {
    // แลก code เป็น access token
    const tokenResponse = await axios.post('https://discord.com/oauth2/authorize?client_id=1367595537049845850&response_type=code&redirect_uri=https%3A%2F%2Fvipalex2.onrender.com%2Fcallback&scope=identify',
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

    // ใช้ access token ดึงข้อมูลผู้ใช้จาก Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userResponse.data;

    // เปลี่ยนเส้นทางไปยังหน้า home พร้อมส่งข้อมูล Discord username
    res.redirect(`/home?username=${user.username}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send('เกิดข้อผิดพลาดในการล็อกอิน');
  }
});

// หน้า home แสดงข้อมูล Discord username
app.get('/home', (req, res) => {
  const username = req.query.username;
  res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ALEX STREAM</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Orbitron', sans-serif;
      background: url('your-bg-image.jpg') no-repeat center center fixed;
      background-size: cover;
      color: #fff;
      min-height: 100vh;
      overflow-x: hidden;
      background-color: #000;
    }

    header {
      width: 100%;
      padding: 20px 40px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      position: fixed;
      top: 0;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 0 15px gold;
    }

    .logo {
      font-size: 1.8rem;
      color: gold;
      text-shadow: 0 0 12px gold;
    }

    nav {
      display: flex;
      gap: 15px;
    }

    nav button {
      background: transparent;
      border: 2px solid gold;
      color: gold;
      padding: 10px 18px;
      font-size: 1rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    nav button:hover {
      background: gold;
      color: black;
      box-shadow: 0 0 15px gold;
    }

    main {
      display: flex;
      justify-content: space-between;
      padding: 120px 40px 40px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .youtube-box {
      flex: 1;
      min-width: 300px;
      max-width: 480px;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 0 20px gold;
    }

    .youtube-box iframe {
      width: 100%;
      height: 270px;
      border: none;
    }

    .top-donate {
      background: rgba(0, 0, 0, 0.7);
      padding: 15px;
      border-radius: 10px;
      margin-top: 15px;
      box-shadow: 0 0 10px gold;
    }

    .top-donate h3 {
      color: gold;
      margin-bottom: 10px;
    }

    .top-donate ol {
      padding-left: 20px;
      line-height: 1.6;
    }

    .stream-info {
      flex: 1 1 55%;
      min-width: 250px;
      background: rgba(0, 0, 0, 0.7);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 0 15px gold;
    }

    .stream-info h2 {
      font-size: 1.4rem;
      margin-bottom: 10px;
      color: gold;
    }

    .stream-info p {
      font-size: 1rem;
      line-height: 1.5;
    }

    .stream-link, .discord-btn, .social-link {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      text-decoration: none;
      transition: 0.3s ease;
    }

    .stream-link {
      background: 020202;
      color: black;
    }

    .stream-link:hover {
      box-shadow: 0 0 10px 020202;
    }

    .donate-info {
      flex: 1 1 55%;
      min-width: 250px;
      background: rgba(255, 255, 255, 0.7);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 0 15px 020202;
    }

    .donate-info h2 {
      font-size: 1.4rem;
      margin-bottom: 10px;
      color: 020202;
    }

    .donate-info p {
      font-size: 1rem;
      line-height: 1.5;
    }
    .donate-link, .discord-btn, .social-link {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      text-decoration: none;
      transition: 0.3s ease;
    }

    .donate-link {
      background: 020202;
      color: black;
    }

    .donate-link:hover {
      box-shadow: 0 0 10px 020202;
    }
    .discord-btn {
      background:rgb(0, 0, 0);
      color: white;
    }

    .discord-btn:hover {
      box-shadow: 0 0 10pxrgb(0, 0, 0);
    }

    .social-link {
      background:rgb(0, 0, 0);
      color: white;
    }

    .social-link:hover {
      box-shadow: 0 0 10pxrgb(0, 0, 0);
    }

    footer {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.7);
      padding: 10px 20px;
      font-size: 0.9rem;
      color: gold;
      border-radius: 10px;
      box-shadow: 0 0 15px gold;
    }

    #particles-js {
      position: fixed;
      width: 100%;
      height: 100%;
      z-index: -1;
    }

    @media (max-width: 768px) {
      main {
        flex-direction: column;
        padding: 120px 20px 20px;
      }
    }
  </style>
</head>
<body>

  <div id="particles-js"></div>

  <header>
    <div class="logo">ALEX DEKHUDBAD</div>
    <nav>
      <button onclick="location.href='pay.html'">PAYMENT</button>
      <button onclick="location.href='vip.html'">VIP ALEX</button>
      <button onclick="location.href='https://www.facebook.com/lakksjslal.ksksiksks'">ติดต่อปัญหาเว็บ</button>
    </nav>
  </header>

  <main>
    <div class="youtube-box">
      <iframe src="https://www.youtube.com/embed/tp6rvz9xbIs" allowfullscreen></iframe>
      <div class="top-donate">
        <h3>🏆 TOP DONATE</h3>
        <ol>
          <li>⭐ คุณ ALEX - 1,500฿</li>
          <li>⭐ คุณ ALEX - 1,200฿</li>
          <li>⭐ คุณ ALEX - 950฿</li>
          <li>⭐ คุณ ALEX - 800฿</li>
          <li>⭐ คุณ ALEX - 500฿</li>
        </ol>
      </div>
    </div>

<div class="stream-info">
  <h2>📢 ประกาศสตรีม</h2>
  <p>วันนี้เราจะสตรีมเกม GTA V เวลา <strong>19:00 - 01:00</strong> ผ่านช่อง TikTok</p>
  <p>กดลิงก์ด้านล่างเพื่อติดตามการสตรีมแบบสดได้เลย!</p>

  <!-- ปุ่มดู TikTok สด (รูป TikTok) -->
  <a class="stream-link" href="https://www.tiktok.com/@alexdekhudbad/live" target="_blank">
    <img src="https://img5.pic.in.th/file/secure-sv1/live-6366830_1280-1.th.png" alt="ดูสตรีมสด TikTok" style="height: 40px;">
  </a>

  <!-- ปุ่ม DONATE (รูปเหรียญ) -->
  <a class="donate-link" href="https://easydonate.app/Alexdekhudbad" target="_blank">
    <img src="https://img2.pic.in.th/pic/donate-1.md.png" alt="Donate" style="height: 40px;">
  </a>

  <!-- ปุ่ม Discord -->
  <a class="discord-btn" href="https://discord.gg/GezePGqfKE" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" alt="Join Discord" style="height: 40px;">
  </a>

  <br><br>
  <h3 style="color: gold;">ช่องทางการติดตาม</h3>

  <!-- ปุ่ม YouTube -->
  <a class="social-link" href="https://www.youtube.com/@1414Studio" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="height: 35px;">
  </a>

  <!-- ปุ่ม Twitch -->
  <a class="social-link" href="https://www.twitch.tv/alexdekhudbad" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111668.png" alt="Twitch" style="height: 35px;">
  </a>

  <!-- ปุ่ม LINE OpenChat -->
  <a class="social-link" href="https://line.me/ti/g2/fY3Sdp6FjBsX5tiUt7snS4rZggeCTDfVLfQKmw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default" target="_blank">
    <img src="https://img2.pic.in.th/pic/unnamed19bdf3142a2d5ed0.th.png" alt="LINE" style="height: 35px;">
  </a>
</div>


  <footer>
    © 2025 | Powered by Jox
  </footer>

  <!-- Particle.js -->
  <script src="https://cdn.jsdelivr.net/npm/particles.js"></script>
  <script>
    particlesJS("particles-js", {
      particles: {
        number: { value: 80 },
        color: { value: "#ffd700" },
        shape: { type: "circle" },
        opacity: { value: 0.3 },
        size: { value: 3 },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffd700",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2
        }
      },
      interactivity: {
        events: {
          onhover: { enable: true, mode: "repulse" }
        }
      },
      retina_detect: true
    });
  </script>

</body>
</html>
`);
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});