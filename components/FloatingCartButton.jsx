'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

const FloatingCartButton = () => {
    const [isVisible, setIsVisible] = useState(false)
    const cartCount = useSelector(state => state.cart.total)

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            {/* Only show on mobile */}
            {isVisible && (
                <Link 
                    href="/cart"
                    className="fixed bottom-8 right-6 md:hidden z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    <div className="relative group">
                        <button className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95">
                            <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />
                        </button>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                        <div className="absolute bottom-full right-0 mb-3 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? 's' : ''}` : 'Empty cart'}
                        </div>
                    </div>
                </Link>
            )}
        </>
    )
}

export default FloatingCartButton
