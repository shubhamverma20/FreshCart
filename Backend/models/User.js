const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: false, // Make false to support phone-only users
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        password: {
            type: String,
            // Not required for social/Firebase users
        },
        profilePicture: {
            type: String,
            default: ''
        },
        provider: {
            type: String,
            enum: ['local', 'google', 'facebook', 'firebase'],
            default: 'local'
        },
        firebaseUid: {
            type: String,
            default: ''
        },
        lastLogin: {
            type: Date,
            default: Date.now
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otpCode: {
            type: String
        },
        otpExpires: {
            type: Date
        },
        otpAttempts: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
