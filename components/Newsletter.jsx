'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const Newsletter = () => {
    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.whatsappLink) {
                    setWhatsappLink(res.data.whatsappLink)
                }
            } catch (error) {
                console.error('Error fetching WhatsApp link:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    return (
        <div className='flex flex-col items-center mx-2 sm:mx-4 md:mx-6 my-12 sm:my-20 md:my-28 lg:my-36'>
            <div className='text-center mb-6 sm:mb-8 md:mb-10 px-2'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-2 sm:mb-3 md:mb-4'>Stay Connected</h2>
                <p className='text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto'>Have questions? Chat with us on WhatsApp for instant support and exclusive offers!</p>
            </div>
            
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className='relative inline-block'>
                <div className='absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur-lg opacity-75 animate-pulse'></div>
                <button className='relative px-6 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm sm:text-base md:text-lg rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 sm:gap-3 border-2 border-green-400'>
                    <FontAwesomeIcon icon={faComments} className='text-lg sm:text-xl animate-bounce' />
                    <span className='hidden xs:inline'>Chat with us on WhatsApp</span>
                    <span className='xs:hidden'>Chat on WhatsApp</span>
                </button>
            </Link>
        </div>
    )
}

export default Newsletter