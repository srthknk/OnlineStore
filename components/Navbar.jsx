'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {useUser, useClerk, UserButton} from "@clerk/nextjs"
import CustomUserButton from "./CustomUserButton"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShoppingBag, faMagnifyingGlass, faShoppingCart, faBars, faXmark } from "@fortawesome/free-solid-svg-icons"

const Navbar = () => {

    const {user, isLoaded} = useUser()
    const {openSignIn} = useClerk()
    const router = useRouter();
    const [storeName, setStoreName] = useState('Shop')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

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

        // Poll for store name changes every 5 seconds
        const interval = setInterval(fetchStoreName, 5000)

        return () => clearInterval(interval)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
        setMobileMenuOpen(false)
    }

    const handleOpenSignIn = () => {
        if (isLoaded && !user) {
            openSignIn()
        }
    }

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" }
    ]

    return (
        <nav className="relative bg-white">
            <div className="mx-4 sm:mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4">

                    {/* Logo */}
                    <Link href="/" className="text-3xl sm:text-4xl font-bold text-slate-800 flex-shrink-0 flex items-center gap-1.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg"><FontAwesomeIcon icon={faShoppingCart} /></span>
                        </div>
                        <span className="flex items-baseline"><span className="text-emerald-600">{storeName}</span><span className="text-emerald-400 text-3xl">.</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8 text-slate-600">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="hover:text-emerald-600 transition text-sm lg:text-base font-medium hover:font-semibold">
                                {link.name}
                            </Link>
                        ))}

                        <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-full hover:border-emerald-300 transition">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-emerald-600 flex-shrink-0 text-sm" />
                            <input className="w-40 bg-transparent outline-none placeholder-slate-500 text-sm" type="text" placeholder="Search fresh items..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition text-sm lg:text-base font-medium">
                            <FontAwesomeIcon icon={faShoppingCart} className="flex-shrink-0" />
                            <span>Cart</span>
                            {cartCount > 0 && <button className="absolute -top-2 left-4 text-[10px] text-white bg-emerald-600 w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</button>}
                        </Link>

                        {
                            !user && isLoaded ? (
                                <button onClick={handleOpenSignIn} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg">
                                    Login
                                </button>
                            ) : (
                                <CustomUserButton>
                                    <UserButton.Action labelIcon={<FontAwesomeIcon icon={faShoppingBag} className="text-sm" />} label="My Orders" onClick={()=> router.push('/orders')}/>
                                </CustomUserButton>
                            )
                        }
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <Link href="/cart" className="relative p-2">
                            <FontAwesomeIcon icon={faShoppingCart} className="text-slate-600 text-lg" />
                            {cartCount > 0 && <span className="absolute top-0 right-0 text-xs text-white bg-slate-600 w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                        </Link>
                        
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 active:scale-95"
                        >
                            {mobileMenuOpen ? (
                                <FontAwesomeIcon icon={faXmark} className="transition-transform duration-300 rotate-90 text-xl" />
                            ) : (
                                <FontAwesomeIcon icon={faBars} className="transition-transform duration-300 text-xl" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 animate-in slide-in-from-top-2 duration-300">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 mx-4 mt-4 mb-4 px-3 py-2 rounded-full">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-600 flex-shrink-0 text-sm" />
                            <input className="flex-1 bg-transparent outline-none placeholder-slate-600 text-sm" type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </form>

                        {/* Mobile Nav Links */}
                        <div className="space-y-2 py-3">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.href}
                                    href={link.href} 
                                    className="block px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium text-base"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Profile Section */}
                        {user ? (
                            <div className="border-t border-slate-200 pt-4 mt-4 px-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{user.firstName}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        router.push('/orders')
                                        setMobileMenuOpen(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium text-base mb-2"
                                >
                                    <PackageIcon size={18} />
                                    My Orders
                                </button>
                                <div className="border-t border-slate-200 pt-3 mt-3">
                                    <CustomUserButton />
                                </div>
                            </div>
                        ) : (
                            isLoaded && !user ? (
                                <div className="flex items-center justify-center mt-6">
                                    <button 
                                        onClick={() => {
                                            handleOpenSignIn()
                                            setMobileMenuOpen(false)
                                        }} 
                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all duration-200 text-white rounded-lg font-medium"
                                    >
                                        Login
                                    </button>
                                </div>
                            ) : null
                        )}
                    </div>
                )}
            </div>
            <hr className="border-gray-200" />
        </nav>
    )
}

export default Navbar