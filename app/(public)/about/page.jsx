'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { ArrowRight, Zap, Users, Award } from "lucide-react"

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
                        Your ultimate destination for premium clothing and fashion that defines your style
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
                            Our Mission
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 mb-4 leading-relaxed">
                            At {storeName}, we believe that fashion is more than just clothing—it's a form of self-expression. Our mission is to provide high-quality, trendy, and affordable clothing that helps you express your unique style.
                        </p>
                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                            We're committed to offering the latest fashion trends, exceptional customer service, and a seamless shopping experience across all platforms.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <img 
                            src="https://images.unsplash.com/photo-1555529702-c70baf1fdf20?w=500&h=500&fit=crop" 
                            alt="Fashion" 
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
                        {/* Quality */}
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
                            <div className="mb-4">
                                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">Quality</h3>
                            <p className="text-sm sm:text-base text-slate-600">
                                We curate only the finest clothing pieces that meet our strict quality standards. Every item is carefully selected to ensure durability and comfort.
                            </p>
                        </div>

                        {/* Innovation */}
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
                            <div className="mb-4">
                                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">Innovation</h3>
                            <p className="text-sm sm:text-base text-slate-600">
                                We stay ahead of fashion trends and continuously update our collection to bring you the latest styles and designs from around the world.
                            </p>
                        </div>

                        {/* Community */}
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow hover:shadow-lg transition">
                            <div className="mb-4">
                                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">Community</h3>
                            <p className="text-sm sm:text-base text-slate-600">
                                We believe in building a vibrant community of fashion enthusiasts who share their styles, tips, and experiences with us.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-8 sm:mb-12">
                    Our Story
                </h2>
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-slate-600 space-y-4 sm:space-y-6">
                    <p>
                        {storeName} was founded with a simple yet powerful vision: to make premium fashion accessible to everyone. We started as a small team of fashion enthusiasts who shared a passion for quality clothing and sustainable fashion practices.
                    </p>
                    <p>
                        Over the years, we've grown into a trusted brand serving thousands of customers across the country. What started as a single store has evolved into a multi-platform e-commerce platform, allowing fashion lovers to shop anytime, anywhere.
                    </p>
                    <p>
                        Today, {storeName} stands as a beacon of style, quality, and customer satisfaction. Our success is built on the trust and loyalty of our customers, and we're committed to continuing this journey with you.
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
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </main>
    )
}
