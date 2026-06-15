const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail, sendOTPEmail } = require('../services/emailService');

// Helper to generate a 6-digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Register User
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    // Trigger Welcome Email asynchronously
    sendWelcomeEmail(email, name).catch(err => 
      console.error("[Auth Controller] Welcome Email background error:", err.message)
    );

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: newUser._id, name, email, isVerified: false } });
  } catch (err) {
    console.error("[Auth Controller] Signup error:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Login User
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch (err) {
    console.error("[Auth Controller] Login error:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Request OTP for Email Verification
 */
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Trigger OTP Email
    const emailRes = await sendOTPEmail(email, otp);
    if (!emailRes.success) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(200).json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error("[Auth Controller] Request OTP error:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and has not expired
    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully', isVerified: true });
  } catch (err) {
    console.error("[Auth Controller] Verify OTP error:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
