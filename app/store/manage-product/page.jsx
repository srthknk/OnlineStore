'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPencil, faLeaf, faPlus, faLink, faImage, faTag } from "@fortawesome/free-solid-svg-icons"

export default function StoreManageProducts() {

    const { getToken } = useAuth()
    const { user } = useUser()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [editingProduct, setEditingProduct] = useState(null)
    const [editFormData, setEditFormData] = useState(null)
    const [editImages, setEditImages] = useState({})
    const [editImageUrls, setEditImageUrls] = useState({})
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [isEditingStock, setIsEditingStock] = useState(false)
    const [stockData, setStockData] = useState({})
    const [editingVariants, setEditingVariants] = useState([])
    const [newVariant, setNewVariant] = useState({ quantity: '', quantityUnit: 'PIECE', totalUnits: '' })
    const categories = ['Fresh Produce', 'Dairy & Eggs', 'Meat & Fish', 'Pantry Staples', 'Frozen Foods', 'Beverages', 'Organic', 'Bakery', 'Snacks', 'Spices', 'Others']

    const fetchProducts = async () => {
        try {
             const token = await getToken()
             const { data } = await axios.get('/api/store/product', {headers: { Authorization: `Bearer ${token}` } })
             setProducts(data.products.sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt)))
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const toggleStock = async (productId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/store/stock-toggle',{ productId }, {headers: { Authorization: `Bearer ${token}` } })
            setProducts(prevProducts => prevProducts.map(product =>  product.id === productId ? {...product, inStock: !product.inStock} : product))

            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const deleteProduct = async (productId, productName) => {
        if(!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return

        try {
            const token = await getToken()
            await axios.delete(`/api/store/product?productId=${productId}`, {headers: { Authorization: `Bearer ${token}` } })
            
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId))
            toast.success('Product deleted successfully!')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setEditFormData({
            name: product.name,
            description: product.description,
            mrp: product.mrp,
            price: product.price,
            category: product.category,
            manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate).toISOString().split('T')[0] : '',
            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
            isVegan: product.isVegan || false,
            isOrganic: product.isOrganic || false,
            manufacturer: product.manufacturer || ''
        })
        setEditImages({})
        setEditImageUrls({})
        setEditingVariants(product.productVariants || [])
        setNewVariant({ quantity: '', quantityUnit: 'PIECE', totalUnits: '' })
        setIsEditingStock(false)
        // Initialize stock data
        if(product.productVariants && product.productVariants.length > 0) {
            const variants = {}
            product.productVariants.forEach(pv => {
                variants[pv.id] = pv.availableUnits
            })
            setStockData(variants)
        } else {
            setStockData({ units: product.totalUnits || 0 })
        }
        setIsEditModalOpen(true)
    }

    const closeEditModal = () => {
        setEditingProduct(null)
        setEditFormData(null)
        setEditImages({})
        setEditImageUrls({})
        setEditingVariants([])
        setNewVariant({ quantity: '', quantityUnit: 'PIECE', totalUnits: '' })
        setIsEditingStock(false)
        setStockData({})
        setIsEditModalOpen(false)
    }

    const handleEditImageUpload = (key, file) => {
        setEditImages(prev => ({ ...prev, [key]: file }))
    }

    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
    }

    const handleStockChange = (sizeOrKey, value) => {
        setStockData(prev => ({ ...prev, [sizeOrKey]: Math.max(0, Number(value)) }))
    }

    const submitStockUpdate = async () => {
        try {
            setEditLoading(true)
            const token = await getToken()
            
            const payload = {
                productId: editingProduct.id,
                hasVariants: editingProduct.productVariants && editingProduct.productVariants.length > 0,
                stockData
            }

            const { data } = await axios.post('/api/store/product/update-stock', payload, { 
                headers: { Authorization: `Bearer ${token}` } 
            })
            
            // Update the product in the list
            setProducts(prevProducts => prevProducts.map(product =>
                product.id === editingProduct.id
                    ? { ...product, ...data.updatedProduct }
                    : product
            ))
            
            toast.success('Stock updated successfully!')
            setIsEditingStock(false)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setEditLoading(false)
        }
    }

    const submitEditProduct = async (e) => {
        e.preventDefault()
        
        if(!editFormData.name || !editFormData.description || !editFormData.mrp || !editFormData.price || !editFormData.category) {
            return toast.error('Please fill all required fields')
        }

        // Date validation
        if(editFormData.manufacturingDate && editFormData.expiryDate) {
            const mfgDate = new Date(editFormData.manufacturingDate)
            const expDate = new Date(editFormData.expiryDate)
            if(expDate <= mfgDate) {
                return toast.error('Expiry date must be after manufacturing date')
            }
        }

        try {
            setEditLoading(true)
            const token = await getToken()
            
            const formData = new FormData()
            formData.append('productId', editingProduct.id)
            formData.append('name', editFormData.name)
            formData.append('description', editFormData.description)
            formData.append('mrp', editFormData.mrp)
            formData.append('price', editFormData.price)
            formData.append('category', editFormData.category)
            formData.append('manufacturingDate', editFormData.manufacturingDate || '')
            formData.append('expiryDate', editFormData.expiryDate || '')
            formData.append('isVegan', editFormData.isVegan)
            formData.append('isOrganic', editFormData.isOrganic)
            formData.append('manufacturer', editFormData.manufacturer)
            formData.append('variants', JSON.stringify(editingVariants))

            // Add file images
            Object.keys(editImages).forEach((key) => {
                if(editImages[key]) formData.append('newImages', editImages[key])
            })

            // Add image URLs
            const urlImageArray = Object.values(editImageUrls).filter(url => url.trim())
            if(urlImageArray.length > 0) {
                formData.append('imageUrls', JSON.stringify(urlImageArray))
            }

            await axios.put('/api/store/product', formData, { headers: { Authorization: `Bearer ${token}` } })
            
            // Update the product in the list
            setProducts(prevProducts => prevProducts.map(product =>
                product.id === editingProduct.id
                    ? { ...product, ...editFormData }
                    : product
            ))
            
            toast.success('Product updated successfully!')
            closeEditModal()
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setEditLoading(false)
        }
    }

    useEffect(() => {
        if(user){
            fetchProducts()
        }  
    }, [user])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-6">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            
            {/* Product Cards Grid - Unified Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                        {/* Product Image */}
                        <div className="relative w-full h-40 md:h-48 bg-slate-100 overflow-hidden">
                            <Image 
                                width={300} 
                                height={200} 
                                className='w-full h-full object-cover' 
                                src={product.images[0]} 
                                alt={product.name} 
                            />
                            {/* Stock Status Badge */}
                            <div className="absolute top-2 right-2">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            
                            {/* Badges (Organic/Vegan) */}
                            {(product.isOrganic || product.isVegan) && (
                                <div className="absolute top-2 left-2 flex gap-1">
                                    {product.isOrganic && (
                                        <span className="bg-green-50 text-green-700 px-2 py-1 text-xs font-medium rounded flex items-center gap-1 border border-green-200">
                                            <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-xs" />
                                            Organic
                                        </span>
                                    )}
                                    {product.isVegan && (
                                        <span className="bg-lime-50 text-lime-700 px-2 py-1 text-xs font-medium rounded flex items-center gap-1 border border-lime-200">
                                            <FontAwesomeIcon icon={faLeaf} className="text-lime-600 text-xs" />
                                            Vegan
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex flex-col flex-1">
                            {/* Product Name */}
                            <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-1 line-clamp-2">{product.name}</h3>
                            
                            {/* Description */}
                            <p className="text-xs md:text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>

                            {/* Prices */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-3 mb-3 border border-slate-200">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-slate-600 mb-0.5">MRP</p>
                                        <p className="text-sm font-semibold text-slate-700 line-through">{currency} {product.mrp.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-600 mb-0.5">Price</p>
                                        <p className="text-lg font-bold text-green-600">{currency} {product.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Variants Preview */}
                            {product.productVariants && product.productVariants.length > 0 && (
                                <div className="mb-3 pb-3 border-b border-slate-200">
                                    <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faTag} className="text-slate-600 text-xs" />
                                        Variants ({product.productVariants.length})
                                    </p>
                                    <div className="space-y-2">
                                        {product.productVariants.slice(0, 3).map((variant) => {
                                            const stockPercentage = (variant.availableUnits / variant.totalUnits) * 100;
                                            const stockStatus = variant.availableUnits === 0 ? 'Out' : variant.availableUnits <= 5 ? 'Low' : 'OK';
                                            const stockColor = variant.availableUnits === 0 ? 'bg-red-500' : variant.availableUnits <= 5 ? 'bg-amber-500' : 'bg-green-500';
                                            
                                            return (
                                                <div key={variant.id} className="flex items-center gap-2">
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 flex-shrink-0">
                                                        {variant.quantity}{variant.quantityUnit === 'PIECE' ? 'x' : variant.quantityUnit === 'KG' ? 'kg' : variant.quantityUnit === 'GRAM' ? 'g' : variant.quantityUnit === 'LITER' ? 'L' : variant.quantityUnit === 'MILLILITER' ? 'ml' : variant.quantityUnit}
                                                    </span>
                                                    <div className="flex-1 flex items-center gap-1.5">
                                                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                            <div className={`h-full ${stockColor}`} style={{ width: `${Math.max(5, stockPercentage)}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600 min-w-12 text-right">{variant.availableUnits}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {product.productVariants.length > 3 && (
                                            <p className="text-xs text-slate-500 pl-2 pt-1">+{product.productVariants.length - 3} more</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Stock Summary */}
                            {!product.productVariants || product.productVariants.length === 0 ? (
                                <div className="mb-3 pb-3 border-b border-slate-200">
                                    <p className="text-xs text-slate-600 mb-1.5">Stock Level</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full ${product.totalUnits === 0 ? 'bg-red-500' : product.totalUnits <= 10 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.max(5, (product.totalUnits / (product.totalUnits + 50)) * 100)}%` }}></div>
                                        </div>
                                        <span className={`text-sm font-bold min-w-16 text-right ${product.totalUnits === 0 ? 'text-red-600' : product.totalUnits <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                                            {product.totalUnits} units
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Category */}
                            <p className="text-xs text-slate-600 mb-3">
                                <span className="font-medium text-slate-700">Category:</span> {product.category}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => openEditModal(product)}
                                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-300 border border-blue-200"
                                    title="Edit product"
                                >
                                    <FontAwesomeIcon icon={faPencil} className="text-sm" />
                                    <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                    onClick={() => deleteProduct(product.id, product.name)}
                                    className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-300 border border-red-200"
                                    title="Delete product"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                    <span className="hidden sm:inline">Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comprehensive Edit Product Modal */}
            {isEditModalOpen && editingProduct && editFormData && (
                <div onClick={closeEditModal} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg sm:text-2xl font-semibold text-slate-800">Edit Product</h2>
                            <button onClick={closeEditModal} className="text-slate-500 hover:text-slate-700 text-2xl font-light">&times;</button>
                        </div>

                        <form onSubmit={submitEditProduct} className="p-4 sm:p-6 space-y-6">
                            {/* SECTION 1: Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</span>
                                    Basic Information
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditFormChange}
                                        rows={3}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Actual Price ({currency})</label>
                                        <input
                                            type="number"
                                            name="mrp"
                                            value={editFormData.mrp}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Offer Price ({currency})</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={editFormData.price}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={editFormData.category}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* SECTION 2: Images */}
                            <div className="space-y-4 pb-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">2</span>
                                    Images
                                </h3>

                                {/* File Uploads */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faImage} className="text-purple-600" />
                                        File Uploads
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map((key) => (
                                            <label key={key} htmlFor={`edit-images${key}`}>
                                                {editImages[key] || editingProduct.images[key-1] ? (
                                                    <Image
                                                        width={100}
                                                        height={100}
                                                        className='w-full aspect-square object-cover border-2 border-slate-200 rounded-lg cursor-pointer hover:border-purple-400 transition-colors'
                                                        src={editImages[key] ? URL.createObjectURL(editImages[key]) : editingProduct.images[key-1]}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <div className='w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors flex items-center justify-center bg-slate-50'>
                                                        <div className="text-center">
                                                            <FontAwesomeIcon icon={faPlus} className="text-slate-400 mb-1 text-lg" />
                                                            <span className="text-xs text-slate-400">Add</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept='image/*'
                                                    id={`edit-images${key}`}
                                                    onChange={e => handleEditImageUpload(key, e.target.files[0])}
                                                    hidden
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* URL Uploads */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faLink} className="text-indigo-600" />
                                        Image URLs (from Internet)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map((key) => (
                                            <input
                                                key={key}
                                                type="url"
                                                placeholder={`Image URL ${key} (optional)`}
                                                value={editImageUrls[key] || ''}
                                                onChange={(e) => setEditImageUrls(prev => ({ ...prev, [key]: e.target.value }))}
                                                className="w-full p-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faLink} className="text-indigo-500" />
                                        Paste direct image URLs (e.g., from ImageKit or other CDNs)
                                    </p>
                                </div>
                            </div>

                            {/* SECTION 3: Dates & Manufacturer */}
                            <div className="space-y-4 pb-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">3</span>
                                    Dates & Manufacturer
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturing Date</label>
                                        <input
                                            type="date"
                                            value={editFormData.manufacturingDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, manufacturingDate: e.target.value })}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={editFormData.expiryDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.manufacturer}
                                        onChange={(e) => setEditFormData({ ...editFormData, manufacturer: e.target.value })}
                                        placeholder="e.g., ABC Foods Ltd."
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* SECTION 4: Product Badges */}
                            <div className="space-y-4 pb-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">4</span>
                                    Product Badges
                                </h3>

                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={editFormData.isOrganic}
                                            onChange={(e) => setEditFormData({ ...editFormData, isOrganic: e.target.checked })}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                                        />
                                        <span className="ml-3 flex items-center gap-2 font-medium text-green-700">
                                            <FontAwesomeIcon icon={faLeaf} className="text-green-600" />
                                            Organic Product
                                        </span>
                                    </label>

                                    <label className="flex items-center p-3 border border-lime-200 rounded-lg bg-lime-50 hover:bg-lime-100 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={editFormData.isVegan}
                                            onChange={(e) => setEditFormData({ ...editFormData, isVegan: e.target.checked })}
                                            className="w-4 h-4 text-lime-600 rounded focus:ring-2 focus:ring-lime-500 cursor-pointer"
                                        />
                                        <span className="ml-3 flex items-center gap-2 font-medium text-lime-700">
                                            <FontAwesomeIcon icon={faLeaf} className="text-lime-600" />
                                            Vegan Product
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* SECTION 5: Variants */}
                            <div className="space-y-4 pb-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm">5</span>
                                    Product Variants ({editingVariants.length})
                                </h3>

                                {editingVariants.length > 0 ? (
                                    <div className="space-y-2 mb-4">
                                        {editingVariants.map((variant, idx) => (
                                            <div key={variant.id} className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {variant.quantity} {variant.quantityUnit === 'PIECE' ? 'pieces' : variant.quantityUnit === 'KG' ? 'kg' : variant.quantityUnit === 'GRAM' ? 'g' : variant.quantityUnit === 'LITER' ? 'L' : variant.quantityUnit === 'MILLILITER' ? 'ml' : variant.quantityUnit} 
                                                    <span className="text-xs text-slate-500 ml-2">({variant.availableUnits} available)</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingVariants(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                    title="Delete variant"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-600 italic">No variants added yet</p>
                                )}

                                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg space-y-3">
                                    <p className="text-sm font-medium text-slate-700">Add New Variant</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Quantity"
                                            value={newVariant.quantity}
                                            onChange={(e) => setNewVariant({ ...newVariant, quantity: e.target.value })}
                                            className="p-2 border border-cyan-200 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                        />
                                        <select
                                            value={newVariant.quantityUnit}
                                            onChange={(e) => setNewVariant({ ...newVariant, quantityUnit: e.target.value })}
                                            className="p-2 border border-cyan-200 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                        >
                                            <option value="PIECE">Piece</option>
                                            <option value="KG">Kg</option>
                                            <option value="GRAM">Gram</option>
                                            <option value="LITER">Liter</option>
                                            <option value="MILLILITER">Milliliter</option>
                                            <option value="DOZEN">Dozen</option>
                                            <option value="PACKET">Packet</option>
                                            <option value="BOTTLE">Bottle</option>
                                            <option value="BOX">Box</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Total Units"
                                            value={newVariant.totalUnits}
                                            onChange={(e) => setNewVariant({ ...newVariant, totalUnits: e.target.value })}
                                            className="p-2 border border-cyan-200 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:col-span-2"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if(newVariant.quantity && newVariant.totalUnits) {
                                                setEditingVariants([...editingVariants, {
                                                    id: `new-${Date.now()}`,
                                                    quantity: parseFloat(newVariant.quantity),
                                                    quantityUnit: newVariant.quantityUnit,
                                                    totalUnits: parseFloat(newVariant.totalUnits),
                                                    availableUnits: parseFloat(newVariant.totalUnits)
                                                }])
                                                setNewVariant({ quantity: '', quantityUnit: 'PIECE', totalUnits: '' })
                                                toast.success('Variant added')
                                            } else {
                                                toast.error('Fill quantity and total units')
                                            }
                                        }}
                                        className="w-full py-2 px-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="text-sm" />
                                        Add Variant
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 6: Stock Management */}
                            <div className="space-y-4 pb-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">6</span>
                                    Stock Management
                                </h3>

                                {!isEditingStock ? (
                                    <div className="space-y-2">
                                        {editingProduct?.productVariants && editingProduct?.productVariants.length > 0 ? (
                                            <>
                                                <p className="text-sm text-slate-600 mb-3">Current stock by variant:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {editingProduct?.productVariants?.map((pv) => (
                                                        <div key={pv.id} className="bg-orange-50 rounded p-3 border border-orange-200 text-center">
                                                            <p className="text-xs font-semibold text-slate-700">{pv.quantity}{pv.quantityUnit === 'PIECE' ? 'x' : pv.quantityUnit === 'KG' ? 'kg' : pv.quantityUnit === 'GRAM' ? 'g' : pv.quantityUnit === 'LITER' ? 'L' : pv.quantityUnit === 'MILLILITER' ? 'ml' : pv.quantityUnit}</p>
                                                            <p className="text-lg font-bold text-orange-600">{pv.availableUnits}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-orange-50 rounded p-4 border border-orange-200">
                                                <p className="text-xs text-slate-600 mb-2">Current stock:</p>
                                                <p className="text-3xl font-bold text-orange-600">{editingProduct?.totalUnits || 0}</p>
                                                <p className="text-xs text-slate-500 mt-1">Units available</p>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingStock(true)}
                                            className="w-full py-2 px-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-medium text-sm transition-colors mt-3"
                                        >
                                            Update Stock
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {editingProduct?.productVariants && editingProduct?.productVariants.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-sm text-slate-600">Update units for each variant:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {editingProduct?.productVariants?.map((pv) => (
                                                        <div key={pv.id}>
                                                            <label className="text-xs font-medium text-slate-700 block mb-1">{pv.quantity}{pv.quantityUnit === 'PIECE' ? 'x' : pv.quantityUnit === 'KG' ? 'kg' : pv.quantityUnit === 'GRAM' ? 'g' : pv.quantityUnit === 'LITER' ? 'L' : pv.quantityUnit === 'MILLILITER' ? 'ml' : pv.quantityUnit}</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={stockData[pv.id] || 0}
                                                                onChange={(e) => handleStockChange(pv.id, e.target.value)}
                                                                className="w-full p-2 border border-orange-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-2">Units Available</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={stockData.units || 0}
                                                    onChange={(e) => handleStockChange('units', e.target.value)}
                                                    className="w-full p-2.5 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingStock(false)}
                                                className="flex-1 px-3 py-2 text-sm text-slate-700 bg-slate-200 hover:bg-slate-300 rounded font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={submitStockUpdate}
                                                disabled={editLoading}
                                                className="flex-1 px-3 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {editLoading ? 'Updating...' : 'Update Stock'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Buttons */}
                            <div className="flex gap-2 justify-end sticky bottom-0 bg-white border-t border-slate-200 pt-4 -mx-6 px-6 pb-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {editLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}