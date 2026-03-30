'use client'
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faList, faPen, faPlus, faBars, faXmark, faBell, faTruck } from '@fortawesome/free-solid-svg-icons'
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import axios from "axios"

const StoreSidebar = ({storeInfo}) => {

    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
    const [unassignedDeliveryCount, setUnassignedDeliveryCount] = useState(0)

    // Fetch badge counts
    useEffect(() => {
        const fetchBadgeCounts = async () => {
            try {
                // Fetch pending orders count (Clerk auth handled automatically via cookies)
                const ordersRes = await axios.get('/api/store/orders')
                const pendingCount = ordersRes.data.orders?.filter(o => 
                    !o.isCancelled && (o.status === 'ORDER_PLACED' || o.status === 'PROCESSING')
                ).length || 0
                setPendingOrdersCount(pendingCount)

                // Fetch unassigned delivery orders count
                const deliveryRes = await axios.get('/api/store/orders/unassigned')
                const unassignedCount = deliveryRes.data.orders?.length || 0
                setUnassignedDeliveryCount(unassignedCount)
            } catch (error) {
                console.error('Error fetching badge counts:', error)
            }
        }

        fetchBadgeCounts()
        
        // Refresh badge counts every 10 seconds
        const interval = setInterval(fetchBadgeCounts, 10000)
        return () => clearInterval(interval)
    }, [])

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: faHome },
        { name: 'Add Product', href: '/store/add-product', icon: faPlus },
        { name: 'Manage Product', href: '/store/manage-product', icon: faPen },
        { name: 'Orders', href: '/store/orders', icon: faList, badge: pendingOrdersCount },
        { name: 'Assign Delivery', href: '/store/orders/assign-delivery', icon: faTruck, badge: unassignedDeliveryCount },
        { name: 'Announcements', href: '/store/announcements', icon: faBell },
    ]

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:inline-flex h-full flex-col gap-5 border-r border-slate-200 md:min-w-60 overflow-y-auto">
                <div className="flex flex-col gap-2 justify-center items-center pt-8 animate-fadeIn">
                    <Image className="w-14 h-14 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300" src={storeInfo?.logo} alt="" width={80} height={80} />
                    <p className="text-slate-700 font-medium text-center px-4 text-sm">{storeInfo?.name}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-green-500">Store</span>
                </div>

                <div className="space-y-1">
                    {
                        sidebarLinks.map((link, index) => (
                            <Link 
                                key={index} 
                                href={link.href} 
                                className={`relative flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-all duration-300 group ${
                                    pathname === link.href 
                                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-600 font-medium shadow-sm' 
                                        : 'text-slate-600 hover:text-green-600 hover:bg-slate-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={link.icon} className="text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                <p className="text-sm flex-1">{link.name}</p>
                                {link.badge > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 ml-auto text-xs font-bold text-white bg-red-500 rounded-full shadow-md animate-pulse">
                                        {link.badge > 99 ? '99+' : link.badge}
                                    </span>
                                )}
                                {pathname === link.href && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-l-full shadow-lg"></span>}
                            </Link>
                        ))
                    }
                </div>
            </div>

            {/* Mobile Header with Hamburger */}
            <div className="md:hidden border-b border-slate-200 bg-white sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Image className="w-10 h-10 rounded-full shadow-md" src={storeInfo?.logo} alt="" width={64} height={64} />
                        <div>
                            <p className="text-slate-700 font-medium text-sm">{storeInfo?.name}</p>
                            <p className="text-xs text-slate-500">Seller Panel</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setMobileOpen(!mobileOpen)} 
                        className={`p-2 rounded-lg hamburger-icon transition-all duration-300 ${
                            mobileOpen 
                                ? 'open bg-green-600 text-white shadow-lg scale-110' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
                        }`}
                    >
                        {mobileOpen ? (
                            <FontAwesomeIcon icon={faXmark} className="text-2xl transition-transform duration-300 rotate-90" />
                        ) : (
                            <FontAwesomeIcon icon={faBars} className="text-2xl transition-transform duration-300" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu - Animated Dropdown */}
                <div
                    style={{
                        maxHeight: mobileOpen ? '300px' : '0px',
                        opacity: mobileOpen ? 1 : 0,
                    }}
                    className={`overflow-hidden border-t border-slate-200 transition-all duration-300 ease-out ${mobileOpen ? 'animate-slideDown' : ''}`}
                >
                    <div className="flex flex-col gap-1 p-3 bg-gradient-to-b from-white to-slate-50">
                        {
                            sidebarLinks.map((link, index) => (
                                <Link 
                                    key={index} 
                                    href={link.href} 
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${
                                        mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                                    } ${
                                        pathname === link.href 
                                            ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md font-medium' 
                                            : 'text-slate-600 hover:text-green-600 hover:bg-slate-100 active:scale-95'
                                    }`}
                                    style={{
                                        transitionDelay: mobileOpen ? `${index * 50}ms` : '0ms'
                                    }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <FontAwesomeIcon icon={link.icon} className="text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                    <p className="text-sm font-medium flex-1">{link.name}</p>
                                    {link.badge > 0 && (
                                        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md animate-pulse">
                                            {link.badge > 99 ? '99+' : link.badge}
                                        </span>
                                    )}
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default StoreSidebar