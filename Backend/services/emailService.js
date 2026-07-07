const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

// Initialize Brevo Client
let brevoClient;
try {
  if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'your_api_key') {
    brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  }
} catch (err) {
  console.error("Failed to initialize Brevo Email API:", err.message);
}

// Configurable sender details
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@freshcart.com';
const SENDER_NAME = process.env.SENDER_NAME || 'FreshCart';

/**
 * Generic helper function to send transactional emails via Brevo
 */
async function sendEmail({ toEmail, toName, subject, htmlContent }) {
  console.log(`[Email Service] Preparing transaction email request:
  - Recipient: ${toEmail}
  - Name: ${toName || 'None'}
  - Subject: ${subject}
  - Sender: ${SENDER_NAME} <${SENDER_EMAIL}>`);

  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your_api_key') {
    console.warn(`[Email Service] Warning: BREVO_API_KEY is not defined. Email to ${toEmail} was not sent. Subject: ${subject}`);
    return { success: false, message: 'API key not configured' };
  }

  if (!brevoClient) {
    console.error("[Email Service] Error: Brevo client was not initialized.");
    return { success: false, message: 'Brevo client not initialized' };
  }

  try {
    const payload = {
      subject: subject,
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName || '' }],
      htmlContent: htmlContent
    };
    
    console.log("[Email Service] Dispatching Brevo API request payload:", JSON.stringify({ ...payload, htmlContent: "[TRUNCATED_HTML]" }, null, 2));

    const data = await brevoClient.transactionalEmails.sendTransacEmail(payload);
    console.log(`[Email Service] Brevo API Response success:`, JSON.stringify(data, null, 2));
    return { success: true, messageId: data.messageId || data.body?.messageId };
  } catch (error) {
    console.error(`[Email Service] Brevo API Error occurred:`, error.message || error);
    if (error.response && error.response.body) {
      console.error("[Email Service] Brevo API Response body details:", JSON.stringify(error.response.body, null, 2));
    }
    return { success: false, error: error.message || error };
  }
}

/**
 * 1. Send Welcome Email
 */
async function sendWelcomeEmail(userEmail, userName) {
  const subject = `Welcome to FreshCart, ${userName}! 🥬`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
        .header { background-color: #10b981; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 20px; margin-top: 0; }
        .content p { font-size: 16px; margin: 16px 0; color: #4b5563; }
        .btn { display: inline-block; padding: 14px 28px; background-color: #10b981; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px; text-align: center; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FreshCart</h1>
        </div>
        <div class="content">
          <h2>Welcome aboard, ${userName}!</h2>
          <p>We are absolutely thrilled to have you here. FreshCart is your go-to destination for the freshest vegetables, fruits, dairy, and daily grocery items delivered straight to your door.</p>
          <p>Get ready to experience grocery shopping like never before—fast, easy, and premium.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5501'}" class="btn">Start Shopping Now</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 FreshCart Inc. All rights reserved.</p>
          <p>123 Grocers Ave, Singapore</p>
        </div>
      </div>
    </body>
    </html>
  `;
 return sendEmail({ toEmail: userEmail, toName: userName, subject, htmlContent });

}

/**
 * 2. Send OTP Verification Email
 */
async function sendOTPEmail(userEmail, otp) {
  const subject = `${otp} is your FreshCart Verification Code 🔒`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
        .header { background-color: #10b981; padding: 30px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 40px 30px; text-align: center; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 20px; margin-top: 0; }
        .content p { font-size: 15px; margin: 12px 0; color: #4b5563; }
        .otp-box { display: inline-block; font-size: 36px; font-weight: 700; color: #10b981; background: #ecfdf5; border: 2px dashed #10b981; border-radius: 10px; padding: 15px 30px; letter-spacing: 5px; margin: 25px 0; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FreshCart Security</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email</h2>
          <p>Please use the following One-Time Password (OTP) to complete your email verification. This code is valid for 10 minutes.</p>
          <div class="otp-box">${otp}</div>
          <p>If you did not request this verification, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 FreshCart Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
 return sendEmail({ toEmail: userEmail, subject, htmlContent });

}

/**
 * 3. Send Order Confirmation Email
 */
async function sendOrderConfirmationEmail(userEmail, orderDetails) {
  const subject = `Order Confirmed! #${orderDetails.orderId || 'ORD-9824X'} 🛍️`;
  
  // Format items list into HTML table rows
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
        .header { background-color: #10b981; padding: 30px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 20px; margin-top: 0; }
        .content p { font-size: 15px; margin: 12px 0; color: #4b5563; }
        .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary-table th { padding: 12px; background: #f3f4f6; text-align: left; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #374151; }
        .total-row td { padding: 12px; font-weight: 700; font-size: 16px; border-top: 2px solid #e5e7eb; color: #111827; }
        .address-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
        </div>
        <div class="content">
          <h2>Hello,</h2>
          <p>Your order has been placed successfully and is now being prepared. Here is your order summary:</p>
          <p style="font-weight: 600; font-size: 14px; color: #6b7280; text-transform: uppercase;">Order ID: #${orderDetails.orderId || 'ORD-9824X'}</p>
          
          <table class="summary-table">
            <thead>
              <tr>
                <th style="width: 50%;">Item</th>
                <th style="width: 20%; text-align: center;">Qty</th>
                <th style="width: 30%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2" style="text-align: right;">Grand Total:</td>
                <td style="text-align: right;">₹${orderDetails.totalPrice}</td>
              </tr>
            </tbody>
          </table>

          <div class="address-box">
            <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #111827;">Delivery Address:</h3>
            <p style="margin: 0; color: #4b5563;">${orderDetails.shippingAddress || '123 Shopping Street, Area Name'}</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">Payment Method: <strong>${(orderDetails.paymentMethod || 'UPI').toUpperCase()}</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 FreshCart Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ toEmail: userEmail, subject, htmlContent });

}

/**
 * 4. Send Password Reset OTP Email
 */
async function sendPasswordResetEmail(userEmail, otp) {
  const subject = `${otp} is your Password Reset Code 🔑`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
        .header { background-color: #10b981; padding: 30px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 40px 30px; text-align: center; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 20px; margin-top: 0; }
        .content p { font-size: 15px; margin: 12px 0; color: #4b5563; }
        .otp-box { display: inline-block; font-size: 36px; font-weight: 700; color: #10b981; background: #ecfdf5; border: 2px dashed #10b981; border-radius: 10px; padding: 15px 30px; letter-spacing: 5px; margin: 25px 0; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FreshCart Security</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your FreshCart account. Please use the following OTP to reset your password. This code is valid for 10 minutes.</p>
          <div class="otp-box">${otp}</div>
          <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 FreshCart Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ toEmail: userEmail, subject, htmlContent });

}

module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail
};
