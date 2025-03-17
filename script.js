// Captcha Generator and Validator
function generateCaptcha() {
  const captchaText = document.getElementById("captcha-text");
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let captcha = "";
  for (let i = 0; i < 5; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  captchaText.textContent = captcha;
}

function validateCaptcha(event) {
  event.preventDefault();
  const userCaptcha = document.getElementById("captcha").value.trim();
  const generatedCaptcha = document.getElementById("captcha-text").textContent;

  if (userCaptcha === generatedCaptcha) {
    alert("Login Successful!");
  } else {
    alert("Invalid CAPTCHA. Please try again.");
    generateCaptcha(); // Refresh CAPTCHA
  }
}

// Add Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  generateCaptcha();

  const form = document.querySelector("form");
  form.addEventListener("submit", validateCaptcha);
});

// Header Scroll Effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header-bottom");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let generatedOTP = "";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password", // Use an App Password for security
  },
});

app.post("/send-otp", (req, res) => {
  const { email } = req.body;
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${generatedOTP}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.json({ success: false, message: "Error sending OTP" });
    }
    res.json({ success: true });
  });
});

app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp === generatedOTP) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
