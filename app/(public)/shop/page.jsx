'use client'
import { Suspense, useState, useMemo, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import ProductCard from "@/components/ProductCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faMagnifyingGlass, faSliders, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

gsap.registerPlugin(ScrollTrigger)

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)
    
    const [localSearch, setLocalSearch] = useState(search || '')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedFilters, setSelectedFilters] = useState({
        category: '',
        priceRange: 'all'
    })
    const [showFilters, setShowFilters] = useState(false)

    // GSAP Refs
    const headerRef = useRef(null)
    const gridRef = useRef(null)
    const filtersRef = useRef(null)

    const categories = ['T-Shirts', 'Shirts', 'Trousers', 'Jeans', 'Kurta', 'Kurti', 'Saree', 'Dress', 'Jacket', 'Sweater']
    const priceRanges = [
        { label: 'All Prices', value: 'all', min: 0, max: Infinity },
        { label: 'Under ₹25', value: 'under25', min: 0, max: 25 },
        { label: '₹25 - ₹50', value: '25-50', min: 25, max: 50 },
        { label: '₹50 - ₹100', value: '50-100', min: 50, max: 100 },
        { label: 'Above ₹100', value: 'above100', min: 100, max: Infinity }
    ]

    // Filter products - MUST be defined BEFORE useEffect that depends on it
    const filteredProducts = useMemo(() => {
        let result = products

        // Exclude expired products (data consistency validation)
        result = result.filter(product => {
            if (!product.expiryDate) return true
            return new Date(product.expiryDate) > new Date()
        })

        // Search filter
        if (localSearch) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(localSearch.toLowerCase()) ||
                product.description.toLowerCase().includes(localSearch.toLowerCase())
            )
        }

        // Category filter
        if (selectedFilters.category) {
            result = result.filter(product => product.category === selectedFilters.category)
        }

        // Price filter
        const priceRange = priceRanges.find(r => r.value === selectedFilters.priceRange)
        if (priceRange) {
            result = result.filter(product => product.price >= priceRange.min && product.price <= priceRange.max)
        }

        // Sort
        if (sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price)
        } else if (sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price)
        } else if (sortBy === 'newest') {
            result.reverse()
        }

        return result
    }, [localSearch, products, selectedFilters, sortBy])

    // GSAP Animation Effects
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return

        // Header entrance animation with GSAP
        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: -30 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
            )
        }

        // Grid scroll trigger animation
        if (gridRef.current && gridRef.current.children.length > 0) {
            const isMobile = window.innerWidth < 640
            
            gsap.to(gridRef.current.children, {
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: isMobile ? "top 80%" : "top 70%",
                    toggleActions: "play none none none",
                    once: true,
                    markers: false
                },
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: isMobile ? 0.08 : 0.05,
                ease: "power2.out"
            })

            return () => {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill())
            }
        }
    }, [filteredProducts])

    // Responsive GSAP animations on filter changes
    useEffect(() => {
        if (filtersRef.current && showFilters) {
            gsap.fromTo(
                filtersRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            )
        }
    }, [showFilters])

    const handleSearch = (e) => {
        e.preventDefault()
        if (localSearch) {
            router.push(`/shop?search=${encodeURIComponent(localSearch)}`)
        } else {
            router.push('/shop')
        }
    }

    const handleClearFilters = () => {
        setLocalSearch('')
        setSortBy('newest')
        setSelectedFilters({ category: '', priceRange: 'all' })
        setShowFilters(false)
    }

    const handleCategoryChange = (category) => {
        setSelectedFilters({ ...selectedFilters, category })
        setTimeout(() => setShowFilters(false), 300)
    }

    const handlePriceChange = (priceRange) => {
        setSelectedFilters({ ...selectedFilters, priceRange })
        setTimeout(() => setShowFilters(false), 300)
    }

    const handleSortChange = (value) => {
        setSortBy(value)
    }

    return (
        <div className="min-h-[70vh] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-white via-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto">
                {/* Premium Header Section with GSAP */}
                <motion.div ref={headerRef} className="mb-8 sm:mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        {search && (
                            <motion.button
                                onClick={() => router.push('/shop')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-slate-600" />
                            </motion.button>
                        )}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 tracking-tight">
                            Discover <span className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Premium</span> Products
                        </h1>
                    </div>
                    <p className="text-slate-600 text-sm sm:text-base font-light ml-1" suppressHydrationWarning>
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                    </p>
                </motion.div>

                {/* Search Bar with Premium Design */}
                <motion.form
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8 sm:mb-10"
                >
                    <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                        <div className="flex items-center gap-3 flex-1 bg-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:shadow-lg transition-all duration-300">
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="text-slate-400 flex-shrink-0 transition-colors duration-200 text-sm sm:text-base"
                            />
                            <input
                                type="text"
                                placeholder="Search for products, categories..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full bg-transparent outline-none placeholder-slate-400 text-sm sm:text-base text-slate-900 font-light transition-colors duration-200"
                                suppressHydrationWarning
                            />
                        </div>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 sm:px-8 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                            suppressHydrationWarning
                        >
                            Search
                        </motion.button>
                    </div>
                </motion.form>

                {/* Premium Controls Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mb-8 sm:mb-10"
                >
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Sort Dropdown */}
                        <motion.select
                            whileHover={{ scale: 1.01 }}
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg outline-none text-sm font-light bg-white hover:border-indigo-300 hover:shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer text-slate-700"
                            suppressHydrationWarning
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="price-low">Sort: Price Low to High</option>
                            <option value="price-high">Sort: Price High to Low</option>
                        </motion.select>

                        {/* Filters Toggle Button */}
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-light text-sm transition-all duration-300 whitespace-nowrap ${
                                showFilters
                                    ? 'bg-indigo-600 text-white shadow-lg border-2 border-indigo-600'
                                    : 'border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md bg-white'
                            }`}
                            suppressHydrationWarning
                        >
                            <FontAwesomeIcon icon={faSliders} size="lg" />
                            <span className="hidden sm:inline">Filters</span>
                        </motion.button>

                        {/* Spacer */}
                        <div className="flex-1 hidden sm:block"></div>

                        {/* Results Count - Desktop */}
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
                            suppressHydrationWarning
                        >
                            <span className="text-sm font-medium text-indigo-700">{filteredProducts.length}</span>
                            <span className="text-sm text-slate-600">result{filteredProducts.length !== 1 ? 's' : ''}</span>
                        </motion.div>

                        {/* Clear All Button */}
                        {(localSearch || selectedFilters.category || selectedFilters.priceRange !== 'all' || sortBy !== 'newest') && (
                            <motion.button
                                onClick={handleClearFilters}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 sm:px-5 py-2.5 sm:py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-light text-sm transition-all duration-300"
                                suppressHydrationWarning
                            >
                                Clear All
                            </motion.button>
                        )}
                    </div>

                    {/* Results Count - Mobile */}
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="sm:hidden mt-3 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-center border border-indigo-200"
                        suppressHydrationWarning
                    >
                        <span className="text-sm font-medium text-indigo-700">{filteredProducts.length}</span>
                        <span className="text-sm text-slate-600 ml-2">result{filteredProducts.length !== 1 ? 's' : ''}</span>
                    </motion.div>
                </motion.div>

                {/* Premium Filters Panel with GSAP */}
                <motion.div
                    ref={filtersRef}
                    initial={false}
                    animate={{
                        height: showFilters ? 'auto' : 0,
                        opacity: showFilters ? 1 : 0,
                        marginBottom: showFilters ? 24 : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden mb-6 sm:mb-8"
                >
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="p-5 sm:p-8 bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h3 className="font-light text-lg sm:text-xl text-slate-900">Refine Your Search</h3>
                            <motion.button
                                onClick={() => setShowFilters(false)}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                                suppressHydrationWarning
                            >
                                <FontAwesomeIcon icon={faXmark} size="lg" className="text-slate-600" />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                            {/* Category Filter */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <h4 className="font-light text-sm sm:text-base text-slate-900 mb-4 uppercase tracking-widest text-opacity-60">Category</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <motion.input
                                            type="radio"
                                            name="category"
                                            value=""
                                            checked={selectedFilters.category === ''}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            whileHover={{ scale: 1.2 }}
                                            className="w-4 h-4 cursor-pointer accent-indigo-600"
                                            suppressHydrationWarning
                                        />
                                        <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">All Categories</span>
                                    </label>
                                    {categories.map((cat, idx) => (
                                        <motion.label
                                            key={cat}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <motion.input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={selectedFilters.category === cat}
                                                onChange={(e) => handleCategoryChange(e.target.value)}
                                                whileHover={{ scale: 1.2 }}
                                                className="w-4 h-4 cursor-pointer accent-indigo-600"
                                                suppressHydrationWarning
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">{cat}</span>
                                        </motion.label>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Price Filter */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <h4 className="font-light text-sm sm:text-base text-slate-900 mb-4 uppercase tracking-widest text-opacity-60">Price Range</h4>
                                <div className="space-y-3">
                                    {priceRanges.map((range, idx) => (
                                        <motion.label
                                            key={range.value}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <motion.input
                                                type="radio"
                                                name="price"
                                                value={range.value}
                                                checked={selectedFilters.priceRange === range.value}
                                                onChange={(e) => handlePriceChange(e.target.value)}
                                                whileHover={{ scale: 1.2 }}
                                                className="w-4 h-4 cursor-pointer accent-indigo-600"
                                                suppressHydrationWarning
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">{range.label}</span>
                                        </motion.label>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Premium Products Grid with GSAP ScrollTrigger */}
                <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-32">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-12 sm:py-16 text-center"
                        >
                            <div className="inline-block">
                                <p className="text-slate-600 text-base sm:text-lg font-light mb-6">
                                    No products found matching your criteria
                                </p>
                                <motion.button
                                    onClick={handleClearFilters}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-light transition-all duration-300 shadow-md hover:shadow-lg"
                                    suppressHydrationWarning
                                >
                                    Clear Filters
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
