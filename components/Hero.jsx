'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPills, faDog, faBaby } from '@fortawesome/free-solid-svg-icons'
import CategoriesMarquee from './CategoriesMarquee'
import HeroCategoriesCarousel from './HeroCategoriesCarousel'

const Hero = () => {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [bannerImage, setBannerImage] = useState(null)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    // Helper function to check if content is truly not empty (ignoring whitespace)
    const hasContent = (str) => str && typeof str === 'string' && str.trim().length > 0

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                setSettings(res.data)
                setBannerImage(res.data?.bannerImage1)
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    // Feature cards from admin settings
    const featureCards = settings ? [
        {
            icon: faPills,
            title: settings.featureCardTitle1,
            description: settings.featureCardDesc1,
            buttonText: settings.featureCardButton1,
            image: settings.featureCardImage1,
            bgColor: 'from-cyan-400 to-teal-500',
            darkBgColor: 'from-cyan-500 to-teal-600',
            link: settings.featureCardLink1 || '/shop?category=pharmacy'
        },
        {
            icon: faDog,
            title: settings.featureCardTitle2,
            description: settings.featureCardDesc2,
            buttonText: settings.featureCardButton2,
            image: settings.featureCardImage2,
            bgColor: 'from-yellow-400 to-amber-500',
            darkBgColor: 'from-yellow-500 to-amber-600',
            link: settings.featureCardLink2 || '/shop?category=petcare'
        },
        {
            icon: faBaby,
            title: settings.featureCardTitle3,
            description: settings.featureCardDesc3,
            buttonText: settings.featureCardButton3,
            image: settings.featureCardImage3,
            bgColor: 'from-blue-300 to-blue-400',
            darkBgColor: 'from-blue-400 to-blue-500',
            link: settings.featureCardLink3 || '/shop?category=baby'
        }
    ] : []
    
    const bannerLink = settings?.bannerLink1 || '/shop'

    if (!mounted || loading) {
        return (
            <div className='w-full'>
                <div className='px-2 sm:px-4 md:px-6'>
                    <div className='w-full max-w-7xl mx-auto'>
                        {/* Main Banner Skeleton */}
                        <div className='w-full rounded-2xl overflow-hidden bg-gray-200 animate-pulse mb-6 sm:mb-8' style={{ aspectRatio: '3/1' }}></div>
                        
                        {/* Feature Cards Skeleton */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6'>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className='h-48 sm:h-56 md:h-48 bg-gray-200 rounded-2xl animate-pulse'></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!bannerImage) {
        return null
    }

    return (
        <div className='w-full' suppressHydrationWarning>
            {/* Single Banner - Image Only, No Text */}
            <div className='px-2 sm:px-4 md:px-6 py-4 sm:py-6'>
                <div className='w-full max-w-7xl mx-auto'>
                    {/* Banner Container - Clickable with responsive aspect ratio */}
                    <div 
                        onClick={() => router.push(bannerLink)}
                        className='relative w-full rounded-3xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 active:scale-95'
                    >
                        {/* Single Banner Image - responsive with 3:1 aspect ratio */}
                        <div className='relative w-full' style={{ aspectRatio: '3/1' }}>
                            <Image
                                src={bannerImage}
                                alt='Main Banner'
                                fill
                                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
                                quality={90}
                                priority={true}
                                className='!object-cover !object-center'
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className='px-2 sm:px-4 md:px-6 pb-6 sm:pb-8 md:pb-12'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6'>
                        {featureCards
                            .filter(card => hasContent(card.title) || hasContent(card.description) || card.image || hasContent(card.buttonText))
                            .map((card, index) => (
                            <div
                                key={index}
                                onClick={() => router.push(card.link)}
                                className='relative group cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left'
                            >
                                {/* If image exists, display it with overlay */}
                                {card.image ? (
                                    <>
                                        {/* Full Image Card */}
                                        <div className='relative w-full h-48 sm:h-56'>
                                            <Image
                                                src={card.image}
                                                alt={card.title || 'Feature Card'}
                                                fill
                                                className='object-cover object-center'
                                                quality={90}
                                            />
                                            
                                            {/* Dark Overlay for text visibility - only if has text/button */}
                                            {(hasContent(card.title) || hasContent(card.description) || hasContent(card.buttonText)) && (
                                                <div className='absolute inset-0 bg-black/40' />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Gradient Background (when no image) */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor}`} />
                                    </>
                                )}
                                
                                {/* Content Container - Only show if has text, description, or button */}
                                {(hasContent(card.title) || hasContent(card.description) || hasContent(card.buttonText)) && (
                                    <div className={`relative p-4 sm:p-5 md:p-6 h-48 sm:h-56 flex flex-col justify-between ${card.image ? 'bg-black/30' : ''}`}>
                                        {/* Icon Section (only show if no image) */}
                                        {!card.image && (
                                            <div>
                                                <div className='w-12 h-12 sm:w-14 sm:h-14 bg-white/25 hover:bg-white/35 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300'>
                                                    <FontAwesomeIcon icon={card.icon} className='text-xl sm:text-2xl text-white drop-shadow' />
                                                </div>
                                            </div>
                                        )}

                                        {/* Text Section */}
                                        {(hasContent(card.title) || hasContent(card.description)) && (
                                            <div className='space-y-2'>
                                                {hasContent(card.title) && (
                                                    <h3 className='text-base sm:text-lg font-bold text-white leading-tight drop-shadow'>
                                                        {card.title}
                                                    </h3>
                                                )}
                                                {hasContent(card.description) && (
                                                    <p className='text-xs sm:text-sm text-white/90 line-clamp-2 font-medium'>
                                                        {card.description}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Button */}
                                    {hasContent(card.buttonText) && (
                                        <div className='pt-2'>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    router.push(card.link)
                                                }}
                                                className='px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 w-fit shadow-md hover:shadow-lg active:scale-95'
                                            >
                                                {card.buttonText}
                                            </button>
                                        </div>
                                    )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CategoriesMarquee />

            {/* Hero Categories Carousel */}
            <HeroCategoriesCarousel />
        </div>
    )
}

export default Hero