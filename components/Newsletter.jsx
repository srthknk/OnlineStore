'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp, faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'

const Newsletter = () => {
    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/')
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.whatsappLink) {
                    setWhatsappLink(res.data.whatsappLink)
                }
                setSettings(res.data)
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    return (
        <section className='relative my-10 sm:my-16 md:my-24 lg:my-32 px-3 sm:px-4 md:px-6 lg:px-8'>
            {/* Background gradient */}
            <div className='absolute inset-0 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl md:rounded-3xl -z-10' />
            
            <div className='max-w-5xl mx-auto'>
                {/* Header Section */}
                <div className='text-center mb-10 sm:mb-12 md:mb-14'>
                    <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-2 sm:mb-3 md:mb-4'>
                        Stay <span className='text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600'>Connected</span>
                    </h2>
                    <p className='text-xs sm:text-sm md:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed px-2'>
                        Have questions? Need instant support? Connect with us through your preferred channel!
                    </p>
                </div>

                {/* Main WhatsApp CTA */}
                <div className='flex justify-center mb-12 sm:mb-16'>
                    <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className='relative inline-block group'>
                        {/* Animated glow background */}
                        <div className='absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500 -z-10 animate-pulse group-hover:animate-none' />
                        
                        {/* Secondary glow */}
                        <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg opacity-0 group-hover:opacity-15 transition-all duration-300 blur-xl' />
                        
                        {/* Button Card */}
                        <button suppressHydrationWarning className='relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm sm:text-base md:text-lg rounded-lg shadow-lg group-hover:shadow-xl group-hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 border-2 border-green-400 overflow-hidden'>
                            {/* Shine effect */}
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 -translate-x-full group-hover:translate-x-full transition-all duration-700' />
                            
                            {/* WhatsApp Icon */}
                            <FontAwesomeIcon icon={faWhatsapp} className='text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300' />
                            
                            {/* Text */}
                            <div className='flex flex-col items-start'>
                                <span className='font-bold text-sm sm:text-base md:text-lg leading-none'>WhatsApp</span>
                                <span className='text-xs font-medium text-green-100'>Chat with us</span>
                            </div>
                        </button>
                    </Link>
                </div>

                {/* Contact Methods Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16'>
                    {/* WhatsApp Card */}
                    <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className='group'>
                        <div className='relative h-full bg-white rounded-xl p-5 sm:p-6 md:p-7 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 border border-slate-100 group-hover:border-green-200'>
                            <div className='flex flex-col items-center text-center h-full justify-center'>
                                <div className='inline-flex p-3 sm:p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110'>
                                    <FontAwesomeIcon icon={faWhatsapp} className='text-xl sm:text-2xl' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-slate-800 mb-1'>WhatsApp</h3>
                                <p className='text-xs sm:text-sm text-slate-600 mb-3'>Instant support 24/7</p>
                                <span suppressHydrationWarning className='text-green-600 font-semibold text-xs sm:text-sm group-hover:text-green-700 transition-colors'>Chat Now →</span>
                            </div>
                        </div>
                    </Link>

                    {/* Email Card */}
                    {settings?.email && (
                        <a href={`mailto:${settings.email}`} className='group'>
                            <div className='relative h-full bg-white rounded-xl p-5 sm:p-6 md:p-7 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 border border-slate-100 group-hover:border-blue-200'>
                                <div className='flex flex-col items-center text-center h-full justify-center'>
                                    <div className='inline-flex p-3 sm:p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110'>
                                        <FontAwesomeIcon icon={faEnvelope} className='text-xl sm:text-2xl' />
                                    </div>
                                    <h3 className='text-lg sm:text-xl font-bold text-slate-800 mb-1'>Email</h3>
                                    <p className='text-xs sm:text-sm text-slate-600 mb-3'>Response within 24hrs</p>
                                    <span suppressHydrationWarning className='text-blue-600 font-semibold text-xs sm:text-sm group-hover:text-blue-700 transition-colors truncate max-w-xs px-1'>{settings.email}</span>
                                </div>
                            </div>
                        </a>
                    )}

                    {/* Phone Card */}
                    {settings?.phone && (
                        <a href={`tel:${settings.phone}`} className='group'>
                            <div className='relative h-full bg-white rounded-xl p-5 sm:p-6 md:p-7 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 border border-slate-100 group-hover:border-purple-200'>
                                <div className='flex flex-col items-center text-center h-full justify-center'>
                                    <div className='inline-flex p-3 sm:p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110'>
                                        <FontAwesomeIcon icon={faPhone} className='text-xl sm:text-2xl' />
                                    </div>
                                    <h3 className='text-lg sm:text-xl font-bold text-slate-800 mb-1'>Call</h3>
                                    <p className='text-xs sm:text-sm text-slate-600 mb-3'>Available 10AM-6PM</p>
                                    <span suppressHydrationWarning className='text-purple-600 font-semibold text-xs sm:text-sm group-hover:text-purple-700 transition-colors'>{settings.phone}</span>
                                </div>
                            </div>
                        </a>
                    )}
                </div>
            </div>
        </section>
    )
}

export default Newsletter