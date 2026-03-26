'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart, faUsers, faThunderbolt, faAward } from '@fortawesome/free-solid-svg-icons'

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
            icon: <FontAwesomeIcon icon={faThunderbolt} className="text-2xl" />,
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
                    {statItems.map((item, index) => (
                        <div 
                            key={index}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-green-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className={`relative bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${item.color} text-white mb-4`}>
                                    {item.icon}
                                </div>
                                <h3 className={`text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-2`}>
                                    {item.value}
                                </h3>
                                <p className="text-slate-600 font-medium text-sm sm:text-base">
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Features */}
                <div className="bg-white rounded-xl p-8 sm:p-10 shadow-lg border border-slate-200">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center">
                        Why Our Customers Love Us
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: '🚚 Fast Shipping', desc: 'Free delivery on orders above ₹500' },
                            { title: '🔒 Secure Payment', desc: '100% secure & encrypted transactions' },
                            { title: '↩️ Easy Returns', desc: '30-day hassle-free return policy' },
                            { title: '💬 24/7 Support', desc: 'Always here to help you' }
                        ].map((feature, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-3xl mb-2">{feature.title.split(' ')[0]}</p>
                                <h4 className="font-semibold text-slate-800 mb-2">
                                    {feature.title.split(' ').slice(1).join(' ')}
                                </h4>
                                <p className="text-slate-600 text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StatisticsSection
