/**
 * Initialize Razorpay Payment Flow
 * @param {Object} params - The parameters required for payment
 * @param {string} params.apiBase - Base API URL
 * @param {Array} params.items - Cart items
 * @param {Object} params.orderDetails - The full order payload for verification (shipping address, etc)
 * @param {Object} params.customer - Customer details (firstName, lastName, email, phone)
 * @param {Function} params.onSuccess - Callback on successful verification and order placement
 * @param {Function} params.onFailure - Callback on any failure
 */
export const initializeRazorpayPayment = async ({
    apiBase,
    items,
    orderDetails,
    customer,
    onSuccess,
    onFailure
}) => {
    try {
        const rzpRes = await fetch(`${apiBase}/api/orders/create-razorpay-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });

        const rzpData = await rzpRes.json();
        if (!rzpRes.ok) {
            onFailure(rzpData.message || "Failed to initialize payment gateway.");
            return;
        }

        const options = {
            key: rzpData.key_id,
            amount: rzpData.order.amount,
            currency: rzpData.order.currency,
            name: "FreshCart",
            description: "Grocery Order Payment",
            order_id: rzpData.order.id,
            handler: async function (response) {
                try {
                    // Verify payment. Backend will save the order on success.
                    const verifyRes = await fetch(`${apiBase}/api/orders/verify-razorpay-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderDetails: orderDetails 
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok && verifyData.success) {
                        onSuccess(verifyData.order);
                    } else {
                        onFailure(verifyData.message || "Payment verification failed.");
                    }
                } catch (err) {
                    console.error("Verification error:", err);
                    onFailure("An error occurred during payment verification.");
                }
            },
            modal: {
                ondismiss: async function() {
                    try {
                        await fetch(`${apiBase}/api/orders/release-inventory`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ razorpay_order_id: rzpData.order.id })
                        });
                    } catch (err) {
                        console.error("Failed to release inventory", err);
                    }
                    onFailure("Payment cancelled by user.");
                }
            },
            prefill: {
                name: `${customer.firstName} ${customer.lastName}`.trim(),
                email: customer.email,
                contact: customer.phone
            },
            theme: {
                color: "#10b981" 
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            console.error("Razorpay Error:", response.error);
            onFailure(response.error.description || "Payment failed or was cancelled.");
        });
        rzp.open();
    } catch (err) {
        console.error("[Razorpay Service] Order placement failed:", err);
        onFailure(`Payment Error: ${err.message}`);
    }
};
