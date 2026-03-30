'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faPen, faUpload } from '@fortawesome/free-solid-svg-icons'

export default function AdminHeroProducts() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        redirectUrl: ''
    })
    const [showForm, setShowForm] = useState(false)

    // Helper function to validate image URL
    const isValidImageUrl = (url) => {
        if (!url || typeof url !== 'string') return false
        return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/admin/hero-categories')
            setCategories(data.categories || [])
        } catch (error) {
            toast.error('Failed to fetch categories')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const formDataObj = new FormData()
            formDataObj.append('file', file)

            const response = await axios.post('/api/admin/hero-categories/upload', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setFormData({ ...formData, image: response.data.url })
            toast.success('Image uploaded successfully!')
        } catch (error) {
            toast.error('Failed to upload image')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleAddCategory = async () => {
        if (!formData.image.trim()) {
            toast.error('At least an image is required')
            return
        }

        try {
            if (editingId) {
                // Update existing
                await axios.put('/api/admin/hero-categories', {
                    id: editingId,
                    ...formData
                })
                toast.success('Category updated!')
            } else {
                // Add new
                await axios.post('/api/admin/hero-categories', formData)
                toast.success('Category added!')
            }

            setFormData({ title: '', image: '', redirectUrl: '' })
            setEditingId(null)
            setShowForm(false)
            fetchCategories()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category')
        }
    }

    const handleEdit = (category) => {
        setFormData({
            title: category.title || '',
            image: category.image || '',
            redirectUrl: category.redirectUrl || ''
        })
        setEditingId(category.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return

        try {
            await axios.delete('/api/admin/hero-categories', {
                data: { id }
            })
            toast.success('Category deleted!')
            fetchCategories()
        } catch (error) {
            toast.error('Failed to delete category')
        }
    }

    const handleCancel = () => {
        setFormData({ title: '', image: '', redirectUrl: '' })
        setEditingId(null)
        setShowForm(false)
    }

    if (loading) {
        return <div className='p-6 text-center'>Loading...</div>
    }

    return (
        <div className='p-4 sm:p-6'>
            <div className='mb-6'>
                <h2 className='text-xl sm:text-2xl font-bold text-slate-900 mb-2'>Hero Categories Carousel</h2>
                <p className='text-slate-600 text-sm'>Manage category tiles displayed below the banner</p>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className='bg-white border-2 border-slate-200 rounded-lg p-4 sm:p-6 mb-6 shadow-sm'>
                    <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </h3>

                    <div className='space-y-4'>
                        {/* Title */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Category Title (Optional)
                            </label>
                            <input
                                type='text'
                                placeholder='e.g., Paan Corner, Dairy & Eggs'
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Category Image
                            </label>
                            <div className='flex gap-3'>
                                <label className='flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors'>
                                    <FontAwesomeIcon icon={faUpload} className='w-4 h-4 mr-2 text-slate-600' />
                                    <span className='text-sm font-medium text-slate-700'>
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </span>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className='hidden'
                                    />
                                </label>
                                <input
                                    type='text'
                                    placeholder='Or paste image URL'
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className='flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                />
                            </div>

                            {isValidImageUrl(formData.image) && (
                                <div className='mt-3 w-full h-40 bg-slate-100 rounded-lg overflow-hidden relative'>
                                    <Image
                                        src={formData.image}
                                        alt='Preview'
                                        fill
                                        quality={95}
                                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw'
                                        className='!relative object-contain'
                                        unoptimized={!formData.image.startsWith('http')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Redirect URL */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Redirect URL (Optional)
                            </label>
                            <input
                                type='text'
                                placeholder='/shop?category=paan or https://...'
                                value={formData.redirectUrl}
                                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className='flex gap-2 pt-4'>
                            <button
                                onClick={handleAddCategory}
                                disabled={uploading}
                                className='px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors'
                            >
                                {editingId ? 'Update' : 'Add'} Category
                            </button>
                            <button
                                onClick={handleCancel}
                                className='px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className='mb-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2'
                >
                    <FontAwesomeIcon icon={faPlus} className='w-4 h-4' />
                    Add New Category
                </button>
            )}

            {/* Categories Grid */}
            <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-slate-900'>Current Categories ({categories.length})</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {categories.map((category) => (
                        <div key={category.id} className='bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow'>
                            {/* Category Image Preview */}
                            <div className='w-full h-40 bg-slate-100 overflow-hidden relative'>
                                {isValidImageUrl(category.image) ? (
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        quality={95}
                                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                        className='!relative object-contain'
                                        unoptimized={!category.image.startsWith('http')}
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300'>
                                        <span className='text-slate-400 text-xs'>No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Category Info */}
                            <div className='p-4'>
                                <h4 className='font-medium text-slate-900 mb-1 line-clamp-2'>{category.title}</h4>
                                <p className='text-xs text-slate-500 mb-3 line-clamp-1'>{category.redirectUrl ? category.redirectUrl : 'Default redirect'}</p>

                                {/* Action Buttons */}
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className='flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded transition-colors flex items-center justify-center gap-1'
                                    >
                                        <FontAwesomeIcon icon={faPen} className='w-3 h-3' />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className='flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded transition-colors flex items-center justify-center gap-1'
                                    >
                                        <FontAwesomeIcon icon={faTrash} className='w-3 h-3' />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {categories.length === 0 && !showForm && (
                    <div className='text-center py-8 text-slate-500'>
                        No categories yet. Click "Add New Category" to start.
                    </div>
                )}
            </div>
        </div>
    )
}
