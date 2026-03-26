'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const CancelOrderModal = ({ order, onClose, onCancelSuccess }) => {
    const [mounted, setMounted] = useState(typeof window !== 'undefined')
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    
    const { getToken } = useAuth()

    const buyerReasons = [
        { value: 'CHANGED_MIND', label: 'Changed my mind' },
        { value: 'FOUND_CHEAPER', label: 'Found cheaper elsewhere' },
        { value: 'DONT_NEED_ANYMORE', label: "Don't need it anymore" },
        { value: 'DELIVERY_LATE', label: 'Delivery taking too long' },
        { value: 'OTHER_REASON', label: 'Other reason' }
    ]

    const handleCancel = async () => {
        if (!reason) {
            toast.error('Please select a reason')
            return
        }

        if (!description.trim()) {
            toast.error('Please provide a description')
            return
        }

        setLoading(true)
        try {
            const token = await getToken()
            await axios.post(
                '/api/orders/cancel',
                {
                    orderId: order.id,
                    reason,
                    description,
                    cancelledBy: 'buyer'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            toast.success('Order cancelled successfully')
            onCancelSuccess()
            onClose()
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to cancel order')
        } finally {
            setLoading(false)
        }
    }

    const modalContent = (
        <div onClick={onClose} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl p-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Cancel Order</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-red-700 p-1 rounded-full transition-all duration-200"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Order ID */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium">Order ID</p>
                        <p className="text-sm font-semibold text-red-700">{order.id}</p>
                    </div>

                    {/* Reason Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Reason for cancellation <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-700 font-medium transition-all"
                        >
                            <option value="">-- Select a reason --</option>
                            {buyerReasons.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please tell us why you want to cancel this order..."
                            maxLength={500}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none font-medium text-slate-700 placeholder-slate-400 transition-all"
                            rows={4}
                        />
                        <p className="text-xs text-slate-500 mt-1">{description.length}/500</p>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                            <span className="font-semibold">Note:</span> Once cancelled, this order cannot be restored. The seller will be notified of your cancellation reason.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 rounded-b-2xl flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 btn-animate transition-all duration-300 disabled:opacity-50"
                    >
                        Keep Order
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg btn-animate transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                </div>
            </div>
        </div>
    )

    if (!mounted) return null
    return createPortal(modalContent, document.body)
}

export default CancelOrderModal
