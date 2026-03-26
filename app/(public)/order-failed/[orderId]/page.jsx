'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default function OrderFailedPage() {
    const params = useParams()
    const orderId = params.orderId

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                {/* Error Message */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-200 rounded-full blur animate-pulse"></div>
                            <div className="relative bg-white p-4 rounded-full">
                                <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600 animate-bounce text-5xl" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Payment Failed</h1>
                    <p className="text-lg text-slate-600">Unfortunately, your payment could not be processed.</p>
                </div>

                {/* Error Details Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border border-slate-200">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                        <h3 className="font-semibold text-red-900 mb-2">What Went Wrong?</h3>
                        <ul className="text-red-700 space-y-2 text-sm">
                            <li>• Insufficient funds in your account</li>
                            <li>• Card/UPI details entered incorrectly</li>
                            <li>• Payment gateway timeout</li>
                            <li>• Transaction declined by your bank</li>
                        </ul>
                    </div>

                    {/* Order ID */}
                    {orderId && (
                        <div className="mb-8 pb-8 border-b border-slate-200">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Attempted Order ID</p>
                            <p className="text-lg font-mono text-slate-800 break-all">{orderId}</p>
                            <p className="text-xs text-slate-600 mt-2">Please keep this ID for reference</p>
                        </div>
                    )}

                    {/* What to Do Next */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">What You Can Do</h3>
                        <ul className="space-y-3 text-blue-700 text-sm">
                            <li className="flex gap-2">
                                <span>1.</span>
                                <span>Check that your card/UPI details are correct</span>
                            </li>
                            <li className="flex gap-2">
                                <span>2.</span>
                                <span>Verify your account has sufficient balance</span>
                            </li>
                            <li className="flex gap-2">
                                <span>3.</span>
                                <span>Contact your bank if payment was declined</span>
                            </li>
                            <li className="flex gap-2">
                                <span>4.</span>
                                <span>Try again with a different payment method</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/cart"
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
                        Back to Cart
                    </Link>
                    <Link
                        href="/shop"
                        className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition text-center"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {/* Support Info */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Need Help?</p>
                    <p>If you continue to experience issues, please contact our support team or try again later.</p>
                </div>
            </div>
        </div>
    )
}
