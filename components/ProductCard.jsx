'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faExclamationCircle, faEye, faHeart, faLeaf } from '@fortawesome/free-solid-svg-icons'

const ProductCard = ({ product, hideStockAndTags = false }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const [isFavorite, setIsFavorite] = useState(false)

    // calculate the average rating of the product
    const rating = product.rating?.length > 0 ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length) : 0;
    
    const outOfStock = product.totalUnits === 0
    const lowStock = product.totalUnits > 0 && product.totalUnits <= 10
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)

    return (
        <Link href={`/product/${product.id}`} className={`group max-xl:mx-auto w-full`}>
            <div className={`relative bg-gradient-to-br from-emerald-50 to-green-50 h-32 sm:h-48 md:h-56 lg:h-64 w-full rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300 ${outOfStock ? 'opacity-60' : ''}`}>
                {/* Hover Overlay */}
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 z-10' />
                
                <Image 
                    width={500} 
                    height={500} 
                    className='max-h-24 sm:max-h-32 md:max-h-40 lg:max-h-48 w-auto group-hover:scale-110 transition-transform duration-300' 
                    src={product.images[0]} 
                    alt={product.name}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Crect fill='%23e2e8f0' width='500' height='500'/%3E%3C/svg%3E"
                />
                
                {/* Premium Badges */}
                <div className='absolute top-2 left-2 flex flex-col gap-1.5 z-20'>
                    {!hideStockAndTags && product.isOrganic && (
                        <div className='flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-md'>
                            <FontAwesomeIcon icon={faLeaf} className='text-green-600 text-xs' />
                            <span className='text-xs font-bold text-green-700'>Organic</span>
                        </div>
                    )}
                    {discount > 0 && !outOfStock && (
                        <div className='bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg'>
                            -{discount}%
                        </div>
                    )}
                </div>
                
                {/* Stock Status */}
                {outOfStock && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm'>
                        <div className='text-center'>
                            <FontAwesomeIcon icon={faExclamationCircle} className='text-white mx-auto mb-2 text-3xl' />
                            <p className='text-white font-bold text-sm'>Out of Stock</p>
                        </div>
                    </div>
                )}
                
                {lowStock && !outOfStock && (
                    <div className='absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse'>
                        Limited Stock
                    </div>
                )}

                {/* Quick Actions on Hover */}
                {!outOfStock && (
                    <div className='absolute bottom-0 left-0 right-0 flex gap-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/20 to-transparent'>
                        <button 
                            onClick={(e) => {
                                e.preventDefault()
                                setIsFavorite(!isFavorite)
                            }}
                            className='flex-1 flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-slate-700 py-2 rounded-lg font-medium text-xs transition-all duration-300 active:scale-95 shadow-md'
                        >
                            <FontAwesomeIcon icon={faHeart} className={`text-sm ${isFavorite ? 'text-red-500' : ''}`} style={{fill: isFavorite ? '#ef4444' : 'none'}} />
                            <span className='hidden sm:inline'>Save</span>
                        </button>
                        <button 
                            onClick={(e) => e.preventDefault()}
                            className='flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-xs transition-all duration-300 active:scale-95 shadow-md'
                        >
                            <FontAwesomeIcon icon={faEye} className='text-sm' />
                            <span className='hidden sm:inline'>Details</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* Product Info */}
            <div className='flex flex-col gap-1.5 text-xs sm:text-sm text-slate-800 pt-3 w-full'>
                <p className='line-clamp-2 font-semibold group-hover:text-emerald-600 transition-colors duration-300'>{product.name}</p>
                
                {/* Rating */}
                <div className='flex items-center gap-1'>
                    <div className='flex gap-0.5'>
                        {Array(5).fill('').map((_, index) => (
                            <FontAwesomeIcon key={index} icon={faStar} className={`text-xs ${ rating >= index + 1 ? 'text-emerald-500' : 'text-gray-300'}`} style={{opacity: rating >= index + 1 ? 1 : 0.4}} />
                        ))}
                    </div>
                    <span className='text-xs text-slate-500 font-medium'>({product.rating?.length || 0})</span>
                </div>
                
                {/* Price */}
                <div className='flex items-center gap-2'>
                    <p className='font-bold text-emerald-600 text-sm'>{currency}{product.price}</p>
                    {product.mrp > product.price && (
                        <p className='text-xs text-slate-400 line-through'>{currency}{product.mrp}</p>
                    )}
                </div>
                
                {/* Variant Info */}
                {product.productVariants && product.productVariants.length > 0 && (
                    <p className='text-xs text-emerald-600 font-medium'>Multiple variants available</p>
                )}
                
                {/* Vegan Badge */}
                {!hideStockAndTags && product.isVegan && (
                    <div className='inline-flex items-center gap-1 w-fit px-2 py-1 bg-lime-50 rounded-full border border-lime-200'>
                        <FontAwesomeIcon icon={faLeaf} className='text-xs text-lime-700' />
                        <span className='text-xs font-semibold text-lime-700'>Vegan</span>
                    </div>
                )}
                
                {/* Stock Indicator Bar */}
                {!hideStockAndTags && !outOfStock && (
                    <div className='mt-2 w-full'>
                        <div className='h-1.5 bg-slate-200 rounded-full overflow-hidden'>
                            <div 
                                className={`h-full transition-all duration-300 ${
                                    lowStock ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, (product.totalUnits / Math.max(product.totalUnits, 50)) * 100)}%` }}
                            />
                        </div>
                        <p className={`text-xs font-medium mt-1 ${lowStock ? 'text-amber-600' : 'text-slate-600'}`}>
                            {lowStock ? `Only ${product.totalUnits} left` : 'Stock Available'}
                        </p>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default ProductCard