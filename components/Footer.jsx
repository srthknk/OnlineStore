import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapPin, faTruck } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faTwitter, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    const [storeName, setStoreName] = useState('Your Store')
    const [settings, setSettings] = useState({
        email: "contact@example.com",
        phone: "+1-212-456-7890",
        address: "794 Francisco, 94102",
        facebookUrl: "https://www.facebook.com",
        instagramUrl: "https://www.instagram.com",
        twitterUrl: "https://twitter.com",
        linkedinUrl: "https://www.linkedin.com"
    })

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
            }
        }

        fetchSettings()

        // Poll for settings changes every 5 seconds
        const interval = setInterval(fetchSettings, 5000)

        return () => clearInterval(interval)
    }, [])

    const MailIcon = faEnvelope
    const PhoneIcon = faPhone
    const MapPinIcon = faMapPin
    const FacebookIcon = faFacebook
    const InstagramIcon = faInstagram
    const TwitterIcon = faTwitter
    const LinkedinIcon = faLinkedin

    const linkSections = [
        {
            title: "CATEGORIES",
            links: [
                { text: "Fresh Produce", path: '/shop?category=produce', icon: null },
                { text: "Dairy & Eggs", path: '/shop?category=dairy', icon: null },
                { text: "Pantry Staples", path: '/shop?category=pantry', icon: null },
                { text: "Frozen Foods", path: '/shop?category=frozen', icon: null },
            ]
        },
        {
            title: "WEBSITE",
            links: [
                { text: "Home", path: '/', icon: null },
                { text: "About Us", path: '/about', icon: null },
                { text: "FAQ", path: '/faq', icon: null },
                { text: "Contact Us", path: '/contact', icon: null },
                { text: "Become Premium Member", path: '/pricing', icon: null },
                { text: "Become a Supplier", path: '/create-store', icon: null },
                { text: "Delivery Partner", path: '/deliverypartner', icon: faTruck },
            ]
        },
        {
            title: "CONTACT",
            links: [
                { text: settings.phone, path: '/', icon: PhoneIcon },
                { text: settings.email, path: '/', icon: MailIcon },
                { text: settings.address, path: '/', icon: MapPinIcon }
            ]
        }
    ];

    const socialIcons = [
        { icon: FacebookIcon, link: settings.facebookUrl },
        { icon: InstagramIcon, link: settings.instagramUrl },
        { icon: TwitterIcon, link: settings.twitterUrl },
        { icon: LinkedinIcon, link: settings.linkedinUrl },
    ]

    return (
        <footer className="mx-4 sm:mx-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 sm:gap-10 py-8 sm:py-10 border-b border-slate-500/30 text-slate-500">
                    <div className="w-full md:w-auto">
                        <Link href="/" className="text-3xl sm:text-4xl font-semibold text-slate-700 inline-block">
                            {storeName}<span className="text-emerald-600 text-4xl sm:text-5xl leading-0">.</span>
                        </Link>
                        <p className="max-w-[410px] mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed">Welcome to {storeName}, your premium destination for fresh, organic groceries and quality food products. From fresh produce and organic dairy to pantry essentials and specialty items, we bring you the finest in groceries — all in one place.</p>
                        <div className="flex items-center gap-3 mt-4 sm:mt-5">
                            {socialIcons.map((item, i) => (
                                <Link href={item.link} key={i} target="_blank" className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-emerald-600 hover:text-white transition rounded-full">
                                    <FontAwesomeIcon icon={item.icon} className="text-base" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 w-full md:w-auto md:flex md:flex-wrap md:justify-end md:gap-6">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-semibold text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h3>
                                <ul className="space-y-2 sm:space-y-2.5">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            {link.icon && <FontAwesomeIcon icon={link.icon} className="flex-shrink-0 mt-0.5 text-sm" />}
                                            <Link href={link.path} className="hover:text-indigo-600 transition text-xs sm:text-sm">{link.text}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="py-8 sm:py-10 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-4 text-sm sm:text-base">Accepted Payment Methods</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Visa */}
                        <div className="flex items-center justify-center w-12 h-8 sm:w-14 sm:h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-bold text-xs">VISA</div>
                        {/* Mastercard */}
                        <div className="flex items-center justify-center w-12 h-8 sm:w-14 sm:h-9 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-bold text-xs">MC</div>
                        {/* Rupay */}
                        <div className="flex items-center justify-center w-12 h-8 sm:w-14 sm:h-9 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg text-white font-bold text-xs">RuPay</div>
                        {/* UPI */}
                        <div className="flex items-center justify-center w-12 h-8 sm:w-14 sm:h-9 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg text-white font-bold text-xs">UPI</div>
                        {/* Wallet */}
                        <div className="flex items-center justify-center w-12 h-8 sm:w-14 sm:h-9 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white font-bold text-xs">💳</div>
                        {/* Bank Transfer */}
                        <div className="flex items-center justify-center w-12 h-8 sm:w-14 sm:h-9 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg text-white font-bold text-xs">🏦</div>
                    </div>
                </div>
                <p className="py-4 sm:py-6 text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                    Copyright 2025 © {storeName} All Right Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;