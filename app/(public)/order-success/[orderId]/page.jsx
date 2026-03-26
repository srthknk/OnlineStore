'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faBox, faMapPin, faPhone, faEnvelope, faArrowRight, faMobileAlt, faCreditCard, faWallet } from '@fortawesome/free-solid-svg-icons'

export default function OrderSuccessPage() {
    const router = useRouter()
    const params = useParams()
    const orderId = params.orderId
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (orderId) {
            fetchOrder()
        }
    }, [orderId])

    const fetchOrder = async () => {
        try {
            const { data } = await axios.get(`/api/orders/${orderId}`)
            setOrder(data.order)
        } catch (error) {
            toast.error('Failed to load order details')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-screen px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h1>
                    <p className="text-slate-600 mb-6">The order you're looking for doesn't exist.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Go Home <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Message */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-200 rounded-full blur animate-pulse"></div>
                            <div className="relative bg-white p-4 rounded-full">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 animate-bounce text-5xl" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Order Placed Successfully!</h1>
                    <p className="text-lg text-slate-600">Thank you for your purchase. Your order has been confirmed.</p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-200">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Order ID</p>
                            <p className="text-2xl font-bold text-slate-800 break-all">{order.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Payment Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-lg font-semibold text-green-600">Paid</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Order Date</p>
                            <p className="text-lg text-slate-800 font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Order Total</p>
                            <p className="text-2xl font-bold text-indigo-600">₹{Math.round(order.total)}</p>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-8 pb-8 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapPin} className="text-indigo-600 text-lg" />
                            Delivery Address
                        </h3>
                        {order.address && (
                            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                <p className="font-semibold text-slate-800">{order.address.name}</p>
                                <p className="text-slate-600">{order.address.street}</p>
                                <p className="text-slate-600">{order.address.city}, {order.address.state} {order.address.zip}</p>
                                <p className="text-slate-600">{order.address.country}</p>
                                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <FontAwesomeIcon icon={faPhone} className="text-sm" />
                                        {order.address.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                                        {order.address.email}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBox} className="text-indigo-600 text-lg" />
                            Order Items
                        </h3>
                        <div className="space-y-3">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800">{item.product?.name || 'Product'}</p>
                                        <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                                        {item.selectedSize && <p className="text-sm text-slate-600">Size: {item.selectedSize}</p>}
                                    </div>
                                    <p className="font-semibold text-slate-800">₹{Math.round(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                        <p className="font-semibold text-slate-800">
                            {order.paymentMethod === 'RAZORPAY_UPI'
                                ? <><FontAwesomeIcon icon={faMobileAlt} className="mr-2" /> UPI Payment</>
                                : order.paymentMethod === 'RAZORPAY_CARD'
                                ? <><FontAwesomeIcon icon={faCreditCard} className="mr-2" /> Card Payment</>
                                : order.paymentMethod === 'RAZORPAY_WALLET'
                                ? <><FontAwesomeIcon icon={faWallet} className="mr-2" /> Wallet Payment</>
                                : 'Online Payment'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/orders"
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/shop"
                        className="flex-1 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition text-center"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {/* Info Message */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <p className="font-semibold mb-1">Order Confirmation</p>
                    <p>You will receive an email confirmation shortly. The seller will start processing your order soon.</p>
                </div>
            </div>
        </div>
    )
}
