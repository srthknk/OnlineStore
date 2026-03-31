'use client'
import { Suspense, useState, useMemo } from "react"
import ProductCard from "@/components/ProductCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faMagnifyingGlass, faSliders, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)
    
    const [localSearch, setLocalSearch] = useState(search || '')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        priceRange: 'all'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [filtersClosing, setFiltersClosing] = useState(false)

    const categories = ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages', 'Snacks', 'Spices & Seasonings', 'Canned Goods', 'Frozen Foods', 'Household Items']
    const priceRanges = [
        { label: 'All Prices', value: 'all', min: 0, max: Infinity },
        { label: 'Under ₹50', value: 'under50', min: 0, max: 50 },
        { label: '₹50 - ₹100', value: '50-100', min: 50, max: 100 },
        { label: '₹100 - ₹200', value: '100-200', min: 100, max: 200 },
        { label: 'Above ₹200', value: 'above200', min: 200, max: Infinity }
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

        // Category filter - Support multiple selections
        if (selectedFilters.categories.length > 0) {
            result = result.filter(product => selectedFilters.categories.includes(product.category))
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
        setSelectedFilters({ categories: [], priceRange: 'all' })
        setFiltersClosing(true)
        setTimeout(() => {
            setShowFilters(false)
            setFiltersClosing(false)
        }, 300)
    }

    const handleCategoryChange = (category) => {
        setSelectedFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }))
    }

    const handleCloseFilters = () => {
        setFiltersClosing(true)
        setTimeout(() => {
            setShowFilters(false)
            setFiltersClosing(false)
        }, 300)
    }

    const handlePriceChange = (priceRange) => {
        setSelectedFilters({ ...selectedFilters, priceRange })
    }

    const handleSortChange = (value) => {
        setSortBy(value)
    }

    return (
        <div className="min-h-[70vh] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-white via-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto">
                {/* Mobile Sort & Filter Buttons - Top of Page */}
                <div className="md:hidden mb-6 grid grid-cols-2 gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="px-3 py-2 border-2 border-slate-200 rounded-lg outline-none text-xs font-light bg-white hover:border-indigo-300 focus:border-indigo-500 transition-all duration-200 cursor-pointer text-slate-700"
                        suppressHydrationWarning
                    >
                        <option value="newest">Sort</option>
                        <option value="price-low">Price Low</option>
                        <option value="price-high">Price High</option>
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-light text-xs transition-all duration-300 ${showFilters ? 'bg-indigo-600 text-white border-2 border-indigo-600' : 'border-2 border-slate-200 text-slate-700 hover:border-indigo-300 bg-white'}`}
                        suppressHydrationWarning
                    >
                        <FontAwesomeIcon icon={faSliders} />
                        Filter
                    </button>
                </div>

                {/* Header Section - Desktop Only */}
                <div className="hidden md:block mb-8 sm:mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        {search && (
                            <button
                                onClick={() => router.push('/shop')}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-slate-600" />
                            </button>
                        )}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 tracking-tight">
                            Discover <span className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Premium</span> Products
                        </h1>
                    </div>
                    <p className="text-slate-600 text-sm sm:text-base font-light ml-1" suppressHydrationWarning>
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Search Bar - Desktop Only */}
                <form
                    onSubmit={handleSearch}
                    className="hidden md:block mb-8 sm:mb-10"
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
                        <button
                            type="submit"
                            className="px-6 sm:px-8 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                            suppressHydrationWarning
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Controls Bar */}
                <div
                    className="hidden md:block mb-8 sm:mb-10"
                >
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg outline-none text-sm font-light bg-white hover:border-indigo-300 hover:shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer text-slate-700"
                            suppressHydrationWarning
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="price-low">Sort: Price Low to High</option>
                            <option value="price-high">Sort: Price High to Low</option>
                        </select>

                        {/* Filters Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-light text-sm transition-all duration-300 whitespace-nowrap ${
                                showFilters
                                    ? 'bg-indigo-600 text-white shadow-lg border-2 border-indigo-600'
                                    : 'border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md bg-white'
                            }`}
                            suppressHydrationWarning
                        >
                            <FontAwesomeIcon icon={faSliders} size="lg" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>

                        {/* Spacer */}
                        <div className="flex-1 hidden sm:block"></div>

                        {/* Results Count - Desktop */}
                        <div
                            className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
                        >
                            <span className="text-sm font-medium text-indigo-700" suppressHydrationWarning>{filteredProducts.length}</span>
                            <span className="text-sm text-slate-600" suppressHydrationWarning>result{filteredProducts.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Clear All Button */}
                        {(localSearch || selectedFilters.categories.length > 0 || selectedFilters.priceRange !== 'all' || sortBy !== 'newest') && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 sm:px-5 py-2.5 sm:py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-light text-sm transition-all duration-300"
                                suppressHydrationWarning
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Results Count - Mobile */}
                    <div
                        className="hidden sm:flex mt-3 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-center border border-indigo-200"
                    >
                        <span className="text-sm font-medium text-indigo-700" suppressHydrationWarning>{filteredProducts.length}</span>
                        <span className="text-sm text-slate-600 ml-2" suppressHydrationWarning>result{filteredProducts.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Filters Panel */}
                {(showFilters || filtersClosing) && (
                    <>
                        {/* Mobile Backdrop */}
                        <div 
                            className={`md:hidden fixed inset-0 z-40 ${showFilters && !filtersClosing ? 'bg-black/30' : 'bg-black/0'} transition-colors duration-300`}
                            onClick={handleCloseFilters}
                        ></div>
                        
                        {/* Mobile Filter Panel - Slides in from right */}
                        <div 
                            className={`md:hidden fixed right-0 top-0 h-screen w-full sm:w-80 bg-white shadow-2xl z-50 flex flex-col overflow-y-auto transform ${filtersClosing ? 'animate-slideOutRight' : 'animate-slideInRight'} border-l border-slate-200`}
                        >
                            <div 
                                className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10"
                            >
                                <h3 className="font-medium text-lg text-slate-900">Filters</h3>
                                <button
                                    onClick={handleCloseFilters}
                                    className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
                                    suppressHydrationWarning
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-xl text-slate-600" />
                                </button>
                            </div>

                            <div className="flex-1 p-5 space-y-6">
                                {/* Category Filter */}
                                <div>
                                    <h4 className="font-medium text-sm text-slate-900 mb-4 uppercase tracking-widest text-slate-600">Category</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.categories.length === 0}
                                                onChange={() => setSelectedFilters({ ...selectedFilters, categories: [] })}
                                                className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                                                suppressHydrationWarning
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">All Categories</span>
                                        </label>
                                        {categories.map((cat) => (
                                            <label
                                                key={cat}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.categories.includes(cat)}
                                                    onChange={() => handleCategoryChange(cat)}
                                                    className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                                                    suppressHydrationWarning
                                                />
                                                <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <h4 className="font-medium text-sm text-slate-900 mb-4 uppercase tracking-widest text-slate-600">Price Range</h4>
                                    <div className="space-y-3">
                                        {priceRanges.map((range) => (
                                            <label
                                                key={range.value}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <input
                                                    type="radio"
                                                    name="price"
                                                    value={range.value}
                                                    checked={selectedFilters.priceRange === range.value}
                                                    onChange={(e) => handlePriceChange(e.target.value)}
                                                    className="w-4 h-4 cursor-pointer accent-indigo-600"
                                                    suppressHydrationWarning
                                                />
                                                <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-5 border-t border-slate-200 bg-white space-y-3 sticky bottom-0">
                                {(selectedFilters.categories.length > 0 || selectedFilters.priceRange !== 'all') && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full px-4 py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium text-sm transition-all duration-300"
                                        suppressHydrationWarning
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={handleCloseFilters}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg text-white rounded-lg font-medium text-sm transition-all duration-300 active:scale-95"
                                    suppressHydrationWarning
                                >
                                    Done
                                </button>
                            </div>
                        </div>

                        {/* Desktop Filter Panel */}
                        <div className="hidden md:block mb-6 sm:mb-8">
                            <div className="p-5 sm:p-8 bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-center mb-6 sm:mb-8">
                                    <h3 className="font-light text-lg sm:text-xl text-slate-900">Refine Your Search</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                                        suppressHydrationWarning
                                    >
                                        <FontAwesomeIcon icon={faXmark} size="lg" className="text-slate-600" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                                    {/* Category Filter */}
                                    <div>
                                        <h4 className="font-light text-sm sm:text-base text-slate-900 mb-4 uppercase tracking-widest text-opacity-60">Category</h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="category-desktop"
                                                    value=""
                                                    checked={selectedFilters.categories.length === 0}
                                                    onChange={() => setSelectedFilters({ ...selectedFilters, categories: [] })}
                                                    className="w-4 h-4 cursor-pointer accent-indigo-600"
                                                    suppressHydrationWarning
                                                />
                                                <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">All Categories</span>
                                            </label>
                                            {categories.map((cat) => (
                                                <label
                                                    key={cat}
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="category-desktop"
                                                        value={cat}
                                                        checked={selectedFilters.categories.length === 1 && selectedFilters.categories[0] === cat}
                                                        onChange={() => setSelectedFilters({ ...selectedFilters, categories: [cat] })}
                                                        className="w-4 h-4 cursor-pointer accent-indigo-600"
                                                        suppressHydrationWarning
                                                    />
                                                    <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Filter */}
                                    <div>
                                        <h4 className="font-light text-sm sm:text-base text-slate-900 mb-4 uppercase tracking-widest text-opacity-60">Price Range</h4>
                                        <div className="space-y-3">
                                            {priceRanges.map((range) => (
                                                <label
                                                    key={range.value}
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="price-desktop"
                                                        value={range.value}
                                                        checked={selectedFilters.priceRange === range.value}
                                                        onChange={(e) => handlePriceChange(e.target.value)}
                                                        className="w-4 h-4 cursor-pointer accent-indigo-600"
                                                        suppressHydrationWarning
                                                    />
                                                    <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors duration-200 font-light">{range.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-32">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div
                                key={product.id}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))
                    ) : (
                        <div
                            className="col-span-full py-12 sm:py-16 text-center"
                        >
                            <div className="inline-block">
                                <p className="text-slate-600 text-base sm:text-lg font-light mb-6">
                                    No products found matching your criteria
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-light transition-all duration-300 shadow-md hover:shadow-lg"
                                    suppressHydrationWarning
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
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
