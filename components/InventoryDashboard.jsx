'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faTriangleExclamation, faTrendingUp, faChartSimple } from '@fortawesome/free-solid-svg-icons'
import { useMemo } from "react"

export default function InventoryDashboard({ products }) {
    const inventory = useMemo(() => {
        let totalUnits = 0
        let outOfStockCount = 0
        let lowStockCount = 0
        let clothingCount = 0

        products.forEach(product => {
            if (product.isClothing) {
                clothingCount++
                const available = product.productSizes?.reduce((sum, size) => sum + size.availableUnits, 0) || 0
                totalUnits += available

                if (available === 0) {
                    outOfStockCount++
                } else if (available <= 10) {
                    lowStockCount++
                }
            } else {
                totalUnits += product.totalUnits

                if (product.totalUnits === 0) {
                    outOfStockCount++
                } else if (product.totalUnits <= 10) {
                    lowStockCount++
                }
            }
        })

        return {
            totalUnits,
            outOfStockCount,
            lowStockCount,
            clothingCount,
            totalProducts: products.length,
            healthScore: products.length === 0 ? 0 : Math.round(((products.length - outOfStockCount) / products.length) * 100)
        }
    }, [products])

    return (
        <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
                <FontAwesomeIcon icon={faChartSimple} className="text-2xl text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-800">Inventory Overview</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Units */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faBox} className="text-lg text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Units</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{inventory.totalUnits}</p>
                    <p className="text-xs text-slate-500 mt-1">Total in Stock</p>
                </div>

                {/* Out of Stock */}
                <div className={`rounded-lg p-4 border-2 transition-all ${
                    inventory.outOfStockCount > 0 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-green-50 border-green-300'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faTriangleExclamation} className={`text-lg ${inventory.outOfStockCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            inventory.outOfStockCount > 0
                                ? 'bg-red-200 text-red-700'
                                : 'bg-green-200 text-green-700'
                        }`}>
                            Critical
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{inventory.outOfStockCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Out of Stock</p>
                </div>

                {/* Low Stock */}
                <div className={`rounded-lg p-4 border-2 transition-all ${
                    inventory.lowStockCount > 0
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-slate-50 border-slate-200'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faTrendingUp} className={`text-lg ${inventory.lowStockCount > 0 ? 'text-orange-600' : 'text-slate-600'}`} />
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            inventory.lowStockCount > 0
                                ? 'bg-orange-200 text-orange-700'
                                : 'bg-slate-200 text-slate-700'
                        }`}>
                            Warning
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{inventory.lowStockCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Low Stock</p>
                </div>

                {/* Health Score */}
                <div className={`rounded-lg p-4 border-2 ${
                    inventory.healthScore >= 80
                        ? 'bg-green-50 border-green-300'
                        : inventory.healthScore >= 50
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-red-50 border-red-300'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-3xl font-bold">{inventory.healthScore}%</div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            inventory.healthScore >= 80
                                ? 'bg-green-200 text-green-700'
                                : inventory.healthScore >= 50
                                ? 'bg-yellow-200 text-yellow-700'
                                : 'bg-red-200 text-red-700'
                        }`}>
                            Health
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Inventory Health</p>
                </div>
            </div>

            {/* Clothing Stats */}
            {inventory.clothingCount > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-300">
                    <h4 className="font-semibold text-slate-800 mb-3">Clothing Products</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-sm text-slate-600 mb-1">Clothing Items</p>
                            <p className="text-2xl font-bold text-indigo-600">{inventory.clothingCount}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-sm text-slate-600 mb-1">All Products</p>
                            <p className="text-2xl font-bold text-slate-800">{inventory.totalProducts}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {(inventory.outOfStockCount > 0 || inventory.lowStockCount > 0) && (
                <div className="mt-6 pt-6 border-t border-slate-300">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">💡 Recommendations</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                            {inventory.outOfStockCount > 0 && (
                                <li>• Restock {inventory.outOfStockCount} product(s) that are out of stock</li>
                            )}
                            {inventory.lowStockCount > 0 && (
                                <li>• Consider restocking {inventory.lowStockCount} item(s) with low inventory</li>
                            )}
                            {inventory.healthScore < 50 && (
                                <li>• Your inventory health is critical - urgent restocking needed</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
