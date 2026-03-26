'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faTag, faLeaf, faCreditCard, faUser, faExclamationCircle, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const hasVariants = product.productVariants && product.productVariants.length > 0;
    const isOutOfStock = !product.inStock;

    const addToCartHandler = () => {
        if (hasVariants && !selectedVariant) {
            toast.error('Please select a variant')
            return
        }
        dispatch(addToCart({ productId, selectedVariant }))
    }

    const averageRating = product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className={`flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg relative ${isOutOfStock ? 'opacity-60' : ''}`}>
                    <Image src={mainImage} alt="" width={250} height={250} />
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                            <div className="text-center">
                                <p className="text-white font-bold text-lg">Out of Stock</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2 gap-0.5'>
                    {Array(5).fill('').map((_, index) => (
                        <FontAwesomeIcon key={index} icon={faStar} className={`text-xs mt-0.5 ${averageRating >= index + 1 ? 'text-green-400' : 'text-gray-300'}`} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating.length} Reviews</p>
                </div>

                {/* Out of Stock Alert */}
                {isOutOfStock && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-lg text-red-600" />
                        <p className="text-sm text-red-700 font-medium">This product is currently out of stock</p>
                    </div>
                )}

                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <FontAwesomeIcon icon={faTag} className="text-sm" />
                    <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                </div>

                {/* Variant Selector for Products with Variants */}
                {hasVariants && (
                    <div className="mt-8">
                        <label className="text-sm font-semibold text-slate-800 block mb-3">
                            Select Variant <span className="text-red-600">*</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {product.productVariants.map((pv) => {
                                const isVariantOutOfStock = pv.availableUnits === 0;
                                return (
                                    <button
                                        key={pv.id}
                                        onClick={() => !isVariantOutOfStock && setSelectedVariant(pv.id)}
                                        disabled={isVariantOutOfStock || isOutOfStock}
                                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                                            selectedVariant === pv.id
                                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-lg'
                                                : isVariantOutOfStock
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow'
                                        }`}
                                    >
                                        {pv.quantity}{pv.quantityUnit === 'PIECE' ? 'x' : pv.quantityUnit === 'KG' ? 'kg' : pv.quantityUnit === 'GRAM' ? 'g' : pv.quantityUnit === 'LITER' ? 'L' : pv.quantityUnit === 'MILLILITER' ? 'ml' : pv.quantityUnit}
                                        {isVariantOutOfStock && <span className="text-xs block">(Out)</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedVariant && (
                            <p className="text-xs text-emerald-600 mt-2 font-medium">
                                ✓ Variant selected
                            </p>
                        )}
                    </div>
                )}

                {/* Organic & Vegan Badges */}
                {(product.isOrganic || product.isVegan) && (
                    <div className="flex gap-2 mt-6">
                        {product.isOrganic && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                                <FontAwesomeIcon icon={faLeaf} className="text-sm text-green-600" />
                                <span className="text-xs font-semibold text-green-700">100% Organic</span>
                            </div>
                        )}
                        {product.isVegan && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                                <span className="text-xs font-semibold text-amber-700">🌱 Vegan</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[selectedVariant ? `${productId}-${selectedVariant}` : productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} selectedVariant={selectedVariant} />
                            </div>
                        )
                    }
                    <button 
                        onClick={() => !cart[selectedVariant ? `${productId}-${selectedVariant}` : productId] ? addToCartHandler() : router.push('/cart')} 
                        disabled={isOutOfStock && !cart[selectedVariant ? `${productId}-${selectedVariant}` : productId]}
                        className={`px-10 py-3 text-sm font-medium rounded-lg active:scale-95 btn-animate transition-all duration-300 shadow-md hover:shadow-lg ${
                            isOutOfStock && !cart[selectedVariant ? `${productId}-${selectedVariant}` : productId]
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                    >
                        {isOutOfStock && !cart[selectedVariant ? `${productId}-${selectedVariant}` : productId] ? 'Out of Stock' : !cart[selectedVariant ? `${productId}-${selectedVariant}` : productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3 items-center"> <FontAwesomeIcon icon={faGlobe} className="text-base text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3 items-center"> <FontAwesomeIcon icon={faCreditCard} className="text-base text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3 items-center"> <FontAwesomeIcon icon={faUser} className="text-base text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails