'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faPlus, faTrash, faChevronDown, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const announcementTypeStyles = {
    NORMAL: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: 'text-blue-600' },
    URGENT: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', icon: 'text-orange-600' },
    HIGHLY_URGENT: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: 'text-red-600' }
};

export default function AdminAnnouncementsTab() {
    const { getToken } = useAuth()
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [expandedId, setExpandedId] = useState(null)
    const [filter, setFilter] = useState('ACTIVE')

    useEffect(() => {
        fetchAnnouncements()
    }, [filter])

    const fetchAnnouncements = async () => {
        setLoading(true)
        try {
            const token = await getToken()
            const { data } = await axios.get(
                `/api/admin/announcements?status=${filter}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setAnnouncements(data.data)
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch announcements')
        }
        setLoading(false)
    }

    const deleteAnnouncement = async (id) => {
        if (!window.confirm('Archive this announcement?')) return

        try {
            const token = await getToken()
            await axios.delete(`/api/admin/announcements?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Announcement archived')
            await fetchAnnouncements()
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to delete')
        }
    }

    return (
        <div className="text-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Announcements</h2>
                    <p className="text-sm text-slate-600 mt-1">Create and manage announcements for stores</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    New Announcement
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['ACTIVE', 'ARCHIVED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        {status === 'ACTIVE' ? 'Active' : 'Archived'}
                    </button>
                ))}
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : announcements.length > 0 ? (
                <div className="space-y-3">
                    {announcements.map((ann) => {
                        const typeStyle = announcementTypeStyles[ann.type]
                        const isExpanded = expandedId === ann.id

                        return (
                            <div
                                key={ann.id}
                                className={`border-l-4 rounded-lg overflow-hidden transition-all ${typeStyle.border}`}
                                style={{ borderLeftColor: ann.type === 'HIGHLY_URGENT' ? '#dc2626' : ann.type === 'URGENT' ? '#ea580c' : '#2563eb' }}
                            >
                                <div className={`${typeStyle.bg} p-4`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeStyle.badge}`}>
                                                    {ann.type.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-slate-600">
                                                    {new Date(ann.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800">{ann.title}</h3>
                                        </div>
                                        <button
                                            onClick={() => deleteAnnouncement(ann.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>

                                    {/* Stores Count */}
                                    <div className="text-sm text-slate-600 mb-3">
                                        Sent to {ann.storeCount} store{ann.storeCount !== 1 ? 's' : ''} • {ann.stores.reduce((sum, s) => sum + s.readCount, 0)} read
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                                    >
                                        {isExpanded ? 'Hide Details' : 'Show Details'}
                                        <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-slate-300 p-4 bg-white">
                                        {/* Content Preview */}
                                        <div className="mb-4 pb-4 border-b border-slate-200">
                                            <p className="text-sm text-slate-600 font-medium mb-2">Content:</p>
                                            <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 whitespace-pre-wrap break-words font-mono text-xs max-h-32 overflow-y-auto">
                                                {ann.content}
                                            </div>
                                        </div>

                                        {/* Recipient Stores */}
                                        <div>
                                            <p className="text-sm text-slate-600 font-medium mb-2">Recipient Stores:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {ann.stores.map(store => (
                                                    <div key={store.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                                                        {store.logo && (
                                                            <img
                                                                src={store.logo}
                                                                alt={store.name}
                                                                className="w-8 h-8 rounded object-contain"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-800 truncate">{store.name}</p>
                                                            <p className="text-xs text-slate-600">@{store.username}</p>
                                                        </div>
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                                                            {store.readCount} read
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <FontAwesomeIcon icon={faBell} className="text-4xl text-slate-300 mb-3" />
                    <p className="text-slate-600">No announcements yet</p>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateAnnouncementModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        fetchAnnouncements()
                    }}
                />
            )}
        </div>
    )
}

function CreateAnnouncementModal({ isOpen, onClose, onSuccess }) {
    const { getToken } = useAuth()
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'NORMAL',
        storeIds: []
    })

    useEffect(() => {
        if (isOpen) fetchStores()
    }, [isOpen])

    const fetchStores = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/stores', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStores(data.stores)
        } catch (error) {
            toast.error('Failed to fetch stores')
        }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('Title is required')
            return
        }
        if (!formData.content.trim()) {
            toast.error('Content is required')
            return
        }
        if (formData.storeIds.length === 0) {
            toast.error('Select at least one store')
            return
        }

        setSubmitting(true)
        try {
            const token = await getToken()
            await axios.post('/api/admin/announcements', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Announcement created successfully')
            onSuccess()
            setFormData({ title: '', content: '', type: 'NORMAL', storeIds: [] })
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to create announcement')
        }
        setSubmitting(false)
    }

    if (!isOpen) return null

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-slate-800">Create Announcement</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter announcement title"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NORMAL">Normal</option>
                            <option value="URGENT">Urgent</option>
                            <option value="HIGHLY_URGENT">Highly Urgent</option>
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your announcement here. Formatting and spaces will be preserved."
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm whitespace-pre-wrap"
                        />
                    </div>

                    {/* Stores Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Stores</label>
                        {loading ? (
                            <div className="text-center py-4 text-slate-600">Loading stores...</div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-slate-50">
                                {stores.length > 0 ? (
                                    stores.map(store => (
                                        <label key={store.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.storeIds.includes(store.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            storeIds: [...formData.storeIds, store.id]
                                                        })
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            storeIds: formData.storeIds.filter(id => id !== store.id)
                                                        })
                                                    }
                                                }}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                            <img src={store.logo} alt={store.name} className="w-6 h-6 rounded object-contain" />
                                            <span className="font-medium text-slate-800">{store.name}</span>
                                            <span className="text-xs text-slate-600">@{store.username}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-slate-600 text-center">No stores available</p>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-slate-600 mt-1">
                            {formData.storeIds.length} store{formData.storeIds.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faBell} />
                                    Send Announcement
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
