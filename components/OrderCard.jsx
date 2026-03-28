'use client'
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapPin, faCalendarDays, faEye, faTruck } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import TrackingModal from "./TrackingModal";
import DetailModal from "./DetailModal";

// Helper function to title case text
const toTitleCase = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusConfig = (status) => {
    const configs = {
        'ORDER_PLACED': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-gray-600' },
        'PROCESSING': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-gray-600' },
        'SHIPPED': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-gray-600' },
        'DELIVERED': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-black' },
        'CANCELLED': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-gray-500' }
    };
    return configs[status] || configs['ORDER_PLACED'];
};

const OrderCard = ({ order }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const [showTracking, setShowTracking] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const statusConfig = getStatusConfig(order.status);
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    // Get first product image
    const firstProductImage = order.orderItems[0]?.product?.images[0];

    return (
        <>
            <div 
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
                {/* Product Image Section */}
                {firstProductImage && (
                    <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200">
                        <Image
                            src={firstProductImage}
                            alt="product"
                            width={150}
                            height={150}
                            className="object-contain"
                            loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                            <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-full">
                                {order.orderItems.length} Item{order.orderItems.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}

                {/* Card Content */}
                <div className="p-4 space-y-3">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border px-3 py-1.5 rounded text-xs font-semibold`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></div>
                        {toTitleCase(order.status)}
                    </div>

                    {/* Order ID */}
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Order ID</p>
                        <p className="text-xs font-mono font-bold text-black truncate">{order.id.slice(0, 12)}</p>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Amount</p>
                        <p className="text-lg font-bold text-black">{currency}{order.total.toFixed(2)}</p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400 w-3 h-3" />
                        <span>{formattedDate}</span>
                    </div>

                    {/* Address Preview */}
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                        <FontAwesomeIcon icon={faMapPin} className="text-gray-500 flex-shrink-0 mt-0.5 w-3 h-3" />
                        <span className="truncate">{toTitleCase(order.address.city)}, {order.address.state}</span>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button 
                            onClick={() => setShowDetails(true)}
                            className="px-3 py-2 bg-black text-white text-xs font-bold rounded hover:bg-gray-900 transition-colors active:scale-95 flex items-center justify-center gap-1"
                        >
                            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                            View Details
                        </button>
                        <button 
                            onClick={() => setShowTracking(true)}
                            className="px-3 py-2 bg-gray-800 text-white text-xs font-bold rounded hover:bg-black transition-colors active:scale-95 flex items-center justify-center gap-1"
                        >
                            <FontAwesomeIcon icon={faTruck} className="w-3 h-3" />
                            Track
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showTracking && <TrackingModal order={order} onClose={() => setShowTracking(false)} />}
            {showDetails && <DetailModal order={order} onClose={() => setShowDetails(false)} />}
        </>
    )
}

export default OrderCard
