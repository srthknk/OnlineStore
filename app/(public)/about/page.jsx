'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faLightbulb, faUsers, faAward } from "@fortawesome/free-solid-svg-icons"

export default function About() {
    const [storeName, setStoreName] = useState('gocart')
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.storeName) {
                    setStoreName(res.data.storeName)
                }
                setSettings(res.data)
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                        About {storeName}
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-2xl mx-auto">
                        Your trusted online destination for fresh, quality groceries and everyday essentials delivered to your door
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="md:text-left text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
                            Our Mission
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 mb-4 leading-relaxed">
                            At {storeName}, we believe in making fresh, high-quality groceries accessible to everyone. Our mission is to provide a wide selection of fresh produce, organic products, and everyday essentials at competitive prices with exceptional convenience.
                        </p>
                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                            We're committed to delivering farm-fresh quality, supporting local farmers, and providing seamless online shopping with reliable delivery to your doorstep.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <img 
                            src="https://images.unsplash.com/photo-1488459716781-38569866f2f0?w=500&h=500&fit=crop" 
                            alt="Fresh Groceries" 
                            className="rounded-lg shadow-lg w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-8 sm:mb-12 text-center">
                        Our Core Values
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition md:text-left text-center">
                        <div className="mb-4 md:flex md:justify-start flex justify-center">
                            <FontAwesomeIcon icon={faLightbulb} className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">Freshness</h3>
                        <p className="text-sm sm:text-base text-slate-600">
                            We prioritize freshness and quality in every item. Our products are sourced directly from trusted suppliers and local farmers to ensure you get the freshest groceries.
                        </p>
                    </div>

                        {/* Innovation */}
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition md:text-left text-center">
                            <div className="mb-4 md:flex md:justify-start flex justify-center">
                                <FontAwesomeIcon icon={faAward} className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">Sustainability</h3>
                            <p className="text-sm sm:text-base text-slate-600">
                                We're committed to eco-friendly practices and sustainable sourcing. We support local farmers and promote organic products to protect our environment for future generations.
                            </p>
                        </div>

                        {/* Community */}
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition md:text-left text-center">
                            <div className="mb-4 md:flex md:justify-start flex justify-center">
                                <FontAwesomeIcon icon={faUsers} className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">Community</h3>
                            <p className="text-sm sm:text-base text-slate-600">
                                We believe in supporting our community by promoting local farmers, offering quality products at fair prices, and building relationships with our customers and suppliers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-8 sm:mb-12 md:text-left text-center">
                    Our Story
                </h2>
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-slate-600 space-y-4 sm:space-y-6 md:text-left text-center">
                    <p>
                        {storeName} was founded with a simple vision: to revolutionize grocery shopping by bringing fresh, quality products online with convenient delivery. We started as a small team of entrepreneurs passionate about healthy living and supporting local farmers.
                    </p>
                    <p>
                        Over the years, we've grown into a trusted grocery platform serving thousands of customers across the country. What started as a local delivery service has evolved into a comprehensive online grocery marketplace, allowing busy families and health-conscious consumers to shop anytime, anywhere.
                    </p>
                    <p>
                        Today, {storeName} stands as a beacon of freshness, quality, and reliability in the grocery industry. Our success is built on the trust of our customers and partnerships with local farmers, and we're committed to continuing to deliver excellence.
                    </p>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="bg-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                        Have Questions?
                    </h2>
                    <p className="text-base sm:text-lg mb-6 sm:mb-8 text-indigo-100">
                        We'd love to hear from you. Get in touch with our team for any inquiries.
                    </p>
                    <Link 
                        href="/contact" 
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-indigo-50 transition text-sm sm:text-base"
                    >
                        Contact Us
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </section>
        </main>
    )
}
