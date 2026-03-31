'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faBox,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faEnvelope,
  faStar,
  faCheckCircle,
  faArrowRight,
  faSearch,
  faTimes,
  faSpinner,
  faClipboardList,
  faClock,
  faRoute,
  faRefresh,
  faMapPin,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

export default function DeliveryAssignment() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchOrder, setSearchOrder] = useState('');
  const [searchPartner, setSearchPartner] = useState('');
  const [step, setStep] = useState('orders'); // 'orders' or 'partners'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const [ordersRes, partnersRes] = await Promise.all([
        axios.get('/api/store/orders/unassigned', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/store/delivery-partners', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUnassignedOrders(ordersRes.data.orders || []);
      setDeliveryPartners(partnersRes.data.deliveryPartners || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmAssignment = async () => {
    if (!selectedOrder || !selectedPartner) return;

    try {
      setAssigning(true);
      const token = await getToken();

      await axios.post(
        '/api/store/orders/assign-delivery-partner',
        {
          orderId: selectedOrder.id,
          deliveryPartnerId: selectedPartner.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('✓ Delivery partner assigned successfully!');
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedPartner(null);
      setStep('orders');
      fetchData();
    } catch (error) {
      console.error('Error assigning partner:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign delivery partner');
    } finally {
      setAssigning(false);
    }
  };

  const filteredOrders = unassignedOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchOrder.toLowerCase()) ||
      order.total.toString().includes(searchOrder)
  );

  const filteredPartners = deliveryPartners.filter(
    (partner) =>
      partner.firstName.toLowerCase().includes(searchPartner.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchPartner.toLowerCase()) ||
      partner.phone.includes(searchPartner)
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <FontAwesomeIcon icon={faTruck} style={{ fontSize: '48px', marginBottom: '20px', color: '#10B981' }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading delivery interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '20px' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', color: 'white', padding: '20px', borderBottom: '3px solid #10B981' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FontAwesomeIcon icon={faTruck} style={{ fontSize: '28px', color: '#10B981' }} />
            <div>
              <h1 style={{ margin: '0', fontSize: '22px', fontWeight: '700' }}>Assign Delivery</h1>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#ccc' }}>Quick delivery partner assignment</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            style={{
              background: '#10B981',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh"
          >
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: '#2d2d2d', padding: '12px', borderRadius: '10px', borderLeft: '3px solid #10B981' }}>
            <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>Pending Orders</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{filteredOrders.length}</p>
          </div>
          <div style={{ background: '#2d2d2d', padding: '12px', borderRadius: '10px', borderLeft: '3px solid #10B981' }}>
            <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>Available Partners</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{filteredPartners.length}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Select Order Section */}
        {step === 'orders' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                <FontAwesomeIcon icon={faClipboardList} /> Select Order
              </label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999', fontSize: '16px' }} />
                <input
                  type="text"
                  placeholder="Search by Order ID or Customer..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', border: '2px dashed #e0e0e0' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '48px', color: '#10B981', marginBottom: '12px' }} />
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>All Orders Assigned!</p>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#666' }}>No pending orders to assign</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setStep('partners');
                      setSearchPartner('');
                    }}
                    style={{
                      background: 'white',
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: selectedOrder?.id === order.id ? '3px solid #10B981' : '2px solid #f0f0f0',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{ background: '#10B981', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <FontAwesomeIcon icon={faBox} /> {order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h4 style={{ margin: '8px 0 0 0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{order.user?.name}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#10B981' }}>₹{order.total.toFixed(0)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#666' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMapPin} style={{ color: '#10B981', width: '14px' }} />
                        <span>{order.address?.city}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faBox} style={{ color: '#10B981', width: '14px' }} />
                        <span>{order.orderItems?.length} Items</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Select Partner Section */}
        {step === 'partners' && selectedOrder && (
          <div>
            <div style={{ background: '#10B981', color: 'white', padding: '14px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0', fontSize: '12px', opacity: '0.9' }}>Selected Order</p>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', fontWeight: '600' }}>{selectedOrder.id.slice(0, 8).toUpperCase()} • {selectedOrder.user?.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setStep('orders');
                }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                <FontAwesomeIcon icon={faTruck} /> Select Delivery Partner
              </label>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999', fontSize: '16px' }} />
                <input
                  type="text"
                  placeholder="Search partner name or phone..."
                  value={searchPartner}
                  onChange={(e) => setSearchPartner(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {filteredPartners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', border: '2px dashed #e0e0e0' }}>
                <FontAwesomeIcon icon={faTruck} style={{ fontSize: '48px', color: '#999', marginBottom: '12px' }} />
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>No Partners Available</p>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#666' }}>Try adjusting your search</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => {
                      setSelectedPartner(partner);
                      setShowAssignModal(true);
                    }}
                    style={{
                      background: selectedPartner?.id === partner.id ? '#10B981' : 'white',
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: selectedPartner?.id === partner.id ? 'none' : '2px solid #f0f0f0',
                      transition: 'all 0.3s',
                      color: selectedPartner?.id === partner.id ? 'white' : 'inherit'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: partner.photo ? `url(${partner.photo})` : '#2d2d2d',
                        backgroundSize: 'cover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                        {!partner.photo && <FontAwesomeIcon icon={faUser} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600' }}>
                          {partner.firstName} {partner.lastName}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '13px' }}>
                          <FontAwesomeIcon icon={faStar} style={{ color: '#FFB800' }} />
                          <span>{partner.stats?.rating?.toFixed(1) || 0}/5.0</span>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '6px' }}>
                      <FontAwesomeIcon icon={faPhone} style={{ width: '14px', opacity: '0.7' }} />
                      <span>{partner.phone}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <FontAwesomeIcon icon={faRoute} style={{ opacity: '0.7' }} />
                        <span>{partner.stats?.totalDeliveries || 0} Deliveries</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <FontAwesomeIcon icon={faClock} style={{ opacity: '0.7' }} />
                        <span>{partner.stats?.avgTime || '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showAssignModal && selectedOrder && selectedPartner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }} onClick={() => setShowAssignModal(false)}>
          <div style={{
            background: 'white',
            width: '100%',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '24px 16px',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '0 0 12px 0' }}>
                <FontAwesomeIcon icon={faTruck} style={{ fontSize: '28px', color: '#10B981' }} />
                <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>Confirm Assignment</h2>
              </div>
              <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>Please review before confirming</p>
            </div>

            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>
                  <FontAwesomeIcon icon={faBox} /> ORDER DETAILS
                </p>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{selectedOrder.user?.name}</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#10B981' }}>₹{selectedOrder.total.toFixed(0)}</p>
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>
                  <FontAwesomeIcon icon={faTruck} /> PARTNER DETAILS
                </p>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                    {selectedPartner.firstName} {selectedPartner.lastName}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{selectedPartner.phone}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '13px' }}>
                    <FontAwesomeIcon icon={faStar} style={{ color: '#FFB800' }} />
                    <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{selectedPartner.stats?.rating?.toFixed(1) || 0}/5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  border: 'none',
                  color: '#1a1a1a',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                disabled={assigning}
                style={{
                  flex: 1,
                  background: assigning ? '#999' : '#10B981',
                  border: 'none',
                  color: 'white',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: assigning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {assigning ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} style={{ animation: 'spin 1s linear infinite' }} />
                    Assigning...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
