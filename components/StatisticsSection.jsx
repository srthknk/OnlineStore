'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart, faUsers, faBolt, faAward, faTruck, faLock, faUndoAlt, faHeadset } from '@fortawesome/free-solid-svg-icons'

const StatisticsSection = () => {
    const [stats, setStats] = useState({
        orders: 0,
        customers: 0,
        products: 0,
        satisfaction: 0
    })

    useEffect(() => {
        // Animate numbers on component mount
        const animateNumbers = () => {
            let currentOrders = 0
            let currentCustomers = 0
            let currentProducts = 0
            let currentSatisfaction = 0

            const targetOrders = 15000
            const targetCustomers = 8500
            const targetProducts = 5200
            const targetSatisfaction = 98

            const increment = setInterval(() => {
                if (currentOrders < targetOrders) currentOrders += Math.ceil(targetOrders / 50)
                if (currentCustomers < targetCustomers) currentCustomers += Math.ceil(targetCustomers / 50)
                if (currentProducts < targetProducts) currentProducts += Math.ceil(targetProducts / 50)
                if (currentSatisfaction < targetSatisfaction) currentSatisfaction += Math.ceil(targetSatisfaction / 50)

                setStats({
                    orders: Math.min(currentOrders, targetOrders),
                    customers: Math.min(currentCustomers, targetCustomers),
                    products: Math.min(currentProducts, targetProducts),
                    satisfaction: Math.min(currentSatisfaction, targetSatisfaction)
                })

                if (currentOrders >= targetOrders && currentCustomers >= targetCustomers && currentProducts >= targetProducts && currentSatisfaction >= targetSatisfaction) {
                    clearInterval(increment)
                }
            }, 30)
        }

        animateNumbers()
    }, [])

    const statItems = [
        {
            icon: <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />,
            value: stats.orders.toLocaleString(),
            label: 'Orders Completed',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: <FontAwesomeIcon icon={faUsers} className="text-2xl" />,
            value: stats.customers.toLocaleString(),
            label: 'Happy Customers',
            color: 'from-green-500 to-green-600'
        },
        {
            icon: <FontAwesomeIcon icon={faBolt} className="text-2xl" />,
            value: stats.products.toLocaleString(),
            label: 'Products Available',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: <FontAwesomeIcon icon={faAward} className="text-2xl" />,
            value: `${stats.satisfaction}%`,
            label: 'Customer Satisfaction',
            color: 'from-amber-500 to-amber-600'
        }
    ]

    return (
        <section className="bg-gradient-to-r from-slate-50 to-slate-100 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                        Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600">Choose Us</span>
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
                        Trusted by thousands of customers worldwide. Experience the best in quality and service.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20">
                    {statItems.map((item, index) => (
                        <div 
                            key={index}
                            className="relative group"
                        >
                            {/* Glow background */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500`} />
                            
                            {/* Card Shadow */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-all duration-300`} />
                            
                            <div className={`relative bg-white rounded-2xl p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 hover:border-slate-200`}>
                                {/* Icon container with shadow */}
                                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${item.color} text-white mb-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                                    {item.icon}
                                </div>
                                
                                {/* Number */}
                                <h3 className={`text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-3 font-black`}>
                                    {item.value}
                                </h3>
                                
                                {/* Label */}
                                <p className="text-slate-600 font-semibold text-base sm:text-lg group-hover:text-slate-800 transition-all duration-300">
                                    {item.label}
                                </p>
                                
                                {/* Bottom border accent */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Features */}
                <div className="bg-white rounded-2xl p-10 sm:p-12 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 text-center">
                        Why Our Customers <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600">Love Us</span>
                    </h3>
                    <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
                        We're committed to delivering excellence in every aspect of your shopping experience
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            { 
                                icon: faTruck, 
                                title: 'Fast Shipping', 
                                desc: 'Free delivery on orders above ₹500',
                                color: 'from-blue-500 to-blue-600'
                            },
                            { 
                                icon: faLock, 
                                title: 'Secure Payment', 
                                desc: '100% secure & encrypted transactions',
                                color: 'from-red-500 to-red-600'
                            },
                            { 
                                icon: faUndoAlt, 
                                title: 'Easy Returns', 
                                desc: '30-day hassle-free return policy',
                                color: 'from-purple-500 to-purple-600'
                            },
                            { 
                                icon: faHeadset, 
                                title: '24/7 Support', 
                                desc: 'Always here to help you',
                                color: 'from-green-500 to-green-600'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="relative group">
                                {/* Glow effect background */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl blur-lg transition-all duration-300`} />
                                
                                {/* Card */}
                                <div className="relative bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200 shadow-lg group-hover:shadow-2xl group-hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-center text-center">
                                    {/* Icon container */}
                                    <div className={`inline-flex p-4 sm:p-5 rounded-full bg-gradient-to-r ${feature.color} text-white mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                                        <FontAwesomeIcon icon={feature.icon} className="text-xl sm:text-2xl" />
                                    </div>
                                    
                                    {/* Title */}
                                    <h4 className="font-bold text-slate-800 mb-3 text-base sm:text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-green-600 transition-all duration-300">
                                        {feature.title}
                                    </h4>
                                    
                                    {/* Description */}
                                    <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-all duration-300">
                                        {feature.desc}
                                    </p>
                                    
                                    {/* Bottom accent line */}
                                    <div className={`w-8 h-1 bg-gradient-to-r ${feature.color} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StatisticsSection
