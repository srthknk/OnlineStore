'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"
import { Upload } from "lucide-react"
import imagekit from "@/configs/imageKit"
import FAQSection from "@/components/FAQSection"

export default function AdminPersonalize() {
    const { getToken } = useAuth()
    const [activeTab, setActiveTab] = useState('store')
    const [settings, setSettings] = useState({
        storeName: "My Store",
        bannerImage1: "",
        bannerImage2: "",
        bannerImage3: "",
        bannerImage4: "",
        bannerImage5: "",
        bannerTitle1: "",
        bannerTitle2: "",
        bannerTitle3: "",
        bannerTitle4: "",
        bannerTitle5: "",
        bannerLink1: "/shop",
        bannerLink2: "/shop",
        bannerLink3: "/shop",
        bannerLink4: "/shop",
        bannerLink5: "/shop",
        email: "contact@example.com",
        phone: "+1-212-456-7890",
        address: "794 Francisco, 94102",
        facebookUrl: "https://www.facebook.com",
        instagramUrl: "https://www.instagram.com",
        twitterUrl: "https://twitter.com",
        linkedinUrl: "https://www.linkedin.com",
        whatsappLink: "https://wa.me/"
    })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [previewImages, setPreviewImages] = useState({
        banner1: "",
        banner2: "",
        banner3: "",
        banner4: "",
        banner5: ""
    })

    const linkOptions = [
        { label: "Shop", value: "/shop" },
        { label: "Home", value: "/" },
        { label: "About Us", value: "/about" },
        { label: "Contact", value: "/contact" },
        { label: "Products", value: "/products" },
        { label: "Deals", value: "/deals" }
    ]

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                setSettings(res.data)
                setPreviewImages({
                    banner1: res.data.bannerImage1,
                    banner2: res.data.bannerImage2,
                    banner3: res.data.bannerImage3,
                    banner4: res.data.bannerImage4,
                    banner5: res.data.bannerImage5
                })
            } catch (error) {
                console.error('Error fetching settings:', error)
                toast.error('Failed to load settings')
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    const handleImageUpload = async (bannerKey, file) => {
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const response = await imagekit.upload({
                file: buffer,
                fileName: file.name,
                folder: "banners"
            })

            const imageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1200' }
                ]
            })

            const key = bannerKey <= 3 ? `bannerImage${bannerKey}` : `bannerImage${bannerKey}`
            setSettings(prev => ({ ...prev, [key]: imageUrl }))
            setPreviewImages(prev => ({ ...prev, [`banner${bannerKey}`]: imageUrl }))
            toast.success('Image uploaded successfully')
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Failed to upload image')
        }
    }

    const handleUrlChange = (bannerKey, url) => {
        const key = `bannerImage${bannerKey}`
        setSettings(prev => ({ ...prev, [key]: url }))
        setPreviewImages(prev => ({ ...prev, [`banner${bannerKey}`]: url }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const token = await getToken()
            const res = await axios.post('/api/admin/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            })

            toast.success('Settings updated successfully!')
        } catch (error) {
            console.error('Error updating settings:', error)
            toast.error(error?.response?.data?.error || 'Failed to update settings')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
        <div className="p-6 max-w-6xl">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Personalize Store</h1>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('store')}
                    className={`px-4 py-3 font-medium transition-all duration-300 ${
                        activeTab === 'store'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                            : 'text-slate-600 hover:text-slate-700'
                    }`}
                >
                    Store Settings
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-4 py-3 font-medium transition-all duration-300 ${
                        activeTab === 'faq'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                            : 'text-slate-600 hover:text-slate-700'
                    }`}
                >
                    FAQ Management
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'store' ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                {/* Store Name Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Store Name</h2>
                    <input
                        type="text"
                        value={settings.storeName}
                        onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                        className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter store name"
                    />
                    <p className="text-sm text-slate-500 mt-2">This name will appear throughout the app</p>
                </div>

                {/* Contact Information Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Contact Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="contact@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={settings.phone}
                                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="+1-212-456-7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your address"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media Links Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Social Media Links</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Facebook URL</label>
                            <input
                                type="url"
                                value={settings.facebookUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://www.facebook.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Instagram URL</label>
                            <input
                                type="url"
                                value={settings.instagramUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://www.instagram.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Twitter URL</label>
                            <input
                                type="url"
                                value={settings.twitterUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, twitterUrl: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://twitter.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn URL</label>
                            <input
                                type="url"
                                value={settings.linkedinUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://www.linkedin.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Link</label>
                            <input
                                type="url"
                                value={settings.whatsappLink}
                                onChange={(e) => setSettings(prev => ({ ...prev, whatsappLink: e.target.value }))}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://wa.me/1234567890"
                            />
                            <p className="text-sm text-slate-500 mt-2">Add your WhatsApp business number (e.g., https://wa.me/1234567890)</p>
                        </div>
                    </div>
                </div>

                {/* Banners Section */}
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-slate-700 mb-4">Banner {num}</h2>

                            {/* Preview */}
                            {previewImages[`banner${num}`] && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-slate-600 mb-2">Preview</p>
                                    <img
                                        src={previewImages[`banner${num}`]}
                                        alt={`Banner ${num}`}
                                        className="w-full max-h-40 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Banner Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Banner Title
                                </label>
                                <input
                                    type="text"
                                    value={settings[`bannerTitle${num}`]}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [`bannerTitle${num}`]: e.target.value }))}
                                    className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={`Banner ${num} title`}
                                />
                            </div>

                            {/* Banner Link */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Click redirects to
                                </label>
                                <select
                                    value={settings[`bannerLink${num}`]}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [`bannerLink${num}`]: e.target.value }))}
                                    className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {linkOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Upload Image
                                </label>
                                <label className="flex items-center justify-center w-full max-w-md px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                                    <div className="flex items-center gap-2">
                                        <Upload size={18} className="text-slate-400" />
                                        <span className="text-slate-600">Click to upload</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(num, e.target.files[0])}
                                        hidden
                                    />
                                </label>
                            </div>

                            {/* URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Or enter image URL
                                </label>
                                <input
                                    type="url"
                                    value={settings[`bannerImage${num}`]}
                                    onChange={(e) => handleUrlChange(num, e.target.value)}
                                    className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
                >
                    {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                    </form>
                ) : (
                    <FAQSection isAdmin={true} />
                )}
            </div>
        </div>
    )
}
