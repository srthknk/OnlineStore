'use client'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faTruck, faBox, faCheckCircle, faClock, faMapMarkerAlt, faCalendarDays, faUser, faPhone } from '@fortawesome/free-solid-svg-icons'

const TrackingModal = ({ order, onClose }) => {
    const [mounted, setMounted] = useState(false)

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

    // Format date
    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'ORDER_PLACED': 'bg-blue-100 text-blue-800',
            'PROCESSING': 'bg-yellow-100 text-yellow-800',
            'SHIPPED': 'bg-orange-100 text-orange-800',
            'DELIVERED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
        }
        return colors[status] || 'bg-blue-100 text-blue-800'
    }

    // Get status icon
    const getStatusIcon = (status) => {
        const icons = {
            'ORDER_PLACED': faBox,
            'PROCESSING': faClock,
            'SHIPPED': faTruck,
            'DELIVERED': faCheckCircle,
            'CANCELLED': faXmark,
        }
        return icons[status] || faBox
    }

    // Format status text
    const formatStatus = (status) => {
        if (!status) return '-'
        return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    }

    // Define status order
    const statusOrder = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    
    // Check if a status has been completed
    const isStatusCompleted = (statusToCheck) => {
        // If order is cancelled, only ORDER_PLACED is completed
        if (order.status === 'CANCELLED') {
            return statusToCheck === 'ORDER_PLACED'
        }
        
        const currentStatusIndex = statusOrder.indexOf(order.status)
        const checkStatusIndex = statusOrder.indexOf(statusToCheck)
        
        // Status is completed if it's before or equal to current status
        return checkStatusIndex <= currentStatusIndex
    }

    // Get date for timeline event
    const getEventDate = (event) => {
        if (event.status === 'ORDER_PLACED') return order.createdAt
        if (event.status === 'PROCESSING') return order.createdAt
        if (event.status === 'SHIPPED') return order.deliveryStartedAt
        if (event.status === 'DELIVERED') return order.deliveryCompletedAt
        return null
    }

    // Timeline events - only show relevant statuses for current order
    const timelineEvents = [
        { status: 'ORDER_PLACED', label: 'Order Placed' },
        { status: 'PROCESSING', label: 'Processing' },
        { status: 'SHIPPED', label: 'Shipped' },
        { status: 'DELIVERED', label: 'Delivered' }
    ]

    const modalContent = (
        <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
        >
            <div 
                onClick={e => e.stopPropagation()} 
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Order Tracking</h2>
                            <p className="text-blue-100">Order #{ order.id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Current Status */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-full ${getStatusColor(order.status)}`}>
                                <FontAwesomeIcon icon={getStatusIcon(order.status)} className="text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Current Status</p>
                                <p className="text-2xl font-bold text-gray-900">{formatStatus(order.status)}</p>
                                <p className="text-sm text-gray-500 mt-1">{formatDate(order.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Shipment Journey</h3>
                        <div className="space-y-4">
                            {timelineEvents.map((event, index) => {
                                const isCompleted = isStatusCompleted(event.status)
                                const eventDate = getEventDate(event)
                                return (
                                <div key={index} className="flex gap-4">
                                    {/* Timeline Line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <FontAwesomeIcon icon={getStatusIcon(event.status)} />
                                        </div>
                                        {index < timelineEvents.length - 1 && (
                                            <div className={`w-0.5 h-16 ${
                                                isCompleted ? 'bg-green-300' : 'bg-gray-200'
                                            }`}></div>
                                        )}
                                    </div>
                                    
                                    {/* Event Info */}
                                    <div className="pt-2 pb-4">
                                        <p className="font-semibold text-gray-900">{event.label}</p>
                                        <p className="text-sm text-gray-600">
                                            {eventDate ? formatDate(eventDate) : (isCompleted ? 'Completed' : 'Pending')}
                                        </p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Delivery Details */}
                    {order.deliveryPartner && (
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Delivery Partner</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Name</p>
                                    <p className="font-semibold text-gray-900">
                                        {order.deliveryPartner.firstName} {order.deliveryPartner.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                                    <p className="font-semibold text-gray-900">
                                        ⭐ {order.deliveryPartner.averageRating?.toFixed(1) || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                        Contact
                                    </p>
                                    <p className="font-semibold text-gray-900">{order.deliveryPartner.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Deliveries</p>
                                    <p className="font-semibold text-gray-900">{order.deliveryPartner.totalDeliveries}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Address */}
                    {order.address && (
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-medium">{order.address?.address}</p>
                                <p>{order.address?.city}, {order.address?.state} {order.address?.pin}</p>
                            </div>
                        </div>
                    )}

                    {/* Order Info */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1">Order Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Total Amount</p>
                                <p className="font-semibold text-gray-900">₹{order.total?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Items</p>
                                <p className="font-semibold text-gray-900">{order.orderItems?.length || 0} items</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Payment Status</p>
                                <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                    {order.isPaid ? 'Paid' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 flex-shrink-0 bg-gray-50 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )

    if (!mounted) return null

    return createPortal(modalContent, document.body)
}

export default TrackingModal
