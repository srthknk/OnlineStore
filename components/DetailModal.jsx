'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faMapPin, faPhone, faBox, faReceipt } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import InvoiceModal from './InvoiceModal'

const DetailModal = ({ order, onClose }) => {
    const [mounted, setMounted] = useState(false)
    const [invoice, setInvoice] = useState(null)
    const [showInvoice, setShowInvoice] = useState(false)
    const [loadingInvoice, setLoadingInvoice] = useState(false)
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    useEffect(() => {
        setMounted(true)
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
        
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        
        document.addEventListener('keydown', handleEscapeKey)
        
        return () => {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [onClose])

    // Generate invoice
    const handleGenerateInvoice = async () => {
        try {
            setLoadingInvoice(true)
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId: order.id })
            })

            if (!response.ok) {
                throw new Error('Failed to generate invoice')
            }

            const data = await response.json()
            if (data.success) {
                setInvoice(data.data)
                setShowInvoice(true)
                toast.success('Invoice generated successfully!')
            }
        } catch (error) {
            console.error('Invoice error:', error)
            toast.error(error.message || 'Failed to generate invoice')
        } finally {
            setLoadingInvoice(false)
        }
    }

    const modalContent = (
        <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
        >
            <div 
                onClick={e => e.stopPropagation()} 
                className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-black text-white p-6 rounded-t-lg flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold">Order Details</h2>
                            <p className="text-gray-400 text-xs mt-1 font-mono">ID: {order.id}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors">
                            <FontAwesomeIcon icon={faXmark} className="text-lg" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Delivery Address */}
                    <div className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapPin} className="w-4 h-4" />
                            Delivery Address
                        </h3>
                        
                        <div className="space-y-3 bg-gray-50 rounded p-4">
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">Address Name</p>
                                <p className="text-sm text-black font-semibold">{order.address.name || order.address.street || 'N/A'}</p>
                            </div>
                            
                            {/* House/Building Info */}
                            {(order.address.house || order.address.street) && (
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">House/Building</p>
                                    <p className="text-sm text-black">{order.address.house || order.address.street || 'N/A'}</p>
                                </div>
                            )}

                            {/* Area/Street Info */}
                            {order.address.area && (
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Area/Street</p>
                                    <p className="text-sm text-black">{order.address.area}</p>
                                </div>
                            )}

                            {/* Landmark */}
                            {order.address.landmark && (
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">📍 Landmark</p>
                                    <p className="text-sm text-black">{order.address.landmark}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                                {/* City */}
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">City</p>
                                    <p className="text-sm text-black">{order.address.city || 'N/A'}</p>
                                </div>

                                {/* District - Fallback to State if not available */}
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">District</p>
                                    <p className="text-sm text-black">{order.address.district || order.address.state || 'N/A'}</p>
                                </div>

                                {/* State */}
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">State</p>
                                    <p className="text-sm text-black">{order.address.state || 'N/A'}</p>
                                </div>

                                {/* PIN Code - Handle both pin and zip */}
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">PIN Code</p>
                                    <p className="text-sm text-black">{order.address.pin || order.address.zip || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3 space-y-2">
                                <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                                    Contact Details
                                </p>
                                {order.address.email && (
                                    <p className="text-sm text-black"><span className="font-semibold">Email:</span> {order.address.email}</p>
                                )}
                                <p className="text-sm font-semibold text-black">{order.address.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBox} className="w-4 h-4" />
                            Items ({order.orderItems.length})
                        </h3>
                        
                        <div className="space-y-3">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                                    {/* Image */}
                                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            width={64}
                                            height={64}
                                            className="h-14 w-auto"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-black truncate">{item.product.name}</p>
                                        {item.selectedVariant && (
                                            <p className="text-xs text-gray-600 mt-0.5">{item.selectedVariant}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="text-gray-600">Qty: <span className="font-semibold text-black">{item.quantity}</span></span>
                                            <span className="text-gray-600">Price: <span className="font-semibold text-black">{currency}{item.price}</span></span>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-bold text-black">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faReceipt} className="w-4 h-4" />
                            Summary
                        </h3>
                        
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold text-black">{currency}{(order.total - (order.deliveryCharges || 0)).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Delivery</span>
                                <span className={`font-semibold ${order.deliveryCharges === 0 ? 'text-black' : 'text-black'}`}>
                                    {order.deliveryCharges === 0 ? 'FREE' : `${currency}${order.deliveryCharges?.toFixed(2) || '0.00'}`}
                                </span>
                            </div>

                            {order.isCouponUsed && (
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Discount ({order.coupon?.code})</span>
                                    <span className="font-semibold text-black">-{currency}{(((order.total - (order.deliveryCharges || 0)) + (order.deliveryCharges || 0)) * (order.coupon?.discount / 100)).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between py-2 bg-gray-100 px-3 rounded font-semibold">
                                <span className="text-black">Total</span>
                                <span className="text-black">{currency}{order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status</span>
                                <span className="font-semibold text-black">{order.isPaid ? 'Paid' : 'Pending'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method</span>
                                <span className="font-semibold text-black">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Stripe'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg flex-shrink-0 flex gap-3">
                    <button
                        onClick={handleGenerateInvoice}
                        disabled={loadingInvoice}
                        className="flex-1 py-2.5 bg-black text-white text-xs font-semibold rounded hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faReceipt} className="mr-1" />
                        {loadingInvoice ? 'Generating...' : 'Invoice'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-300 text-black text-xs font-semibold rounded hover:bg-gray-400 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )

    if (!mounted) return null

    return (
        <>
            {createPortal(modalContent, document.body)}
            {showInvoice && invoice && (
                <InvoiceModal
                    invoice={invoice}
                    onClose={() => setShowInvoice(false)}
                    storeName={order?.store?.storeName || 'Store'}
                    websiteName="E-Commerce Shop"
                    autoDownload={true}
                />
            )}
        </>
    )
}

export default DetailModal
