const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup / Registration
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Request Email Verification OTP
router.post('/otp/request', authController.requestOTP);

// Confirm Email Verification OTP
router.post('/otp/verify', authController.verifyOTP);

// Firebase Social Login Sync (Google / Facebook / Phone)
router.post('/firebase', authController.firebaseSync);

// Password Reset
router.post('/password/request-reset', authController.requestPasswordReset);
router.post('/password/reset', authController.resetPassword);

module.exports = router;