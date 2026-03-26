'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { orderDummyData } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import SellerCancelOrderModal from "@/components/SellerCancelOrderModal"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faList, faGears, faTruck, faCheckCircle, faBan, faBell, faUser, faBox, faCreditCard, faSackDollar, faTicket, faRotate } from "@fortawesome/free-solid-svg-icons"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)


    const { getToken } = useAuth()

    const fetchOrders = async () => {
       try {
        const token = await getToken()
        const { data } = await axios.get('/api/store/orders', {headers: { Authorization: `Bearer ${token}` }})
        setOrders(data.orders)
       } catch (error) {
        toast.error(error?.response?.data?.error || error.message)
       }finally{
        setLoading(false)
       }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = await getToken()
            await axios.post('/api/store/orders',{orderId, status}, {headers: { Authorization: `Bearer ${token}` }})
            setOrders(prev =>
                prev.map(order => 
                    order.id === orderId ? {...order, status} : order
                )
            )
            toast.success('Order status updated!')
       } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
       }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    // Calculate order statistics
    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => !o.isCancelled && o.status === 'ORDER_PLACED').length,
        processing: orders.filter(o => !o.isCancelled && o.status === 'PROCESSING').length,
        shipped: orders.filter(o => !o.isCancelled && o.status === 'SHIPPED').length,
        delivered: orders.filter(o => !o.isCancelled && o.status === 'DELIVERED').length,
        cancelled: orders.filter(o => o.isCancelled).length
    }

    const getStatusColor = (status, isCancelled) => {
        if (isCancelled) return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: faBan }
        switch(status) {
            case 'ORDER_PLACED': return { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: faList }
            case 'PROCESSING': return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: faGears }
            case 'SHIPPED': return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: faTruck }
            case 'DELIVERED': return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', icon: faCheckCircle }
            default: return { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', icon: faBox }
        }
    }

    return (
        <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-6">Store <span className="text-slate-800 font-medium">Orders</span></h1>
            
            {/* Order Statistics Badges */}
            {orders.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 text-center hover:shadow-md transition-shadow">
                        <p className="text-2xl sm:text-3xl font-bold text-slate-700">{orderStats.total}</p>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Total Orders</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 text-center hover:shadow-md transition-shadow">
                        <p className="text-2xl sm:text-3xl font-bold text-orange-700">{orderStats.pending}</p>
                        <p className="text-xs sm:text-sm text-orange-600 font-medium mt-1"><FontAwesomeIcon icon={faBell} className="mr-1" /> Pending</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 text-center hover:shadow-md transition-shadow">
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-700">{orderStats.processing}</p>
                        <p className="text-xs sm:text-sm text-yellow-600 font-medium mt-1"><FontAwesomeIcon icon={faGears} className="mr-1" /> Processing</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 text-center hover:shadow-md transition-shadow">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-700">{orderStats.shipped}</p>
                        <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1"><FontAwesomeIcon icon={faTruck} className="mr-1" /> Shipped</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 text-center hover:shadow-md transition-shadow">
                        <p className="text-2xl sm:text-3xl font-bold text-green-700">{orderStats.delivered}</p>
                        <p className="text-xs sm:text-sm text-green-600 font-medium mt-1"><FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Delivered</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200 text-center hover:shadow-md transition-shadow">
                        <p className="text-2xl sm:text-3xl font-bold text-red-700">{orderStats.cancelled}</p>
                        <p className="text-xs sm:text-sm text-red-600 font-medium mt-1"><FontAwesomeIcon icon={faBan} className="mr-1" /> Cancelled</p>
                    </div>
                </div>
            )}
            
            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No orders found</p>
                </div>
            ) : (
                <>
                    {/* Cards View - All Devices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {orders.map((order, index) => {
                            const colors = getStatusColor(order.status, order.isCancelled)
                            const orderId = order.id.substring(0, 8).toUpperCase()
                            return (
                            <div
                                key={order.id}
                                onClick={() => openModal(order)}
                                className={`border-2 rounded-xl p-5 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:scale-105 ${colors.bg} ${colors.border}`}
                            >
                                {/* Header with Status Badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <p className="text-xs font-mono text-slate-500 mb-1">Order ID: {orderId}</p>
                                        <p className="font-semibold text-slate-900 text-lg">{order.user?.name}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${colors.badge}`}>
                                        <FontAwesomeIcon icon={colors.icon} className="mr-1" /> {order.isCancelled ? 'CANCELLED' : order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="mb-4 pb-4 border-b-2 border-current border-opacity-10">
                                    <p className="text-3xl font-bold text-slate-900">₹{order.total?.toLocaleString()}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    <div>
                                        <p className="text-slate-600 text-xs font-medium">Payment</p>
                                        <p className="font-semibold text-slate-800">{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 text-xs font-medium">Paid</p>
                                        <p className={`font-semibold ${order.isPaid ? 'text-green-700' : 'text-red-700'}`}>
                                            {order.isPaid ? <><FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Yes</> : <><FontAwesomeIcon icon={faBan} className="mr-1" /> No</>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 text-xs font-medium">Items</p>
                                        <p className="font-semibold text-slate-800">{order.orderItems?.length || 0} item(s)</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 text-xs font-medium">Date</p>
                                        <p className="font-semibold text-slate-800 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Coupon Info */}
                                {order.isCouponUsed && (
                                    <div className="mb-4 p-2 bg-green-100 bg-opacity-50 rounded-lg text-xs">
                                        <p className="text-green-700 font-semibold"><FontAwesomeIcon icon={faTicket} className="mr-1" /> Coupon: {order.coupon?.code} ({order.coupon?.discount}% off)</p>
                                    </div>
                                )}

                                {/* Status Update */}
                                <div onClick={(e) => e.stopPropagation()} className="mt-4">
                                    {order.isCancelled ? (
                                        <div className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-red-200 text-red-800 text-center font-bold">
                                            <FontAwesomeIcon icon={faBan} className="mr-2" /> CANCELLED
                                        </div>
                                    ) : (
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer ${colors.badge}`}
                                        >
                                            <option value="ORDER_PLACED"><FontAwesomeIcon icon={faList} /> ORDER PLACED</option>
                                            <option value="PROCESSING"><FontAwesomeIcon icon={faGears} /> PROCESSING</option>
                                            <option value="SHIPPED"><FontAwesomeIcon icon={faTruck} /> SHIPPED</option>
                                            <option value="DELIVERED"><FontAwesomeIcon icon={faCheckCircle} /> DELIVERED</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                </>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 backdrop-blur-sm z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto p-4 sm:p-6 relative">
                        {/* Header with Order ID and Status */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-xs font-mono text-slate-500 mb-1">Order ID: {selectedOrder.id}</p>
                                <h2 className="text-lg sm:text-2xl font-semibold text-slate-900">
                                    Order Details
                                </h2>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                selectedOrder.isCancelled ? 'bg-red-100 text-red-700' :
                                selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                selectedOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                selectedOrder.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                                {selectedOrder.isCancelled ? <><FontAwesomeIcon icon={faBan} className="mr-2" /> CANCELLED</> : selectedOrder.status.replace(/_/g, ' ')}
                            </span>
                        </div>

                        {/* Customer Details */}
                        <div className="mb-6 pb-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="text-lg" /> Customer Details
                            </h3>
                            <div className="space-y-2 text-sm bg-slate-50 rounded-lg p-4">
                                <p><span className="text-green-700 font-medium">Name:</span> <span className="font-semibold">{selectedOrder.user?.name}</span></p>
                                <p><span className="text-green-700 font-medium">Email:</span> <span className="font-semibold">{selectedOrder.user?.email}</span></p>
                                <p><span className="text-green-700 font-medium">Phone:</span> <span className="font-semibold">{selectedOrder.address?.phone}</span></p>
                                <p className="break-words"><span className="text-green-700 font-medium">Address:</span> <span className="font-semibold text-xs sm:text-sm">{selectedOrder.address?.house && selectedOrder.address?.house + ', '}{selectedOrder.address?.area && selectedOrder.address?.area + ', '}{selectedOrder.address?.landmark && selectedOrder.address?.landmark + ', '}{selectedOrder.address?.city}, {selectedOrder.address?.district}, {selectedOrder.address?.state} - {selectedOrder.address?.pin}, {selectedOrder.address?.country}</span></p>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="mb-6 pb-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBox} className="text-lg" /> Products ({selectedOrder.orderItems?.length || 0})
                            </h3>
                            <div className="space-y-3">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex gap-3 border border-slate-100 rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <img
                                            src={item.product?.images?.[0]}
                                            alt={item.product?.name}
                                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 truncate text-sm">{item.product?.name}</p>
                                            {item.selectedVariant && (
                                                <p className="text-xs text-emerald-600 font-medium">Variant: {item.selectedVariant}</p>
                                            )}
                                            <p className="text-xs text-slate-600 mt-1">Qty: <span className="font-semibold">{item.quantity}</span></p>
                                            <p className="text-sm font-semibold text-slate-800">₹{item.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-6 space-y-3 text-sm pb-4 border-b border-slate-200 bg-slate-50 rounded-lg p-4">
                            <p><span className="text-green-700 font-medium"><FontAwesomeIcon icon={faCreditCard} className="mr-2" />Payment Method:</span> <span className="font-semibold">{selectedOrder.paymentMethod}</span></p>
                            <p><span className="text-green-700 font-medium"><FontAwesomeIcon icon={faSackDollar} className="mr-2" />Paid:</span> <span className={`font-semibold ${selectedOrder.isPaid ? 'text-green-600' : 'text-red-600'}`}>{selectedOrder.isPaid ? <><FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Yes</> : <><FontAwesomeIcon icon={faBan} className="mr-1" /> No</>}</span></p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700 font-medium"><FontAwesomeIcon icon={faTicket} className="mr-2" />Coupon:</span> <span className="font-semibold">{selectedOrder.coupon?.code} ({selectedOrder.coupon?.discount}% off)</span></p>
                            )}
                            <p><span className="text-green-700 font-medium">Order Status:</span> <span className="font-semibold">{selectedOrder.status.replace(/_/g, ' ')}</span></p>
                            <p><span className="text-green-700 font-medium">Order Date:</span> <span className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                            <div className="border-t border-slate-200 pt-3 mt-3 font-bold text-lg">
                                <p><span className="text-green-700">Total: </span>₹{selectedOrder.total?.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        {/* Cancellation Info */}
                        {selectedOrder.isCancelled && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-700 font-bold mb-2"><FontAwesomeIcon icon={faBan} className="mr-2" /> Order Cancelled</p>
                                <p className="text-red-600 text-sm"><span className="font-semibold">By:</span> {selectedOrder.cancelledBy === 'buyer' ? 'Customer' : 'You (Seller)'}</p>
                                {selectedOrder.cancellationReason && (
                                    <p className="text-red-600 text-sm mt-1"><span className="font-semibold">Reason:</span> {selectedOrder.cancellationReason.replace(/_/g, ' ')}</p>
                                )}
                                {selectedOrder.cancellationDescription && (
                                    <p className="text-red-600 text-sm mt-1"><span className="font-semibold">Message:</span> {selectedOrder.cancellationDescription}</p>
                                )}
                            </div>
                        )}

                        {/* Status Update - Only if not cancelled */}
                        {!selectedOrder.isCancelled && (
                            <div className="mb-6 pb-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faRotate} className="text-lg" /> Update Order Status
                                </h3>
                                <select
                                    value={selectedOrder.status}
                                    onChange={e => {
                                        updateOrderStatus(selectedOrder.id, e.target.value)
                                        setSelectedOrder({...selectedOrder, status: e.target.value})
                                    }}
                                    className={`w-full px-4 py-2 rounded-lg font-medium border-2 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all ${
                                        selectedOrder.status === 'DELIVERED' ? 'border-green-300 bg-green-50 text-green-700' :
                                        selectedOrder.status === 'SHIPPED' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                                        selectedOrder.status === 'PROCESSING' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                                        'border-orange-300 bg-orange-50 text-orange-700'
                                    }`}
                                >
                                    <option value="ORDER_PLACED"><FontAwesomeIcon icon={faList} /> ORDER PLACED</option>
                                    <option value="PROCESSING"><FontAwesomeIcon icon={faGears} /> PROCESSING</option>
                                    <option value="SHIPPED"><FontAwesomeIcon icon={faTruck} /> SHIPPED</option>
                                    <option value="DELIVERED"><FontAwesomeIcon icon={faCheckCircle} /> DELIVERED</option>
                                </select>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            {!selectedOrder.isCancelled && !['DELIVERED', 'SHIPPED'].includes(selectedOrder.status) && (
                                <button 
                                    onClick={() => { setCancelModalOpen(true); closeModal(); }}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 btn-animate font-medium transition-all duration-300"
                                >
                                    Cancel Order
                                </button>
                            )}
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 btn-animate btn-secondary font-medium transition-all duration-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cancelModalOpen && selectedOrder && (
                <SellerCancelOrderModal 
                    order={selectedOrder} 
                    onClose={() => setCancelModalOpen(false)}
                    onCancelSuccess={() => {
                        setOrders(prev =>
                            prev.map(order =>
                                order.id === selectedOrder.id ? {...order, isCancelled: true, status: 'CANCELLED'} : order
                            )
                        )
                        setSelectedOrder(null)
                        setIsModalOpen(false)
                    }}
                />
            )}
        </>
    )
}
