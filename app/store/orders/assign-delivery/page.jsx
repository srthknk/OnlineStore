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
  faFilter,
  faTimes,
  faSpinner,
  faChartBar,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import styles from './delivery-assignment.module.css';

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

  // Fetch data on mount
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
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error.message || 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = (order, partner) => {
    setSelectedOrder(order);
    setSelectedPartner(partner);
    setShowAssignModal(true);
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

      toast.success('Delivery partner assigned successfully!');
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedPartner(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error assigning partner:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign delivery partner');
    } finally {
      setAssigning(false);
    }
  };

  // Filter data based on search
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
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <FontAwesomeIcon icon={faSpinner} className={styles.spinIcon} />
          <p>Loading delivery assignment interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faTruck} className={styles.headerIcon} />
          <div>
            <h1>Delivery Partner Assignment</h1>
            <p>Assign delivery partners to orders intelligently</p>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <FontAwesomeIcon icon={faBox} />
            <span>{unassignedOrders.length} Pending Orders</span>
          </div>
          <div className={styles.stat}>
            <FontAwesomeIcon icon={faUser} />
            <span>{deliveryPartners.length} Available Partners</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Section - Unassigned Orders */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FontAwesomeIcon icon={faClipboardList} />
            <h2>Unassigned Orders</h2>
            <span className={styles.count}>{filteredOrders.length}</span>
          </div>

          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Amount..."
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <p>All orders have been assigned!</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {filteredOrders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <h4>Order {order.id.slice(0, 8).toUpperCase()}</h4>
                      <p className={styles.customerName}>
                        <FontAwesomeIcon icon={faUser} /> {order.user?.name}
                      </p>
                    </div>
                    <div className={styles.orderAmount}>₹{order.total.toFixed(2)}</div>
                  </div>

                  <div className={styles.orderDetails}>
                    <div className={styles.detail}>
                      <FontAwesomeIcon icon={faEnvelope} />
                      <small>{order.user?.email}</small>
                    </div>
                    <div className={styles.detail}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <small>
                        {order.address?.address}, {order.address?.city}
                      </small>
                    </div>
                    <div className={styles.detail}>
                      <FontAwesomeIcon icon={faBox} />
                      <small>{order.orderItems?.length} Items</small>
                    </div>
                  </div>

                  <button
                    className={styles.assignBtn}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <FontAwesomeIcon icon={faArrowRight} /> Assign Partner
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Delivery Partners */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FontAwesomeIcon icon={faTruck} />
            <h2>Available Partners</h2>
            <span className={styles.count}>{filteredPartners.length}</span>
          </div>

          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Name, Email, or Phone..."
              value={searchPartner}
              onChange={(e) => setSearchPartner(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {filteredPartners.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faFilter} />
              <p>No delivery partners available</p>
            </div>
          ) : (
            <div className={styles.partnersList}>
              {filteredPartners.map((partner) => (
                <div key={partner.id} className={styles.partnerCard}>
                  {partner.photo && (
                    <img src={partner.photo} alt={partner.firstName} className={styles.partnerPhoto} />
                  )}

                  <div className={styles.partnerInfo}>
                    <h4 className={styles.partnerName}>
                      {partner.firstName} {partner.lastName}
                    </h4>

                    <div className={styles.partnerMeta}>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{partner.phone}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{partner.email}</span>
                      </div>
                    </div>

                    <div className={styles.stats}>
                      <div className={styles.statBadge}>
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>{partner.stats.totalDeliveries} Deliveries</span>
                      </div>
                      <div className={styles.statBadge}>
                        <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
                        <span>{partner.stats.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <button
                      className={styles.selectBtn}
                      onClick={() => {
                        if (selectedOrder) {
                          handleAssignPartner(selectedOrder, partner);
                        } else {
                          toast.error('Please select an order first');
                        }
                      }}
                      disabled={!selectedOrder}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} /> Assign to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Order Info */}
      {selectedOrder && (
        <div className={styles.selectedOrderBar}>
          <div className={styles.selectedOrderInfo}>
            <FontAwesomeIcon icon={faBox} />
            <div>
              <strong>Selected Order:</strong>
              <span> {selectedOrder.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
          <button
            className={styles.clearBtn}
            onClick={() => setSelectedOrder(null)}
          >
            <FontAwesomeIcon icon={faTimes} /> Clear
          </button>
        </div>
      )}

      {/* Assignment Confirmation Modal */}
      {showAssignModal && selectedOrder && selectedPartner && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <FontAwesomeIcon icon={faTruck} />
              <h3>Confirm Assignment</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAssignModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.assignmentSummary}>
                <div className={styles.summaryItem}>
                  <label>Order</label>
                  <p>{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  <small>{selectedOrder.user?.name}</small>
                </div>

                <FontAwesomeIcon icon={faArrowRight} className={styles.arrowIcon} />

                <div className={styles.summaryItem}>
                  <label>Delivery Partner</label>
                  <p>{selectedPartner.firstName} {selectedPartner.lastName}</p>
                  <small>Rating: {selectedPartner.stats.rating.toFixed(1)} ⭐</small>
                </div>
              </div>

              <div className={styles.deliveryAddress}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <div>
                  <strong>Delivery Address:</strong>
                  <p>{selectedOrder.address?.address}</p>
                  <p>{selectedOrder.address?.city}, {selectedOrder.address?.state}</p>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={confirmAssignment}
                disabled={assigning}
              >
                {assigning ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className={styles.spinIcon} />
                    Assigning...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} /> Confirm Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
