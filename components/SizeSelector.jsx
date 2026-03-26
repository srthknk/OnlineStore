'use client'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faBox } from '@fortawesome/free-solid-svg-icons'

export default function SizeSelector({ product, onSizeSelect, selectedSize }) {
    const [selectedVariant, setSelectedVariant] = useState(selectedSize || '')

    const handleVariantChange = (variantId) => {
        setSelectedVariant(variantId)
        onSizeSelect(variantId)
    }

    // Support both old productSizes and new productVariants for backwards compatibility
    const variants = product.productVariants || product.productSizes || []
    
    if (!product.isClothing && variants.length === 0) {
        return null
    }

    const outOfStock = product.totalUnits === 0

    const getVariantLabel = (variant) => {
        // For grocery: show quantity and unit (e.g., "500g", "1kg")
        if (variant.quantity && variant.quantityUnit) {
            return `${variant.quantity}${variant.quantityUnit.toLowerCase().replace('piece', '').replace('dozen', 'x').replace('packet', 'pack')}`
        }
        // Fallback for clothing sizes
        return variant.size ? `Size ${variant.size}` : variant.id
    }

    return (
        <div className="my-6 p-4 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBox} className="text-lg text-emerald-700" />
                    <h3 className="font-semibold text-slate-800">Select Variant</h3>
                </div>
                {outOfStock && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600 text-sm" />
                        <span className="text-xs font-semibold text-red-600">Out of Stock</span>
                    </div>
                )}
            </div>

            {outOfStock ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-600 font-medium text-sm">This product is currently out of stock</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {variants.map((variant) => {
                        const isAvailable = variant.availableUnits > 0
                        const isLowStock = isAvailable && variant.availableUnits <= 3
                        const isSelected = selectedVariant === variant.id

                        return (
                            <button
                                key={variant.id}
                                onClick={() => isAvailable && handleVariantChange(variant.id)}
                                disabled={!isAvailable}
                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                    isSelected
                                        ? 'border-emerald-600 bg-emerald-100 shadow-md'
                                        : isAvailable
                                        ? 'border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-sm'
                                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                                }`}
                            >
                                <span className={`font-bold text-sm block ${
                                    isSelected ? 'text-emerald-900' : isAvailable ? 'text-slate-700' : 'text-slate-400'
                                }`}>
                                    {getVariantLabel(variant)}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full block mt-1 ${
                                    !isAvailable
                                        ? 'bg-gray-200 text-gray-600'
                                        : isLowStock
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-green-100 text-green-700'
                                }`}>
                                    {isAvailable ? `${variant.availableUnits} ${isLowStock ? '(Low)' : 'in stock'}` : 'Out of Stock'}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {!outOfStock && !selectedVariant && variants.length > 0 && (
                <p className="text-xs text-amber-600 mt-3 font-medium">⚠️ Please select a variant to add to cart</p>
            )}
        </div>
    )
}
