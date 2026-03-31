'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"
import imagekit from "@/configs/imageKit"
import FAQSection from "@/components/FAQSection"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

export default function AdminPersonalize() {
    const { getToken } = useAuth()
    const [activeTab, setActiveTab] = useState('store')
    const [settings, setSettings] = useState({
        storeName: "My Store",
        bannerImage1: "",
        bannerLink1: "/shop",
        featureCardTitle1: "Pharmacy at your doorstep!",
        featureCardDesc1: "Cough syrups, pain relief sprays & more",
        featureCardButton1: "Order Now",
        featureCardLink1: "/shop?category=pharmacy",
        featureCardImage1: "",
        featureCardTitle2: "Pet care supplies at your door",
        featureCardDesc2: "Food, treats, toys & more",
        featureCardButton2: "Order Now",
        featureCardLink2: "/shop?category=petcare",
        featureCardImage2: "",
        featureCardTitle3: "No time for a diaper run?",
        featureCardDesc3: "Get baby care essentials",
        featureCardButton3: "Order Now",
        featureCardLink3: "/shop?category=baby",
        featureCardImage3: "",
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
        featureCard1: "",
        featureCard2: "",
        featureCard3: ""
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
                    featureCard1: res.data.featureCardImage1,
                    featureCard2: res.data.featureCardImage2,
                    featureCard3: res.data.featureCardImage3
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

    const handleImageUpload = async (imageKey, file) => {
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

            setSettings(prev => ({ ...prev, [imageKey]: imageUrl }))
            
            // Update preview for banner or feature cards
            if (imageKey === 'bannerImage1') {
                setPreviewImages(prev => ({ ...prev, banner1: imageUrl }))
            } else if (imageKey === 'featureCardImage1') {
                setPreviewImages(prev => ({ ...prev, featureCard1: imageUrl }))
            } else if (imageKey === 'featureCardImage2') {
                setPreviewImages(prev => ({ ...prev, featureCard2: imageUrl }))
            } else if (imageKey === 'featureCardImage3') {
                setPreviewImages(prev => ({ ...prev, featureCard3: imageUrl }))
            }
            
            toast.success('Image uploaded successfully')
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Failed to upload image')
        }
    }

    const handleUrlChange = (imageKey, url) => {
        setSettings(prev => ({ ...prev, [imageKey]: url }))
        
        // Update preview
        if (imageKey === 'bannerImage1') {
            setPreviewImages(prev => ({ ...prev, banner1: url }))
        } else if (imageKey === 'featureCardImage1') {
            setPreviewImages(prev => ({ ...prev, featureCard1: url }))
        } else if (imageKey === 'featureCardImage2') {
            setPreviewImages(prev => ({ ...prev, featureCard2: url }))
        } else if (imageKey === 'featureCardImage3') {
            setPreviewImages(prev => ({ ...prev, featureCard3: url }))
        }
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
        <div className="p-4 md:p-6 max-w-6xl">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8">Personalize Store</h1>

            {/* Tabs Navigation */}
            <div className="flex gap-1 md:gap-2 mb-6 md:mb-8 border-b border-slate-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('store')}
                    className={`px-3 md:px-4 py-3 md:py-3 font-medium text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
                        activeTab === 'store'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                            : 'text-slate-600 hover:text-slate-700'
                    }`}
                >
                    Store Settings
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-3 md:px-4 py-3 md:py-3 font-medium text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
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
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-4">Store Name</h2>
                    <input
                        type="text"
                        value={settings.storeName}
                        onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                        className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                        placeholder="Enter store name"
                    />
                    <p className="text-xs md:text-sm text-slate-500 mt-2">This name will appear throughout the app</p>
                </div>

                {/* Contact Information Section */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-4">Contact Information</h2>
                    <div className="space-y-4 md:space-y-3">
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="contact@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={settings.phone}
                                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="+1-212-456-7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">Address</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="Enter your address"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media Links Section */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-4">Social Media Links</h2>
                    <div className="space-y-4 md:space-y-3">
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">Facebook URL</label>
                            <input
                                type="url"
                                value={settings.facebookUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="https://www.facebook.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">Instagram URL</label>
                            <input
                                type="url"
                                value={settings.instagramUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="https://www.instagram.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">Twitter URL</label>
                            <input
                                type="url"
                                value={settings.twitterUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, twitterUrl: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="https://twitter.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">LinkedIn URL</label>
                            <input
                                type="url"
                                value={settings.linkedinUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="https://www.linkedin.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">WhatsApp Link</label>
                            <input
                                type="url"
                                value={settings.whatsappLink}
                                onChange={(e) => setSettings(prev => ({ ...prev, whatsappLink: e.target.value }))}
                                className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                placeholder="https://wa.me/1234567890"
                            />
                            <p className="text-xs md:text-sm text-slate-500 mt-2">Add your WhatsApp business number (e.g., https://wa.me/1234567890)</p>
                        </div>
                    </div>
                </div>

                {/* Main Banner Section */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-2\">Main Banner</h2>
                    <p className="text-xs md:text-sm text-slate-500 mb-4\">The main hero banner displayed at the top of the homepage</p>
                    
                    {/* Image Dimension Guidelines */}
                    <div className="mb-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg\">
                        <p className="text-xs md:text-sm font-semibold text-blue-900 mb-2\">📐 Image Guidelines for Best Results:</p>
                        <ul className="text-xs text-blue-800 space-y-1 ml-4\">
                            <li>• <strong>Recommended Dimensions:</strong> 1200×400px (3:1 aspect ratio)</li>
                            <li>• <strong>Minimum Width:</strong> 1200px for HD quality</li>
                            <li>• <strong>Aspect Ratio:</strong> 3:1 ratio (e.g., 1500×500px, 1800×600px)</li>
                            <li>• <strong>File Format:</strong> JPG, PNG, or WebP (max 5MB recommended)</li>
                            <li>• Avoid narrow or tall images for best fit on all devices</li>
                        </ul>
                    </div>

                    {/* Preview */}
                    {previewImages.banner1 && (
                        <div className="mb-4\">
                            <p className="text-xs md:text-sm font-medium text-slate-600 mb-2\">Preview</p>
                            <img
                                src={previewImages.banner1}
                                alt="Main Banner"
                                className="w-full max-h-60 object-cover rounded-lg\"/>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="mb-4\">
                        <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2\">
                            Upload Image
                        </label>
                        <label className="flex items-center justify-center w-full px-4 py-4 md:py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 transition\">
                            <div className="flex items-center gap-2\">
                                <FontAwesomeIcon icon={faUpload} className="text-slate-400\" />
                                <span className="text-sm md:text-xs text-slate-600\">Click to upload</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload('bannerImage1', e.target.files[0])}
                                hidden
                            />
                        </label>
                    </div>

                    {/* URL Input */}
                    <div className="mb-4\">
                        <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2\">
                            Or enter image URL
                        </label>
                        <input
                            type="url"
                            value={settings.bannerImage1}
                            onChange={(e) => handleUrlChange('bannerImage1', e.target.value)}
                            className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium\"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* Banner Link */}
                    <div>
                        <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">
                            Banner Click Redirect Link
                        </label>
                        <input
                            type="url"
                            value={settings.bannerLink1}
                            onChange={(e) => setSettings(prev => ({ ...prev, bannerLink1: e.target.value }))}
                            className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                            placeholder="/shop"
                        />
                        <p className="text-xs md:text-xs text-slate-500 mt-2">Where clicking the banner will navigate to (e.g., /shop, /deals, or https://example.com)</p>
                    </div>
                </div>

                {/* Feature Cards Section */}
                <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Feature Cards</h2>
                    <p className="text-xs md:text-sm text-slate-600">Customize the 3 feature cards displayed below the main banner. You can add images, text, or both.</p>
                    
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-white p-4 md:p-6 rounded-lg shadow">
                            <h3 className="text-lg md:text-lg font-semibold text-slate-700 mb-4">Feature Card {num}</h3>

                            {/* Preview Image */}
                            {previewImages[`featureCard${num}`] && (
                                <div className="mb-4">
                                    <p className="text-xs md:text-sm font-medium text-slate-600 mb-2">Image Preview</p>
                                    <img
                                        src={previewImages[`featureCard${num}`]}
                                        alt={`Feature Card ${num}`}
                                        className="w-full max-h-48 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Card Image Upload */}
                            <div className="mb-6 md:mb-6 pb-6 md:pb-6 border-b border-slate-200">
                                <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">
                                    Card Image (Optional)
                                </label>
                                <p className="text-xs md:text-xs text-slate-500 mb-3">You can display the card with image only, without text</p>
                                <div className="mb-3">
                                    <label className="flex items-center justify-center w-full px-4 py-4 md:py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faUpload} className="text-slate-400" />
                                            <span className="text-sm md:text-xs text-slate-600">Click to upload</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(`featureCardImage${num}`, e.target.files[0])}
                                            hidden
                                        />
                                    </label>
                                </div>
                                <input
                                    type="url"
                                    value={settings[`featureCardImage${num}`]}
                                    onChange={(e) => handleUrlChange(`featureCardImage${num}`, e.target.value)}
                                    className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                    placeholder="Or enter image URL"
                                />
                            </div>

                            {/* Card Title */}
                            <div className="mb-4">
                                <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">
                                    Card Title
                                </label>
                                <input
                                    type="text"
                                    value={settings[`featureCardTitle${num}`]}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [`featureCardTitle${num}`]: e.target.value }))}
                                    className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                    placeholder={`Feature Card ${num} title`}
                                />
                            </div>

                            {/* Card Description */}
                            <div className="mb-4">
                                <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">
                                    Card Description
                                </label>
                                <textarea
                                    value={settings[`featureCardDesc${num}`]}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [`featureCardDesc${num}`]: e.target.value }))}
                                    className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                    placeholder={`Feature Card ${num} description`}
                                    rows="3"
                                />
                            </div>

                            {/* Button Text */}
                            <div className="mb-4">
                                <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">
                                    Button Text
                                </label>
                                <input
                                    type="text"
                                    value={settings[`featureCardButton${num}`]}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [`featureCardButton${num}`]: e.target.value }))}
                                    className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                    placeholder="Button text (e.g., Order Now)"
                                />
                            </div>

                            {/* Card Link */}
                            <div>
                                <label className="block text-sm md:text-xs font-medium text-slate-700 mb-2">
                                    Card Link (where button clicks)
                                </label>
                                <input
                                    type="url"
                                    value={settings[`featureCardLink${num}`]}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [`featureCardLink${num}`]: e.target.value }))}
                                    className="w-full px-4 py-3 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-sm font-medium"
                                    placeholder="https://example.com/category"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-8 py-3 md:py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:shadow-lg active:scale-95 disabled:bg-slate-400 disabled:shadow-none text-white font-semibold rounded-lg md:rounded-lg transition-all duration-300 text-base md:text-sm"
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
