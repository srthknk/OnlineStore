'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faTrendingDown, faBox } from '@fortawesome/free-solid-svg-icons'

export default function InventoryAlertCard({ product }) {
    const isClothing = product.isClothing
    const outOfStock = product.totalUnits === 0
    const lowStock = product.totalUnits > 0 && product.totalUnits <= 10

    if (!outOfStock && !lowStock && isClothing && product.productSizes?.some(s => s.availableUnits <= 2)) {
        // Check if any size is low on stock
    } else if (!outOfStock && !lowStock) {
        return null
    }

    return (
        <div className={`p-3 rounded-lg border-2 mb-3 ${
            outOfStock ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
        }`}>
            <div className="flex items-start gap-3">
                {outOfStock ? (
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600 flex-shrink-0 mt-1 text-lg" />
                ) : (
                    <FontAwesomeIcon icon={faTrendingDown} className="text-yellow-600 flex-shrink-0 mt-1 text-lg" />
                )}
                <div className="flex-1 text-sm">
                    <p className={`font-semibold ${outOfStock ? 'text-red-700' : 'text-yellow-700'}`}>
                        {outOfStock ? '🚨 Out of Stock' : '⚠️ Low Stock Alert'}
                    </p>
                    {isClothing ? (
                        <div className="text-xs mt-1">
                            {outOfStock ? (
                                <p className="text-red-600">All sizes are out of stock</p>
                            ) : (
                                <div className="text-yellow-600">
                                    {product.productSizes?.filter(s => s.availableUnits <= 2).map(s => (
                                        <p key={s.id}>{s.size}: {s.availableUnits} units left</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className={`text-xs mt-1 ${outOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
                            {outOfStock ? 'Restock immediately' : `Only ${product.totalUnits} units available`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
