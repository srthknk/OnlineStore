'use client'
import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminDashboard() {

    const { getToken } = useAuth()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        cancelledOrders: 0,
        cancelledRevenue: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon, color: 'bg-blue-100 text-blue-700' },
        { title: 'Total Revenue (Active Orders)', value: currency + dashboardData.revenue, icon: CircleDollarSignIcon, color: 'bg-green-100 text-green-700' },
        { title: 'Total Orders (Active)', value: dashboardData.orders, icon: TagsIcon, color: 'bg-orange-100 text-orange-700' },
        { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon, color: 'bg-purple-100 text-purple-700' },
    ]

    const cancelledCardsData = [
        { title: 'Cancelled Orders', value: dashboardData.cancelledOrders, icon: TagsIcon, color: 'bg-red-100 text-red-700' },
        { title: 'Lost Revenue (Cancelled)', value: currency + dashboardData.cancelledRevenue, icon: CircleDollarSignIcon, color: 'bg-red-100 text-red-700' },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDashboardData(data.dashboardData)
        } catch (error) {
           toast.error(error?.response?.data?.error || error.message) 
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 pb-10">
            <h1 className="text-2xl sm:text-3xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow duration-200 ${card.color}`}>
                            <div className="flex flex-col gap-2 flex-1 text-xs sm:text-sm">
                                <p className="text-slate-600">{card.title}</p>
                                <b className="text-xl sm:text-2xl font-medium text-slate-700 break-words">{card.value}</b>
                            </div>
                            <card.icon size={40} className="w-10 h-10 p-2 text-slate-400 bg-slate-100 rounded-full flex-shrink-0" />
                        </div>
                    ))
                }
            </div>

            {/* Cancelled Orders Section */}
            <div className="mt-10 pt-8 border-t border-slate-200">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">Cancelled Orders Analytics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {
                        cancelledCardsData.map((card, index) => (
                            <div key={index} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 border-2 border-red-200 p-4 rounded-lg hover:shadow-md transition-shadow duration-200 ${card.color}`}>
                                <div className="flex flex-col gap-2 flex-1 text-xs sm:text-sm">
                                    <p className="text-slate-600">{card.title}</p>
                                    <b className="text-xl sm:text-2xl font-medium text-slate-700 break-words">{card.value}</b>
                                </div>
                                <card.icon size={40} className="w-10 h-10 p-2 text-red-400 bg-red-100 rounded-full flex-shrink-0" />
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Area Chart */}
            <div className="overflow-x-auto">
                <OrdersAreaChart allOrders={dashboardData.allOrders} />
            </div>
        </div>
    )
}