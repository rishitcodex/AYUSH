require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Temporary storage (Replace with a database in production)
let otpStore = {};
let userStore = {};

// Verify if .env variables are loading
console.log("Brevo Email:", process.env.BREVO_EMAIL);
console.log("Brevo Password:", process.env.BREVO_PASSWORD ? "Loaded" : "Missing");

// Configure Nodemailer transporter for Brevo
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Brevo SMTP server
    port: 587, // Brevo SMTP port
    secure: false,  // False for port 587 (TLS), True for port 465 (SSL)
    auth: {
        user: process.env.BREVO_EMAIL, // Brevo SMTP login
        pass: process.env.BREVO_PASSWORD // Brevo SMTP password
    },
    debug: true, // Enable debugging
    logger: true // Log output to console
});

// Verify SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP connection error:", error);
    } else {
        console.log("SMTP server is ready to send emails");
    }
});

// Endpoint to send OTP
app.post("/send-otp", async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, password, createdAt: Date.now() };

    // Email options
    const mailOptions = {
        from: process.env.BREVO_EMAIL, // Brevo email as sender
        to: email,
        subject: "Your OTP for Ayush - The Virtual Herbal Garden",
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Error sending OTP" });
    }
});

// Endpoint to verify OTP and store user
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const storedOtpData = otpStore[email];

    // Check if OTP exists
    if (!storedOtpData) {
        return res.status(400).json({ success: false, message: "OTP not found. Request a new OTP." });
    }

    // Check if OTP is valid
    if (storedOtpData.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (Date.now() - storedOtpData.createdAt > 10 * 60 * 1000) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: "OTP expired. Request a new OTP." });
    }

    // Store user data
    userStore[email] = { email, password: storedOtpData.password };
    delete otpStore[email];

    // Save user data to file
    fs.appendFileSync("users.txt", `${email} : ${storedOtpData.password}\n`);

    res.json({ success: true, message: "OTP verified successfully. You can now sign up." });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});