import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PaymentModal = ({ bill, onClose, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('UPI');
  const [isSandboxCheckout, setIsSandboxCheckout] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const navigate = useNavigate();

  if (!bill) return null;

  // Step 1: Initiate payment order on the backend
  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.post('/payments/create-order', {
        billId: bill._id,
      });

      const orderData = res.data;

      if (orderData.isSandbox) {
        // Open transparent Sandbox Checkout dialog
        setIsSandboxCheckout(true);
        setPendingOrderData(orderData);
        setLoading(false);
      } else {
        // Real Razorpay Checkout flow
        openRazorpayCheckout(orderData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment order.');
      setLoading(false);
    }
  };

  // Step 2: Open real Razorpay modal if test keys are configured
  const openRazorpayCheckout = (orderData) => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => launchRazorpay(orderData);
      script.onerror = () => {
        setError('Failed to load Razorpay SDK. You can use FlatFlow test checkout.');
        setIsSandboxCheckout(true);
        setPendingOrderData(orderData);
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      launchRazorpay(orderData);
    }
  };

  const launchRazorpay = (orderData) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: 'FlatFlow Society',
      description: `Maintenance Bill: ${orderData.billNumber}`,
      order_id: orderData.orderId,
      handler: async (response) => {
        await verifyTransaction({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          billId: bill._id,
          paymentMethod: method,
        });
      },
      prefill: {
        name: bill.flat?.ownerName,
        email: 'resident@flatflow.com',
      },
      theme: { color: '#2563eb' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  // Step 3: Simulate Test Gateway Capture (Cryptographic signature test)
  const handleSimulatePayment = async (shouldFail = false) => {
    try {
      setLoading(true);
      setError('');

      if (shouldFail) {
        setError('Payment cancelled / failed as simulated.');
        setLoading(false);
        return;
      }

      // Generate simulated payment ID and signature
      const paymentId = `pay_sim_${Date.now()}`;
      const orderId = pendingOrderData.orderId;
      const signature = `sandbox_sig_${Date.now()}_${paymentId}`;

      await verifyTransaction({
        orderId,
        paymentId,
        signature,
        billId: bill._id,
        paymentMethod: method,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed.');
      setLoading(false);
    }
  };

  const verifyTransaction = async (verificationPayload) => {
    try {
      setLoading(true);
      const res = await api.post('/payments/verify', verificationPayload);
      if (res.data?.success) {
        onPaymentSuccess();
        onClose();
        navigate(`/receipt/${res.data.receipt._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div className="card" style={{ maxWidth: '480px', width: '90%', margin: '1rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Secure Maintenance Payment
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Bill: {bill.billNumber} ({bill.billingPeriodName})
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Bill Breakdown */}
        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Base Maintenance:</span>
            <span>₹{bill.baseAmount}</span>
          </div>
          {bill.adjustments !== 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#4b5563' }}>
              <span>Adjustments:</span>
              <span>₹{bill.adjustments}</span>
            </div>
          )}
          <hr style={{ margin: '0.5rem 0', borderColor: '#e5e7eb' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <span>Total Payable:</span>
            <span style={{ color: '#2563eb' }}>₹{bill.totalAmount}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        {!isSandboxCheckout ? (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>
              Select Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['UPI', 'Card', 'NetBanking'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: method === m ? '2px solid #2563eb' : '1px solid #d1d5db',
                    background: method === m ? '#eff6ff' : '#ffffff',
                    fontWeight: method === m ? '600' : 'normal',
                    fontSize: '0.85rem',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}
            >
              {loading ? 'Initiating Gateway...' : `Proceed to Pay ₹${bill.totalAmount}`}
            </button>
          </div>
        ) : (
          /* Sandbox Gateway Simulation Interface */
          <div style={{ border: '2px dashed #93c5fd', padding: '1rem', borderRadius: '6px', background: '#eff6ff' }}>
            <p style={{ fontWeight: '600', color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              🧪 Gateway Test Mode Sandbox
            </p>
            <p style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '1rem' }}>
              Order ID: <code style={{ background: '#dbeafe', padding: '0.1rem 0.3rem' }}>{pendingOrderData?.orderId}</code>
              <br />
              Amount: ₹{bill.totalAmount} | Method: {method}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleSimulatePayment(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                {loading ? 'Verifying...' : '✓ Complete Test Payment'}
              </button>

              <button
                onClick={() => handleSimulatePayment(true)}
                disabled={loading}
                style={{
                  padding: '0.5rem 0.8rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                }}
              >
                Cancel / Fail
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
