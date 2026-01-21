import { RefreshCw, Clock, Package, AlertCircle } from 'lucide-react'

const ReturnPolicyPage = () => {
  const policies = [
    {
      icon: Clock,
      title: 'Thời gian đổi trả',
      content: [
        'Đổi trả trong vòng 30 ngày kể từ ngày nhận hàng',
        'Đổi size/màu trong vòng 7 ngày kể từ ngày nhận hàng',
        'Áp dụng cho tất cả sản phẩm còn nguyên tem, chưa sử dụng'
      ]
    },
    {
      icon: Package,
      title: 'Điều kiện đổi trả',
      content: [
        'Sản phẩm còn nguyên tem, nhãn mác',
        'Chưa qua sử dụng, giặt tẩy',
        'Còn nguyên bao bì, hộp đựng (nếu có)',
        'Có hóa đơn mua hàng hoặc email xác nhận đơn hàng',
        'Không áp dụng cho sản phẩm sale, khuyến mãi đặc biệt (trừ khi có lỗi từ phía chúng tôi)'
      ]
    },
    {
      icon: RefreshCw,
      title: 'Quy trình đổi trả',
      content: [
        'Bước 1: Đăng nhập tài khoản và vào mục "Đơn hàng"',
        'Bước 2: Chọn đơn hàng cần đổi trả và click "Yêu cầu đổi trả"',
        'Bước 3: Điền thông tin và lý do đổi trả, chụp ảnh sản phẩm (nếu có)',
        'Bước 4: Chờ xác nhận từ chúng tôi (trong vòng 24h)',
        'Bước 5: Gửi sản phẩm về địa chỉ được chỉ định',
        'Bước 6: Nhận sản phẩm mới hoặc hoàn tiền'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Phí đổi trả',
      content: [
        'Miễn phí đổi trả nếu sản phẩm có lỗi từ phía chúng tôi',
        'Miễn phí đổi trả nếu nhầm size/màu do chúng tôi giao sai',
        'Phí đổi trả 30.000₫ nếu khách hàng đổi ý (đổi size, màu, mẫu)',
        'Phí vận chuyển đổi trả do khách hàng chịu trừ trường hợp lỗi từ phía chúng tôi'
      ]
    }
  ]

  const returnReasons = [
    'Sản phẩm bị lỗi, hư hỏng',
    'Sản phẩm không đúng với mô tả',
    'Nhận nhầm sản phẩm',
    'Size không phù hợp',
    'Màu sắc không đúng',
    'Đổi ý (áp dụng phí đổi trả)'
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Chính sách đổi trả
            </h1>
            <p className="text-xl text-white/90">
              Cam kết đổi trả dễ dàng, nhanh chóng cho khách hàng
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm mb-8">
              <h2 className="text-2xl font-display font-bold text-dark-900 mb-4">
                Cam kết của chúng tôi
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 space-y-4">
                <p>
                  PhanKid cam kết mang đến sự hài lòng tối đa cho khách hàng. Chúng tôi hiểu 
                  rằng đôi khi bạn có thể cần đổi trả sản phẩm vì nhiều lý do khác nhau. Chính sách 
                  đổi trả của chúng tôi được thiết kế để đảm bảo quy trình đơn giản, nhanh chóng và 
                  minh bạch.
                </p>
                <p>
                  Chúng tôi sẽ xử lý yêu cầu đổi trả của bạn trong thời gian sớm nhất và đảm bảo 
                  bạn nhận được sản phẩm thay thế hoặc hoàn tiền một cách nhanh chóng.
                </p>
              </div>
            </div>

            {/* Policy Details */}
            <div className="space-y-6">
              {policies.map((policy, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <policy.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-dark-900">
                      {policy.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 ml-16">
                    {policy.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-dark-700">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Return Reasons */}
            <div className="mt-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-display font-bold text-dark-900 mb-4">
                Các lý do được chấp nhận đổi trả
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {returnReasons.map((reason, index) => (
                  <div key={index} className="flex items-center gap-2 text-dark-700">
                    <span className="text-primary-500">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Time */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-dark-900 mb-3">
                ⏱️ Thời gian xử lý
              </h3>
              <ul className="space-y-2 text-dark-700">
                <li>• Xác nhận yêu cầu đổi trả: Trong vòng 24 giờ</li>
                <li>• Kiểm tra sản phẩm sau khi nhận: 2-3 ngày làm việc</li>
                <li>• Gửi sản phẩm mới: 1-2 ngày làm việc sau khi xác nhận</li>
                <li>• Hoàn tiền: 7-10 ngày làm việc (nếu áp dụng)</li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-dark-900 mb-3">
                ⚠️ Lưu ý quan trọng
              </h3>
              <ul className="space-y-2 text-dark-700">
                <li>• Vui lòng đóng gói sản phẩm cẩn thận khi gửi đổi trả</li>
                <li>• Giữ lại hóa đơn mua hàng để làm bằng chứng</li>
                <li>• Chụp ảnh sản phẩm trước khi gửi đổi trả (nếu có vấn đề)</li>
                <li>• Sản phẩm sale, khuyến mãi đặc biệt chỉ được đổi trả nếu có lỗi từ phía chúng tôi</li>
                <li>• Không áp dụng đổi trả cho đồ lót, tất (trừ khi có lỗi)</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-white rounded-2xl p-6 text-center shadow-sm">
              <h3 className="text-xl font-display font-bold text-dark-900 mb-2">
                Cần hỗ trợ về đổi trả?
              </h3>
              <p className="text-dark-600 mb-4">
                Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:1900123456" className="btn-primary">
                  Hotline: 1900 123 456
                </a>
              <a href="mailto:info@phankid.vn" className="btn-outline">
                Email: info@phankid.vn
              </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ReturnPolicyPage
