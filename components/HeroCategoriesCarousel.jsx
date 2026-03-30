'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function HeroCategoriesCarousel() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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

    return (
        <div className='px-2 sm:px-4 md:px-6 py-6 sm:py-8 bg-white'>
            <div className='w-full max-w-7xl mx-auto'>
                <div className='grid grid-cols-10 gap-3 sm:gap-4'>
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => {
                                if (category.redirectUrl) {
                                    router.push(category.redirectUrl)
                                } else {
                                    router.push(`/shop?category=${category.title}`)
                                }
                            }}
                            className='flex flex-col items-center gap-2 cursor-pointer group'
                        >
                            {/* Category Image */}
                            <div className='w-full aspect-square bg-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'>
                                {category.image ? (
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        width={120}
                                        height={120}
                                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300'>
                                        <span className='text-slate-400 text-xs text-center p-2'>No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Category Title */}
                            <h3 className='text-xs sm:text-sm font-medium text-slate-800 text-center line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200'>
                                {category.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
