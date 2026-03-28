'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const createCartArray = () => {
        setTotalPrice(0);
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            // Extract productId from key (format: "productId" or "productId-variant")
            let productId, selectedVariant = null;
            
            if (typeof value === 'number') {
                // Old format: key is productId directly
                productId = key;
            } else {
                // New format: value has productId and selectedVariant
                productId = value.productId;
                selectedVariant = value.selectedVariant;
            }
            
            const product = products.find(product => product.id === productId);
            if (product) {
                const quantity = typeof value === 'number' ? value : value.quantity;
                cartArray.push({
                    ...product,
                    quantity,
                    selectedVariant,
                    cartKey: key
                });
                setTotalPrice(prev => prev + product.price * quantity);
            }
        }
        setCartArray(cartArray);
    }

    const handleDeleteItemFromCart = (productId, selectedVariant) => {
        dispatch(deleteItemFromCart({ productId, selectedVariant }))
    }

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 lg:py-12 px-4 sm:px-6">

            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Cart Items - Left Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            {/* Desktop View */}
                            <table className="w-full text-slate-600 table-auto hidden sm:table">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-4 py-4 font-semibold text-slate-700">Product</th>
                                        <th className="text-center px-4 py-4 font-semibold text-slate-700">Quantity</th>
                                        <th className="text-right px-4 py-4 font-semibold text-slate-700">Price</th>
                                        <th className="text-center px-4 py-4 font-semibold text-slate-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        cartArray.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="flex gap-3 items-center justify-center bg-slate-100 w-20 h-20 rounded-lg flex-shrink-0">
                                                            <Image src={item.images[0]} className="h-16 w-auto object-contain" alt={item.name} width={60} height={60} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-900 mb-1">{item.name}</p>
                                                            <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                                                            {item.selectedSize && (
                                                                <p className="text-xs text-blue-600 font-medium">Size: {item.selectedSize}</p>
                                                            )}
                                                            <p className="font-semibold text-indigo-600">{currency}{item.price}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <Counter productId={item.id} selectedSize={item.selectedSize} />
                                                </td>
                                                <td className="px-4 py-4 text-right font-semibold text-slate-900">
                                                    {currency}{(item.price * item.quantity).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleDeleteItemFromCart(item.id, item.selectedSize)} 
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 p-2.5 rounded-full transition-colors duration-300"
                                                        title="Remove item"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>

                            {/* Mobile View */}
                            <div className="sm:hidden space-y-4 p-4">
                                {
                                    cartArray.map((item, index) => (
                                        <div key={index} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                                            <div className="flex gap-2 items-center justify-center bg-slate-100 w-16 h-16 rounded-lg flex-shrink-0">
                                                <Image src={item.images[0]} className="h-12 w-auto object-contain" alt={item.name} width={48} height={48} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 text-sm mb-1">{item.name}</p>
                                                <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                                                {item.selectedSize && (
                                                    <p className="text-xs text-blue-600 font-medium">Size: {item.selectedSize}</p>
                                                )}
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="font-semibold text-indigo-600">{currency}{(item.price * item.quantity)}</p>
                                                    <button 
                                                        onClick={() => handleDeleteItemFromCart(item.id, item.selectedSize)} 
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} size="sm" />
                                                    </button>
                                                </div>
                                                <div className="mt-2">
                                                    <Counter productId={item.id} selectedSize={item.selectedSize} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    {/* Order Summary - Right Side */}
                    <div className="lg:col-span-1">
                        <OrderSummary totalPrice={totalPrice} items={cartArray} />
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center">
                <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-slate-300 mb-4" />
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400 mb-2">Your cart is empty</h1>
                <p className="text-slate-500 mb-6">Start shopping to add items to your cart</p>
                <a href="/shop" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Continue Shopping
                </a>
            </div>
        </div>
    )
}