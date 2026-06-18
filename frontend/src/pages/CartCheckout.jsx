import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartCheckout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, apiBase } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [alert, setAlert] = useState(null); // { message, type }
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null); // Contains placed order details

  // Pre-fill fields if user is logged in
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.name) {
        const nameParts = user.name.trim().split(' ');
        setFirstName(nameParts[0] || '');
        if (nameParts.length > 1) {
          setLastName(nameParts.slice(1).join(' '));
        }
      }
    }
  }, [user]);

  const showAlert = (message, type) => {
    setAlert({ message, type });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  // Calculations
  const subtotal = cartTotal;
  const tax = Math.round(subtotal * 0.05); // 5% mock tax
  const delivery = subtotal > 0 ? 40 : 0;
  const total = subtotal + tax + delivery;

  const handlePlaceOrder = async () => {
    hideAlert();

    // Validations
    if (!firstName || !lastName || !email || !phone || !address || !pincode) {
      showAlert("Please fill out all the delivery details.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }

    if (cart.length === 0) {
      showAlert("Your cart is empty. Please add items to your cart first.", "error");
      return;
    }

    const items = cart.map(item => ({
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    const shippingAddress = `${firstName} ${lastName}, ${address}, Pin: ${pincode}, Phone: ${phone}`;

    const payload = {
      userId: user ? user.id || user._id : null,
      email,
      items,
      totalPrice: total,
      shippingAddress,
      paymentMethod
    };

    setLoading(true);

    try {
      // If Cash on Delivery, place order directly
      if (paymentMethod === 'cod') {
        const res = await fetch(`${apiBase}/api/orders/place`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessOrder(data.order);
          clearCart();
        } else {
          showAlert(data.message || "Failed to place order.", "error");
        }
        return;
      }

      // If Card or UPI, trigger Razorpay Gateway
      const rzpRes = await fetch(`${apiBase}/api/orders/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderAmount: total
        })
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        showAlert(rzpData.message || "Failed to initialize payment gateway.", "error");
        setLoading(false);
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
            // Verify payment
            const verifyRes = await fetch(`${apiBase}/api/orders/verify-razorpay-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              // Payment verified, place final order
              const placeRes = await fetch(`${apiBase}/api/orders/place`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              
              const placeData = await placeRes.json();
              if (placeRes.ok) {
                setSuccessOrder(placeData.order);
                clearCart();
              } else {
                showAlert("Payment succeeded but order placement failed. Please contact support.", "error");
              }
            } else {
              showAlert(verifyData.message || "Payment verification failed.", "error");
            }
          } catch (err) {
            console.error("Verification error:", err);
            showAlert("An error occurred during payment verification.", "error");
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Razorpay Error:", response.error);
        showAlert(response.error.description || "Payment failed or was cancelled.", "error");
      });
      rzp.open();

    } catch (err) {
      console.error("[Checkout] Order placement failed:", err);
      showAlert("Network connection error. Check if the server is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content container">
      {/* Page-specific inline CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            margin-top: 80px;
            width: 100%;
        }

        @media(max-width: 900px) {
            .checkout-grid {
                grid-template-columns: 1fr;
            }
        }

        .checkout-card {
            background: var(--surface-color);
            border-radius: var(--border-radius);
            padding: 30px;
            box-shadow: var(--shadow-sm);
            margin-bottom: 24px;
            border: 1px solid rgba(148, 163, 184, 0.12);
        }

        .checkout-title {
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }

        .form-group {
            margin-bottom: 15px;
            text-align: left;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            box-sizing: border-box;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .payment-methods {
            display: grid;
            gap: 15px;
        }

        .payment-method {
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .payment-method:hover, .payment-method.active {
            border-color: var(--primary-color);
            background: rgba(16, 185, 129, 0.05);
        }

        .payment-icon {
            font-size: 24px;
            color: var(--primary-color);
            display: flex;
            align-items: center;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            color: var(--text-secondary);
        }

        .summary-item.total {
            color: var(--text-primary);
            font-size: 18px;
            font-weight: 700;
            border-top: 1px solid var(--border-color);
            padding-top: 15px;
            margin-top: 15px;
        }

        .checkout-cart-items {
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
            padding-right: 10px;
        }

        .mini-cart-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--bg-color);
            text-align: left;
        }

        .mini-cart-item img {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
        }
        
        .mini-cart-info {
            flex: 1;
        }
        
        .mini-cart-title {
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        .mini-cart-price {
            color: var(--primary-color);
            font-weight: 600;
        }

        /* Success Overlay */
        .success-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 255, 255, 0.98);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s;
        }
        
        .success-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        .success-icon {
            font-size: 80px;
            color: var(--primary-color);
            margin-bottom: 20px;
            animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
            0% { transform: scale(0); }
            100% { transform: scale(1); }
        }
      `}} />

      {cart.length === 0 && !successOrder ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', marginTop: '60px' }}>
          <span style={{ fontSize: '64px' }} role="img" aria-label="Cart">🛒</span>
          <h2>Your checkout cart is empty!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '15px 0 30px' }}>
            Add some fresh items to your cart before proceeding.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go to Storefront
          </button>
        </div>
      ) : (
        <div className="checkout-grid fade-in">
          {/* Forms Side */}
          <div className="checkout-forms">
            {/* Shipping Address */}
            <div className="checkout-card">
              <h2 className="checkout-title">
                <ion-icon name="location"></ion-icon> Delivery Address
              </h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address (For Confirmation)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Address / Flat no.</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123 Shopping Street, Area Name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ maxWidth: '50%' }}>
                <label className="form-label">Pin Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <h2 className="checkout-title">
                <ion-icon name="card"></ion-icon> Payment Method
              </h2>
              <div className="payment-methods">
                <label 
                  className={`payment-method ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    style={{ display: 'none' }}
                  />
                  <div className="payment-icon">
                    <ion-icon name="qr-code-outline"></ion-icon>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>UPI (Google Pay, PhonePe, Paytm)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pay fast via UPI App</div>
                  </div>
                </label>

                <label 
                  className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    style={{ display: 'none' }}
                  />
                  <div className="payment-icon">
                    <ion-icon name="card-outline"></ion-icon>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Visa, MasterCard, RuPay</div>
                  </div>
                </label>

                <label 
                  className={`payment-method ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ display: 'none' }}
                  />
                  <div className="payment-icon">
                    <ion-icon name="cash-outline"></ion-icon>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pay when you receive the order</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Side */}
          <div className="checkout-summary">
            <div className="checkout-card" style={{ position: 'sticky', top: '100px' }}>
              <h2 className="checkout-title">
                <ion-icon name="receipt"></ion-icon> Order Summary
              </h2>

              <div className="checkout-cart-items">
                {cart.map((item, index) => {
                  const itemId = item.id || item._id || index;
                  return (
                    <div key={itemId} className="mini-cart-item">
                      <img src={item.image} alt={item.name} loading="lazy" />
                      <div className="mini-cart-info">
                        <div className="mini-cart-title">{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="mini-cart-price">₹{item.price * item.quantity}</div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-item">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-item">
                <span>Delivery Fee</span>
                <span>₹{delivery}</span>
              </div>
              <div className="summary-item">
                <span>Tax</span>
                <span>₹{tax}</span>
              </div>
              <div className="summary-item total">
                <span>Total to Pay</span>
                <span>₹{total}</span>
              </div>

              {alert && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '15px',
                    marginBottom: '5px',
                    fontWeight: '500',
                    textAlign: 'left',
                    border: `1px solid ${alert.type === 'success' ? '#10b981' : '#ef4444'}`,
                    background: alert.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: alert.type === 'success' ? '#065f46' : '#991b1b'
                  }}
                >
                  {alert.message}
                </div>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '20px', fontSize: '16px', padding: '16px' }}
                disabled={loading}
                onClick={handlePlaceOrder}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Output Overlay */}
      <div className={`success-overlay ${successOrder ? 'show' : ''}`}>
        <ion-icon name="checkmark-circle" className="success-icon"></ion-icon>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', fontFamily: 'Outfit' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '18px' }}>
          Your groceries are on the way. Order ID:{' '}
          <strong>#{successOrder?.orderId || 'ORD-9824X'}</strong>
        </p>
        <button
          className="btn-primary"
          style={{ padding: '14px 30px', fontSize: '16px' }}
          onClick={() => {
            const orderId = successOrder?.orderId || 'ORD-9824X';
            setSuccessOrder(null);
            navigate(`/delivery?orderId=${orderId}`);
          }}
        >
          Track Your Order
        </button>
      </div>
    </main>
  );
}
