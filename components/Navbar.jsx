'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {useUser, useClerk, UserButton} from "@clerk/nextjs"
import CustomUserButton from "./CustomUserButton"
import FAQModal from "./FAQModal"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShoppingBag, faMagnifyingGlass, faShoppingCart, faBars, faXmark } from "@fortawesome/free-solid-svg-icons"

const Navbar = () => {

    const {user, isLoaded} = useUser()
    const {openSignIn} = useClerk()
    const router = useRouter();
    const [storeName, setStoreName] = useState('Shop')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [faqModalOpen, setFaqModalOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [allProducts, setAllProducts] = useState([])
    const searchRef = useRef(null)
    const cartCount = useSelector(state => state.cart.total)



    // Fetch all products on mount
    useEffect(() => {
        fetchAllProducts()
    }, [])

    const fetchAllProducts = async () => {
        try {
            const { data } = await axios.get('/api/products')
            // Handle both array and object responses
            if (Array.isArray(data)) {
                setAllProducts(data)
            } else if (data?.products && Array.isArray(data.products)) {
                setAllProducts(data.products)
            } else {
                setAllProducts([])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setAllProducts([])
        }
    }

    useEffect(() => {
        const fetchStoreName = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.storeName) {
                    setStoreName(res.data.storeName)
                }
            } catch (error) {
                console.error('Error fetching store name:', error)
            }
        }

        fetchStoreName()
        const interval = setInterval(fetchStoreName, 5000)
        return () => clearInterval(interval)
    }, [])

    // Handle search suggestions
    useEffect(() => {
        if (search.trim().length > 0 && Array.isArray(allProducts)) {
            setLoadingSuggestions(true)
            const filtered = allProducts
                .filter(product =>
                    product.name.toLowerCase().includes(search.toLowerCase()) ||
                    product.category.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 6)
            setSuggestions(filtered)
            setShowSuggestions(true)
            setLoadingSuggestions(false)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [search, allProducts])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Check if clicked element is a button within suggestions
            const clickedButton = e.target.closest('button[type="button"]')
            if (clickedButton) {
                return
            }
            
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleSearch = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault()
        }
        if (search.trim()) {
            setShowSuggestions(false)
            router.push(`/shop?search=${encodeURIComponent(search)}`)
            setSearch('')
            setSuggestions([])
        }
    }

    const handleProductClick = (productId) => {
        setShowSuggestions(false)
        setSearch('')
        setSuggestions([])
        router.push(`/product/${productId}`)
    }

    const handleOpenSignIn = () => {
        if (isLoaded && !user) {
            openSignIn()
        }
    }

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" }
    ]

    return (
        <nav className="relative bg-white" suppressHydrationWarning>
            <div className="mx-4 sm:mx-6">
                {/* Main Navbar Content */}
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 gap-4">

                    {/* Logo */}
                    <Link href="/" className="text-2xl sm:text-3xl font-bold text-slate-800 flex-shrink-0 flex items-center gap-1.5 hover:scale-105 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg"><FontAwesomeIcon icon={faShoppingCart} /></span>
                        </div>
                        <span className="hidden sm:flex items-baseline"><span className="text-emerald-600">{storeName}</span><span className="text-emerald-400 text-2xl">.</span></span>
                    </Link>

                    {/* Desktop Navigation - Left Side */}
                    <div className="hidden lg:flex items-center gap-8 text-slate-600 flex-1 ml-8">
                        {navLinks.slice(0, 2).map(link => (
                            <Link key={link.href} href={link.href} className="hover:text-emerald-600 transition-colors text-sm font-medium hover:font-semibold duration-300">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Centered Search Bar - Desktop */}
                    <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl mx-4 relative group">
                        <form onSubmit={handleSearch} className="relative" suppressHydrationWarning>
                            <div className="relative flex items-center bg-white border-2 border-slate-200 rounded-full px-5 py-3 hover:border-emerald-300 focus-within:border-emerald-500 focus-within:shadow-lg transition-all duration-300 group-hover:shadow-md">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 flex-shrink-0 text-base group-focus-within:text-emerald-600 transition-colors duration-300" />
                                <input
                                    type="text"
                                    placeholder="Search products, categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => search.trim().length > 0 && setShowSuggestions(true)}
                                    className="w-full bg-transparent outline-none placeholder-slate-500 text-sm ml-3 text-slate-700"
                                    suppressHydrationWarning
                                />
                            </div>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute top-full mt-3 -left-20 right-0 md:left-1/2 md:transform md:-translate-x-1/2 w-screen md:w-[700px] lg:w-[750px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    {loadingSuggestions ? (
                                        <div className="p-8 text-center">
                                            <div className="inline-block animate-spin">
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-emerald-600 text-2xl" />
                                            </div>
                                            <p className="text-slate-600 text-sm mt-3">Searching products...</p>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <div className="max-h-96 overflow-y-auto">
                                            {suggestions.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setShowSuggestions(false)
                                                        setSearch('')
                                                        setSuggestions([])
                                                        setTimeout(() => {
                                                            router.push(`/product/${product.id}`)
                                                        }, 50)
                                                    }}
                                                    className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all duration-200 border-b border-slate-100 last:border-b-0 cursor-pointer group bg-white border-0"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault()
                                                            setShowSuggestions(false)
                                                            setSearch('')
                                                            setSuggestions([])
                                                            setTimeout(() => {
                                                                router.push(`/product/${product.id}`)
                                                            }, 50)
                                                        }
                                                    }}
                                                >
                                                    {/* Product Image */}
                                                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-emerald-200 group-hover:border-emerald-400 transition-colors duration-300 pointer-events-none">
                                                        {product.images && product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover pointer-events-none" />
                                                        ) : (
                                                            <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-600 text-lg pointer-events-none" />
                                                        )}
                                                    </div>
                                                    {/* Product Info */}
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="text-sm sm:text-base font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors duration-200">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-slate-500 truncate">
                                                            {product.category}
                                                        </p>
                                                    </div>
                                                    {/* Price */}
                                                    <div className="flex-shrink-0">
                                                        <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                            ₹{product.price}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-2xl" />
                                            </div>
                                            <p className="text-slate-700 font-semibold mb-2">No products found</p>
                                            <p className="text-slate-500 text-sm">Try searching with different keywords</p>
                                        </div>
                                    )}

                                    {/* View All Products Link */}
                                    {suggestions.length > 0 && (
                                        <div className="border-t-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleSearch({preventDefault: () => {}})
                                                    setShowSuggestions(false)
                                                }}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                                                suppressHydrationWarning
                                            >
                                                View all results
                                                <span className="text-lg">→</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Desktop Navigation - Right Side */}
                    <div className="hidden lg:flex items-center gap-8 text-slate-600 flex-1 justify-end">
                        {navLinks.slice(2).map(link => (
                            <Link key={link.href} href={link.href} className="hover:text-emerald-600 transition-colors text-sm font-medium hover:font-semibold duration-300">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Icons */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/cart" className="relative flex items-center text-slate-600 hover:text-emerald-600 transition-colors duration-300 group">
                            <div className="p-2 rounded-full group-hover:bg-emerald-50 transition-colors duration-300">
                                <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
                            </div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 text-xs text-white bg-emerald-600 w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {!user && isLoaded ? (
                            <button onClick={handleOpenSignIn} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:shadow-lg active:scale-95 transition-all duration-300 text-white rounded-full font-semibold text-sm shadow-md" suppressHydrationWarning>
                                Login
                            </button>
                        ) : (
                            <div suppressHydrationWarning>
                                <CustomUserButton onFAQClick={() => setFaqModalOpen(true)}>
                                    <UserButton.Action labelIcon={<FontAwesomeIcon icon={faShoppingBag} className="text-sm" />} label="My Orders" onClick={()=> router.push('/orders')}/>
                                </CustomUserButton>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <Link href="/cart" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                            <FontAwesomeIcon icon={faShoppingCart} className="text-slate-600 text-lg" />
                            {cartCount > 0 && <span className="absolute top-0 right-0 text-xs text-white bg-emerald-600 w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
                        </Link>
                        
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 active:scale-95"
                        >
                            {mobileMenuOpen ? (
                                <FontAwesomeIcon icon={faXmark} className="transition-transform duration-300 text-xl" />
                            ) : (
                                <FontAwesomeIcon icon={faBars} className="transition-transform duration-300 text-xl" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div ref={searchRef} className="md:hidden mb-4 px-2 relative">
                    <form onSubmit={handleSearch} className="relative" suppressHydrationWarning>
                        <div className="relative flex items-center bg-white border-2 border-slate-200 rounded-full px-4 py-3 focus-within:border-emerald-500 focus-within:shadow-md transition-all duration-300">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 flex-shrink-0 text-base focus-within:text-emerald-600" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => search.trim().length > 0 && setShowSuggestions(true)}
                                className="w-full bg-transparent outline-none placeholder-slate-600 text-sm ml-3 text-slate-700"
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Mobile Search Suggestions */}
                        {showSuggestions && (
                            <div className="absolute top-full mt-2 left-2 right-2 w-auto bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                {loadingSuggestions ? (
                                    <div className="p-6 text-center">
                                        <div className="inline-block animate-spin">
                                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-emerald-600 text-xl" />
                                        </div>
                                        <p className="text-slate-600 text-xs mt-2">Searching...</p>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestions.map((product) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setShowSuggestions(false)
                                                    setSearch('')
                                                    setSuggestions([])
                                                    setTimeout(() => {
                                                        router.push(`/product/${product.id}`)
                                                    }, 50)
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors duration-200 border-b border-slate-100 last:border-b-0 cursor-pointer active:bg-emerald-100 bg-white border-0"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        setShowSuggestions(false)
                                                        setSearch('')
                                                        setSuggestions([])
                                                        setTimeout(() => {
                                                            router.push(`/product/${product.id}`)
                                                        }, 50)
                                                    }
                                                }}
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg overflow-hidden flex items-center justify-center border border-emerald-200 pointer-events-none">
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover pointer-events-none" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-600 text-sm pointer-events-none" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {product.category}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <p className="text-xs sm:text-sm font-bold text-emerald-600">
                                                        ₹{product.price}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center">
                                        <div className="inline-block p-3 bg-slate-100 rounded-full mb-3">
                                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-lg" />
                                        </div>
                                        <p className="text-slate-700 font-semibold text-sm mb-1">No products found</p>
                                        <p className="text-slate-500 text-xs">Try different keywords</p>
                                    </div>
                                )}

                                {/* View All Results Button - Mobile */}
                                {suggestions.length > 0 && (
                                    <div className="border-t-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white p-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleSearch({preventDefault: () => {}})
                                                setShowSuggestions(false)
                                            }}
                                            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 active:scale-95 text-sm"
                                            suppressHydrationWarning
                                        >
                                            View all results
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 animate-in slide-in-from-top-2 duration-300">
                        {/* Mobile Nav Links */}
                        <div className="space-y-2 py-3">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.href}
                                    href={link.href} 
                                    className="block px-4 py-3 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors font-medium text-sm"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Profile Section */}
                        {user ? (
                            <div className="border-t border-slate-200 pt-4 mt-4 px-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{user.firstName}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        router.push('/orders')
                                        setMobileMenuOpen(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium text-sm mb-2"
                                    suppressHydrationWarning
                                >
                                    <FontAwesomeIcon icon={faShoppingBag} className="text-lg" />
                                    My Orders
                                </button>
                                <div className="border-t border-slate-200 pt-3 mt-3" suppressHydrationWarning>
                                    <CustomUserButton />
                                </div>
                            </div>
                        ) : (
                            isLoaded && !user ? (
                                <div className="flex items-center justify-center mt-6">
                                    <button 
                                        onClick={() => {
                                            handleOpenSignIn()
                                            setMobileMenuOpen(false)
                                        }} 
                                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:shadow-lg active:scale-95 transition-all duration-300 text-white rounded-full font-semibold text-sm"
                                        suppressHydrationWarning
                                    >
                                        Login
                                    </button>
                                </div>
                            ) : null
                        )}
                    </div>
                )}
            </div>
            <hr className="border-slate-200" />
            <FAQModal isOpen={faqModalOpen} onClose={() => setFaqModalOpen(false)} />
        </nav>
    )
}

export default Navbar