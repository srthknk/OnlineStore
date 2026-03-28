'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruck, faSave, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

export default function OrderSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        minimumAmountForFreeDelivery: 500,
        deliveryCharges: 50,
        freeDeliveryMessage: "Yay! You unlocked free delivery"
    })

    // Fetch current settings
    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/order-settings')
            if (data.success) {
                setSettings(data.data)
            }
        } catch (error) {
            console.error(error)
            // Show warning but still load defaults
            toast.error('Failed to load from database. Using default settings.')
            setSettings({
                minimumAmountForFreeDelivery: 500,
                deliveryCharges: 50,
                freeDeliveryMessage: "Yay! You unlocked free delivery"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: field === 'freeDeliveryMessage' ? value : parseFloat(value) || 0
        }))
    }

    const handleSave = async () => {
        // Validate inputs
        if (settings.minimumAmountForFreeDelivery < 0) {
            toast.error('Minimum amount must be positive')
            return
        }

        if (settings.deliveryCharges < 0) {
            toast.error('Delivery charges must be positive')
            return
        }

        if (settings.freeDeliveryMessage.trim().length === 0) {
            toast.error('Free delivery message cannot be empty')
            return
        }

        try {
            setSaving(true)
            const { data } = await axios.put('/api/order-settings', settings)
            if (data.success) {
                toast.success('Order settings updated successfully!')
                setSettings(data.data)
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message;
            console.error('Save error:', error)
            
            // Check if it's a database migration issue
            if (errorMessage?.includes('table') || errorMessage?.includes('migration') || errorMessage?.includes('exist')) {
                toast.error('Database table not found. Please run: npx prisma migrate dev')
            } else {
                toast.error(errorMessage || 'Failed to save settings')
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faTruck} className="text-3xl text-indigo-600" />
                    <h1 className="text-3xl font-bold text-slate-800">Order Settings</h1>
                </div>
                <p className="text-slate-600">Manage delivery charges and free delivery threshold</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-sm">
                {/* Info Section */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-blue-900 font-semibold text-sm">How it works:</p>
                        <p className="text-blue-800 text-sm mt-1">When a customer's cart subtotal reaches or exceeds the minimum amount for free delivery, they will see your custom message and no delivery charges will be applied.</p>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="space-y-8">
                    {/* Minimum Amount for Free Delivery */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Minimum Amount for Free Delivery
                        </label>
                        <p className="text-xs text-slate-600 mb-3">
                            Customers who spend this amount or more will get free delivery
                        </p>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-slate-600 font-medium text-lg">
                                {currency}
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="10"
                                value={settings.minimumAmountForFreeDelivery}
                                onChange={(e) => handleInputChange('minimumAmountForFreeDelivery', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="500"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Current threshold: {currency}{settings.minimumAmountForFreeDelivery}
                        </p>
                    </div>

                    {/* Delivery Charges */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Delivery Charges
                        </label>
                        <p className="text-xs text-slate-600 mb-3">
                            Amount to charge for delivery when order is below minimum amount
                        </p>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-slate-600 font-medium text-lg">
                                {currency}
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="5"
                                value={settings.deliveryCharges}
                                onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="50"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Current charge: {currency}{settings.deliveryCharges}
                        </p>
                    </div>

                    {/* Free Delivery Message */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Free Delivery Notification Message
                        </label>
                        <p className="text-xs text-slate-600 mb-3">
                            This message will be shown to customers when they unlock free delivery
                        </p>
                        <textarea
                            rows="4"
                            value={settings.freeDeliveryMessage}
                            onChange={(e) => handleInputChange('freeDeliveryMessage', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                            placeholder="Enter your custom message here..."
                        />
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <span>Preview:</span>
                            <span className="text-sm font-medium text-slate-700">"{settings.freeDeliveryMessage}"</span>
                        </p>
                    </div>
                </div>

                {/* Example Preview */}
                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm font-semibold text-slate-700 mb-4">Example:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded">
                            <p className="text-xs text-slate-500 font-semibold mb-2">Order Below Threshold</p>
                            <p className="text-sm text-slate-700 mb-3">Subtotal: {currency}400</p>
                            <p className="text-sm text-slate-700 flex justify-between items-center">
                                Delivery Charges: <span className="font-semibold text-red-600">{currency}{settings.deliveryCharges}</span>
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                            <p className="text-xs text-slate-500 font-semibold mb-2">Order Meets Threshold</p>
                            <p className="text-sm text-slate-700 mb-3">Subtotal: {currency}500+</p>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faTruck} className="text-green-600" />
                                <p className="text-sm font-semibold text-green-700">{settings.freeDeliveryMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={fetchSettings}
                        disabled={saving}
                        className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    )
}
