'use client'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBox, faTruck, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons'

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

    // Timeline statuses in order
    const timelineSteps = [
        { status: 'ORDER_PLACED', label: 'Order Placed', icon: faBox, description: 'Your order has been confirmed' },
        { status: 'PROCESSING', label: 'Processing', icon: faClock, description: 'We\'re preparing your order' },
        { status: 'SHIPPED', label: 'Shipped', icon: faTruck, description: 'Your order is on the way' },
        { status: 'DELIVERED', label: 'Delivered', icon: faCheckCircle, description: 'Order delivered successfully' }
    ]

    // Get current step index
    const currentStepIndex = timelineSteps.findIndex(step => step.status === order.status)

    // Check if status is completed
    const isCompleted = (stepStatus) => {
        const stepIndex = timelineSteps.findIndex(step => step.status === stepStatus)
        return stepIndex <= currentStepIndex
    }

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
                <div className="bg-black text-white p-6 rounded-t-lg flex-shrink-0 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold">Track Order</h2>
                            <p className="text-gray-400 text-xs mt-1 font-mono">ID: {order.id}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors">
                            <FontAwesomeIcon icon={faXmark} className="text-lg" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Order Cancelled Notice */}
                    {order.isCancelled && (
                        <div className="bg-gray-100 border-l-4 border-gray-800 rounded p-4 mb-6">
                            <p className="text-gray-900 font-semibold text-sm">Order Cancelled</p>
                            <p className="text-gray-600 text-xs mt-1">Cancelled by {order.cancelledBy === 'buyer' ? 'you' : 'seller'}</p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-5">
                        {timelineSteps.map((step, index) => {
                            const StepIcon = step.icon
                            const completed = isCompleted(step.status)
                            const isCurrent = step.status === order.status

                            return (
                                <div key={step.status} className="flex gap-4">
                                    {/* Icon */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                                            completed 
                                                ? 'bg-black text-white' 
                                                : isCurrent
                                                ? 'bg-gray-300 text-black'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <FontAwesomeIcon icon={StepIcon} />
                                        </div>
                                        {index < timelineSteps.length - 1 && (
                                            <div className={`w-0.5 h-12 mt-1 ${
                                                completed ? 'bg-black' : 'bg-gray-200'
                                            }`}></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pt-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-semibold transition-colors ${
                                                completed ? 'text-black' : isCurrent ? 'text-black' : 'text-gray-400'
                                            }`}>
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <span className="text-xs bg-black text-white px-2 py-0.5 rounded animate-pulse">Active</span>
                                            )}
                                        </div>
                                        <p className={`text-xs mt-0.5 ${
                                            completed ? 'text-gray-700' : isCurrent ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Order Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-gray-500 font-semibold mb-1">Order Date</p>
                                <p className="text-gray-900 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-semibold mb-1">Payment Status</p>
                                <p className={`text-sm font-semibold ${order.isPaid ? 'text-black' : 'text-gray-500'}`}>
                                    {order.isPaid ? 'Paid' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-gray-900 transition-colors"
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
