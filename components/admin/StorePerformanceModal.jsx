'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShoppingCart, faBox, faIndianRupee, faChartBar, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

export default function StorePerformanceModal({ store, isOpen, onClose }) {
    const { getToken } = useAuth();
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && store?.id) {
            fetchPerformanceData();
        }
    }, [isOpen, store?.id]);

    const fetchPerformanceData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get(`/api/admin/store-performance?storeId=${store.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPerformanceData(data.data);
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch performance data');
        }
        setLoading(false);
    };

    if (!isOpen || !store) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Performance Dashboard</h2>
                        <p className="text-sm text-slate-600 mt-1">{store.name}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-2xl font-light transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading performance data...</p>
                            </div>
                        </div>
                    ) : performanceData ? (
                        <div className="space-y-8">
                            {/* KPI Cards Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Total Orders */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Total Orders</span>
                                        <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600 text-xl" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-800">{performanceData.sales.totalOrders}</p>
                                    <p className="text-xs text-slate-600 mt-2">{performanceData.sales.totalItemsSold} items sold</p>
                                </div>

                                {/* Cancelled Orders */}
                                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Cancelled Orders</span>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-800">{performanceData.cancellations.cancelledOrders}</p>
                                    <p className="text-xs text-red-600 mt-2">{performanceData.cancellations.cancelledPercentage}% cancellation rate</p>
                                </div>

                                {/* Total Revenue */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Total Revenue</span>
                                        <FontAwesomeIcon icon={faIndianRupee} className="text-green-600 text-xl" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-800">₹{performanceData.revenue.totalRevenue}</p>
                                    <p className="text-xs text-slate-600 mt-2">Avg: ₹{performanceData.revenue.averageOrderValue}/order</p>
                                </div>

                                {/* Stock Status */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Total Stock</span>
                                        <FontAwesomeIcon icon={faBox} className="text-purple-600 text-xl" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-800">{performanceData.inventory.totalUnits}</p>
                                    <p className="text-xs text-slate-600 mt-2">{performanceData.inventory.totalProducts} products</p>
                                </div>
                            </div>

                            {/* Revenue Details */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faIndianRupee} className="text-green-600" />
                                    Revenue Breakdown
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                                        <p className="text-sm text-slate-600 font-medium">Active Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">₹{performanceData.revenue.totalRevenue}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                                        <p className="text-sm text-slate-600 font-medium">Cancelled Revenue</p>
                                        <p className="text-2xl font-bold text-red-600">₹{performanceData.revenue.cancelledRevenue}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                                        <p className="text-sm text-slate-600 font-medium">Avg Order Value</p>
                                        <p className="text-2xl font-bold text-slate-800">₹{performanceData.revenue.averageOrderValue}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Status */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBox} className="text-purple-600" />
                                    Inventory Status
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                                        <p className="text-sm text-slate-600 font-medium">Total Products</p>
                                        <p className="text-2xl font-bold text-slate-800">{performanceData.inventory.totalProducts}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
                                        <p className="text-sm text-green-700 font-medium">In Stock</p>
                                        <p className="text-2xl font-bold text-green-600">{performanceData.inventory.inStock}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-orange-200 bg-orange-50">
                                        <p className="text-sm text-orange-700 font-medium">Low Stock</p>
                                        <p className="text-2xl font-bold text-orange-600">{performanceData.inventory.lowStock}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-red-200 bg-red-50">
                                        <p className="text-sm text-red-700 font-medium">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-600">{performanceData.inventory.outOfStock}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Top Selling Products */}
                            {performanceData.topProducts && performanceData.topProducts.length > 0 && (
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
                                        Top Selling Products
                                    </h3>
                                    <div className="space-y-3">
                                        {performanceData.topProducts.map((product, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                        #{index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                                                        <p className="text-sm text-slate-600">{product.quantity} units sold</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">₹{product.revenue.toFixed(2)}</p>
                                                    <p className="text-xs text-slate-600">revenue</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Stats */}
                            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
                                    <div>
                                        <p className="font-medium">Order Statistics</p>
                                        <p className="mt-2">
                                            • Completed: <span className="font-semibold text-green-600">{performanceData.sales.completedOrders}</span>
                                        </p>
                                        <p>
                                            • Cancelled: <span className="font-semibold text-red-600">{performanceData.cancellations.cancelledOrders}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Inventory Status</p>
                                        <p className="mt-2">
                                            • Total Units: <span className="font-semibold">{performanceData.inventory.totalUnits}</span>
                                        </p>
                                        <p>
                                            • Critical: <span className="font-semibold text-red-600">{performanceData.inventory.outOfStock + performanceData.inventory.lowStock}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Performance Metrics</p>
                                        <p className="mt-2">
                                            • Health: <span className="font-semibold text-blue-600">
                                                {parseInt(performanceData.cancellations.cancelledPercentage) < 10 ? '✓ Good' : parseInt(performanceData.cancellations.cancelledPercentage) < 25 ? '⚠ Fair' : '✗ Poor'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-600">No performance data available</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
