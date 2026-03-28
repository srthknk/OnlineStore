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

    return (
        <>
            <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 border-b border-slate-200 transition-all bg-white sticky top-0 z-50">
                <Link href="/admin" className="relative text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-700 flex-1">
                    {storeName}<span className="text-green-600 text-3xl sm:text-4xl md:text-5xl leading-0">.</span>
                </Link>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-all duration-300 hamburger-icon ${menuOpen ? 'open bg-indigo-600 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'}`}
                    >
                        {menuOpen ? (
                            <FontAwesomeIcon icon={faXmark} className="text-2xl transition-transform duration-300 rotate-90" />
                        ) : (
                            <FontAwesomeIcon icon={faBars} className="text-2xl transition-transform duration-300" />
                        )}
                    </button>

                    <p className="text-sm sm:text-base hidden sm:block">Hi, {user?.firstName}</p>
                    <p className="text-xs sm:hidden font-medium">{user?.firstName}</p>
                    <UserButton />
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                style={{
                    maxHeight: menuOpen ? '400px' : '0px',
                    opacity: menuOpen ? 1 : 0,
                }}
                className={`md:hidden overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 ease-out ${menuOpen ? 'animate-slideDown' : ''}`}
            >
                <div className="flex flex-col gap-1 p-3">
                    {adminLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${
                                menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                            } ${
                                pathname === link.href
                                    ? 'bg-gradient-to-r from-green-500 to-indigo-600 text-white shadow-md font-medium'
                                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100 active:scale-95'
                            }`}
                            style={{
                                transitionDelay: menuOpen ? `${index * 50}ms` : '0ms'
                            }}
                            onClick={() => setMenuOpen(false)}
                        >
                            <FontAwesomeIcon icon={link.icon} className="text-lg flex-shrink-0" />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}

export default AdminNavbar