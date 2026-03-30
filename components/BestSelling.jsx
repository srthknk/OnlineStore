'use client'
import Title from './Title'
import GroceryProductCard from './GroceryProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    // Filter out expired products
    const validProducts = products.filter(product => {
        if (!product.expiryDate) return true
        return new Date(product.expiryDate) > new Date()
    })

    return (
        <div className='px-3 sm:px-4 md:px-6 my-16 sm:my-20 md:my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${validProducts.length < displayQuantity ? validProducts.length : displayQuantity} of ${validProducts.length} products`} href='/shop' />
            <div className='mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-12'>
                {validProducts.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, displayQuantity).map((product, index) => (
                    <GroceryProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling