import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MoMoDemoPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isPaying, setIsPaying] = useState(false)
  
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const orderInfo = searchParams.get('orderInfo') || `Thanh toán đơn hàng ${orderId}`

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handlePay = async () => {
    setIsPaying(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('Thanh toán MoMo thành công! (Demo)')
    
    // Redirect to success page
    navigate(`/payment/callback/momo?gateway=momo&resultCode=0&orderId=${orderId}`)
  }

  const handleCancel = () => {
    toast.error('Đã hủy thanh toán')
    navigate(`/payment/callback/momo?gateway=momo&resultCode=1006&orderId=${orderId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* MoMo Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-500 rounded-full mb-4">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-pink-600">MoMo</h1>
          <p className="text-gray-500 text-sm">Demo Payment</p>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">Số tiền thanh toán</p>
            <p className="text-4xl font-bold text-pink-600">{formatPrice(amount)}</p>
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nội dung</span>
              <span className="font-medium text-right max-w-[200px] truncate">{decodeURIComponent(orderInfo)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nguồn tiền</span>
              <span className="font-medium">Ví MoMo</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800 text-sm text-center">
            ⚠️ Đây là trang demo. Trong môi trường thực tế, bạn sẽ được chuyển đến ứng dụng MoMo để xác nhận thanh toán.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePay}
            disabled={isPaying}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isPaying ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Xác nhận thanh toán'
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={isPaying}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Được bảo vệ bởi MoMo
        </p>
      </div>
    </div>
  )
}

export default MoMoDemoPage
