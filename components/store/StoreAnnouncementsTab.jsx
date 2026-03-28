'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCheckCircle, faEye, faTrash } from '@fortawesome/free-solid-svg-icons'

const typeStyles = {
    NORMAL: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
    URGENT: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' },
    HIGHLY_URGENT: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', badge: 'bg-red-100 text-red-800' }
};

export default function StoreAnnouncementsTab() {
    const { getToken } = useAuth()
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [filter, setFilter] = useState('unread')
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

    useEffect(() => {
        fetchAnnouncements()
        // Refresh every 30 seconds
        const interval = setInterval(fetchAnnouncements, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchAnnouncements = async () => {
        try {
            const token = await getToken()
            const includeRead = filter === 'all'
            const { data } = await axios.get(
                `/api/store/announcements?includeRead=${includeRead}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setAnnouncements(data.data)
            setUnreadCount(data.counts.unread)
        } catch (error) {
            console.error('Failed to fetch announcements', error)
        }
        setLoading(false)
    }

    const handleMarkAction = async (announcementStoreId, action) => {
        try {
            const token = await getToken()
            await axios.post(
                '/api/store/announcements',
                { announcementStoreId, action },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            toast.success(`Marked as ${action}`)
            // Switch to 'all' tab to show history with read announcements
            setFilter('all')
            setSelectedAnnouncement(null)
            // Fetch with includeRead=true
            const { data } = await axios.get(
                `/api/store/announcements?includeRead=true`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setAnnouncements(data.data)
            setUnreadCount(data.counts.unread)
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to update')
        }
    }

    return (
        <div className="text-slate-700">
            {/* Header with Badge */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FontAwesomeIcon icon={faBell} className="text-3xl text-blue-600" />
                        {unreadCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Announcements</h2>
                        <p className="text-sm text-slate-600">{unreadCount} new announcement{unreadCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => {
                        setFilter('unread')
                        setAnnouncements(announcements.filter(a => !a.isRead))
                    }}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'unread'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                    Unread
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => {
                        setFilter('all')
                        fetchAnnouncements()
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                    All
                </button>
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : announcements.length > 0 ? (
                <div className="space-y-3">
                    {announcements.map((ann) => {
                        const style = typeStyles[ann.type]
                        return (
                            <div
                                key={ann.id}
                                onClick={() => setSelectedAnnouncement(ann)}
                                className={`border-l-4 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${style.border} ${
                                    ann.isRead ? 'opacity-75' : ''
                                }`}
                                style={{ borderLeftColor: ann.type === 'HIGHLY_URGENT' ? '#dc2626' : ann.type === 'URGENT' ? '#ea580c' : '#2563eb' }}
                            >
                                <div className={`${style.bg} p-4`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${style.badge}`}>
                                                    {ann.type.replace('_', ' ')}
                                                </span>
                                                {!ann.isRead && (
                                                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                                )}
                                                <span className="text-xs text-slate-600">
                                                    Sent: {new Date(ann.createdAt).toLocaleDateString()} {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {ann.isRead && ann.readAt && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        • Read: {new Date(ann.readAt).toLocaleDateString()} {new Date(ann.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800">{ann.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
                                        </div>
                                        {ann.isRead && (
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1 ml-2" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <FontAwesomeIcon icon={faBell} className="text-4xl text-slate-300 mb-3" />
                    <p className="text-slate-600">
                        {filter === 'unread' ? 'No new announcements' : 'No announcements yet'}
                    </p>
                </div>
            )}

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <AnnouncementDetailModal
                    announcement={selectedAnnouncement}
                    onClose={() => setSelectedAnnouncement(null)}
                    onAction={(action) => handleMarkAction(selectedAnnouncement.id, action)}
                />
            )}
        </div>
    )
}

function AnnouncementDetailModal({ announcement, onClose, onAction }) {
    const style = typeStyles[announcement.type]

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`${style.bg} border-b ${style.border} px-6 py-5`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${style.badge}`}>
                                    {announcement.type.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-slate-600">
                                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{announcement.title}</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                        <div className="text-slate-700 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                            {announcement.content}
                        </div>
                    </div>

                    {/* Status Info */}
                    <div className="space-y-3 mb-6">
                        <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
                            <div className="text-sm mb-2">
                                <div className="font-semibold text-slate-700">Sent by Admin:</div>
                                <div className="text-slate-600">
                                    {new Date(announcement.createdAt).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        {announcement.isRead && announcement.readAt && (
                            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                                <div className="text-sm mb-2">
                                    <div className="font-semibold text-green-700 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        Marked as {announcement.readStatus || 'read'}:
                                    </div>
                                    <div className="text-green-600">
                                        {new Date(announcement.readAt).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3 flex-wrap">
                    {!announcement.isRead && (
                        <>
                            <button
                                onClick={() => onAction('read')}
                                className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={faEye} />
                                Mark as Read
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onAction('seen')}
                        className="flex-1 min-w-[120px] px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Mark as Seen
                    </button>

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
