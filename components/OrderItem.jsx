'use client'
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import TrackingModal from "./TrackingModal";
import CancelOrderModal from "./CancelOrderModal";

const OrderItem = ({ order, onOrderCancelled }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const [ratingModal, setRatingModal] = useState(null);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    const { ratings } = useSelector(state => state.rating);

    return (
        <>
            <tr className="text-sm cursor-pointer hover:bg-slate-50 transition-colors duration-300" onClick={() => setTrackingModalOpen(true)}>
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product.images[0]}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product.name}</p>
                                    {item.selectedSize && (
                                        <p className="text-xs text-blue-600 font-medium">Size: {item.selectedSize}</p>
                                    )}
                                    <p>{currency}{item.price} Qty : {item.quantity} </p>
                                    <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div>
                                        {ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : <button onClick={(e) => { e.stopPropagation(); setRatingModal({ orderId: order.id, productId: item.product.id }); }} className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <p className="font-medium text-slate-700">{order.address.name}</p>
                    <p className="text-sm text-slate-600">{order.address.phone}</p>
                    <p className="text-sm text-slate-600">{order.address.house}, {order.address.area}</p>
                    {order.address.landmark && <p className="text-sm text-slate-600">Near {order.address.landmark}</p>}
                    <p className="text-sm text-slate-600">{order.address.city}, {order.address.state}, PIN {order.address.pin}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 cursor-pointer hover:shadow-md transition-all ${
                            order.status === 'CANCELLED' ? 'text-red-500 bg-red-100'
                            : order.status === 'confirmed'
                                ? 'text-yellow-500 bg-yellow-100'
                                : order.status === 'DELIVERED'
                                    ? 'text-green-500 bg-green-100'
                                    : 'text-slate-500 bg-slate-100'
                        }`}
                    >
                        <FontAwesomeIcon icon={faDotCircle} className="text-lg" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                    {order.isCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs">
                            <p className="text-red-700 font-semibold">Cancelled by {order.cancelledBy}</p>
                            {order.cancellationReason && (
                                <p className="text-red-600 mt-1">{order.cancellationReason.replace(/_/g, ' ')}</p>
                            )}
                            {order.cancellationDescription && (
                                <p className="text-red-600 mt-1 italic">"{order.cancellationDescription}"</p>
                            )}
                        </div>
                    )}
                    {!order.isCancelled && !['DELIVERED', 'SHIPPED'].includes(order.status) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setCancelModalOpen(true); }}
                            className="w-full flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1.5 rounded transition-all text-xs font-medium"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            Cancel Order
                        </button>
                    )}
                    <p className="text-xs text-slate-400 italic">Click to view details</p>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden cursor-pointer hover:bg-slate-50 transition-colors duration-300" onClick={() => setTrackingModalOpen(true)}>
                <td colSpan={5}>
                    <p className="font-medium text-slate-700">{order.address.name}</p>
                    <p className="text-sm text-slate-600">{order.address.phone}</p>
                    <p className="text-sm text-slate-600">{order.address.house}, {order.address.area}</p>
                    {order.address.landmark && <p className="text-sm text-slate-600">Near {order.address.landmark}</p>}
                    <p className="text-sm text-slate-600">{order.address.city}, {order.address.state}, PIN {order.address.pin}</p>
                    <br />
                    <div className="flex items-center">
                        <span className={`text-center mx-auto px-6 py-1.5 rounded ${
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                            : order.status === 'DELIVERED' ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                    {order.isCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs mt-2">
                            <p className="text-red-700 font-semibold">Cancelled by {order.cancelledBy}</p>
                            {order.cancellationReason && (
                                <p className="text-red-600 mt-1">{order.cancellationReason.replace(/_/g, ' ')}</p>
                            )}
                            {order.cancellationDescription && (
                                <p className="text-red-600 mt-1 italic">"{order.cancellationDescription}"</p>
                            )}
                        </div>
                    )}
                    {!order.isCancelled && !['DELIVERED', 'SHIPPED'].includes(order.status) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setCancelModalOpen(true); }}
                            className="w-full mt-2 flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1.5 rounded transition-all text-xs font-medium border border-red-300"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            Cancel Order
                        </button>
                    )}
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
            
            {trackingModalOpen && <TrackingModal order={order} onClose={() => setTrackingModalOpen(false)} />}
            {cancelModalOpen && <CancelOrderModal order={order} onClose={() => setCancelModalOpen(false)} onCancelSuccess={() => onOrderCancelled?.(order.id)} />}
        </>
    )
}

export default OrderItem