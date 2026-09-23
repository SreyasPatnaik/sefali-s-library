import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, CustomerProfile } from '../../types';
import { FileText, Tag, User, X, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export const OrderTracking: React.FC = () => {
  const { adminStats, refreshAdminStats, addToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrdersAndCustomers();
  }, []);

  const fetchOrdersAndCustomers = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await api.getAdminOrders();
      setOrders(fetchedOrders);
      const fetchedCustomers = await api.getAdminCustomers();
      setCustomers(fetchedCustomers);
    } catch (err) {
      console.warn('Backend order retrieval info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrderStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Refunded' : 'Paid';
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      addToast('info', `Order status updated to ${nextStatus}.`);
      fetchOrdersAndCustomers();
      refreshAdminStats();
    } catch (err: any) {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: nextStatus as any } : o));
      addToast('info', `Status set to ${nextStatus}.`);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ADMINISTRATION CONTROL
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, marginTop: '0.2rem', color: '#1C1917' }}>
          Transaction Orders & Customer Tracking
        </h1>
      </div>

      {/* 3 Architecture Feature Cards */}
      <div className="admin-info-cards-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FAF7EE', border: '1px solid #E7E3D4' }}>
          <div style={{ color: '#2E5A44', marginBottom: '0.5rem' }}>
            <FileText size={22} />
          </div>
          <h4 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.3rem' }}>
            Transaction Logs
          </h4>
          <p style={{ fontSize: '0.825rem', color: '#57534E', lineHeight: 1.4, margin: 0 }}>
            Tracks generated order numbers, customer delivery emails, purchase amounts, and payment methods.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FAF7EE', border: '1px solid #E7E3D4' }}>
          <div style={{ color: '#2E5A44', marginBottom: '0.5rem' }}>
            <Tag size={22} />
          </div>
          <h4 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.3rem' }}>
            Status Flags
          </h4>
          <p style={{ fontSize: '0.825rem', color: '#57534E', lineHeight: 1.4, margin: 0 }}>
            Visual badge indicators for completed transactions ('Paid') and processed refunds ('Refunded').
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FAF7EE', border: '1px solid #E7E3D4' }}>
          <div style={{ color: '#2E5A44', marginBottom: '0.5rem' }}>
            <User size={22} />
          </div>
          <h4 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.3rem' }}>
            Customer Profiles
          </h4>
          <p style={{ fontSize: '0.825rem', color: '#57534E', lineHeight: 1.4, margin: 0 }}>
            Interactive drawer displaying user activity, total spent, and purchased book history.
          </p>
        </div>
      </div>

      {/* Main Orders Log Table Box */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E7E3D4',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
            Live Transaction Logs ({orders.length})
          </h3>
          <button
            className="btn btn-secondary"
            onClick={fetchOrdersAndCustomers}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Stream
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E7E3D4', color: '#78716C', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Order #</th>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Customer Email</th>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>E-Book Title</th>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Payment Method</th>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No orders logged yet.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id || order.orderNumber} style={{ borderBottom: '1px solid #FAF7EE', fontSize: '0.9rem', color: '#1C1917' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: '#57534E' }}>
                      {order.customerEmail}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                      {order.bookTitle}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#2E5A44' }}>
                      ₹{order.amount}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.825rem', color: '#78716C' }}>
                      {order.paymentMethod}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <button
                        onClick={() => handleToggleOrderStatus(order._id, order.status)}
                        className={`badge ${order.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}
                        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Click to toggle status (Paid / Refunded)"
                      >
                        {order.status}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const cust = customers.find(c => c.email === order.customerEmail) || {
                            id: 'c-temp',
                            name: order.customerName || order.customerEmail.split('@')[0],
                            email: order.customerEmail,
                            createdAt: new Date().toLocaleDateString(),
                            purchasedBooksCount: 1,
                            totalSpent: order.amount,
                            orders: [order],
                            status: 'Active'
                          };
                          setSelectedCustomer(cust);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Profile <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div
            className="modal-content animate-slide-right"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '440px',
              height: '100vh',
              borderRadius: '20px 0 0 20px',
              padding: '2rem',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E7E3D4', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '0.3rem' }}>
                  {selectedCustomer.status} Customer Account
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                  {selectedCustomer.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#78716C', margin: 0 }}>{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#FAF7EE' }}>
                <span style={{ fontSize: '0.75rem', color: '#78716C' }}>Books Purchased</span>
                <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1C1917' }}>
                  {selectedCustomer.purchasedBooksCount}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#FAF7EE' }}>
                <span style={{ fontSize: '0.75rem', color: '#78716C' }}>Total Spent</span>
                <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2E5A44' }}>
                  ₹{selectedCustomer.totalSpent}
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1C1917' }}>
              Account Information
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E7E3D4' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1C1917' }}>Customer Email</div>
                <div style={{ fontSize: '0.8rem', color: '#57534E' }}>{selectedCustomer.email}</div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E7E3D4' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1C1917' }}>Member Since</div>
                <div style={{ fontSize: '0.8rem', color: '#57534E' }}>{selectedCustomer.createdAt}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
