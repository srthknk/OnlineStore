'use client'
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faHome, faShield, faStore, faPercent, faPalette } from '@fortawesome/free-solid-svg-icons'
import { usePathname } from "next/navigation"
import axios from "axios"

const AdminNavbar = () => {

    const {user} = useUser()
    const pathname = usePathname()
    const [storeName, setStoreName] = useState('Admin')
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuClosing, setMenuClosing] = useState(false)

    const adminLinks = [
        { name: 'Dashboard', href: '/admin', icon: faHome },
        { name: 'Stores', href: '/admin/stores', icon: faStore },
        { name: 'Approve Store', href: '/admin/approve', icon: faShield },
        { name: 'Coupons', href: '/admin/coupons', icon: faPercent },
        { name: 'Personalize', href: '/admin/personalize', icon: faPalette },
    ]

    useEffect(() => {
        const fetchStoreName = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.storeName) {
                    setStoreName(res.data.storeName)
                }
            } catch (error) {
                console.error('Error fetching store name:', error)
            }
        }

        fetchStoreName()
    }, [])

    const handleCloseMobileMenu = () => {
        setMenuClosing(true)
        setTimeout(() => {
            setMenuOpen(false)
            setMenuClosing(false)
        }, 300)
    }

    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-6 lg:px-12 py-2.5 md:py-3 border-b border-slate-200 transition-all bg-white sticky top-0 z-50">
                <Link href="/admin" className="relative text-xl md:text-3xl lg:text-4xl font-semibold text-slate-700 flex-1">
                    {storeName}<span className="text-green-600 text-2xl md:text-4xl lg:text-5xl leading-0">.</span>
                </Link>
                
                <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`md:hidden p-1.5 rounded-lg transition-all duration-300 hamburger-icon ${menuOpen && !menuClosing ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'}`}
                    >
                        {menuOpen && !menuClosing ? (
                            <FontAwesomeIcon icon={faXmark} className="text-xl transition-transform duration-300 rotate-90" />
                        ) : (
                            <FontAwesomeIcon icon={faBars} className="text-xl transition-transform duration-300" />
                        )}
                    </button>

                    <p className="text-sm md:text-base hidden sm:block">Hi, {user?.firstName}</p>
                    <p className="text-xs md:text-sm sm:hidden font-medium">{user?.firstName}</p>
                    <div className="scale-75 md:scale-100 origin-right">
                        <UserButton />
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {(menuOpen || menuClosing) && (
                <div className={`fixed inset-0 z-40 md:hidden mobile-menu-backdrop ${menuOpen && !menuClosing ? 'bg-black/30' : 'bg-black/0'} transition-colors duration-300`} onClick={handleCloseMobileMenu}></div>
            )}

            {/* Mobile Sliding Sidebar Menu - Right to Left */}
            {(menuOpen || menuClosing) && (
                <div className={`md:hidden fixed right-0 top-0 h-screen w-64 bg-gradient-to-b from-white to-slate-50 shadow-2xl z-50 flex flex-col transform ${menuClosing ? 'animate-slideOutRight' : 'animate-slideInRight'} border-l border-slate-200`}>
                    
                    {/* Close Button */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                        <h2 className="text-lg font-bold text-slate-800">Menu</h2>
                        <button 
                            onClick={handleCloseMobileMenu}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xl text-slate-600" />
                        </button>
                    </div>

                    {/* Menu Links */}
                    <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
                        {adminLinks.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                                    pathname === link.href
                                        ? 'bg-gradient-to-r from-green-500 to-indigo-600 text-white shadow-md font-medium'
                                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95'
                                }`}
                                onClick={handleCloseMobileMenu}
                            >
                                <FontAwesomeIcon icon={link.icon} className="text-lg flex-shrink-0" />
                                <span className="font-medium text-sm">{link.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default AdminNavbar