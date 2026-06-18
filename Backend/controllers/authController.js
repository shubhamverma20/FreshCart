const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendWelcomeEmail, sendOTPEmail } = require('../services/emailService');

// Helper to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

// Helper to generate a 6-digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Register User
 */
exports.signup = async (req, res) => {
  console.log("[Auth Controller] Processing signup request. Body:", JSON.stringify({ ...req.body, password: "[PROTECTED]" }));
  
  try {
    const { email, password, name } = req.body;

    // Payload Validation
    if (!name || !name.trim()) {
      console.warn("[Auth Controller] Signup failed: Name is empty");
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!isValidEmail(email)) {
      console.warn(`[Auth Controller] Signup failed: Invalid email format (${email})`);
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!password || password.length < 6) {
      console.warn("[Auth Controller] Signup failed: Password too short");
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Mock database check when offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Auth Controller] Database is offline. Running in Mock Mode for signup.");
      console.log(`[Auth Controller] Mock signup successful for: ${email}`);
      console.log(`[Auth Controller] Triggering Welcome Email to ${email}`);
      sendWelcomeEmail(email, name).catch(err => 
        console.error("[Auth Controller] Welcome Email background error:", err.message)
      );

      const token = jwt.sign({ id: 'mock-user-id' }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '1h' });
      return res.status(201).json({ 
        message: 'Registration successful (Mock Mode)! Welcome email sent.',
        token, 
        user: { id: 'mock-user-id', name, email, isVerified: false } 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`[Auth Controller] Signup failed: User already exists (${email})`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    console.log(`[Auth Controller] User saved successfully in database: ${email}`);

    // Trigger Welcome Email in background
    console.log(`[Auth Controller] Triggering Welcome Email to ${email}`);
    sendWelcomeEmail(email, name).catch(err => 
      console.error("[Auth Controller] Welcome Email background error:", err.message)
    );

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ 
      message: 'Registration successful! Welcome email sent.',
      token, 
      user: { id: newUser._id, name, email, isVerified: false } 
    });
  } catch (err) {
    console.error("[Auth Controller] Signup error:", err);
    res.status(500).json({ message: 'Something went wrong during signup' });
  }
};

/**
 * Login User
 */
exports.login = async (req, res) => {
  console.log("[Auth Controller] Processing login request. Body:", JSON.stringify({ ...req.body, password: "[PROTECTED]" }));

  try {
    const { email, password } = req.body;

    // Payload Validation
    if (!isValidEmail(email)) {
      console.warn(`[Auth Controller] Login failed: Invalid email format (${email})`);
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!password) {
      console.warn("[Auth Controller] Login failed: Password is empty");
      return res.status(400).json({ message: 'Password is required' });
    }

    // Mock database check when offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Auth Controller] Database is offline. Running in Mock Mode for login.");
      console.log(`[Auth Controller] Mock login successful for: ${email}`);
      const token = jwt.sign({ id: 'mock-user-id' }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '1h' });
      return res.status(200).json({ 
        token, 
        user: { id: 'mock-user-id', name: email.split('@')[0], email, isVerified: true } 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[Auth Controller] Login failed: User not found (${email})`);
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.warn(`[Auth Controller] Login failed: Invalid password for ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[Auth Controller] Login successful for ${email}`);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified } 
    });
  } catch (err) {
    console.error("[Auth Controller] Login error:", err);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
};

/**
 * Request OTP for Email Verification
 */
exports.requestOTP = async (req, res) => {
  console.log("[Auth Controller] Processing requestOTP. Body:", JSON.stringify(req.body));

  try {
    const { email } = req.body;

    // Payload Validation
    if (!isValidEmail(email)) {
      console.warn(`[Auth Controller] OTP request failed: Invalid email format (${email})`);
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    // Mock database check when offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Auth Controller] Database is offline. Running in Mock Mode for OTP request.");
      const otp = generateOTP();
      console.log(`[Auth Controller] Mock generated OTP: ${otp} for ${email}`);
      
      global.mockOtpCache = global.mockOtpCache || {};
      global.mockOtpCache[email] = otp;

      console.log(`[Auth Controller] Dispatching OTP Email to ${email}`);
      const emailRes = await sendOTPEmail(email, otp);
      if (!emailRes.success) {
        console.error(`[Auth Controller] OTP email dispatch failed: ${emailRes.error || 'Unknown error'}`);
        return res.status(500).json({ message: 'Failed to send verification email (Mock Mode)' });
      }

      return res.status(200).json({ message: 'Verification code sent to your email (Mock Mode)' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[Auth Controller] OTP request failed: User not found (${email})`);
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();
    console.log(`[Auth Controller] Stored verification code in DB for: ${email}`);

    // Trigger OTP Email
    console.log(`[Auth Controller] Dispatching OTP Email to ${email}`);
    const emailRes = await sendOTPEmail(email, otp);
    if (!emailRes.success) {
      console.error(`[Auth Controller] OTP email dispatch failed: ${emailRes.error || 'Unknown error'}`);
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
  console.log("[Auth Controller] Processing verifyOTP. Body:", JSON.stringify(req.body));

  try {
    const { email, otp } = req.body;

    // Payload Validation
    if (!isValidEmail(email)) {
      console.warn(`[Auth Controller] OTP verify failed: Invalid email format (${email})`);
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!otp || otp.trim().length !== 6) {
      console.warn(`[Auth Controller] OTP verify failed: Invalid OTP length (${otp})`);
      return res.status(400).json({ message: 'A 6-digit verification code is required' });
    }

    // Mock database check when offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Auth Controller] Database is offline. Running in Mock Mode for OTP verification.");
      global.mockOtpCache = global.mockOtpCache || {};
      const expectedOtp = global.mockOtpCache[email];
      
      if (otp !== '123456' && expectedOtp && otp !== expectedOtp) {
        console.warn(`[Auth Controller] Mock OTP verify failed: Code mismatch for ${email}. Expected: ${expectedOtp || '123456'}, Received: ${otp}`);
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      console.log(`[Auth Controller] Mock email successfully verified for: ${email}`);
      return res.status(200).json({ message: 'Email verified successfully (Mock Mode)', isVerified: true });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[Auth Controller] OTP verify failed: User not found (${email})`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and has not expired
    if (!user.otpCode || user.otpCode !== otp) {
      console.warn(`[Auth Controller] OTP verify failed: Code mismatch for ${email}. Expected: ${user.otpCode}, Received: ${otp}`);
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > user.otpExpires) {
      console.warn(`[Auth Controller] OTP verify failed: Code expired for ${email}. Expiration: ${user.otpExpires}`);
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
    console.log(`[Auth Controller] User email successfully verified: ${email}`);

    res.status(200).json({ message: 'Email verified successfully', isVerified: true });
  } catch (err) {
    console.error("[Auth Controller] Verify OTP error:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Firebase Social Login Sync
 * Creates or updates a user record after successful Firebase authentication.
 */
exports.firebaseSync = async (req, res) => {
  console.log("[Auth Controller] Processing firebaseSync request.");
  try {
    const { name, email, profilePicture, provider, firebaseUid } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lastLogin = new Date();

    // Mock mode when DB is offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Auth Controller] Database is offline. Running in Mock Mode for firebaseSync.");
      const token = jwt.sign({ id: 'mock-firebase-user' }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '7d' });
      return res.status(200).json({
        message: 'Firebase sync successful (Mock Mode)',
        token,
        user: { name, email, profilePicture, provider, firebaseUid, isVerified: true, lastLogin }
      });
    }

    // Upsert: create if not exists, update if exists
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          profilePicture: profilePicture || '',
          provider: provider || 'firebase',
          firebaseUid: firebaseUid || '',
          isVerified: true,
          lastLogin
        },
        $setOnInsert: { password: '' }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[Auth Controller] Firebase user synced: ${email} (${user._id})`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      message: 'Firebase sync successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        provider: user.provider,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error("[Auth Controller] Firebase sync error:", err);
    res.status(500).json({ message: 'Firebase sync failed' });
  }
};
