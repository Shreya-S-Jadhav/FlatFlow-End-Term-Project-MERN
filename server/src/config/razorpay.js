import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
const isRazorpayConfigured = Boolean(keyId && keySecret && !keyId.includes('<'));

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[Payment Gateway] Razorpay initialized in Test Mode.');
  } catch (err) {
    console.error('[Payment Gateway Error] Failed to initialize Razorpay:', err.message);
  }
} else {
  console.log('[Payment Gateway Info] Real Razorpay API keys not detected in .env. FlatFlow Test Sandbox active.');
}

export { razorpayInstance, isRazorpayConfigured, keyId, keySecret };
