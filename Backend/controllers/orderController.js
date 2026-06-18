const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Helper to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

// Helper to generate a unique order ID
function generateOrderId() {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000) + 'X';
}

/**
 * Create Cashfree Order Session
 */
exports.createCashfreeOrder = async (req, res) => {
  try {
    const { orderAmount, customerEmail, customerPhone, customerName } = req.body;
    
    // Ensure credentials exist
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.warn("[Cashfree] Missing API Keys. Using Mock payment_session_id.");
      // We return a mock session ID. The frontend must handle this gracefully if testing without keys.
      return res.status(200).json({ 
        payment_session_id: 'mock_session_' + Date.now(),
        order_id: generateOrderId(),
        isMock: true 
      });
    }

    const orderId = generateOrderId();
    const url = process.env.CASHFREE_ENV === 'PROD' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST_' + Date.now(),
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName || 'Guest'
      },
      order_meta: {
        return_url: 'http://localhost:5173/checkout?order_id={order_id}'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Cashfree] API Error:', data);
      return res.status(400).json({ message: 'Failed to create payment session', error: data });
    }

    res.status(200).json({ 
      payment_session_id: data.payment_session_id, 
      order_id: orderId 
    });
  } catch (error) {
    console.error('[Cashfree] Create Order Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Place a New Order
 */
exports.placeOrder = async (req, res) => {
  console.log("[Order Controller] Place Order Request received. Body:", JSON.stringify(req.body));

  try {
    const { userId, email, items, totalPrice, shippingAddress, paymentMethod } = req.body;

    // Payload Validations
    if (!email || !isValidEmail(email)) {
      console.warn(`[Order Controller] Place Order failed: Invalid email format (${email})`);
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn("[Order Controller] Place Order failed: Items list is empty or not an array");
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }
    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
      console.warn(`[Order Controller] Place Order failed: Invalid total price (${totalPrice})`);
      return res.status(400).json({ message: 'Total price must be a positive number' });
    }
    if (!shippingAddress || !shippingAddress.trim()) {
      console.warn("[Order Controller] Place Order failed: Shipping address is missing");
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate cart items internal structure
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity || item.quantity <= 0) {
        console.warn("[Order Controller] Place Order failed: Invalid item format inside items array:", JSON.stringify(item));
        return res.status(400).json({ message: 'Each item must contain a valid name, price, and positive quantity' });
      }
    }

    // Mock database check when offline
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Order Controller] Database is offline. Running in Mock Mode for placeOrder.");
      const orderId = generateOrderId();
      console.log(`[Order Controller] Mock generated Order ID: ${orderId}`);
      
      const orderDetails = {
        orderId,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod: paymentMethod || 'upi'
      };

      console.log(`[Order Controller] Triggering Order Confirmation Email to ${email} for order ${orderId}`);
      sendOrderConfirmationEmail(email, orderDetails).catch(err =>
        console.error("[Order Controller] Order Confirmation Email background error:", err.message)
      );

      return res.status(201).json({
        message: 'Order placed successfully (Mock Mode)! Confirmation email has been sent.',
        order: {
          userId: userId || 'mock-user-id',
          orderId,
          items,
          totalPrice,
          shippingAddress,
          paymentMethod: paymentMethod || 'upi',
          createdAt: new Date()
        }
      });
    }

    const orderId = generateOrderId();
    console.log(`[Order Controller] Generated unique Order ID: ${orderId}`);

    const newOrder = new Order({
      userId: userId || null,
      orderId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'upi'
    });

    await newOrder.save();
    console.log(`[Order Controller] Order successfully saved to database: ${orderId}`);

    // Trigger Order Confirmation Email
    const orderDetails = {
      orderId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'upi'
    };

    console.log(`[Order Controller] Triggering Order Confirmation Email to ${email} for order ${orderId}`);
    sendOrderConfirmationEmail(email, orderDetails).catch(err =>
      console.error("[Order Controller] Order Confirmation Email background error:", err.message)
    );

    res.status(201).json({
      message: 'Order placed successfully! Confirmation email has been sent.',
      order: newOrder
    });
  } catch (err) {
    console.error("[Order Controller] Place Order error:", err);
    res.status(500).json({ message: 'Something went wrong while placing order' });
  }
};

/**
 * Get All Orders
 */
exports.getOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("[Order Controller] Database is offline. Serving static mock orders.");
      return res.status(200).json([
        {
          orderId: 'ORD-9824X',
          email: 'rahul@example.com',
          items: [{ name: 'Fresh Organic Bananas', price: 80, quantity: 2 }],
          totalPrice: 680,
          shippingAddress: 'Rahul Sharma, 123 Shopping St, Pin: 400001, Phone: 9876543210',
          paymentMethod: 'upi',
          createdAt: new Date(),
          status: 'Processing'
        },
        {
          orderId: 'ORD-9823X',
          email: 'priya@example.com',
          items: [{ name: 'Whole Wheat Bread', price: 55, quantity: 1 }],
          totalPrice: 1240,
          shippingAddress: 'Priya Patel, Area Name, Pin: 400002, Phone: 9876543211',
          paymentMethod: 'card',
          createdAt: new Date(Date.now() - 3600000),
          status: 'Out for Delivery'
        },
        {
          orderId: 'ORD-9822X',
          email: 'amit@example.com',
          items: [{ name: 'Free Range Eggs', price: 60, quantity: 3 }],
          totalPrice: 450,
          shippingAddress: 'Amit Kumar, Road St, Pin: 400003, Phone: 9876543212',
          paymentMethod: 'cod',
          createdAt: new Date(Date.now() - 7200000),
          status: 'Delivered'
        }
      ]);
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("[Order Controller] Get Orders error:", err);
    res.status(500).json({ message: 'Something went wrong while fetching orders' });
  }
};

 / * * 
   *   G e t   S p e c i f i c   O r d e r   B y   I D 
   * / 
 e x p o r t s . g e t O r d e r B y I d   =   a s y n c   ( r e q ,   r e s )   = >   { 
     t r y   { 
         c o n s t   {   o r d e r I d   }   =   r e q . p a r a m s ; 
         
         / /   M o c k   M o d e   S u p p o r t 
         i f   ( m o n g o o s e . c o n n e c t i o n . r e a d y S t a t e   ! = =   1 )   { 
             c o n s o l e . w a r n ( ' [ O r d e r   C o n t r o l l e r ]   D a t a b a s e   i s   o f f l i n e .   S e r v i n g   m o c k   o r d e r . ' ) ; 
             / /   R e t u r n   a   d y n a m i c   m o c k   o r d e r 
             r e t u r n   r e s . s t a t u s ( 2 0 0 ) . j s o n ( { 
                 o r d e r I d , 
                 e m a i l :   ' u s e r @ e x a m p l e . c o m ' , 
                 i t e m s :   [ {   n a m e :   ' M o c k   I t e m ' ,   p r i c e :   1 0 0 ,   q u a n t i t y :   1   } ] , 
                 t o t a l P r i c e :   1 0 0 , 
                 s h i p p i n g A d d r e s s :   ' M o c k   A d d r e s s ' , 
                 p a y m e n t M e t h o d :   ' u p i ' , 
                 s t a t u s :   ' P r o c e s s i n g ' , 
                 c r e a t e d A t :   n e w   D a t e ( ) 
             } ) ; 
         } 
 
         c o n s t   o r d e r   =   a w a i t   O r d e r . f i n d O n e ( {   o r d e r I d   } ) ; 
         i f   ( ! o r d e r )   { 
             r e t u r n   r e s . s t a t u s ( 4 0 4 ) . j s o n ( {   m e s s a g e :   ' O r d e r   n o t   f o u n d '   } ) ; 
         } 
         
         r e s . s t a t u s ( 2 0 0 ) . j s o n ( o r d e r ) ; 
     }   c a t c h   ( e r r )   { 
         c o n s o l e . e r r o r ( ' [ O r d e r   C o n t r o l l e r ]   G e t   O r d e r   B y   I D   e r r o r : ' ,   e r r ) ; 
         r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   m e s s a g e :   ' S o m e t h i n g   w e n t   w r o n g   f e t c h i n g   t h e   o r d e r '   } ) ; 
     } 
 } ; 
 
 / * * 
   *   U p d a t e   O r d e r   S t a t u s 
   * / 
 e x p o r t s . u p d a t e O r d e r S t a t u s   =   a s y n c   ( r e q ,   r e s )   = >   { 
     t r y   { 
         c o n s t   {   o r d e r I d   }   =   r e q . p a r a m s ; 
         c o n s t   {   s t a t u s   }   =   r e q . b o d y ;   / /   P r o c e s s i n g ,   O u t   f o r   D e l i v e r y ,   D e l i v e r e d 
         
         i f   ( ! [ ' P r o c e s s i n g ' ,   ' O u t   f o r   D e l i v e r y ' ,   ' D e l i v e r e d ' ] . i n c l u d e s ( s t a t u s ) )   { 
             r e t u r n   r e s . s t a t u s ( 4 0 0 ) . j s o n ( {   m e s s a g e :   ' I n v a l i d   s t a t u s '   } ) ; 
         } 
 
         i f   ( m o n g o o s e . c o n n e c t i o n . r e a d y S t a t e   ! = =   1 )   { 
               c o n s o l e . w a r n ( ' [ O r d e r   C o n t r o l l e r ]   D a t a b a s e   o f f l i n e .   R e t u r n i n g   s u c c e s s   m o c k . ' ) ; 
               r e t u r n   r e s . s t a t u s ( 2 0 0 ) . j s o n ( {   m e s s a g e :   ' S t a t u s   u p d a t e d   s u c c e s s f u l l y   ( M o c k ) '   } ) ; 
         } 
 
         c o n s t   o r d e r   =   a w a i t   O r d e r . f i n d O n e A n d U p d a t e ( 
             {   o r d e r I d   } , 
             {   s t a t u s   } , 
             {   n e w :   t r u e   } 
         ) ; 
 
         i f   ( ! o r d e r )   { 
             r e t u r n   r e s . s t a t u s ( 4 0 4 ) . j s o n ( {   m e s s a g e :   ' O r d e r   n o t   f o u n d '   } ) ; 
         } 
 
         r e s . s t a t u s ( 2 0 0 ) . j s o n ( {   m e s s a g e :   ' O r d e r   s t a t u s   u p d a t e d   s u c c e s s f u l l y ' ,   o r d e r   } ) ; 
     }   c a t c h   ( e r r )   { 
         c o n s o l e . e r r o r ( ' [ O r d e r   C o n t r o l l e r ]   U p d a t e   O r d e r   S t a t u s   e r r o r : ' ,   e r r ) ; 
         r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   m e s s a g e :   ' S o m e t h i n g   w e n t   w r o n g   u p d a t i n g   t h e   o r d e r   s t a t u s '   } ) ; 
     } 
 } ; 
  
 