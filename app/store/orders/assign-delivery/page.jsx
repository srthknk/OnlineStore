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
  faBriefcase,
  faShieldAlt,
  faRefresh,
  faFire,
  faMapPin,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import styles from './styles.module.css';

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
  const [sortBy, setSortBy] = useState('recent');

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

      toast.success('🎉 Delivery partner assigned successfully!');
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

  // Filter and sort data
  const filteredOrders = unassignedOrders
    .filter(
      (order) =>
        order.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchOrder.toLowerCase()) ||
        order.total.toString().includes(searchOrder)
    )
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'amount-high') return b.total - a.total;
      if (sortBy === 'amount-low') return a.total - b.total;
      return 0;
    });

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
          <div className={styles.spinnerContent}>
            <FontAwesomeIcon icon={faTruck} className={styles.spinIcon} />
            <p>Loading delivery assignment interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <div>
            <h1>Delivery Partner Assignment</h1>
            <p>Efficiently assign delivery partners to pending orders</p>
          </div>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} title="Refresh data">
          <FontAwesomeIcon icon={faRefresh} /> Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending Orders</p>
            <p className={styles.statNumber}>{unassignedOrders.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Available Partners</p>
            <p className={styles.statNumber}>{deliveryPartners.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Ready to Assign</p>
            <p className={styles.statNumber}>{Math.min(filteredOrders.length, filteredPartners.length)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Section - Unassigned Orders */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitleGroup}>
              <FontAwesomeIcon icon={faClipboardList} className={styles.headerIcon2} />
              <div>
                <h2>Unassigned Orders</h2>
                <p className={styles.subtitle}>Select an order to proceed with partner assignment</p>
              </div>
            </div>
            <span className={styles.badge}>{filteredOrders.length}</span>
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

          <div className={styles.sortBar}>
            <span>Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
              <option value="recent">Most Recent</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <p className={styles.emptyTitle}>All orders assigned!</p>
              <p className={styles.emptySubtitle}>No pending orders at the moment</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`${styles.orderCard} ${selectedOrder?.id === order.id ? styles.active : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className={styles.orderCardHeader}>
                    <div className={styles.orderCardTitle}>
                      <span className={styles.orderBadge}>
                        <FontAwesomeIcon icon={faBox} /> {order.id.slice(0, 8)}
                      </span>
                      <h4>{order.user?.name}</h4>
                    </div>
                    <div className={styles.orderAmount}>
                      <span>₹</span>
                      <strong>{order.total.toFixed(0)}</strong>
                    </div>
                  </div>

                  <div className={styles.orderCardBody}>
                    <div className={styles.orderDetail}>
                      <FontAwesomeIcon icon={faEnvelope} />
                      <small>{order.user?.email}</small>
                    </div>
                    <div className={styles.orderDetail}>
                      <FontAwesomeIcon icon={faMapPin} />
                      <small>{order.address?.city}</small>
                    </div>
                    <div className={styles.orderDetail}>
                      <FontAwesomeIcon icon={faBox} />
                      <small>{order.orderItems?.length} Items</small>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className={styles.selectedIndicator}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Delivery Partners */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitleGroup}>
              <FontAwesomeIcon icon={faRoute} className={styles.headerIcon2} />
              <div>
                <h2>Available Partners</h2>
                <p className={styles.subtitle}>Select a partner to complete the assignment</p>
              </div>
            </div>
            <span className={styles.badge}>{filteredPartners.length}</span>
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
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faTruck} />
              </div>
              <p className={styles.emptyTitle}>No partners found</p>
              <p className={styles.emptySubtitle}>Try adjusting your search or creating new partners</p>
            </div>
          ) : !selectedOrder ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faArrowRight} />
              </div>
              <p className={styles.emptyTitle}>Select an order first</p>
              <p className={styles.emptySubtitle}>Pick an order from the left to see matching partners</p>
            </div>
          ) : (
            <div className={styles.partnersList}>
              {filteredPartners.map((partner) => (
                <div key={partner.id} className={styles.partnerCard}>
                  <div className={styles.partnerCardHeader}>
                    {partner.photo && (
                      <img src={partner.photo} alt={partner.firstName} className={styles.partnerPhoto} />
                    )}
                    {!partner.photo && (
                      <div className={styles.partnerPhotoPlaceholder}>
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                    <div className={styles.partnerBasicInfo}>
                      <h4 className={styles.partnerName}>
                        {partner.firstName} {partner.lastName}
                      </h4>
                      <div className={styles.partnerRating}>
                        <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
                        <span>{partner.stats?.rating?.toFixed(1) || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.partnerDetails}>
                    <div className={styles.partnerMetaItem}>
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{partner.phone}</span>
                    </div>
                    <div className={styles.partnerMetaItem}>
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{partner.email}</span>
                    </div>
                  </div>

                  <div className={styles.partnerStats}>
                    <div className={styles.partnerStatItem}>
                      <FontAwesomeIcon icon={faRoute} />
                      <div>
                        <span>{partner.stats?.totalDeliveries || 0}</span>
                        <p>Deliveries</p>
                      </div>
                    </div>
                    <div className={styles.partnerStatItem}>
                      <FontAwesomeIcon icon={faClock} />
                      <div>
                        <span>{partner.stats?.avgTime || '—'}</span>
                        <p>Avg Time</p>
                      </div>
                    </div>
                  </div>

                  <button
                    className={styles.assignPartnerBtn}
                    onClick={() => handleAssignPartner(selectedOrder, partner)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> Assign to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Order Info Bar */}
      {selectedOrder && (
        <div className={styles.selectedOrderBar}>
          <div className={styles.selectedOrderContent}>
            <div className={styles.selectedInfo}>
              <div className={styles.selectedIcon}>
                <FontAwesomeIcon icon={faBox} />
              </div>
              <div>
                <p className={styles.selectedLabel}>Selected Order</p>
                <p className={styles.selectedValue}>
                  {selectedOrder.id.slice(0, 8).toUpperCase()} • {selectedOrder.user?.name}
                </p>
              </div>
            </div>
            <button
              className={styles.clearBtn}
              onClick={() => {
                setSelectedOrder(null);
                setSelectedPartner(null);
              }}
            >
              <FontAwesomeIcon icon={faTimes} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Assignment Confirmation Modal */}
      {showAssignModal && selectedOrder && selectedPartner && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <FontAwesomeIcon icon={faTruck} className={styles.modalIcon} />
                <h3>Confirm Assignment</h3>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowAssignModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.assignmentFlow}>
                <div className={styles.flowItem}>
                  <div className={styles.flowIcon} style={{ background: '#667eea' }}>
                    <FontAwesomeIcon icon={faBox} />
                  </div>
                  <div className={styles.flowContent}>
                    <p className={styles.flowLabel}>Order</p>
                    <p className={styles.flowValue}>{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                    <small>{selectedOrder.user?.name}</small>
                  </div>
                </div>

                <div className={styles.flowArrow}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>

                <div className={styles.flowItem}>
                  <div className={styles.flowIcon} style={{ background: '#f5576c' }}>
                    <FontAwesomeIcon icon={faTruck} />
                  </div>
                  <div className={styles.flowContent}>
                    <p className={styles.flowLabel}>Partner</p>
                    <p className={styles.flowValue}>{selectedPartner.firstName} {selectedPartner.lastName}</p>
                    <small>{selectedPartner.phone}</small>
                  </div>
                </div>
              </div>

              <div className={styles.assignmentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Order Date
                  </span>
                  <span className={styles.detailValue}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Delivery Location
                  </span>
                  <span className={styles.detailValue}>
                    {selectedOrder.address?.city}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faStar} /> Partner Rating
                  </span>
                  <span className={styles.detailValue}>
                    {selectedPartner.stats?.rating?.toFixed(1) || 0}/5.0
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={confirmAssignment}
                disabled={assigning}
              >
                {assigning ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className={styles.spinnerSmall} /> Assigning...
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
