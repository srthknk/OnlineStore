'use client'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

export default function QuantitySelector({ product, onVariantSelect, selectedVariant }) {
    const [selectedId, setSelectedVariant] = useState(selectedVariant || '')

    const handleVariantChange = (id) => {
        setSelectedVariant(id)
        onVariantSelect(id)
    }

    if (!product.productVariants || product.productVariants.length === 0) {
        return null
    }

    const outOfStock = product.totalUnits === 0

    return (
        <div className="my-6 p-4 border border-emerald-200 rounded-lg bg-emerald-50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Select Quantity/Size</h3>
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
                <div className="space-y-2">
                    {product.productVariants.map((variantOption) => {
                        const isAvailable = variantOption.availableUnits > 0
                        const isLowStock = isAvailable && variantOption.availableUnits <= 3
                        const isSelected = selectedId === variantOption.id

                        return (
                            <button
                                key={variantOption.id}
                                onClick={() => isAvailable && handleVariantChange(variantOption.id)}
                                disabled={!isAvailable}
                                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                                    isSelected
                                        ? 'border-emerald-600 bg-emerald-100 shadow-md'
                                        : isAvailable
                                        ? 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow'
                                        : 'border-slate-100 bg-slate-50 cursor-not-allowed'
                                }`}
                            >
                                <span className={`font-medium ${
                                    isSelected ? 'text-emerald-700' : isAvailable ? 'text-slate-700' : 'text-slate-400'
                                }`}>
                                    {variantOption.quantity}{variantOption.quantityUnit === 'PIECE' ? ' Piece(s)' : variantOption.quantityUnit === 'KG' ? 'kg' : variantOption.quantityUnit === 'GRAM' ? 'g' : variantOption.quantityUnit === 'LITER' ? 'L' : variantOption.quantityUnit === 'MILLILITER' ? 'ml' : variantOption.quantityUnit}
                                </span>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    !isAvailable
                                        ? 'bg-slate-200 text-slate-600'
                                        : isLowStock
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {isAvailable ? `${variantOption.availableUnits} in stock${isLowStock ? ' (Low)' : ''}` : 'Out of Stock'}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {!outOfStock && !selectedId && (
                <p className="text-xs text-red-600 mt-3 font-medium">⚠️ Please select a quantity/size to add to cart</p>
            )}
        </div>
    )
}
