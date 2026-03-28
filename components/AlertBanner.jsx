'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export default function AlertBanner() {
    const [alert, setAlert] = useState(null)
    const [isOpen, setIsOpen] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchAlert = async () => {
            try {
                const { data } = await axios.get('/api/alerts/active')
                if (data.success && data.alert) {
                    setAlert(data.alert)
                    setIsOpen(true)
                }
            } catch (error) {
                console.error('Failed to fetch alert:', error)
            }
        }

        if (mounted) {
            fetchAlert()
        }
    }, [mounted])

    if (!mounted || !isOpen || !alert) {
        return null
    }

    const bgColor = alert.bgColor || 'from-emerald-600 to-green-600'
    const textColor = alert.textColor || 'text-white'

    return (
        <div className={`w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm ${textColor} text-center bg-gradient-to-r ${bgColor}`} suppressHydrationWarning>
            <div className='flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto'>
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-center gap-2'>
                        {alert.icon && <span className='text-sm sm:text-base'>{alert.icon}</span>}
                        <div>
                            <p className='font-semibold'>{alert.title}</p>
                            {alert.message && <p className='text-xs sm:text-sm opacity-90'>{alert.message}</p>}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    aria-label="Close alert"
                >
                    <FontAwesomeIcon icon={faXmark} className='text-base' />
                </button>
            </div>
        </div>
    )
}
