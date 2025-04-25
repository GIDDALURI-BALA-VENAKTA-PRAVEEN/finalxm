import { User } from "../models/User.js"; // Sequelize User model
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";

const otpStore = {}; // Temporary in-memory OTP store
const SECRET_KEY = "your_secret_key"; // Move this to .env in production

// ✅ Configure Nodemailer
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "mcsushma90@gmail.com", // Replace with your Gmail
    pass: "uwqv vmdd wnxa btzg",   // Replace with app password
  },
});

// ✅ Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Check if OTP has been sent recently (e.g., within 1 minute)
  const lastOtpSent = otpStore[email] && otpStore[email].timestamp;
  const now = Date.now();

  if (lastOtpSent && now - lastOtpSent < 60000) { // 1 minute time window
    return res.status(400).json({ message: "OTP already sent. Please wait before requesting again." });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, timestamp: now }; // Store OTP and the timestamp

    console.log(`✅ Sending OTP ${otp} to ${email}`);

    await transporter.sendMail({
      from: "mcsushma90@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  console.log(`🔍 Verifying OTP for ${email}: Received ${otp}, Stored ${otpStore[email]?.otp}`);

  if (!otpStore[email])
    return res.status(400).json({ message: "OTP expired or not found" });

  const storedOtp = otpStore[email].otp;
  const timestamp = otpStore[email].timestamp;
  const now = Date.now();

  // Check OTP expiration (10 minutes)
  if (now - timestamp > 600000) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  }

  if (storedOtp.toString() === otp) {
    delete otpStore[email];

    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        email,
        name: "New User", // placeholder
        phone: "",
        pincode: ""
      });
      isNewUser = true;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      user,
      token,
      isNewUser // 👈 Send this flag
    });
  } else {
    console.log("❌ Invalid OTP entered");
    return res.status(400).json({ message: "Invalid OTP" });
  }
};