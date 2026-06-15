const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional to allow guest orders
        },
        orderId: {
            type: String,
            required: true,
            unique: true
        },
        items: [
            {
                id: { type: Number, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true }
            }
        ],
        totalPrice: {
            type: Number,
            required: true
        },
        shippingAddress: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'upi'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
