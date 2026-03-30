'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartSimple, faTrendingUp } from '@fortawesome/free-solid-svg-icons'
import { useMemo } from "react"

export default function SizeAnalytics({ orders }) {
    const sizeStats = useMemo(() => {
        const stats = {}
        const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXXL']

        orders.forEach(order => {
            if (!order.isCancelled) {
                order.orderItems?.forEach(item => {
                    if (item.selectedSize) {
                        stats[item.selectedSize] = (stats[item.selectedSize] || 0) + item.quantity
                    }
                })
            }
        })

        return stats
    }, [orders])

    const mostPopularSize = useMemo(() => {
        if (Object.keys(sizeStats).length === 0) return null
        return Object.entries(sizeStats).reduce((prev, current) => 
            current[1] > prev[1] ? current : prev
        )[0]
    }, [sizeStats])

    const totalOrders = useMemo(() => {
        return Object.values(sizeStats).reduce((sum, count) => sum + count, 0)
    }, [sizeStats])

    if (totalOrders === 0) {
        return null
    }

    return (
        <div className="mt-10 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-6">
                <FontAwesomeIcon icon={faChartSimple} className="text-2xl text-indigo-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Size Popularity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Size Stats */}
                <div className="space-y-3">
                    {Object.entries(sizeStats).map(([size, count]) => {
                        const percentage = (count / totalOrders) * 100
                        return (
                            <div key={size}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-slate-700">Size {size}</span>
                                    <span className="text-sm font-semibold text-slate-600">{count} units ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Key Metrics */}
                <div className="space-y-3">
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Total Size Orders</p>
                        <p className="text-3xl font-bold text-indigo-700">{totalOrders}</p>
                    </div>

                    {mostPopularSize && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faTrendingUp} className="text-green-600" />
                                <p className="text-xs text-green-600 font-medium">Most Popular Size</p>
                            </div>
                            <p className="text-3xl font-bold text-green-700">Size {mostPopularSize}</p>
                            <p className="text-sm text-green-600 mt-1">{sizeStats[mostPopularSize]} units sold</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
