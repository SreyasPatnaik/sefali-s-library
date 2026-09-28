import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, ShieldCheck, CreditCard, Smartphone, Building, ArrowRight, CheckCircle2, Download, Package, Truck, MapPin, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateInvoicePDF } from '../../utils/generateInvoicePdf';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutBook,
    setCheckoutBook,
    cart,
    user,
    purchaseBook,
    purchaseCart,
    setActiveTab,
    setAuthModalOpen,
    addToast
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState('');

  if (!checkoutBook) return null;

  const isCartCheckout = cart.length > 0 && cart.some(item => item.book._id === checkoutBook._id);
  const itemsToBuy = isCartCheckout ? cart : [{ book: checkoutBook, quantity: 1 }];
  const totalAmount = itemsToBuy.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

  const handleNextStep = () => {
    if (!user) {
      addToast('warning', 'Please sign in to complete your studio order.');
      setAuthModalOpen(true);
      return;
    }

    if (step === 1) {
      if (!shippingName.trim()) {
        addToast('error', 'Please enter the recipient full name.');
        return;
      }
      if (!deliveryEmail || !deliveryEmail.includes('@') || !deliveryEmail.includes('.')) {
        addToast('error', 'Please provide a valid delivery email address.');
        return;
      }
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        addToast('error', 'Please enter a valid 10-digit contact phone number.');
        return;
      }
      if (!addressLine.trim()) {
        addToast('error', 'Please enter your shipping delivery address.');
        return;
      }
      if (!city.trim() || !pincode.trim()) {
        addToast('error', 'Please provide your delivery city and postal code.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'upi') {
        if (!upiId.trim() || !upiId.includes('@')) {
          addToast('error', 'Please enter a valid UPI ID (e.g. yourname@upi) or scan the QR.');
          return;
        }
      } else if (paymentMethod === 'card') {
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 12) {
          addToast('error', 'Please enter a valid 16-digit card number.');
          return;
        }
        if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
          addToast('error', 'Please enter card expiry date in MM/YY format.');
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
          const methodText = paymentMethod === 'upi' ? `UPI (${upiId})` : 
                             paymentMethod === 'card' ? 'Credit/Debit Card' : 
                             paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Netbanking';
          
          if (isCartCheckout) {
            await purchaseCart(methodText, `${shippingName} | ${deliveryEmail} | Ph: ${phoneNumber} | ${addressLine}, ${city} - ${pincode}`);
          } else {
            await purchaseBook(checkoutBook, methodText, `${shippingName} | ${deliveryEmail} | Ph: ${phoneNumber} | ${addressLine}, ${city} - ${pincode}`);
          }

          const orderNum = `SS-${Math.floor(10000 + Math.random() * 90000)}`;
          setCompletedOrderNum(orderNum);
          setStep(3);

          confetti({
            particleCount: 110,
            spread: 90,
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
    try {
      generateInvoicePDF({
        orderNumber: completedOrderNum,
        customerName: shippingName || user?.name || 'Valued Customer',
        customerEmail: deliveryEmail || user?.email || '',
        customerPhone: phoneNumber,
        shippingAddress: `${addressLine}, ${city} - ${pincode}`,
        paymentMethod: paymentMethod.toUpperCase(),
        items: itemsToBuy.map(i => ({
          title: i.book.title,
          category: i.book.category || i.book.tag,
          quantity: i.quantity,
          price: i.book.price,
          materials: i.book.materials
        })),
        totalAmount: totalAmount
      });
      addToast('success', 'Official Tax Invoice PDF downloaded!');
    } catch (err: any) {
      addToast('error', 'Failed to generate PDF invoice: ' + err.message);
    }
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
        style={{ maxWidth: '860px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          backgroundColor: '#FAF7EE',
          borderBottom: '1px solid #EAE5D5'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#A08020', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              THE SHEFALIS SPACE • CHECKOUT
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              Order & Shipping Confirmation
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
          padding: '1.25rem 2rem 0 2rem'
        }}>
          <div
            className={`card ${step === 1 ? 'card-highlight' : ''}`}
            style={{ padding: '0.75rem 1rem', border: step === 1 ? '2px solid #1C1917' : '1px solid #EAE5D5', backgroundColor: step === 1 ? '#FFFBF0' : '#FFFFFF' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? '#1C1917' : '#EAE6D8',
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
                Delivery Address
              </h4>
            </div>
          </div>

          <div
            className={`card ${step === 2 ? 'card-highlight' : ''}`}
            style={{ padding: '0.75rem 1rem', border: step === 2 ? '2px solid #1C1917' : '1px solid #EAE5D5', backgroundColor: step === 2 ? '#FFFBF0' : '#FFFFFF' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? '#1C1917' : '#EAE6D8',
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
            style={{ padding: '0.75rem 1rem', border: step === 3 ? '2px solid #1C1917' : '1px solid #EAE5D5', backgroundColor: step === 3 ? '#FFFBF0' : '#FFFFFF' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: step === 3 ? '#1C1917' : '#EAE6D8',
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
                Order Confirmed
              </h4>
            </div>
          </div>
        </div>

        {/* Step Body */}
        <div style={{ padding: '1.75rem 2rem' }}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {itemsToBuy.map(item => (
                  <div key={item.book._id} style={{
                    backgroundColor: '#FAF7EE',
                    borderRadius: '8px',
                    padding: '0.85rem 1.25rem',
                    border: '1px solid #EAE5D5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={item.book.coverImage || item.book.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'}
                        alt={item.book.title}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#8C827A' }}>
                          {item.book.category || item.book.tag}
                        </span>
                        <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                          {item.book.title} {item.quantity > 1 && <span style={{ fontSize: '0.85rem', color: '#78716C' }}>× {item.quantity}</span>}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: '#78716C', margin: 0 }}>
                          {item.book.materials || 'Handcrafted studio design'} • Insured Dispatch
                        </p>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1917' }}>
                      ₹{item.book.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Recipient Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="e.g. Shefali Verma"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Delivery & Order Confirmation Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={deliveryEmail}
                  onChange={(e) => setDeliveryEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Delivery Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Apartment, Studio, Street name, Landmark"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Pincode / Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 400001"
                    required
                  />
                </div>
              </div>

              <div className="checkout-footer-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1.25rem',
                borderTop: '1px solid #EAE5D5',
                marginTop: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#78716C' }}>
                  <Truck size={16} style={{ color: '#1C1917' }} />
                  <span>Complimentary insured shipping included with all studio pieces.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.95rem', color: '#57534E' }}>
                    Total: <strong style={{ color: '#1C1917', fontSize: '1.35rem' }}>₹{totalAmount}</strong>
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}
                  >
                    Select Payment Method <ArrowRight size={16} />
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'upi' ? '#1C1917' : '#EAE5D5',
                    backgroundColor: paymentMethod === 'upi' ? '#FAF7EE' : '#FFFFFF',
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
                  <Smartphone size={20} style={{ color: '#1C1917' }} />
                  UPI QR / VPA
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'card' ? '#1C1917' : '#EAE5D5',
                    backgroundColor: paymentMethod === 'card' ? '#FAF7EE' : '#FFFFFF',
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
                  <CreditCard size={20} style={{ color: '#1C1917' }} />
                  Credit / Debit Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'cod' ? '#1C1917' : '#EAE5D5',
                    backgroundColor: paymentMethod === 'cod' ? '#FAF7EE' : '#FFFFFF',
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
                  <Package size={20} style={{ color: '#1C1917' }} />
                  Cash On Delivery
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'netbanking' ? '#1C1917' : '#EAE5D5',
                    backgroundColor: paymentMethod === 'netbanking' ? '#FAF7EE' : '#FFFFFF',
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
                  <Building size={20} style={{ color: '#1C1917' }} />
                  Netbanking
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="checkout-upi-box" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1.25rem', alignItems: 'center', backgroundColor: '#FAF7EE', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '130px', height: '130px', backgroundColor: '#FFF', padding: '8px', border: '1px solid #EAE5D5', borderRadius: '8px', margin: '0 auto' }}>
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=shefali.space@upi" alt="UPI QR Code" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#78716C', marginTop: '6px', display: 'block' }}>Scan with GPay / PhonePe / Paytm</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Or enter VPA / UPI ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                    />
                    <span style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '4px', display: 'block' }}>
                      Direct instant verification via Unified Payments Interface.
                    </span>
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

              {paymentMethod === 'cod' && (
                <div style={{ backgroundColor: '#FAF7EE', padding: '1.25rem', borderRadius: '8px', border: '1px solid #EAE5D5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Package size={22} style={{ color: '#1C1917' }} />
                    <h4 className="font-serif" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Cash on Delivery Selected</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#57534E', margin: 0, lineHeight: 1.5 }}>
                    Pay with cash or UPI directly to our delivery courier partner when your handcrafted studio package arrives at your doorstep.
                  </p>
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
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="checkout-footer-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1.25rem',
                borderTop: '1px solid #EAE5D5',
                marginTop: '1.5rem'
              }}>
                <span style={{ fontSize: '0.95rem', color: '#57534E' }}>
                  Total Investment: <strong style={{ color: '#1C1917', fontSize: '1.4rem' }}>₹{totalAmount}</strong>
                </span>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep(1)}
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Back to Address
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    disabled={isProcessing}
                    style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
                  >
                    {isProcessing ? 'Processing Order...' : paymentMethod === 'cod' ? `Confirm Order (₹${totalAmount})` : `Pay ₹${totalAmount} & Place Order`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-pop-in" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#FAF7EE',
                border: '2px solid #1C1917',
                color: '#1C1917',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={42} />
              </div>

              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#A08020', textTransform: 'uppercase' }}>
                ORDER CONFIRMED • #{completedOrderNum}
              </span>
              <h2 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#1C1917', margin: '0.4rem 0 0.6rem 0' }}>
                Thank You for Your Order
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#57534E', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
                Your order has been received at <strong>THE SHEFALIS SPACE</strong>. We are carefully preparing your handcrafted pieces with soul, passion, and meditation.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadInvoice}
                  style={{ padding: '0.75rem 1.4rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} /> Download Tax Invoice
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleFinish}
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
                >
                  View My Orders <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
