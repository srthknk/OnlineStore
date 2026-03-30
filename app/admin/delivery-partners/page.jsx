'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faCheck,
  faClock,
  faTimes,
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faStore,
  faImage,
  faCheckCircle,
  faXmarkCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/app/admin/delivery-partners/dashboard.module.css';

export default function AdminDeliveryPartnersDashboard() {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/delivery-partners');
      if (response.ok) {
        const data = await response.json();
        setDeliveryPartners(data.deliveryPartners);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/delivery-partners/${id}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchDeliveryPartners();
        alert('Delivery partner approved successfully!');
      }
    } catch (error) {
      console.error('Error approving delivery partner:', error);
      alert('Failed to approve delivery partner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPartner) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/delivery-partners/${selectedPartner.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (response.ok) {
        fetchDeliveryPartners();
        setShowModal(false);
        setSelectedPartner(null);
        setRejectionReason('');
        alert('Delivery partner rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting delivery partner:', error);
      alert('Failed to reject delivery partner');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: { bg: '#fef08a', text: '#854d0e', icon: faClock },
      APPROVED: { bg: '#bbf7d0', text: '#166534', icon: faCheck },
      REJECTED: { bg: '#fecaca', text: '#991b1b', icon: faTimes },
      ACTIVE: { bg: '#a7f3d0', text: '#065f46', icon: faCheckCircle },
    };

    const style = statusStyles[status] || statusStyles.PENDING;
    return style;
  };

  const filteredPartners =
    filter === 'all' ? deliveryPartners : deliveryPartners.filter((dp) => dp.status === filter);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
          <p>Loading delivery partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faTruck} /> Delivery Partners Management
          </h1>
          <p className={styles.subtitle}>Manage and approve delivery partner applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.total}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Applications</h3>
            <p className={styles.statNumber}>{stats.total}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.pending}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className={styles.statContent}>
            <h3>Pending</h3>
            <p className={styles.statNumber}>{stats.pending}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.approved}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div className={styles.statContent}>
            <h3>Approved</h3>
            <p className={styles.statNumber}>{stats.approved}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.rejected}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
          <div className={styles.statContent}>
            <h3>Rejected</h3>
            <p className={styles.statNumber}>{stats.rejected}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.active}`}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statContent}>
            <h3>Active</h3>
            <p className={styles.statNumber}>{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs - With Approvals Highlight */}
      <div className={styles.filterTabs}>
        {['all', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'].map((status) => (
          <button
            key={status}
            className={`${styles.filterTab} ${filter === status ? styles.active : ''} ${status === 'PENDING' && stats.pending > 0 ? styles.highlight : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status}
            {status === 'PENDING' && stats.pending > 0 && (
              <span className={styles.badge}>{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {stats.pending > 0 && filter !== 'PENDING' && (
        <div className={styles.alert}>
          <FontAwesomeIcon icon={faClock} />
          <span>You have <strong>{stats.pending}</strong> pending application{stats.pending !== 1 ? 's' : ''} waiting for approval</span>
          <button onClick={() => setFilter('PENDING')} className={styles.alertBtn}>
            View Pending
          </button>
        </div>
      )}

      {/* Delivery Partners Table */}
      <div className={styles.tableContainer}>
        {filteredPartners.length === 0 ? (
          <div className={styles.noData}>
            <FontAwesomeIcon icon={faTruck} className={styles.noDataIcon} />
            <p>No delivery partners found</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Store</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => {
                const statusStyle = getStatusBadge(partner.status);
                return (
                  <tr key={partner.id}>
                    <td>
                      <div className={styles.nameCell}>
                        {partner.photoUrl && (
                          <img src={partner.photoUrl} alt={partner.firstName} />
                        )}
                        <span>
                          {partner.firstName} {partner.lastName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
                      {partner.email}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faPhone} className={styles.icon} />
                      {partner.phone}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faStore} className={styles.icon} />
                      {partner.selectedStore?.name}
                    </td>
                    <td>
                      <div
                        className={styles.statusBadge}
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        <FontAwesomeIcon icon={statusStyle.icon} />
                        {partner.status}
                      </div>
                    </td>
                    <td>{new Date(partner.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        {partner.status === 'PENDING' && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.approveBtn}`}
                              onClick={() => handleApprove(partner.id)}
                              disabled={actionLoading}
                              title="Approve"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.rejectBtn}`}
                              onClick={() => {
                                setSelectedPartner(partner);
                                setShowModal(true);
                              }}
                              disabled={actionLoading}
                              title="Reject"
                            >
                              <FontAwesomeIcon icon={faXmarkCircle} />
                            </button>
                          </>
                        )}
                        <button
                          className={`${styles.actionBtn} ${styles.viewBtn}`}
                          onClick={() => setSelectedPartner(partner)}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faUser} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for viewing/rejecting */}
      {selectedPartner && !showModal && (
        <div className={styles.modal} onClick={() => setSelectedPartner(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delivery Partner Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPartner(null)}>
                ×
              </button>
            </div>

            <div className={styles.detailsGrid}>
              {selectedPartner.photoUrl && (
                <div className={styles.photoSection}>
                  <img src={selectedPartner.photoUrl} alt={selectedPartner.firstName} />
                </div>
              )}

              <div className={styles.infoSection}>
                <h3>Personal Information</h3>
                <div className={styles.infoRow}>
                  <span className={styles.label}>
                    <FontAwesomeIcon icon={faUser} /> Name:
                  </span>
                  <span>
                    {selectedPartner.firstName} {selectedPartner.lastName}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>
                    <FontAwesomeIcon icon={faEnvelope} /> Email:
                  </span>
                  <span>{selectedPartner.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>
                    <FontAwesomeIcon icon={faPhone} /> Phone:
                  </span>
                  <span>{selectedPartner.phone}</span>
                </div>

                <h3>Address</h3>
                <div className={styles.infoRow}>
                  <span className={styles.label}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Address:
                  </span>
                  <span>{selectedPartner.address}</span>
                </div>

                <h3>Store Assignment</h3>
                <div className={styles.infoRow}>
                  <span className={styles.label}>
                    <FontAwesomeIcon icon={faStore} /> Store:
                  </span>
                  <span>{selectedPartner.selectedStore?.name}</span>
                </div>

                <h3>Status</h3>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Current Status:</span>
                  <div
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: getStatusBadge(selectedPartner.status).bg,
                      color: getStatusBadge(selectedPartner.status).text,
                    }}
                  >
                    <FontAwesomeIcon icon={getStatusBadge(selectedPartner.status).icon} />
                    {selectedPartner.status}
                  </div>
                </div>
              </div>
            </div>

            {selectedPartner.status === 'PENDING' && (
              <div className={styles.modalActions}>
                <button
                  className={`${styles.btn} ${styles.approveBtnLarge}`}
                  onClick={() => {
                    handleApprove(selectedPartner.id);
                    setSelectedPartner(null);
                  }}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Approve
                </button>
                <button
                  className={`${styles.btn} ${styles.rejectBtnLarge}`}
                  onClick={() => setShowModal(true)}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faXmarkCircle} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showModal && selectedPartner && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reject Delivery Partner</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className={styles.rejectForm}>
              <label>Reason for Rejection:</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={5}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={`${styles.btn} ${styles.rejectBtnLarge}`}
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                <FontAwesomeIcon icon={faXmarkCircle} /> Confirm Rejection
              </button>
              <button
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
