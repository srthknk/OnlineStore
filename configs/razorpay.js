import Razorpay from 'razorpay'

// Lazy initialize Razorpay instance only when needed
let razorpayInstance = null

function getRazorpayInstance() {
    if (!razorpayInstance) {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        
        if (!keyId || !keySecret) {
            throw new Error('Razorpay keys not configured in environment variables')
        }
        
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        })
    }
    return razorpayInstance
}

// Helper function to create Razorpay order
export async function createRazorpayOrder(amount, notes = {}) {
    try {
        const instance = getRazorpayInstance()
        const order = await instance.orders.create({
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: notes
        })
        return order
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        throw error
    }
}

// Helper function to verify payment signature
export function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
        const crypto = require('crypto')
        const body = `${razorpayOrderId}|${razorpayPaymentId}`
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex')
        
        return expectedSignature === razorpaySignature
    } catch (error) {
        console.error('Error verifying payment signature:', error)
        return false
    }
}
