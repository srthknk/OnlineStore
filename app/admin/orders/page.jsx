'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTruck,
  faBox,
  faUser,
  faMapMarkerAlt,
  faPhone,
  faNotesMedical,
  faArrowRight,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

export default function AdminOrderAssignment() {
  const router = useRouter()
  const [unassignedOrders, setUnassignedOrders] = useState([])
  const [deliveryPartners, setDeliveryPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [assignmentStatus, setAssignmentStatus] = useState(null)
  const [filterStore, setFilterStore] = useState('all')
  const [stores, setStores] = useState([])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch unassigned orders
        const ordersRes = await axios.get('/api/admin/orders/unassigned')
        setUnassignedOrders(ordersRes.data.orders || [])

        // Extract unique stores
        const uniqueStores = [...new Set(ordersRes.data.orders.map(o => o.store?.id))]
        const storesData = ordersRes.data.orders.map(o => o.store).filter((store, idx, arr) => arr.findIndex(s => s.id === store?.id) === idx)
        setStores(storesData)

        // Fetch approved delivery partners
        const dpRes = await axios.get('/api/admin/delivery-partners/approved')
        setDeliveryPartners(dpRes.data.deliveryPartners || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedPartner) {
      setAssignmentStatus({ type: 'error', message: 'Please select both order and delivery partner' })
      return
    }

    setAssigning(true)
    try {
      await axios.post('/api/admin/orders/assign-delivery-partner', {
        orderId: selectedOrder.id,
        deliveryPartnerId: selectedPartner,
      })

      setAssignmentStatus({ type: 'success', message: 'Order assigned successfully!' })

      // Refresh orders
      const ordersRes = await axios.get('/api/admin/orders/unassigned')
      setUnassignedOrders(ordersRes.data.orders || [])

      // Reset selection
      setTimeout(() => {
        setSelectedOrder(null)
        setSelectedPartner(null)
        setAssignmentStatus(null)
      }, 2000)
    } catch (error) {
      setAssignmentStatus({ type: 'error', message: error.response?.data?.message || 'Failed to assign order' })
    } finally {
      setAssigning(false)
    }
  }

  const filteredOrders = filterStore === 'all' 
    ? unassignedOrders 
    : unassignedOrders.filter(o => o.store?.id === filterStore)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <FontAwesomeIcon icon={faTruck} className="text-4xl text-emerald-600 mb-4 animate-bounce" />
          <p className="text-slate-600 font-semibold">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={faTruck} className="text-emerald-600" />
            Order Assignment
          </h1>
          <p className="text-slate-600">Assign undelivered orders to delivery partners</p>
        </div>

        {/* Assignment Status */}
        {assignmentStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            assignmentStatus.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <FontAwesomeIcon
              icon={assignmentStatus.type === 'success' ? faCheckCircle : faExclamationCircle}
              className={assignmentStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}
            />
            <span className={assignmentStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {assignmentStatus.message}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Unassigned Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faBox} />
                  Unassigned Orders ({filteredOrders.length})
                </h2>
              </div>

              {/* Store Filter */}
              {stores.length > 1 && (
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Store</label>
                  <select
                    value={filterStore}
                    onChange={(e) => setFilterStore(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Stores</option>
                    {stores.map(store => (
                      <option key={store?.id} value={store?.id}>
                        {store?.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-400 mb-4" />
                  <p className="text-slate-600 font-semibold">All orders assigned!</p>
                  <p className="text-slate-500 text-sm">No unassigned orders waiting for delivery partners</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 cursor-pointer transition-colors duration-200 ${
                        selectedOrder?.id === order.id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">#{order.orderNumber}</p>
                          <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">₹{order.totalAmount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{order.itemCount} items</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-700">
                          <FontAwesomeIcon icon={faUser} className="text-slate-500 mr-2 w-4" />
                          {order.buyerName}
                        </p>
                        <p className="text-slate-600 text-xs">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-500 mr-2 w-4" />
                          {order.deliveryAddress?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Delivery Partners & Assignment */}
          <div className="space-y-6">
            {/* Selected Order Details */}
            {selectedOrder && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBox} />
                  Order Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600">Order ID</p>
                    <p className="font-semibold text-slate-800">#{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Customer</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Address</p>
                    <p className="text-slate-700 text-xs">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Amount</p>
                    <p className="font-semibold text-slate-800">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Partners */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruck} />
                  Available Partners
                </h3>
              </div>

              {deliveryPartners.length === 0 ? (
                <div className="p-6 text-center text-slate-600">
                  <p>No approved delivery partners available</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {deliveryPartners.map(partner => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedPartner(partner.id)}
                      className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                        selectedPartner === partner.id
                          ? 'bg-emerald-50 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">{partner.fullName}</p>
                          <p className="text-xs text-slate-500">{partner.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <FontAwesomeIcon icon={faNotesMedical} className="text-yellow-500 text-xs" />
                            <span className="font-semibold text-slate-800">{partner.averageRating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-slate-500">{partner.totalDeliveries} deliveries</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">Store: {partner.selectedStore?.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign Button */}
            <button
              onClick={handleAssignOrder}
              disabled={!selectedOrder || !selectedPartner || assigning}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                selectedOrder && selectedPartner && !assigning
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg active:scale-95'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {assigning ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowRight} />
                  Assign Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
