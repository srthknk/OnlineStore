'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId, selectedVariant }) => {

    const { cartItems } = useSelector(state => state.cart);

    const dispatch = useDispatch();
    
    const cartKey = selectedVariant ? `${productId}-${selectedVariant}` : productId;
    const cartItem = cartItems[cartKey];
    
    // Handle both old format (number) and new format (object)
    const quantity = typeof cartItem === 'number' ? cartItem : (cartItem?.quantity || 0);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId, selectedVariant }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId, selectedVariant }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{quantity}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter