'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'

export default function StoreAnnouncementsBadge() {
    const { getToken } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchUnreadCount()
        // Check for new announcements every 20 seconds
        const interval = setInterval(fetchUnreadCount, 20000)
        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(
                '/api/store/announcements?includeRead=false',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setUnreadCount(data.counts.unread)
        } catch (error) {
            console.error('Failed to fetch unread count', error)
        }
    }

    return (
        <div className="relative inline-block">
            <div className="relative p-2">
                <FontAwesomeIcon icon={faBell} className="text-xl text-slate-600 hover:text-slate-800 transition-colors cursor-pointer" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </div>
        </div>
    )
}
