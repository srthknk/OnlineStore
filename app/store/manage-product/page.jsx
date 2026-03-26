'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { Trash2Icon, EditIcon } from "lucide-react"

export default function StoreManageProducts() {

    const { getToken } = useAuth()
    const { user } = useUser()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [editingProduct, setEditingProduct] = useState(null)
    const [editFormData, setEditFormData] = useState(null)
    const [editImages, setEditImages] = useState({})
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [isEditingStock, setIsEditingStock] = useState(false)
    const [stockData, setStockData] = useState({})

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
            category: product.category
        })
        setEditImages({})
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
            return toast.error('Please fill all fields')
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

            Object.keys(editImages).forEach((key) => {
                editImages[key] && formData.append('newImages', editImages[key])
            })

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
            
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 hidden md:table-cell">Description</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 hidden lg:table-cell">MRP</th>
                            <th className="px-4 py-3 font-semibold text-slate-700">Price</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 text-center">Status</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 divide-y divide-slate-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-200">
                                <td className="px-4 py-3">
                                    <div className="flex gap-3 items-center">
                                        <Image width={40} height={40} className='w-10 h-10 rounded object-cover shadow-sm' src={product.images[0]} alt="" />
                                        <span className="font-medium text-slate-700">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 max-w-xs text-slate-600 hidden md:table-cell truncate text-sm">{product.description}</td>
                                <td className="px-4 py-3 hidden lg:table-cell font-medium">{currency} {product.mrp.toLocaleString()}</td>
                                <td className="px-4 py-3 font-semibold text-green-600">{currency} {product.price.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating..." })} checked={product.inStock} />
                                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200 shadow-sm"></div>
                                        <span className="dot absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-md"></span>
                                    </label>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex gap-2 justify-center items-center">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg btn-animate btn-primary transition-all duration-300"
                                            title="Edit product"
                                        >
                                            <EditIcon size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id, product.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg btn-animate btn-danger transition-all duration-300"
                                            title="Delete product"
                                        >
                                            <Trash2Icon size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
                {products.map((product) => (
                    <div key={product.id} className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-all duration-200">
                        <div className="flex gap-3 mb-3">
                            <Image width={60} height={60} className='w-16 h-16 rounded-lg object-cover shadow-sm' src={product.images[0]} alt="" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                                <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-600">Actual Price</p>
                                <p className="font-semibold text-slate-800">{currency} {product.mrp.toLocaleString()}</p>
                            </div>
                            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-600">Offer Price</p>
                                <p className="font-semibold text-green-600">{currency} {product.price.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 mb-3">
                            <span className="text-sm font-medium text-slate-700">{product.inStock ? "In Stock" : "Out of Stock"}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating..." })} checked={product.inStock} />
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200 shadow-sm"></div>
                                <span className="dot absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-md"></span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditModal(product)}
                                className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg btn-animate btn-primary font-medium flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                <EditIcon size={16} /> Edit
                            </button>
                            <button
                                onClick={() => deleteProduct(product.id, product.name)}
                                className="flex-1 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg btn-animate btn-danger font-medium flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                <Trash2Icon size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Product Modal */}
            {isEditModalOpen && editingProduct && editFormData && (
                <div onClick={closeEditModal} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto p-4 sm:p-6">
                        <h2 className="text-lg sm:text-2xl font-semibold text-slate-800 mb-4">
                            Edit Product
                        </h2>

                        <form onSubmit={submitEditProduct} className="space-y-4">
                            {/* Stock Management Section */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-slate-800">Stock Management</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingStock(!isEditingStock)}
                                        className="text-xs px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-medium transition-colors"
                                    >
                                        {isEditingStock ? 'Cancel' : 'Edit Stock'}
                                    </button>
                                </div>

                                {!isEditingStock ? (
                                    <div className="space-y-2">
                                        {editingProduct?.productVariants && editingProduct?.productVariants.length > 0 ? (
                                            <>
                                                <p className="text-xs text-slate-600 mb-3">Current stock by variant:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {editingProduct?.productVariants?.map((pv) => (
                                                        <div key={pv.id} className="bg-white rounded p-2 border border-amber-100 text-center">
                                                            <p className="text-xs font-semibold text-slate-700">{pv.quantity}{pv.quantityUnit === 'PIECE' ? 'x' : pv.quantityUnit === 'KG' ? 'kg' : pv.quantityUnit === 'GRAM' ? 'g' : pv.quantityUnit === 'LITER' ? 'L' : pv.quantityUnit === 'MILLILITER' ? 'ml' : pv.quantityUnit}</p>
                                                            <p className="text-sm font-bold text-amber-600">{pv.availableUnits}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-white rounded p-3 border border-amber-100">
                                                <p className="text-xs text-slate-600 mb-2">Current stock:</p>
                                                <p className="text-2xl font-bold text-amber-600">{editingProduct?.totalUnits || 0}</p>
                                                <p className="text-xs text-slate-500 mt-1">Units available</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {editingProduct?.productVariants && editingProduct?.productVariants.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-slate-600">Update units for each variant:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {editingProduct?.productVariants?.map((pv) => (
                                                        <div key={pv.id}>
                                                            <label className="text-xs font-medium text-slate-700 block mb-1">{pv.quantity}{pv.quantityUnit === 'PIECE' ? 'x' : pv.quantityUnit === 'KG' ? 'kg' : pv.quantityUnit === 'GRAM' ? 'g' : pv.quantityUnit === 'LITER' ? 'L' : pv.quantityUnit === 'MILLILITER' ? 'ml' : pv.quantityUnit}</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={stockData[pv.id] || 0}
                                                                onChange={(e) => handleStockChange(pv.id, e.target.value)}
                                                                className="w-full p-2 border border-amber-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-xs font-medium text-slate-700 block mb-2">Units Available</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={stockData.units || 0}
                                                    onChange={(e) => handleStockChange('units', e.target.value)}
                                                    className="w-full p-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingStock(false)}
                                                className="flex-1 px-3 py-2 text-xs text-slate-700 bg-slate-200 hover:bg-slate-300 rounded font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={submitStockUpdate}
                                                disabled={editLoading}
                                                className="flex-1 px-3 py-2 text-xs text-white bg-amber-500 hover:bg-amber-600 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {editLoading ? 'Updating...' : 'Update Stock'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Update Images (Optional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((key) => (
                                        <label key={key} htmlFor={`edit-images${key}`}>
                                            {editImages[key] || editingProduct.images[key-1] ? (
                                                <Image
                                                    width={100}
                                                    height={100}
                                                    className='w-full aspect-square object-cover border-2 border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors'
                                                    src={editImages[key] ? URL.createObjectURL(editImages[key]) : editingProduct.images[key-1]}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className='w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors flex items-center justify-center bg-slate-50'>
                                                    <span className="text-xs text-slate-400 text-center px-2">Add Image</span>
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

                            {/* Name */}
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

                            {/* Description */}
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

                            {/* Prices */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Actual Price (₹)</label>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Offer Price (₹)</label>
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

                            {/* Category */}
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

                            {/* Buttons */}
                            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg btn-animate btn-secondary font-medium transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg btn-animate btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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