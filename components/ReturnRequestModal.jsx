'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'

const RETURN_REASONS = [
    { value: 'WRONG_SIZE', label: 'Wrong Size' },
    { value: 'NOT_AS_DESCRIBED', label: 'Not as Described' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'POOR_QUALITY', label: 'Poor Quality' },
    { value: 'CHANGED_MIND', label: 'Changed Mind' },
]

export default function ReturnRequestModal({ isOpen, onClose, orderItem, onSuccess }) {
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')
    const [selectedSize, setSelectedSize] = useState('')
    const [replacementSize, setReplacementSize] = useState('')
    const [returnType, setReturnType] = useState('return')
    const [loading, setLoading] = useState(false)

    const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXXL']

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!reason || !description) {
            return toast.error('Please fill all fields')
        }

        if (returnType === 'exchange' && !replacementSize) {
            return toast.error('Please select replacement size')
        }

        setLoading(true)

        // TODO: Send to API
        toast.success(`${returnType === 'return' ? 'Return' : 'Exchange'} request submitted successfully`)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Return/Exchange</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Return Type Selection */}
                    {orderItem?.product?.isClothing && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Return Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setReturnType('return')}
                                    className={`p-2 rounded-lg border-2 transition-all ${
                                        returnType === 'return'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <p className="font-medium text-sm">Return</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReturnType('exchange')}
                                    className={`p-2 rounded-lg border-2 transition-all ${
                                        returnType === 'exchange'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <p className="font-medium text-sm">Exchange</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Current Size Display */}
                    {orderItem?.selectedSize && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-600 mb-1">Current Size</p>
                            <p className="font-semibold text-slate-800">Size {orderItem.selectedSize}</p>
                        </div>
                    )}

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Return Reason</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 outline-none"
                        >
                            <option value="">Select a reason</option>
                            {RETURN_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                            placeholder="Please describe the issue..."
                            rows={3}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 outline-none resize-none"
                        />
                        <p className="text-xs text-slate-500">{description.length}/500</p>
                    </div>

                    {/* Replacement Size for Exchange */}
                    {returnType === 'exchange' && orderItem?.product?.isClothing && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Replacement Size</label>
                            <select
                                value={replacementSize}
                                onChange={(e) => setReplacementSize(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 outline-none"
                            >
                                <option value="">Select size</option>
                                {CLOTHING_SIZES.map((size) => (
                                    <option key={size} value={size}>Size {size}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
