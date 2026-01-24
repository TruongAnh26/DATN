import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import paymentService from '../../services/paymentService'

// Load Stripe outside of component to avoid recreating on every render
let stripePromise = null

const getStripePromise = async () => {
  if (!stripePromise) {
    try {
      const config = await paymentService.getStripeConfig()
      stripePromise = loadStripe(config.publishableKey)
    } catch (error) {
      console.error('Failed to load Stripe config:', error)
    }
  }
  return stripePromise
}

// Checkout Form Component (inside Elements provider)
const CheckoutForm = ({ orderId, orderCode, amount, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?code=${orderCode}`,
        },
        redirect: 'if_required'
      })

      if (error) {
        setErrorMessage(error.message)
        toast.error(error.message)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Verify payment and update order status on backend
        try {
          await paymentService.verifyStripePayment(paymentIntent.id)
          console.log('Payment verified and order status updated')
        } catch (verifyErr) {
          console.error('Failed to verify payment:', verifyErr)
          // Continue anyway since payment was successful
        }
        
        toast.success('Thanh toán thành công!')
        onSuccess(paymentIntent)
      }
    } catch (err) {
      setErrorMessage('Có lỗi xảy ra khi xử lý thanh toán')
      toast.error('Có lỗi xảy ra khi xử lý thanh toán')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Info */}
      <div className="bg-sand rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-dark-600">Mã đơn hàng:</span>
          <span className="font-semibold">{orderCode}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-dark-600">Tổng thanh toán:</span>
          <span className="font-bold text-lg text-primary-600">{formatPrice(amount)}</span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="bg-white border border-dark-200 rounded-xl p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-dark-500">
        <Lock className="w-4 h-4" />
        <span>Thanh toán được bảo mật bởi Stripe</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-1"
          disabled={isProcessing}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Thanh toán
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Main Stripe Checkout Component
const StripeCheckout = ({ orderId, orderCode, amount, onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState('')
  const [stripeLoaded, setStripeLoaded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Prevent double initialization from React StrictMode
  const initRef = useRef(false)

  useEffect(() => {
    // Skip if already initialized (StrictMode calls useEffect twice)
    if (initRef.current) return
    initRef.current = true

    const initStripe = async () => {
      try {
        setLoading(true)
        
        // Load Stripe
        const stripe = await getStripePromise()
        setStripeLoaded(stripe)

        // Create PaymentIntent
        const response = await paymentService.createStripePaymentIntent(orderId)
        setClientSecret(response.clientSecret)
        
      } catch (err) {
        console.error('Error initializing Stripe:', err)
        setError('Không thể khởi tạo thanh toán. Vui lòng thử lại.')
        toast.error('Không thể khởi tạo thanh toán')
      } finally {
        setLoading(false)
      }
    }

    initStripe()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-dark-500">Đang khởi tạo thanh toán...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onCancel} className="btn-outline">
          Quay lại
        </button>
      </div>
    )
  }

  if (!clientSecret || !stripeLoaded) {
    return null
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#f97316', // primary-500
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      borderRadius: '8px',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Thanh toán qua Stripe</h2>
          <p className="text-sm text-dark-500">Nhập thông tin thẻ để thanh toán</p>
        </div>
      </div>

      <Elements stripe={stripeLoaded} options={options}>
        <CheckoutForm 
          orderId={orderId}
          orderCode={orderCode}
          amount={amount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  )
}

export default StripeCheckout
