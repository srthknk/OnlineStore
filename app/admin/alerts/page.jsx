'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'

const ALERT_TYPES = ['INFO', 'WARNING', 'PROMOTION', 'URGENT']
const BG_COLORS = [
    'from-emerald-600 to-green-600',
    'from-blue-600 to-cyan-600',
    'from-red-600 to-pink-600',
    'from-yellow-500 to-orange-600',
    'from-purple-600 to-pink-600'
]

export default function AdminAlerts() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'INFO',
        bgColor: 'from-emerald-600 to-green-600',
        textColor: 'text-white',
        icon: '📢',
        priority: 1,
        expiresAt: '',
        isActive: true
    })

    useEffect(() => {
        fetchAlerts()
    }, [])

    const fetchAlerts = async () => {
        try {
            setLoading(true)
            setError(null)
            const { data } = await axios.get('/api/admin/alerts')
            console.log('✅ Alerts fetched:', data)
            setAlerts(data.alerts || [])
        } catch (error) {
            console.error('❌ Error fetching alerts:', error)
            const errorMsg = error?.response?.data?.message || error.message || 'Failed to fetch alerts'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            if (editingId) {
                await axios.put(`/api/admin/alerts/${editingId}`, formData)
                toast.success('Alert updated successfully')
            } else {
                await axios.post('/api/admin/alerts', formData)
                toast.success('Alert created successfully')
            }
            
            setFormData({
                title: '',
                message: '',
                type: 'INFO',
                bgColor: 'from-emerald-600 to-green-600',
                textColor: 'text-white',
                icon: '📢',
                priority: 1,
                expiresAt: '',
                isActive: true
            })
            setEditingId(null)
            setShowForm(false)
            fetchAlerts()
        } catch (error) {
            console.error('Error saving alert:', error)
            toast.error('Failed to save alert')
        }
    }

    const handleEdit = (alert) => {
        setFormData({
            title: alert.title,
            message: alert.message,
            type: alert.type,
            bgColor: alert.bgColor,
            textColor: alert.textColor,
            icon: alert.icon || '📢',
            priority: alert.priority,
            expiresAt: alert.expiresAt ? new Date(alert.expiresAt).toISOString().split('T')[0] : '',
            isActive: alert.isActive
        })
        setEditingId(alert.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this alert?')) return

        try {
            await axios.delete(`/api/admin/alerts/${id}`)
            toast.success('Alert deleted successfully')
            fetchAlerts()
        } catch (error) {
            console.error('Error deleting alert:', error)
            toast.error('Failed to delete alert')
        }
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            title: '',
            message: '',
            type: 'INFO',
            bgColor: 'from-emerald-600 to-green-600',
            textColor: 'text-white',
            icon: '📢',
            priority: 1,
            expiresAt: '',
            isActive: true
        })
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Alert Notifications</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Create Alert
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingId ? 'Edit Alert' : 'Create New Alert'}
                            </h2>
                            <button
                                onClick={handleCloseForm}
                                className="text-slate-500 hover:text-slate-800"
                            >
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., 500 Rs Off Today"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="e.g., Use code SAVE500 for 500 rs discount on all products"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    rows="3" 
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Alert Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {ALERT_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        min="1"
                                        max="100"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Background Color
                                    </label>
                                    <select
                                        value={formData.bgColor}
                                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {BG_COLORS.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Icon (Emoji)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        maxLength="2"
                                        placeholder="📢"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Expires At (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                                >
                                    {editingId ? 'Update Alert' : 'Create Alert'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="flex-1 px-6 py-2 bg-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Alerts List */}
            {loading ? (
                <div className="text-center py-8"><p className="text-slate-600">Loading alerts...</p></div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700 font-semibold">❌ Error Loading Alerts</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <button
                        onClick={fetchAlerts}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                        Retry
                    </button>
                </div>
            ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-600">No alerts created yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert.id} className={`p-4 border-2 border-slate-200 rounded-lg bg-gradient-to-r ${alert.bgColor}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className={`font-bold text-sm ${alert.textColor} flex items-center gap-2`}>
                                        {alert.icon && <span>{alert.icon}</span>}
                                        <span>{alert.title}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${alert.type === 'URGENT' ? 'bg-red-500' : alert.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'} text-white opacity-80`}>
                                            {alert.type}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 ${alert.textColor} opacity-90`}>{alert.message}</p>
                                    <div className={`text-xs mt-2 ${alert.textColor} opacity-75`}>
                                        Priority: {alert.priority} | Status: {alert.isActive ? '✅ Active' : '❌ Inactive'}
                                        {alert.expiresAt && ` | Expires: ${new Date(alert.expiresAt).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(alert)}
                                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className={alert.textColor} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(alert.id)}
                                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className={alert.textColor} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
