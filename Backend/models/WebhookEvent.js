const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        event: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processed', 'failed'],
            default: 'pending'
        },
        payload: {
            type: mongoose.Schema.Types.Mixed
        },
        error: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
