'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentBanner, setCurrentBanner] = useState(0)
    const [isAutoPlay, setIsAutoPlay] = useState(true)
    const [banners, setBanners] = useState([])
    const router = useRouter()

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                setSettings(res.data)
                
                // Calculate banners from settings
                const newBanners = [
                    {
                        image: res.data?.bannerImage1,
                        title: res.data?.bannerTitle1,
                        link: res.data?.bannerLink1 || '/shop'
                    },
                    {
                        image: res.data?.bannerImage2,
                        title: res.data?.bannerTitle2,
                        link: res.data?.bannerLink2 || '/shop'
                    },
                    {
                        image: res.data?.bannerImage3,
                        title: res.data?.bannerTitle3,
                        link: res.data?.bannerLink3 || '/shop'
                    },
                    ...(res.data?.bannerImage4 ? [{
                        image: res.data.bannerImage4,
                        title: res.data.bannerTitle4,
                        link: res.data.bannerLink4 || '/shop'
                    }] : []),
                    ...(res.data?.bannerImage5 ? [{
                        image: res.data.bannerImage5,
                        title: res.data.bannerTitle5,
                        link: res.data.bannerLink5 || '/shop'
                    }] : [])
                ].filter(banner => banner.image)
                
                setBanners(newBanners)
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlay || banners.length === 0) return

        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlay, banners.length])

    const handleBannerClick = (link) => {
        if (link && link !== '#' && link.trim() !== '') {
            try {
                router.push(link)
            } catch (error) {
                console.error('Navigation error:', error)
            }
        }
    }

    const nextBanner = () => {
        setCurrentBanner(prev => (prev + 1) % banners.length)
        setIsAutoPlay(false)
    }

    const prevBanner = () => {
        setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)
        setIsAutoPlay(false)
    }

    const goToBanner = (index) => {
        setCurrentBanner(index)
        setIsAutoPlay(false)
    }

    if (loading) {
        return (
            <div className='mx-2 sm:mx-4 md:mx-6'>
                <div className='w-full max-w-7xl mx-auto my-6 sm:my-8 md:my-10'>
                    <div className='h-32 xs:h-40 sm:h-56 md:h-72 lg:h-80 bg-slate-200 rounded-lg animate-pulse'></div>
                </div>
            </div>
        )
    }

    if (banners.length === 0) {
        return null
    }

    const currentBannerData = banners[currentBanner]

    return (
        <div className='mx-2 sm:mx-4 md:mx-6'>
            {/* Banners Carousel Section */}
            <div className='max-w-7xl mx-auto my-6 sm:my-8 md:my-10'>
                <div className='relative group'>
                    {/* Main Banner */}
                    <div
                        onClick={() => handleBannerClick(currentBannerData.link)}
                        className='relative w-full h-32 xs:h-40 sm:h-56 md:h-72 lg:h-80 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer carousel-slide'
                    >
                        {/* Banner Image with animation */}
                        {currentBannerData.image ? (
                            <Image
                                key={`banner-${currentBanner}`}
                                src={currentBannerData.image}
                                alt={currentBannerData.title || `Banner ${currentBanner + 1}`}
                                fill
                                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px'
                                quality={90}
                                priority={currentBanner === 0}
                                className='!object-cover !object-center !w-full !h-full group-hover:scale-105 transition-transform duration-500'
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: 'center'
                                }}
                            />
                        ) : (
                            <div className='w-full h-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center'>
                                <p className='text-white text-lg font-semibold'>Banner {currentBanner + 1}</p>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300'></div>

                        {/* Content */}
                        <div key={`content-${currentBanner}`} className='absolute inset-0 flex flex-col items-center justify-center text-center px-3 sm:px-4 md:px-6 animate-fadeIn'>
                            {currentBannerData.title && (
                                <h2 className='text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg line-clamp-2'>
                                    {currentBannerData.title}
                                </h2>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleBannerClick(currentBannerData.link)
                                }}
                                className='px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-colors duration-300 shadow-md'
                            >
                                Shop Now
                            </button>
                        </div>
                    </div>

                    {/* Left Arrow */}
                    {banners.length > 1 && (
                        <button
                            onClick={prevBanner}
                            className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 hover:scale-110'
                            aria-label='Previous banner'
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className='text-2xl text-slate-800' />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {banners.length > 1 && (
                        <button
                            onClick={nextBanner}
                            className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 hover:scale-110'
                            aria-label='Next banner'
                        >
                            <FontAwesomeIcon icon={faChevronRight} className='text-2xl text-slate-800' />
                        </button>
                    )}
                </div>

                {/* Dot Indicators */}
                {banners.length > 1 && (
                    <div className='flex justify-center gap-2 mt-4'>
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToBanner(index)}
                                className={`h-2 sm:h-2.5 transition-all duration-300 rounded-full ${
                                    index === currentBanner
                                        ? 'bg-emerald-600 w-6 sm:w-8'
                                        : 'bg-slate-300 w-2 sm:w-2.5 hover:bg-slate-400'
                                }`}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CategoriesMarquee />

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                :global(.animate-fadeIn) {
                    animation: fadeIn 0.5s ease-in-out;
                }
                :global(.carousel-slide) {
                    animation: slideIn 0.3s ease-in-out;
                }
            `}</style>
        </div>
    )
}

export default Hero