'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTruck,
  faBox,
  faCheck,
  faClock,
  faStar,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faSignOutAlt,
  faRefresh,
  faCreditCard,
  faCheckCircle,
  faXmark,
  faSpinner,
  faInfoCircle,
  faMapPin,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'

export default function DeliveryPartnerDashboard() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()

  const [isDeliveryPartner, setIsDeliveryPartner] = useState(false)
  const [dpData, setDpData] = useState(null)
  const [allOrders, setAllOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [paymentCollecting, setPaymentCollecting] = useState(null)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    completed: 0,
    totalEarnings: 0,
  })

  // Check if user is delivery partner
  useEffect(() => {
    const checkDeliveryPartnerStatus = async () => {
      if (!isLoaded || !user) {
        setLoading(false)
        return
      }

      try {
        const token = await getToken()
        const response = await axios.get('/api/delivery-partners/is-delivery-partner', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.isDeliveryPartner) {
          setIsDeliveryPartner(true)
          setDpData(response.data)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking delivery partner status:', error)
        router.push('/')
      }
    }

    checkDeliveryPartnerStatus()
  }, [isLoaded, user, getToken, router])

  // Fetch assigned orders
  useEffect(() => {
    if (!isDeliveryPartner || !dpData) return

    const fetchOrders = async () => {
      try {
        const token = await getToken()
        const response = await axios.get('/api/delivery-partners/assigned-orders', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const orders = response.data.orders || []
        setAllOrders(orders)
        
        // Calculate stats
        const pending = orders.filter(o => o.delivery.status === 'ASSIGNED').length
        const inTransit = orders.filter(o => o.delivery.status === 'PICKED_UP' || o.delivery.status === 'IN_TRANSIT').length
        const completed = orders.filter(o => o.delivery.status === 'DELIVERED').length
        const totalEarnings = orders.reduce((sum, o) => sum + (o.order.total || 0), 0)

        setStats({
          total: orders.length,
          pending,
          inTransit,
          completed,
          totalEarnings,
        })

        applyFilter('all', orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isDeliveryPartner, dpData, getToken])

  // Apply filters
  const applyFilter = (filter, orders = allOrders) => {
    let filtered = orders

    if (filter === 'pending') {
      filtered = orders.filter(o => o.delivery.status === 'ASSIGNED')
    } else if (filter === 'in-transit') {
      filtered = orders.filter(o => o.delivery.status === 'PICKED_UP' || o.delivery.status === 'IN_TRANSIT')
    } else if (filter === 'completed') {
      filtered = orders.filter(o => o.delivery.status === 'DELIVERED')
    } else if (filter === 'cod') {
      filtered = orders.filter(o => o.order.paymentMethod === 'COD' && !o.order.isPaid)
    }

    setFilteredOrders(filtered)
    setSelectedFilter(filter)
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [orderId]: true }))
      const token = await getToken()

      await axios.put(
        `/api/delivery-partners/orders/${orderId}/status`,
        { deliveryStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Refresh orders
      const response = await axios.get('/api/delivery-partners/assigned-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const orders = response.data.orders || []
      setAllOrders(orders)
      applyFilter(selectedFilter, orders)
      
      const statusLabel = newStatus === 'PICKED_UP' ? 'Picked Up' : newStatus
      toast.success(`Order marked as ${statusLabel}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const handlePaymentCollection = async (orderId) => {
    try {
      setPaymentCollecting(orderId)
      const token = await getToken()

      await axios.post(
        `/api/delivery-partners/orders/${orderId}/collect-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Refresh orders
      const response = await axios.get('/api/delivery-partners/assigned-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const orders = response.data.orders || []
      setAllOrders(orders)
      applyFilter(selectedFilter, orders)
      setExpandedOrder(null)

      toast.success('✅ Payment collected and order delivered!')
    } catch (error) {
      console.error('Error collecting payment:', error)
      toast.error(error.response?.data?.message || 'Failed to collect payment')
    } finally {
      setPaymentCollecting(null)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <FontAwesomeIcon icon={faTruck} className="text-5xl text-emerald-600 mb-4 animate-bounce" />
          <p className="text-slate-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isDeliveryPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <p className="text-slate-600 font-semibold">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <FontAwesomeIcon icon={faTruck} className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Partner Dashboard</h1>
                <p className="text-emerald-600 text-xs font-semibold">Welcome, {dpData?.firstName} {dpData?.lastName}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-3 h-3" />
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-slate-600 text-xs font-semibold">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FontAwesomeIcon icon={faBox} className="text-3xl text-blue-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-slate-600 text-xs font-semibold">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-3xl text-yellow-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-slate-600 text-xs font-semibold">In Transit</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inTransit}</p>
              </div>
              <FontAwesomeIcon icon={faTruck} className="text-3xl text-purple-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-slate-600 text-xs font-semibold">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-100" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-emerald-50 text-xs font-semibold">Total Value</p>
                <p className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(0)}</p>
              </div>
              <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-emerald-100" />
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All', icon: faBox },
            { id: 'pending', label: 'Pending', icon: faClock },
            { id: 'in-transit', label: 'Transit', icon: faTruck },
            { id: 'completed', label: 'Done', icon: faCheck },
            { id: 'cod', label: 'COD', icon: faCreditCard },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => applyFilter(filter.id)}
              className={`px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1 transition-all ${
                selectedFilter === filter.id
                  ? 'bg-emerald-600 text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-500'
              }`}
            >
              <FontAwesomeIcon icon={filter.icon} className="w-3 h-3" />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <FontAwesomeIcon icon={faTruck} className="text-3xl text-emerald-600 animate-spin mr-3" />
              <p className="text-slate-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <FontAwesomeIcon icon={faBox} className="text-5xl text-slate-300 mr-4" />
              <div>
                <p className="text-slate-600 font-semibold">No orders in this category</p>
                <p className="text-slate-500 text-sm">Try changing the filter</p>
              </div>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrderDetail(order)}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden border-l-4 ${
                  order.delivery.status === 'DELIVERED' ? 'border-green-500 bg-green-50' :
                  order.delivery.status === 'PICKED_UP' || order.delivery.status === 'IN_TRANSIT' ? 'border-purple-500 bg-purple-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}
              >
                {/* Compact Card Header */}
                <div className={`px-3 py-2 ${
                  order.delivery.status === 'DELIVERED' ? 'bg-green-600' :
                  order.delivery.status === 'PICKED_UP' || order.delivery.status === 'IN_TRANSIT' ? 'bg-purple-600' :
                  'bg-yellow-600'
                } text-white flex items-center justify-between`}>
                  <h3 className="font-bold text-xs">#{order.orderNumber}</h3>
                  <span className="text-xs font-semibold">{order.delivery.status}</span>
                </div>

                {/* Minimal Card Body */}
                <div className="p-2 space-y-2 text-xs">
                  <p className="font-semibold text-slate-900 truncate">{order.customer.name}</p>
                  <p className="text-slate-600 truncate">{order.customer.phone}</p>
                  <p className="text-slate-700 font-medium text-emerald-700">₹{order.order.total.toFixed(0)}</p>
                  {order.order.paymentMethod === 'COD' && !order.order.isPaid && (
                    <p className="text-red-600 font-semibold text-xs">⚠️ COD Pending</p>
                  )}
                  <p className="text-slate-500 text-xs">📍 Click for details</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedOrderDetail && (
          <div onClick={() => setSelectedOrderDetail(null)} className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center overflow-y-auto">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
              {/* Modal Header */}
              <div className={`px-6 py-4 ${
                selectedOrderDetail.delivery.status === 'DELIVERED' ? 'bg-green-600' :
                selectedOrderDetail.delivery.status === 'PICKED_UP' || selectedOrderDetail.delivery.status === 'IN_TRANSIT' ? 'bg-purple-600' :
                'bg-yellow-600'
              } text-white flex items-center justify-between rounded-t-xl`}>
                <div>
                  <h2 className="text-lg font-bold">Order #{selectedOrderDetail.orderNumber}</h2>
                  <p className="text-sm opacity-90">{selectedOrderDetail.delivery.status}</p>
                </div>
                <button onClick={() => setSelectedOrderDetail(null)} className="p-1 hover:bg-white/20 rounded transition">
                  <FontAwesomeIcon icon={faXmark} className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Customer Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-emerald-600" />
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-700">Name:</span> {selectedOrderDetail.customer.name}</p>
                    <p><span className="font-semibold text-slate-700">Phone:</span> {selectedOrderDetail.customer.phone}</p>
                    <p><span className="font-semibold text-slate-700">Email:</span> {selectedOrderDetail.customer.email}</p>
                  </div>
                </div>

                {/* Full Address Details */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapPin} className="text-blue-600" />
                    Complete Address
                  </h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="break-words"><span className="font-semibold">Address:</span> <span className="text-slate-800">{selectedOrderDetail.address?.house && selectedOrderDetail.address?.house + ', '}{selectedOrderDetail.address?.area && selectedOrderDetail.address?.area + ', '}{selectedOrderDetail.address?.landmark && selectedOrderDetail.address?.landmark + ', '}{selectedOrderDetail.address?.city}, {selectedOrderDetail.address?.district}, {selectedOrderDetail.address?.state} - {selectedOrderDetail.address?.pin}, {selectedOrderDetail.address?.country}</span></p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBox} className="text-slate-600" />
                    Order Items ({selectedOrderDetail.order.items.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrderDetail.order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-slate-700">• {item.quantity}x <span className="font-semibold">{item.name}</span> - ₹{(item.price * item.quantity).toFixed(0)}</p>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>Order Total:</span>
                      <span>₹{selectedOrderDetail.order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Payment Method:</span>
                      <span className="font-semibold">{selectedOrderDetail.order.paymentMethod}</span>
                    </div>
                    {selectedOrderDetail.order.paymentMethod === 'COD' && (
                      <div className={`flex justify-between font-bold ${selectedOrderDetail.order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        <span>Payment Status:</span>
                        <span>{selectedOrderDetail.order.isPaid ? '✅ Paid' : '❌ Pending'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  {/* Status Update */}
                  {selectedOrderDetail.delivery.status !== 'DELIVERED' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Update Delivery Status</label>
                      <select
                        value={selectedOrderDetail.delivery.status}
                        onChange={(e) => handleStatusUpdate(selectedOrderDetail.id, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-emerald-300 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="ASSIGNED">📌 Assigned</option>
                        <option value="PICKED_UP">📦 Picked Up</option>
                        <option value="IN_TRANSIT">🚚 In Transit</option>
                        <option value="DELIVERED">✅ Delivered</option>
                      </select>
                    </div>
                  )}

                  {/* COD Payment Collection */}
                  {selectedOrderDetail.order.paymentMethod === 'COD' && !selectedOrderDetail.order.isPaid && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">💳 Collect Payment - ₹{selectedOrderDetail.order.total.toFixed(0)}</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePaymentCollection(selectedOrderDetail.id)}
                          disabled={paymentCollecting === selectedOrderDetail.id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {paymentCollecting === selectedOrderDetail.id ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCreditCard} />
                              ✅ Payment Collected
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedOrderDetail(null)}
                          className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-400 transition-colors"
                        >
                          ❌ Not Collected
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrderDetail.order.paymentMethod === 'COD' && selectedOrderDetail.order.isPaid && (
                    <div className="p-3 bg-green-100 border border-green-500 rounded-lg text-center">
                      <p className="text-green-800 font-bold">✅ Payment Already Collected</p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOrderDetail(null)}
                    className="w-full px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
