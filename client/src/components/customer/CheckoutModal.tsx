import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, ShieldCheck, CreditCard, Smartphone, Building, ArrowRight, CheckCircle2, Download, Printer, ShoppingBag, BookOpen, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutBook,
    setCheckoutBook,
    cart,
    user,
    purchaseBook,
    purchaseCart,
    setActiveTab,
    setActiveBookForReader,
    setReaderIsSample,
    setAuthModalOpen,
    addToast
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState('');

  if (!checkoutBook) return null;

  const isCartCheckout = cart.length > 0 && cart.some(item => item.book._id === checkoutBook._id);
  const itemsToBuy = isCartCheckout ? cart.map(i => i.book) : [checkoutBook];
  const totalAmount = itemsToBuy.reduce((sum, item) => sum + item.price, 0);

  const handleNextStep = () => {
    if (!user) {
      addToast('warning', 'Please sign in to complete your checkout.');
      setAuthModalOpen(true);
      return;
    }

    if (step === 1) {
      if (!deliveryEmail || !deliveryEmail.includes('@') || !deliveryEmail.includes('.')) {
        addToast('error', 'Please provide a valid delivery email address.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'upi') {
        if (!upiId.trim() || !upiId.includes('@')) {
          addToast('error', 'Please enter a valid UPI ID (e.g., username@upi).');
          return;
        }
      } else if (paymentMethod === 'card') {
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 12) {
          addToast('error', 'Please enter a valid 16-digit card number.');
          return;
        }
        if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
          addToast('error', 'Please enter expiry date in MM/YY format.');
          return;
        }
        if (!cardCvv.trim() || cardCvv.length < 3) {
          addToast('error', 'Please enter valid 3-digit CVV security code.');
          return;
        }
      }

      setIsProcessing(true);
      setTimeout(async () => {
        try {
          const methodText = paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Netbanking';
          
          if (isCartCheckout) {
            await purchaseCart(methodText, deliveryEmail);
          } else {
            await purchaseBook(checkoutBook, methodText, deliveryEmail);
          }

          const orderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
          setCompletedOrderNum(orderNum);
          setStep(3);

          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (err: any) {
          addToast('error', err.message || 'Payment processing failed');
        } finally {
          setIsProcessing(false);
        }
      }, 1000);
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `
====================================================
           SEFALI'S LIBRARY EDITORIAL
              OFFICIAL TAX INVOICE
====================================================
Order Number: ${completedOrderNum}
Date: ${new Date().toLocaleDateString()}
Customer: ${user?.name || 'Valued Reader'} (${deliveryEmail})
Payment Method: ${paymentMethod.toUpperCase()}

ITEMS PURCHASED:
----------------------------------------------------
${itemsToBuy.map(item => `- ${item.title} (₹${item.price}) [Instant Digital Delivery]`).join('\n')}

TOTAL AMOUNT PAID: ₹${totalAmount}
STATUS: PAID & VERIFIED
====================================================
Thank you for supporting independent technical publishing!
    `;
    const element = document.createElement('a');
    const file = new Blob([invoiceContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice_${completedOrderNum}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('success', 'Invoice downloaded successfully!');
  };

  const handleFinish = () => {
    setCheckoutBook(null);
    setActiveTab('my-shelf');
  };

  return (
    <div className="modal-overlay" onClick={() => setCheckoutBook(null)}>
      <div
        className="modal-content animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', padding: 0 }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          backgroundColor: '#FAF7EE',
          borderBottom: '1px solid #E7E3D4'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.08em' }}>
              SECURE CHECKOUT GATEWAY
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              Order Checkout & Invoice Generation
            </h3>
          </div>
          <button
            onClick={() => setCheckoutBook(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#78716C',
              padding: '0.4rem',
              borderRadius: '50%',
              backgroundColor: '#EAE6D8',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Step Progress Bar */}
        <div className="checkout-steps-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          padding: '1.5rem 1.75rem 0 1.75rem'
        }}>
          <div
            className={`card ${step === 1 ? 'card-highlight' : ''}`}
            style={{ padding: '0.85rem', border: step === 1 ? '2px solid #2E5A44' : '1px solid #E7E3D4' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? '#2E5A44' : '#EAE6D8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                1
              </div>
              <h4 className="font-serif" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                Summary
              </h4>
            </div>
          </div>

          <div
            className={`card ${step === 2 ? 'card-highlight' : ''}`}
            style={{ padding: '0.85rem', border: step === 2 ? '2px solid #2E5A44' : '1px solid #E7E3D4' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? '#2E5A44' : '#EAE6D8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                2
              </div>
              <h4 className="font-serif" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                Payment Gateway
              </h4>
            </div>
          </div>

          <div
            className={`card ${step === 3 ? 'card-highlight' : ''}`}
            style={{ padding: '0.85rem', border: step === 3 ? '2px solid #2E5A44' : '1px solid #E7E3D4' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: step === 3 ? '#2E5A44' : '#EAE6D8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                3
              </div>
              <h4 className="font-serif" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                Invoice & Access
              </h4>
            </div>
          </div>
        </div>

        {/* Step Body */}
        <div style={{ padding: '1.75rem' }}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {itemsToBuy.map(item => (
                  <div key={item._id} style={{
                    backgroundColor: '#FAF7EE',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid #E7E3D4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span className="badge badge-green" style={{ marginBottom: '0.2rem' }}>
                        {item.tag}
                      </span>
                      <h4 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C1917', margin: '0.2rem 0 0 0' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#78716C', margin: 0 }}>
                        By {item.author} • {item.ebookFile ? (
                          <span style={{ color: '#0369A1', fontWeight: 600 }}>
                            📄 Authentic PDF Document ({item.fileOriginalName || 'Complete E-Book'})
                          </span>
                        ) : 'Instant Digital Delivery'}
                      </p>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2E5A44' }}>
                      ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Delivery & Receipt Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={deliveryEmail}
                  onChange={(e) => setDeliveryEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="checkout-footer-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #E7E3D4',
                marginTop: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#57534E' }}>
                  <ShieldCheck size={16} style={{ color: '#2E5A44' }} />
                  <span>256-bit SSL encrypted checkout guarantee.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1rem', color: '#57534E' }}>
                    Total: <strong style={{ color: '#1C1917', fontSize: '1.35rem' }}>₹{totalAmount}</strong>
                  </span>
                  <button
                    className="btn btn-green"
                    onClick={handleNextStep}
                    style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}
                  >
                    Proceed to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1C1917', marginBottom: '1rem' }}>
                Choose Payment Method
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'upi' ? '#2E5A44' : '#E7E3D4',
                    backgroundColor: paymentMethod === 'upi' ? '#E8F2EC' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#1C1917'
                  }}
                >
                  <Smartphone size={20} style={{ color: '#2E5A44' }} />
                  UPI QR / VPA
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'card' ? '#2E5A44' : '#E7E3D4',
                    backgroundColor: paymentMethod === 'card' ? '#E8F2EC' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#1C1917'
                  }}
                >
                  <CreditCard size={20} style={{ color: '#2E5A44' }} />
                  Credit / Debit Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'netbanking' ? '#2E5A44' : '#E7E3D4',
                    backgroundColor: paymentMethod === 'netbanking' ? '#E8F2EC' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#1C1917'
                  }}
                >
                  <Building size={20} style={{ color: '#2E5A44' }} />
                  Netbanking
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="checkout-upi-box" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.25rem', alignItems: 'center', backgroundColor: '#FAF7EE', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '130px', height: '130px', backgroundColor: '#FFF', padding: '8px', border: '1px solid #E7E3D4', borderRadius: '8px', margin: '0 auto' }}>
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=sefali@upi" alt="UPI QR Code" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#78716C', marginTop: '4px', display: 'block' }}>Scan with GPay / PhonePe</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Or enter VPA / UPI ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="e.g. 4532 8901 2345 6789"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input type="text" className="form-input" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV Security Code</label>
                      <input type="password" className="form-input" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="form-group">
                  <label className="form-label">Select Your Banking Provider</label>
                  <select className="form-select">
                    <option>HDFC Bank Retail & Corporate</option>
                    <option>ICICI Bank NetBanking</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank Internet Banking</option>
                  </select>
                </div>
              )}

              <div className="checkout-footer-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1.25rem',
                borderTop: '1px solid #E7E3D4',
                marginTop: '1.25rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#57534E' }}>
                  Total Investment: <strong style={{ color: '#2E5A44', fontSize: '1.4rem' }}>₹{totalAmount}</strong>
                </span>

                <button
                  className="btn btn-green"
                  onClick={handleNextStep}
                  disabled={isProcessing}
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
                >
                  {isProcessing ? 'Verifying Gateway Response...' : `Pay ₹${totalAmount} & Unlock`}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-pop-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#E8F2EC',
                color: '#2E5A44',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
                PAYMENT VERIFIED • ORDER {completedOrderNum}
              </span>
              <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.4rem' }}>
                Instant Access Unlocked!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#57534E', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                Your order is confirmed. Digital publications have been credited to your personal shelf on <strong>Sefali's Library</strong>.
              </p>

              <div className="btn-group-mobile" style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-green"
                  onClick={() => {
                    const targetBook = checkoutBook;
                    setCheckoutBook(null);
                    setActiveBookForReader(targetBook);
                    setReaderIsSample(false);
                  }}
                  style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <BookOpen size={18} /> Continue Reading (Open PDF)
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadInvoice}
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Download size={16} /> Download Tax Invoice
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleFinish}
                  style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}
                >
                  Go to 'My Shelf' <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
