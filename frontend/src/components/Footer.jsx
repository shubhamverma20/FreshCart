import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, 
  FiMail, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiYoutube 
} from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import Button from './Button';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter an email address.', 'error');
      return;
    }
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Thank you for subscribing to our newsletter! 🥬', 'success');
      setEmail('');
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/40 pt-16 pb-8 transition-colors duration-300 text-left"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top: Newsletter Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 mb-16"
        >
          <div className="flex-1 text-center lg:text-left">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-800 dark:text-slate-100">
              Join Our Fresh Community!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs sm:text-sm font-semibold">
              Subscribe to get 15% off your first order and stay updated on flash discounts.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full lg:max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-805 dark:text-slate-200 pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-primary focus:bg-white dark:focus:bg-slate-850 transition-all text-xs font-semibold"
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="px-6 py-3 rounded-xl w-full sm:w-auto text-xs"
            >
              Subscribe
            </Button>
          </form>
        </motion.div>

        {/* Middle: Links Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Column 1: Brand details & Socials */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-emerald-500/10 transition-transform duration-300">
                <FiShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-emerald-600 dark:text-emerald-505 select-none">
                FreshCart
              </span>
            </Link>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              Your neighborhood grocery delivery. Fresh produce, organic essentials, and daily household items delivered directly to your doorstep in minutes.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2.5">
              {[
                { icon: <FiFacebook className="w-4 h-4" />, color: 'hover:bg-blue-600 hover:text-white', label: 'Facebook' },
                { icon: <FiTwitter className="w-4 h-4" />, color: 'hover:bg-sky-500 hover:text-white', label: 'Twitter' },
                { icon: <FiInstagram className="w-4 h-4" />, color: 'hover:bg-pink-600 hover:text-white', label: 'Instagram' },
                { icon: <FiYoutube className="w-4 h-4" />, color: 'hover:bg-red-600 hover:text-white', label: 'YouTube' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8.5 h-8.5 rounded-xl bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/80 shadow-sm transition-colors duration-300 ${social.color}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Categories */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-200">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {['Fresh Fruits & Veggies', 'Dairy, Butter & Eggs', 'Bakery & Bread', 'Beverages & Soft Drinks', 'Packaged & Frozen Foods'].map((link) => (
                <li key={link}>
                  <Link to="/products" className="hover:text-primary transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Company */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <h4 className="font-heading font-extrabold text-sm text-slate-805 dark:text-slate-200">
              Company
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {['About FreshCart', 'Careers & Hiring', 'Our Partner Stores', 'Store Locator', 'FreshCart Blog'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Customer Support */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <h4 className="font-heading font-extrabold text-sm text-slate-805 dark:text-slate-200">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {['Help Center & FAQs', 'Contact Customer Support', 'Refund & Return Policy', 'Delivery Tracking', 'Corporate Inquiries'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-slate-200/50 dark:border-slate-800/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400"
        >
          <div>
            &copy; {new Date().getFullYear()} FreshCart Delivery Inc. Developed by Shubham Verma.
          </div>
          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            {['Visa', 'Mastercard', 'Razorpay', 'Paypal', 'Apple Pay', 'Google Pay'].map((method) => (
              <span 
                key={method} 
                className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[9px] text-slate-400 tracking-wide select-none"
              >
                {method}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.footer>
  );
}
