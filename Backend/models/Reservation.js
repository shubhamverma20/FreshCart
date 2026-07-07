const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
    {
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true
        },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ],
        status: {
            type: String,
            enum: ['pending', 'completed', 'released'],
            default: 'pending'
        },
        expiresAt: {
            type: Date,
            required: true,
            // Sets a TTL index in MongoDB
            index: { expires: '0' } 
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
