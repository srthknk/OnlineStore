'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faExclamationCircle, faEye, faHeart, faLeaf } from '@fortawesome/free-solid-svg-icons'

const ProductCard = ({ product, hideStockAndTags = false }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const [isFavorite, setIsFavorite] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)
    const cardRef = useRef(null)
    const imageRef = useRef(null)

    // Fallback image if product has no images
    const productImage = product?.images && product.images.length > 0 
        ? product.images[0] 
        : '/placeholder-product.png'

    // Debug logging
    if (!product?.images || product.images.length === 0) {
        console.warn('[ProductCard] Product has no images:', product?.name || product?.id)
    }

    // calculate the average rating of the product
    const rating = product.rating?.length > 0 ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length) : 0;
    
    // Check inStock status - use inStock flag first, then fall back to totalUnits check
    const outOfStock = product.inStock === false || (product.totalUnits !== undefined && product.totalUnits === 0)
    const lowStock = !outOfStock && product.totalUnits > 0 && product.totalUnits <= 10
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)

    // GSAP hover animations
    useEffect(() => {
        if (!imageRef.current) return

        if (isHovered) {
            gsap.to(imageRef.current, {
                scale: 1.15,
                duration: 0.4,
                ease: "power2.out"
            })
        } else {
            gsap.to(imageRef.current, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            })
        }
    }, [isHovered])

    return (
        <Link href={`/product/${product.id}`} className={`group max-xl:mx-auto w-full`}>
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ duration: 0.4 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex flex-col h-full"
            >
                <div className={`relative bg-gradient-to-br from-emerald-50 to-green-50 h-32 sm:h-48 md:h-56 lg:h-64 w-full rounded-xl flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ${
                    isHovered ? 'shadow-2xl' : 'shadow-md'
                } ${outOfStock ? 'opacity-60' : ''}`}>
                    {/* Premium Hover Overlay */}
                    <motion.div
                        animate={{
                            backgroundColor: isHovered ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)'
                        }}
                        transition={{ duration: 0.3 }}
                        className='absolute inset-0 z-10'
                    />
                    
                    <div ref={imageRef}>
                        {!imageError && productImage !== '/placeholder-product.png' ? (
                            <Image 
                                width={500} 
                                height={500} 
                                className='max-h-24 sm:max-h-32 md:max-h-40 lg:max-h-48 w-auto' 
                                src={productImage} 
                                alt={product.name}
                                loading="lazy"
                                unoptimized={true}
                                placeholder="blur"
                                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Crect fill='%23e2e8f0' width='500' height='500'/%3E%3C/svg%3E"
                                onError={() => {
                                    setImageError(true)
                                }}
                            />
                        ) : (
                            <Image 
                                width={500} 
                                height={500} 
                                className='max-h-24 sm:max-h-32 md:max-h-40 lg:max-h-48 w-auto' 
                                src='/placeholder-product.svg' 
                                alt='No product image'
                                unoptimized={true}
                            />
                        )}
                    </div>
                    
                    {/* Premium Badges with Animation */}
                    <motion.div
                        className='absolute top-2 left-2 flex flex-col gap-1.5 z-20'
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        {!hideStockAndTags && product.isOrganic && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className='flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-md border border-green-100'
                            >
                                <FontAwesomeIcon icon={faLeaf} className='text-green-600 text-xs' />
                                <span className='text-xs font-semibold text-green-700'>Organic</span>
                            </motion.div>
                        )}
                        {discount > 0 && !outOfStock && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className='bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg'
                            >
                                -{discount}%
                            </motion.div>
                        )}
                    </motion.div>
                    
                    {/* Stock Status */}
                    {outOfStock && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm z-20'
                        >
                            <div className='text-center'>
                                <FontAwesomeIcon icon={faExclamationCircle} className='text-white mx-auto mb-2 text-3xl' />
                                <p className='text-white font-light text-sm'>Out of Stock</p>
                            </div>
                        </motion.div>
                    )}
                    
                    {lowStock && !outOfStock && (
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className='absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg'
                        >
                            Limited Stock
                        </motion.div>
                    )}

                    {/* Premium Quick Actions on Hover */}
                    {!outOfStock && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className='absolute bottom-0 left-0 right-0 flex gap-2 p-3 bg-gradient-to-t from-black/30 via-black/10 to-transparent'
                        >
                            <motion.button 
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsFavorite(!isFavorite)
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='flex-1 flex items-center justify-center gap-2 bg-white/95 hover:bg-white text-slate-700 py-2.5 rounded-lg font-light text-xs transition-all duration-300 shadow-lg backdrop-blur-sm'
                            >
                                <FontAwesomeIcon icon={faHeart} className={`text-sm transition-colors duration-200 ${isFavorite ? 'text-red-500' : ''}`} style={{fill: isFavorite ? '#ef4444' : 'none'}} />
                                <span className='hidden sm:inline'>Save</span>
                            </motion.button>
                            <motion.button 
                                onClick={(e) => e.preventDefault()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-light text-xs transition-all duration-300 shadow-lg'
                            >
                                <FontAwesomeIcon icon={faEye} className='text-sm' />
                                <span className='hidden sm:inline'>Details</span>
                            </motion.button>
                        </motion.div>
                    )}
                </div>
                
                {/* Premium Product Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className='flex flex-col gap-2 text-xs sm:text-sm text-slate-800 pt-3.5 w-full'
                >
                    <motion.p
                        whileHover={{ color: '#059669' }}
                        className='line-clamp-2 font-light group-hover:text-emerald-600 transition-colors duration-300'
                    >
                        {product.name}
                    </motion.p>
                    
                    {/* Rating with Premium Style */}
                    <div className='flex items-center gap-1.5'>
                        <div className='flex gap-0.5'>
                            {Array(5).fill('').map((_, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className={`text-xs ${ rating >= index + 1 ? 'text-emerald-500' : 'text-gray-300'}`}
                                        style={{opacity: rating >= index + 1 ? 1 : 0.4}}
                                    />
                                </motion.div>
                            ))}
                        </div>
                        <span className='text-xs text-slate-500 font-light'>({product.rating?.length || 0})</span>
                    </div>
                    
                    {/* Price with Premium Style */}
                    <div className='flex items-center gap-2 pt-1'>
                        <motion.p
                            className='font-semibold text-emerald-600 text-sm'
                        >
                            {currency}{product.price}
                        </motion.p>
                        {product.mrp > product.price && (
                            <motion.p
                                className='text-xs text-slate-400 line-through font-light'
                            >
                                {currency}{product.mrp}
                            </motion.p>
                        )}
                    </div>
                    
                    {/* Variant Info */}
                    {product.productVariants && product.productVariants.length > 0 && (
                        <p className='text-xs text-emerald-600 font-light'>Multiple variants</p>
                    )}
                    
                    {/* Vegan Badge */}
                    {!hideStockAndTags && product.isVegan && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className='inline-flex items-center gap-1.5 w-fit px-2.5 py-1 bg-lime-50 rounded-full border border-lime-200'
                        >
                            <FontAwesomeIcon icon={faLeaf} className='text-xs text-lime-700' />
                            <span className='text-xs font-semibold text-lime-700'>Vegan</span>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </Link>
    )
}

export default ProductCard