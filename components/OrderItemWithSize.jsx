'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons'

export default function OrderItemWithVariant({ item, index }) {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    return (
        <div className="flex gap-3 border border-emerald-100 rounded-lg p-3 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            <img
                src={item.product?.images?.[0]}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate text-sm">{item.product?.name}</p>
                <p className="text-xs text-slate-600 mt-1">Qty: <span className="font-semibold">{item.quantity}</span></p>
                
                {item.selectedVariant && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2.5 py-1 bg-emerald-200 text-emerald-800 rounded text-xs font-semibold">
                            Variant: {item.selectedVariant}
                        </span>
                    </div>
                )}
                
                <p className="text-sm font-semibold text-slate-800 mt-2">{currency}{item.price?.toLocaleString()}</p>
            </div>
        </div>
    )
}
