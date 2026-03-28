'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import Link from 'next/link'

const CategoryWiseProducts = () => {
    const products = useSelector(state => state.product.list)

    // Filter out expired products
    const validProducts = products.filter(product => {
        if (!product.expiryDate) return true
        return new Date(product.expiryDate) > new Date()
    })

    // Group products by category
    const groupedByCategory = validProducts.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = []
        }
        acc[product.category].push(product)
        return acc
    }, {})

    const productsPerCategory = 4

    return (
        <div className='px-3 sm:px-4 md:px-6 my-16 sm:my-20 md:my-28 max-w-6xl mx-auto'>
            <Title 
                visibleButton={false} 
                title='Shop by Category' 
                description="Explore our curated collection across different categories"
            />

            <div className='mt-12 sm:mt-16 md:mt-20'>
                {Object.entries(groupedByCategory).length > 0 ? (
                    Object.entries(groupedByCategory).map(([category, categoryProducts], index) => (
                        <div key={index} className='mb-16 sm:mb-20 md:mb-24'>
                            <div className='flex items-center justify-between mb-8 sm:mb-10'>
                                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 capitalize'>
                                    {category}
                                </h2>
                                <Link 
                                    href={`/shop?category=${category}`}
                                    className='text-sm sm:text-base text-blue-600 hover:text-blue-700 font-semibold transition'
                                >
                                    View All →
                                </Link>
                            </div>
                            
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-12'>
                                {categoryProducts.slice(0, productsPerCategory).map((product, idx) => (
                                    <ProductCard key={idx} product={product} hideStockAndTags={true} />
                                ))}
                            </div>

                            {categoryProducts.length > productsPerCategory && (
                                <div className='text-center mt-6 sm:mt-8'>
                                    <Link
                                        href={`/shop?category=${category}`}
                                        className='inline-block px-6 sm:px-8 py-2 sm:py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition font-medium text-sm sm:text-base'
                                    >
                                        Show More Products ({categoryProducts.length - productsPerCategory} more)
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className='text-center py-12'>
                        <p className='text-slate-600 text-lg'>No products available yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoryWiseProducts
