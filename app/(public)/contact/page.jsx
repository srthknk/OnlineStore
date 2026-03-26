'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import toast from "react-hot-toast"

export default function Contact() {
    const [storeName, setStoreName] = useState('gocart')
    const [settings, setSettings] = useState({
        email: "contact@example.com",
        phone: "+1-212-456-7890",
        address: "794 Francisco, 94102",
        facebookUrl: "https://www.facebook.com",
        instagramUrl: "https://www.instagram.com",
        twitterUrl: "https://twitter.com",
        linkedinUrl: "https://www.linkedin.com"
    })
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.storeName) {
                    setStoreName(res.data.storeName)
                }
                setSettings({
                    email: res.data?.email || "contact@example.com",
                    phone: res.data?.phone || "+1-212-456-7890",
                    address: res.data?.address || "794 Francisco, 94102",
                    facebookUrl: res.data?.facebookUrl || "https://www.facebook.com",
                    instagramUrl: res.data?.instagramUrl || "https://www.instagram.com",
                    twitterUrl: res.data?.twitterUrl || "https://twitter.com",
                    linkedinUrl: res.data?.linkedinUrl || "https://www.linkedin.com"
                })
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill all fields')
            return
        }

        setSubmitting(true)
        try {
            // Since we don't have a backend endpoint for contact forms yet,
            // we'll just show a success message
            toast.success('Thank you for your message! We will get back to you soon.')
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (error) {
            toast.error('Failed to send message. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                        Contact Us
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-indigo-100">
                        Get in touch with the {storeName} team. We're here to help!
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8">
                            Get In Touch
                        </h2>

                        {/* Contact Cards */}
                        <div className="space-y-6">
                            {/* Email */}
                            <div className="flex gap-4 sm:gap-6">
                                <div className="flex-shrink-0">
                                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mt-1" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">Email</h3>
                                    <a 
                                        href={`mailto:${settings.email}`}
                                        className="text-base sm:text-lg text-indigo-600 hover:text-indigo-700 transition"
                                    >
                                        {settings.email}
                                    </a>
                                    <p className="text-sm sm:text-base text-slate-500 mt-1">
                                        We'll respond within 24 hours
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex gap-4 sm:gap-6">
                                <div className="flex-shrink-0">
                                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mt-1" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">Phone</h3>
                                    <a 
                                        href={`tel:${settings.phone}`}
                                        className="text-base sm:text-lg text-indigo-600 hover:text-indigo-700 transition"
                                    >
                                        {settings.phone}
                                    </a>
                                    <p className="text-sm sm:text-base text-slate-500 mt-1">
                                        Mon-Sat, 9AM-6PM
                                    </p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex gap-4 sm:gap-6">
                                <div className="flex-shrink-0">
                                    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mt-1" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">Address</h3>
                                    <p className="text-base sm:text-lg text-slate-600">
                                        {settings.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-10 sm:mt-12">
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">
                                Follow Us
                            </h3>
                            <div className="flex gap-4 sm:gap-6">
                                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition">
                                    <Facebook className="w-6 h-6" />
                                </a>
                                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition">
                                    <Instagram className="w-6 h-6" />
                                </a>
                                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition">
                                    <Twitter className="w-6 h-6" />
                                </a>
                                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition">
                                    <Linkedin className="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="bg-slate-50 p-6 sm:p-8 lg:p-10 rounded-lg shadow">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8">
                            Send us a Message
                        </h2>

                        <div className="space-y-4 sm:space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                    placeholder="How can we help?"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows="5"
                                    className="w-full px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm sm:text-base"
                                    placeholder="Tell us more..."
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold py-3 sm:py-4 rounded-lg transition text-sm sm:text-base"
                            >
                                {submitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}
