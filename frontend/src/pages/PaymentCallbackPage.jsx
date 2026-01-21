import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const PaymentCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gateway = searchParams.get('gateway') || 'vnpay'
  const status = searchParams.get('status') || searchParams.get('vnp_ResponseCode')

  useEffect(() => {
    // Check payment status
    if (gateway === 'vnpay') {
      if (status === '00') {
        toast.success('Thanh toán thành công!')
        setTimeout(() => {
          navigate('/order-success')
        }, 2000)
      } else {
        toast.error('Thanh toán thất bại')
        setTimeout(() => {
          navigate('/cart')
        }, 2000)
      }
    } else if (gateway === 'momo') {
      const resultCode = searchParams.get('resultCode')
      if (resultCode === '0') {
        toast.success('Thanh toán thành công!')
        setTimeout(() => {
          navigate('/order-success')
        }, 2000)
      } else {
        toast.error('Thanh toán thất bại')
        setTimeout(() => {
          navigate('/cart')
        }, 2000)
      }
    }
  }, [gateway, status, navigate, searchParams])

  const isSuccess = (gateway === 'vnpay' && status === '00') || 
                    (gateway === 'momo' && searchParams.get('resultCode') === '0')

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl p-12 text-center max-w-md w-full mx-4">
        {isSuccess ? (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-dark-600 mb-6">
              Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ gửi email xác nhận đến bạn.
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-dark-600 mb-6">
              Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
            </p>
          </>
        )}
        <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        <p className="text-sm text-dark-500 mt-4">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}

export default PaymentCallbackPage
