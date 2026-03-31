'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderCard from "@/components/OrderCard";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";

export default function Orders() {

    const {getToken} = useAuth()
    const {user, isLoaded} = useUser()
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    const fetchOrders = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
            setOrders(data.orders)
            setLoading(false)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleOrderCancelled = (orderId) => {
        // Remove cancelled order from the list
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId))
    }

    useEffect(() => {
       if(isLoaded){
        if(user){
            fetchOrders()
        }else{
            router.push('/')
        }
       }
    }, [isLoaded, user, getToken, router]);

    if(!isLoaded || loading){
        return <Loading />
    }

    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 to-slate-100 py-12">
            {orders.length > 0 ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PageTitle heading="My Orders" text={`Showing ${orders.length} Order${orders.length !== 1 ? 's' : ''}`} linkText={'Go to home'} />
                    
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => (
                            <OrderCard 
                                key={order.id} 
                                order={order}
                                onOrderCancelled={handleOrderCancelled}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="min-h-[60vh] flex items-center justify-center px-4">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200">
                            <FontAwesomeIcon icon={faShoppingBag} className="text-2xl text-slate-400" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">No Orders Yet</h1>
                        <p className="text-slate-600 max-w-md">Start Shopping Now To Place Your First Order</p>
                    </div>
                </div>
            )}
        </div>
    )
}