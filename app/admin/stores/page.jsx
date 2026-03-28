'use client'
import { storesDummyData } from "@/assets/assets"
import StoreInfo from "@/components/admin/StoreInfo"
import StorePerformanceModal from "@/components/admin/StorePerformanceModal"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faTimes, faChartLine } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"

export default function AdminStores() {

    const { user } = useUser()
    const { getToken } = useAuth()

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedStore, setSelectedStore] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPerformanceOpen, setIsPerformanceOpen] = useState(false)

    const fetchStores = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/stores', {headers: { Authorization: `Bearer ${token}` }})
            setStores(data.stores)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const toggleIsActive = async (storeId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/admin/toggle-store', {storeId}, {headers: { Authorization: `Bearer ${token}` }})
            await fetchStores()
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const deleteStore = async (storeId, storeName) => {
        try {
            const confirm = window.confirm(`Are you sure you want to delete "${storeName}"? This action cannot be undone and will delete all associated products and orders.`)
            if(!confirm) return;

            const token = await getToken()
            const { data } = await axios.delete(`/api/admin/stores?storeId=${storeId}`, {headers: { Authorization: `Bearer ${token}` }})
            await fetchStores()
            setIsModalOpen(false)
            setSelectedStore(null)
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const openStoreDetails = (store) => {
        setSelectedStore(store)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedStore(null)
    }

    useEffect(() => {
        if(user){
            fetchStores()
        }
    }, [user])

    return !loading ? (
        <div className="text-slate-500 mb-28 pb-10">
            <h1 className="text-2xl sm:text-3xl">Live <span className="text-slate-800 font-medium">Stores</span></h1>

            {stores.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                    {stores.map((store) => (
                        <div 
                            key={store.id} 
                            onClick={() => openStoreDetails(store)}
                            className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                        >
                            {/* Store Card Header - Clickable Area */}
                            <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors duration-300">
                                <div className="flex items-start gap-3 mb-3">
                                    <Image 
                                        width={60} 
                                        height={60} 
                                        src={store.logo} 
                                        alt={store.name} 
                                        className="w-14 h-14 object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{store.name}</h3>
                                        <p className="text-sm text-slate-600">@{store.username}</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                    store.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : store.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                                </span>
                            </div>

                            {/* Store Summary */}
                            <div className="p-4 sm:p-5 space-y-3 border-t border-slate-200">
                                <p className="text-sm text-slate-600 line-clamp-2 h-10">{store.description}</p>
                                
                                <div className="space-y-2 text-xs text-slate-600">
                                    <p className="truncate">📍 {store.address}</p>
                                    <p className="truncate">📞 {store.contact}</p>
                                    <p className="truncate">✉️ {store.email}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-500">Applied on {new Date(store.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-600">Active</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            onChange={() => toast.promise(toggleIsActive(store.id), { loading: "Updating..." })} 
                                            checked={store.isActive}
                                        />
                                        <div className="w-8 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                        <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-3"></span>
                                    </label>
                                </div>
                                <button 
                                    onClick={() => deleteStore(store.id, store.name)} 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-300"
                                    title="Delete store"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-2xl sm:text-3xl text-slate-400 font-medium">No stores Available</h1>
                </div>
            )}

            {/* Store Details Modal */}
            {isModalOpen && selectedStore && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-slate-800">Store Details</h2>
                            <button 
                                onClick={closeModal}
                                className="text-slate-500 hover:text-slate-700 text-2xl font-light transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8">
                            <StoreInfo store={selectedStore} />

                            {/* Modal Actions */}
                            <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3 items-center flex-wrap">
                                <button 
                                    onClick={() => setIsPerformanceOpen(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 font-medium flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faChartLine} />
                                    Performance
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">Active Status</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            onChange={() => toast.promise(toggleIsActive(selectedStore.id), { loading: "Updating..." })} 
                                            checked={selectedStore.isActive}
                                        />
                                        <div className="w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                        <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                    </label>
                                </div>

                                <div className="border-l border-slate-300 pl-4">
                                    <button 
                                        onClick={() => deleteStore(selectedStore.id, selectedStore.name)}
                                        className="text-red-600 hover:text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        Delete Store
                                    </button>
                                </div>

                                <div className="flex-1"></div>

                                <button 
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Store Performance Modal */}
            {selectedStore && (
                <StorePerformanceModal 
                    store={selectedStore} 
                    isOpen={isPerformanceOpen} 
                    onClose={() => setIsPerformanceOpen(false)} 
                />
            )}
        </div>
    ) : <Loading />
}