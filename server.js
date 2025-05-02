const express = require("express");
const session = require("express-session");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: "very_secret_key",
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static("public")); // สำหรับ landing page และไฟล์หน้าเว็บ

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://vipalex2.onrender.com/callback";

// เริ่ม OAuth2 login
app.get("/login", (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(redirect);
});

// Callback หลัง login
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    // ขอ access token
    const tokenResponse = await axios.post("https://discord.com/oauth2/authorize?client_id=1367595537049845850&response_type=code&redirect_uri=https%3A%2F%2Fvipalex2.onrender.com&scope=identify", new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      scope: "identify"
    }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const accessToken = tokenResponse.data.access_token;

    // ดึง user data
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    req.session.user = userResponse.data;
    res.redirect("/landing");
  } catch (err) {
    console.error(err);
    res.send("OAuth2 error");
  }
});

// หน้า landing หลัง login
app.get("/landing", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.send(`
    <html>
      <head><title>Logged In</title></head>
      <body style="background:black;color:gold;font-family:sans-serif;text-align:center;padding-top:50px">
        <h1>👑 Welcome, ${req.session.user.username}</h1>
        <p>Your Discord ID: ${req.session.user.id}</p>
        <a href="/logout">Logout</a>
      </body>
    </html>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
