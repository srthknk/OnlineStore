'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { useState } from 'react'

export default function GroceryProductCard({ product }) {
    const dispatch = useDispatch()
    const [isAdding, setIsAdding] = useState(false)

    if (!product) return null

    // Calculate discount percentage
    const originalPrice = product.basePrice || product.price
    const currentPrice = product.price
    const discountPercent = originalPrice > currentPrice 
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0

    const handleAddToCart = (e) => {
        e.preventDefault()
        setIsAdding(true)
        
        dispatch(addToCart({ productId: product.id }))

        // Reset button state
        setTimeout(() => setIsAdding(false), 500)
    }

    // Get weight/quantity text
    const weightText = product.weight || product.quantity || product.unit || ''

    return (
        <Link href={`/product/${product.id}`}>
            <div className='bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col cursor-pointer'>
                {/* Image Container with Badge */}
                <div className='relative bg-slate-100 aspect-square overflow-hidden'>
                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <div className='absolute top-3 left-3 z-10 bg-indigo-600 text-white px-2 py-1 rounded-md shadow-md'>
                            <div className='text-xs font-bold text-center'>
                                {discountPercent}%
                            </div>
                            <div className='text-xs font-light text-center'>OFF</div>
                        </div>
                    )}

                    {/* Product Image */}
                    <div className='w-full h-full relative'>
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className='object-cover'
                                sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                            />
                        ) : (
                            <div className='w-full h-full bg-slate-200 flex items-center justify-center'>
                                <span className='text-slate-400 text-sm'>No Image</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className='p-3 flex flex-col flex-grow'>
                    {/* Product Name */}
                    <h3 className='font-medium text-sm text-slate-900 line-clamp-2 mb-1'>
                        {product.name}
                    </h3>

                    {/* Weight/Quantity */}
                    {weightText && (
                        <p className='text-xs text-slate-500 mb-2'>
                            {weightText}
                        </p>
                    )}

                    {/* Pricing */}
                    <div className='flex items-center gap-2 mb-3'>
                        <span className='text-sm font-semibold text-slate-900'>
                            ₹{currentPrice}
                        </span>
                        {discountPercent > 0 && (
                            <span className='text-xs text-slate-400 line-through'>
                                ₹{originalPrice}
                            </span>
                        )}
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className='w-full mt-auto px-4 py-2 border-2 border-emerald-500 text-emerald-600 font-semibold text-sm rounded-lg hover:bg-emerald-50 transition-colors duration-200 disabled:opacity-75'
                    >
                        {isAdding ? 'Adding...' : 'ADD'}
                    </button>
                </div>
            </div>
        </Link>
    )
}
