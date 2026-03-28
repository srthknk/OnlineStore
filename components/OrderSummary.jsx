import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencil, faXmark, faTruck, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {Protect, useAuth, useUser} from '@clerk/nextjs'
import axios from 'axios';
import { fetchCart } from '@/lib/features/cart/cartSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const {user} = useUser()
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [orderSettings, setOrderSettings] = useState({
        minimumAmountForFreeDelivery: 500,
        deliveryCharges: 50,
        freeDeliveryMessage: "Yay! You unlocked free delivery"
    });
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Fetch order settings on mount
    useEffect(() => {
        const fetchOrderSettings = async () => {
            try {
                setSettingsLoading(true)
                const { data } = await axios.get('/api/order-settings')
                if (data.success) {
                    setOrderSettings(data.data)
                }
            } catch (error) {
                console.error('Failed to load order settings:', error)
                // Keep default settings on error
            } finally {
                setSettingsLoading(false)
            }
        }

        fetchOrderSettings()
    }, [])

    // Calculate delivery charges
    const isEligibleForFreeDelivery = totalPrice >= orderSettings.minimumAmountForFreeDelivery;
    const deliveryCharges = isEligibleForFreeDelivery ? 0 : orderSettings.deliveryCharges;
    const subtotalWithDelivery = totalPrice + deliveryCharges;

    // Calculate final total with coupon
    const discountAmount = coupon ? (subtotalWithDelivery * coupon.discount / 100) : 0;
    const finalTotal = subtotalWithDelivery - discountAmount;

    const handleCouponCode = async (event) => {
        event.preventDefault();
        try {
            if(!user){
                return toast('Please login to proceed')
            }
            const token = await getToken();
            const { data } = await axios.post('/api/coupon', {code: couponCodeInput}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCoupon(data.coupon)
            toast.success('Coupon Applied')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            if(!user){
                return toast('Please login to place an order')
            }
            if(!selectedAddress){
                return toast('Please select an address')
            }
            const token = await getToken();

            const orderData = {
                addressId: selectedAddress.id,
                items,
                paymentMethod,
                deliveryCharges: deliveryCharges
            }

            if(coupon){
                orderData.couponCode = coupon.code
            }
           // create order
           const {data} = await axios.post('/api/orders', orderData, {
            headers: { Authorization: `Bearer ${token}` }
           })

           if(paymentMethod === 'STRIPE'){
            window.location.href = data.session.url;
           }else{
            toast.success(data.message)
            router.push('/orders')
            dispatch(fetchCart({getToken}))
           }

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }

        
    }

    return (
        <div className='w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-4'>
            {/* Header */}
            <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 sm:p-6'>
                <h2 className='text-xl sm:text-2xl font-bold flex items-center gap-2'>
                    <FontAwesomeIcon icon={faTruck} className='text-lg' />
                    Order Summary
                </h2>
            </div>

            <div className='p-4 sm:p-6 space-y-6'>
                {/* Free Delivery Alert */}
                {isEligibleForFreeDelivery && (
                    <div className='p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 animate-pulse'>
                        <FontAwesomeIcon icon={faCheckCircle} className='text-green-600 text-lg flex-shrink-0 mt-0.5' />
                        <div>
                            <p className='text-sm font-semibold text-green-700'>{orderSettings.freeDeliveryMessage}</p>
                            <p className='text-xs text-green-600 mt-1'>No delivery charges on this order</p>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide'>Payment Method</h3>
                    <div className='space-y-2'>
                        <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors'>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="COD" 
                                onChange={() => setPaymentMethod('COD')} 
                                checked={paymentMethod === 'COD'} 
                                className='accent-indigo-600'
                            />
                            <div>
                                <p className='font-medium text-slate-900'>Cash on Delivery</p>
                                <p className='text-xs text-slate-500'>Pay when you receive</p>
                            </div>
                        </label>
                        <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors'>
                            <input 
                                type="radio" 
                                name="payment" 
                                value="STRIPE" 
                                onChange={() => setPaymentMethod('STRIPE')} 
                                checked={paymentMethod === 'STRIPE'} 
                                className='accent-indigo-600'
                            />
                            <div>
                                <p className='font-medium text-slate-900'>UPI / Online</p>
                                <p className='text-xs text-slate-500'>Secure online payment</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Delivery Address */}
                <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide'>Delivery Address</h3>
                    {
                        selectedAddress ? (
                            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-2 items-start'>
                                <div className='flex-1'>
                                    <p className='font-medium text-slate-900'>{selectedAddress.name}</p>
                                    <p className='text-sm text-slate-600 mt-1'>
                                        {selectedAddress.house}, {selectedAddress.area}, {selectedAddress.city}
                                    </p>
                                    {selectedAddress.landmark && <p className='text-sm text-slate-600'>Near {selectedAddress.landmark}</p>}
                                    <p className='text-sm text-slate-600'>{selectedAddress.state}, {selectedAddress.pin}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedAddress(null)} 
                                    className='text-indigo-600 hover:text-indigo-700 p-2 rounded-lg hover:bg-white transition-colors flex-shrink-0'
                                    title="Change address"
                                >
                                    <FontAwesomeIcon icon={faPencil} className='text-lg' />
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {
                                    addressList.length > 0 && (
                                        <select 
                                            className='w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all'
                                            onChange={(e) => setSelectedAddress(addressList[e.target.value])}
                                        >
                                            <option value="">Select an address</option>
                                            {
                                                addressList.map((address, index) => (
                                                    <option key={index} value={index}>
                                                        {address.name} - {address.city}, {address.state}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    )
                                }
                                <button 
                                    className='w-full flex items-center justify-center gap-2 text-indigo-600 border border-indigo-600 py-2.5 rounded-lg hover:bg-indigo-50 font-medium transition-colors'
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} className='text-lg' />
                                    Add New Address
                                </button>
                            </div>
                        )
                    }
                </div>

                {/* Price Breakdown */}
                <div className='space-y-3 py-4 border-y border-slate-200'>
                    <div className='flex justify-between items-center'>
                        <span className='text-slate-600'>Subtotal</span>
                        <span className='font-semibold text-slate-900'>{currency}{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                        <span className='text-slate-600'>Delivery Charges</span>
                        <span className={`font-semibold ${deliveryCharges === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                            {deliveryCharges === 0 ? 'FREE' : `${currency}${deliveryCharges.toFixed(2)}`}
                        </span>
                    </div>
                    {coupon && (
                        <div className='flex justify-between items-center'>
                            <span className='text-slate-600'>Coupon Discount ({coupon.discount}%)</span>
                            <span className='font-semibold text-green-600'>-{currency}{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Coupon Section */}
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex gap-2'>
                            <input 
                                onChange={(e) => setCouponCodeInput(e.target.value)} 
                                value={couponCodeInput} 
                                type="text" 
                                placeholder='Enter coupon code' 
                                className='flex-1 border border-slate-300 px-3 py-2 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm'
                            />
                            <button 
                                type='submit'
                                className='bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium transition-colors text-sm whitespace-nowrap'
                            >
                                Apply
                            </button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs'>
                            <div>
                                <p className='font-semibold text-green-700'>Code: {coupon.code.toUpperCase()}</p>
                                <p className='text-green-600 text-xs'>{coupon.description}</p>
                            </div>
                            <button 
                                onClick={() => setCoupon('')}
                                className='text-green-700 hover:text-red-700 transition p-1'
                            >
                                <FontAwesomeIcon icon={faXmark} className='text-lg' />
                            </button>
                        </div>
                    )
                }

                {/* Final Total */}
                <div className='p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg'>
                    <div className='flex justify-between items-center'>
                        <span className='text-slate-700 font-semibold text-lg'>Total Amount</span>
                        <span className='text-2xl font-bold text-indigo-600'>{currency}{finalTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Place Order Button */}
                <button 
                    onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'Placing order...' })} 
                    disabled={!selectedAddress}
                    className='w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-400 font-semibold transition-all duration-300 flex items-center justify-center gap-2'
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Place Order
                </button>
            </div>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary