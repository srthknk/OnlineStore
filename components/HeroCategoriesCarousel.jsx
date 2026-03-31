'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function HeroCategoriesCarousel() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [windowSize, setWindowSize] = useState(null)
    const [imageErrors, setImageErrors] = useState({})
    const router = useRouter()

    useEffect(() => {
        setWindowSize(typeof window !== 'undefined' ? window.innerWidth : null)
        
        const handleResize = () => {
            setWindowSize(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/admin/hero-categories')
                setCategories(data.categories || [])
            } catch (error) {
                console.error('Error fetching hero categories:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    if (loading || categories.length === 0) {
        return null
    }

    // Show only 8 cards on mobile, all on larger screens
    const displayCategories = windowSize !== null && windowSize < 640 ? categories.slice(0, 8) : categories

    return (
        <div className='px-2 sm:px-4 md:px-6 py-6 sm:py-8 bg-white'>
            <div className='w-full max-w-7xl mx-auto'>
                <div className='grid grid-cols-4 sm:grid-cols-10 gap-2 sm:gap-3 md:gap-4'>
                    {displayCategories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => {
                                if (category.redirectUrl) {
                                    router.push(category.redirectUrl)
                                } else {
                                    router.push(`/shop?category=${category.title}`)
                                }
                            }}
                            className='flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer group'
                        >
                            {/* Category Image */}
                            <div className='w-full aspect-square bg-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'>
                                {category.image && !imageErrors[category.id] ? (
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        width={80}
                                        height={80}
                                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                                        unoptimized={true}
                                        onError={() => {
                                            setImageErrors(prev => ({ ...prev, [category.id]: true }))
                                        }}
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100'>
                                        <Image
                                            src='/placeholder-product.svg'
                                            alt='No image'
                                            width={60}
                                            height={60}
                                            className='object-contain'
                                            unoptimized={true}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Category Title */}
                            <h3 className='text-[10px] sm:text-sm font-medium text-slate-800 text-center line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200'>
                                {category.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
