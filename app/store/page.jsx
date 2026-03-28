'use client'
import { dummyStoreDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { faDollarSign, faShoppingBasket, faStar, faTags } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function Dashboard() {

    const {getToken} = useAuth()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        cancelledOrdersCount: 0,
        cancelledEarnings: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: faShoppingBasket, color: 'bg-emerald-100 text-emerald-700' },
        { title: 'Total Earnings (Active)', value: currency + dashboardData.totalEarnings, icon: faDollarSign, color: 'bg-green-100 text-green-700' },
        { title: 'Total Orders (Active)', value: dashboardData.totalOrders, icon: faTags, color: 'bg-teal-100 text-teal-700' },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: faStar, color: 'bg-amber-100 text-amber-700' },
    ]

    const cancelledCardsData = [
        { title: 'Cancelled Orders', value: dashboardData.cancelledOrdersCount, icon: faTags, color: 'bg-red-100 text-red-700' },
        { title: 'Lost Earnings (Cancelled)', value: currency + dashboardData.cancelledEarnings, icon: faDollarSign, color: 'bg-red-100 text-red-700' },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/dashboard', {headers: { Authorization: `Bearer ${token}` }})
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
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 my-6 mt-8">
                {
                    dashboardCardsData.map((card, index) => (
                        <div 
                            key={index} 
                            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 border border-slate-200 p-4 sm:p-5 rounded-lg hover:shadow-md hover:border-slate-300 transition-all duration-300 animate-fadeIn ${card.color}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex flex-col gap-2 text-xs flex-1">
                                <p className="text-slate-600 font-medium">{card.title}</p>
                                <b className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-700">{card.value}</b>
                            </div>
                            <div className="p-2.5 text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex-shrink-0">
                                <FontAwesomeIcon icon={card.icon} className="text-2xl" />
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Cancelled Orders Section */}
            <div className="mt-10 pt-8 border-t border-slate-200">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">Cancelled Orders Analytics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {
                        cancelledCardsData.map((card, index) => (
                            <div 
                                key={index} 
                                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 border-2 border-red-200 p-4 sm:p-5 rounded-lg hover:shadow-md transition-all duration-300 animate-fadeIn ${card.color}`}
                                style={{ animationDelay: `${(index + 4) * 50}ms` }}
                            >
                                <div className="flex flex-col gap-2 text-xs flex-1">
                                    <p className="text-slate-600 font-medium">{card.title}</p>
                                    <b className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-700">{card.value}</b>
                                </div>
                                <div className="p-2.5 text-red-400 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex-shrink-0">
                                    <FontAwesomeIcon icon={card.icon} className="text-2xl" />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mt-10">Total Reviews</h2>

            <div className="mt-6 space-y-0">
                {
                    dashboardData.ratings.map((review, index) => (
                        <div 
                            key={index} 
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start lg:items-center justify-between py-6 px-3 sm:px-4 border-b border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-200"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex gap-3 items-start">
                                    <Image src={review.user.image} alt="" className="w-10 h-10 rounded-full flex-shrink-0" width={100} height={100} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-slate-700 truncate">{review.user.name}</p>
                                        <p className="font-light text-slate-500 text-xs">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-600 leading-6 break-words">{review.review}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-4 sm:gap-3 sm:items-end flex-shrink-0">
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-xs sm:text-sm text-slate-400">{review.product?.category}</p>
                                    <p className="font-medium text-slate-700 text-sm">{review.product?.name}</p>
                                    <div className='flex items-center gap-1'>
                                        {Array(5).fill('').map((_, index) => (
                                            <FontAwesomeIcon key={index} icon={faStar} className='text-base' style={{color: review.rating >= index + 1 ? "#00C950" : "#D1D5DB"}} />
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-4 py-2 text-xs sm:text-sm hover:bg-slate-200 rounded transition-all hover:shadow-md active:scale-95 w-full sm:w-auto">View Product</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}