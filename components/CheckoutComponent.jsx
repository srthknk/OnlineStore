'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faExclamationCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons'

export default function CheckoutComponent() {
    const router = useRouter()
    const { userId } = useAuth()
    const { user } = useUser()
    const cartItems = useSelector(state => state.cart.items)
    
    const [loading, setLoading] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [addresses, setAddresses] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('razorpay-upi')
    const [coupon, setCoupon] = useState(null)
    const [processingPayment, setProcessingPayment] = useState(false)

    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get('/api/address')
            setAddresses(data.addresses || [])
            if (data.addresses?.length > 0) {
                setSelectedAddress(data.addresses[0].id)
            }
        } catch (error) {
            toast.error('Failed to load addresses')
        }
    }

    // Calculate total
    const calculateTotal = () => {
        let total = cartItems.reduce((sum, item) => {
            const quantity = typeof item === 'object' ? item.quantity : 1
            const price = typeof item === 'object' ? item.price : item
            return sum + (price * quantity)
        }, 0)

        if (coupon) {
            total = total - (total * coupon.discount / 100)
        }
        return total
    }

    // Initiate payment with Razorpay
    const handlePayment = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address')
            return
        }

        if (cartItems.length === 0) {
            toast.error('Cart is empty')
            return
        }

        try {
            setProcessingPayment(true)

            // Get store ID from first cart item (all items are from same store ideally)
            const storeId = cartItems[0]?.storeId
            const total = calculateTotal()

            // Create order on backend
            const { data } = await axios.post('/api/payments', {
                total,
                cartItems,
                addressId: selectedAddress,
                storeId,
                coupon
            })

            // Initialize Razorpay
            const options = {
                key: data.keyId,
                amount: Math.round(total * 100), // Amount in paise
                currency: 'INR',
                order_id: data.razorpayOrderId,
                name: 'Your Store',
                description: `Order #${data.orderId}`,
                image: '/logo.png',
                prefill: {
                    name: user?.fullName || '',
                    email: user?.primaryEmailAddress?.emailAddress || '',
                    contact: ''
                },
                notes: {
                    orderId: data.orderId,
                    userId,
                    paymentMethod
                },
                theme: {
                    color: '#4F46E5'
                },
                handler: async (response) => {
                    await handlePaymentSuccess(response, data.orderId, data.razorpayOrderId)
                },
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled')
                        setProcessingPayment(false)
                    }
                }
            }

            // Open Razorpay modal
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options)
                rzp.open()
            } else {
                toast.error('Razorpay not loaded')
                setProcessingPayment(false)
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Payment initiation failed')
            setProcessingPayment(false)
        }
    }

    // Handle successful payment
    const handlePaymentSuccess = async (response, orderId, razorpayOrderId) => {
        try {
            setProcessingPayment(true)

            // Verify payment on backend
            const { data } = await axios.put('/api/payments', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod
            })

            if (data.success) {
                toast.success('Payment successful! Redirecting...')
                
                // Clear cart
                localStorage.removeItem('cart')
                
                // Redirect to order success page
                setTimeout(() => {
                    router.push(`/order-success/${orderId}`)
                }, 1500)
            }
        } catch (error) {
            toast.error('Payment verification failed')
            router.push(`/order-failed/${orderId}`)
        } finally {
            setProcessingPayment(false)
        }
    }

    const total = calculateTotal()

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Delivery Address</h2>
                            {addresses.length > 0 ? (
                                <div className="space-y-3">
                                    {addresses.map(address => (
                                        <label key={address.id} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                            <input
                                                type="radio"
                                                name="address"
                                                value={address.id}
                                                checked={selectedAddress === address.id}
                                                onChange={() => setSelectedAddress(address.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{address.name}</p>
                                                <p className="text-sm text-slate-600">{address.phone}</p>
                                                <p className="text-sm text-slate-600">{address.house}, {address.area}</p>
                                                {address.landmark && <p className="text-sm text-slate-600">Near {address.landmark}</p>}
                                                <p className="text-sm text-slate-600">{address.city}, {address.state}, PIN {address.pin}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-600">No addresses found. Please add one first.</p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border-2 border-indigo-600 rounded-lg bg-indigo-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay-upi"
                                        checked={paymentMethod === 'razorpay-upi'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">UPI Payment</p>
                                        <p className="text-sm text-slate-600">Pay via UPI, Cards, Wallets</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay-card"
                                        checked={paymentMethod === 'razorpay-card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">Credit/Debit Card</p>
                                        <p className="text-sm text-slate-600">Visa, Mastercard, RuPay</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay-wallet"
                                        checked={paymentMethod === 'razorpay-wallet'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">Wallet</p>
                                        <p className="text-sm text-slate-600">PayPal, Amazon Pay, etc</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Order Summary</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {cartItems.map((item, index) => {
                                    const quantity = typeof item === 'object' ? item.quantity : 1
                                    const price = typeof item === 'object' ? item.price : item
                                    return (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">{item.productName || 'Product'}</p>
                                                {item.selectedVariant && <p className="text-xs text-slate-500">Variant: {item.selectedVariant}</p>}
                                            </div>
                                            <p className="text-sm text-slate-600">{quantity} x ₹{price}</p>
                                            <p className="text-sm font-medium text-slate-800">₹{price * quantity}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 sticky top-4">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Price Details</h2>
                            
                            <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="text-slate-800 font-medium">₹{cartItems.reduce((sum, item) => sum + ((typeof item === 'object' ? item.price : item) * (typeof item === 'object' ? item.quantity : 1)), 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Delivery</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Discount ({coupon.discount}%)</span>
                                        <span className="text-green-600 font-medium">-₹{Math.round(cartItems.reduce((sum, item) => sum + ((typeof item === 'object' ? item.price : item) * (typeof item === 'object' ? item.quantity : 1)), 0) * coupon.discount / 100)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mb-6">
                                <span className="text-lg font-semibold text-slate-800">Total Amount</span>
                                <span className="text-lg font-bold text-indigo-600">₹{Math.round(total)}</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={!selectedAddress || processingPayment || cartItems.length === 0}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {processingPayment ? (
                                    <>
                                        <FontAwesomeIcon icon={faCircleNotch} className="text-lg animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Proceed to Pay'
                                )}
                            </button>

                            <p className="text-xs text-slate-500 text-center mt-4">
                                Your payment is secure and encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
