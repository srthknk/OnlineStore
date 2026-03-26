'use client'
import { Suspense, useState, useMemo } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, Search, Sliders, X } from "lucide-react"
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
        category: '',
        priceRange: 'all'
    })
    const [showFilters, setShowFilters] = useState(false)

    const categories = ['T-Shirts', 'Shirts', 'Trousers', 'Jeans', 'Kurta', 'Kurti', 'Saree', 'Dress', 'Jacket', 'Sweater']
    const priceRanges = [
        { label: 'All Prices', value: 'all', min: 0, max: Infinity },
        { label: 'Under ₹25', value: 'under25', min: 0, max: 25 },
        { label: '₹25 - ₹50', value: '25-50', min: 25, max: 50 },
        { label: '₹50 - ₹100', value: '50-100', min: 50, max: 100 },
        { label: 'Above ₹100', value: 'above100', min: 100, max: Infinity }
    ]

    // Filter products
    const filteredProducts = useMemo(() => {
        let result = products

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
        <div className="min-h-[70vh] mx-4 sm:mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <h1 onClick={() => router.push('/shop')} className="text-2xl sm:text-3xl text-slate-500 my-4 sm:my-6 flex items-center gap-2 cursor-pointer">
                    {search && <MoveLeftIcon size={20} />}
                    All <span className="text-slate-700 font-medium">Products</span>
                </h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6 animate-fadeIn">
                    <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                        <div className="flex items-center gap-2 flex-1 bg-slate-100 px-4 py-2.5 rounded-lg border border-transparent hover:border-slate-300 transition-all duration-200 focus-within:border-indigo-500 focus-within:bg-white">
                            <Search size={20} className="text-slate-400 flex-shrink-0 transition-colors duration-200" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full bg-transparent outline-none placeholder-slate-500 text-sm sm:text-base transition-colors duration-200"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg btn-animate"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Controls Bar - Single Line */}
                <div className="mb-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm font-medium bg-white hover:border-indigo-400 hover:shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="price-low">Sort: Price Low to High</option>
                            <option value="price-high">Sort: Price High to Low</option>
                        </select>

                        {/* Filters Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 btn-animate ${
                                showFilters
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'border border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-md'
                            } active:scale-95`}
                        >
                            <Sliders size={18} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>

                        {/* Spacer */}
                        <div className="flex-1 hidden sm:block"></div>

                        {/* Results Count - Desktop */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">{filteredProducts.length}</span>
                            <span className="text-sm text-slate-600">product{filteredProducts.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Clear All Button */}
                        {(localSearch || selectedFilters.category || selectedFilters.priceRange !== 'all' || sortBy !== 'newest') && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium text-sm transition-all duration-300 btn-animate active:scale-95"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Results Count - Mobile */}
                    <div className="sm:hidden mt-3 px-4 py-2 bg-slate-50 rounded-lg text-center">
                        <span className="text-sm font-medium text-slate-700">{filteredProducts.length}</span>
                        <span className="text-sm text-slate-600 ml-2">product{filteredProducts.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Filters Panel - Smooth Collapse/Expand */}
                <div
                    style={{
                        maxHeight: showFilters ? '600px' : '0px',
                        opacity: showFilters ? 1 : 0,
                    }}
                    className="overflow-hidden transition-all duration-300 ease-out"
                >
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-md mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-800">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-1 hover:bg-slate-300 rounded transition-colors duration-200 active:scale-95"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Category Filter */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Category</h4>
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            value=""
                                            checked={selectedFilters.category === ''}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-4 h-4 cursor-pointer accent-indigo-600 transition-all duration-200"
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors duration-200">All Categories</span>
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={selectedFilters.category === cat}
                                                onChange={(e) => handleCategoryChange(e.target.value)}
                                                className="w-4 h-4 cursor-pointer accent-indigo-600 transition-all duration-200"
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors duration-200">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Price Range</h4>
                                <div className="space-y-2.5">
                                    {priceRanges.map(range => (
                                        <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="price"
                                                value={range.value}
                                                checked={selectedFilters.priceRange === range.value}
                                                onChange={(e) => handlePriceChange(e.target.value)}
                                                className="w-4 h-4 cursor-pointer accent-indigo-600 transition-all duration-200"
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors duration-200">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-32">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-slate-500 text-lg">No products found matching your criteria</p>
                            <button
                                onClick={handleClearFilters}
                                className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                            >
                                Clear Filters
                            </button>
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
