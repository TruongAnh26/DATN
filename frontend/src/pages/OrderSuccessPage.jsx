import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('code') || 'ORD-XXXXXX'

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">
            Đặt hàng thành công!
          </h1>
          
          <p className="text-dark-500 mb-6">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>

          {/* Order Code */}
          <div className="bg-sand rounded-xl p-4 mb-6">
            <p className="text-sm text-dark-500 mb-1">Mã đơn hàng</p>
            <p className="text-lg font-bold text-primary-600">{orderCode}</p>
          </div>

          {/* Info */}
          <div className="text-left space-y-3 mb-6">
            <div className="flex items-start gap-3 text-sm">
              <Package className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <p className="text-dark-600">
                Email xác nhận đơn hàng đã được gửi đến địa chỉ email của bạn.
              </p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Package className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <p className="text-dark-600">
                Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/orders" className="btn-primary w-full flex items-center justify-center gap-2">
              Xem đơn hàng
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products" className="btn-outline w-full">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Support */}
        <p className="text-sm text-dark-500 mt-6">
          Cần hỗ trợ? Liên hệ hotline{' '}
          <a href="tel:1900123456" className="text-primary-500 font-medium">
            1900 123 456
          </a>
        </p>
      </div>
    </div>
  )
}

export default OrderSuccessPage

