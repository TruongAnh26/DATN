import { Truck, Clock, MapPin, Package } from 'lucide-react'

const ShippingPolicyPage = () => {
  const policies = [
    {
      icon: Package,
      title: 'Phí vận chuyển',
      content: [
        'Miễn phí vận chuyển cho đơn hàng từ 599.000₫',
        'Đơn hàng dưới 599.000₫: Phí vận chuyển 30.000₫',
        'Áp dụng cho tất cả các tỉnh thành trên toàn quốc'
      ]
    },
    {
      icon: Clock,
      title: 'Thời gian giao hàng',
      content: [
        'TP. Hồ Chí Minh và Hà Nội: 1-2 ngày làm việc',
        'Các tỉnh thành khác: 3-5 ngày làm việc',
        'Khu vực vùng sâu vùng xa: 5-7 ngày làm việc',
        'Thời gian giao hàng được tính từ khi đơn hàng được xác nhận'
      ]
    },
    {
      icon: MapPin,
      title: 'Khu vực giao hàng',
      content: [
        'Chúng tôi giao hàng toàn quốc',
        'Hỗ trợ giao hàng tại nhà hoặc điểm nhận hàng',
        'Không giao hàng đến địa chỉ P.O. Box'
      ]
    },
    {
      icon: Truck,
      title: 'Theo dõi đơn hàng',
      content: [
        'Sau khi đơn hàng được xác nhận, bạn sẽ nhận được mã vận đơn qua email/SMS',
        'Sử dụng mã vận đơn để theo dõi trên website của đơn vị vận chuyển',
        'Hoặc đăng nhập tài khoản để xem trạng thái đơn hàng chi tiết'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Chính sách vận chuyển
            </h1>
            <p className="text-xl text-white/90">
              Thông tin chi tiết về dịch vụ vận chuyển của chúng tôi
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
                Tổng quan
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 space-y-4">
                <p>
                  PhanKid cam kết mang đến dịch vụ vận chuyển nhanh chóng, an toàn và tiện lợi 
                  cho khách hàng. Chúng tôi hợp tác với các đơn vị vận chuyển uy tín để đảm bảo 
                  sản phẩm đến tay bạn trong tình trạng tốt nhất.
                </p>
                <p>
                  Tất cả đơn hàng đều được đóng gói cẩn thận, đảm bảo sản phẩm không bị hư hỏng 
                  trong quá trình vận chuyển.
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

            {/* Important Notes */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-dark-900 mb-3">
                ⚠️ Lưu ý quan trọng
              </h3>
              <ul className="space-y-2 text-dark-700">
                <li>• Vui lòng kiểm tra sản phẩm trước khi ký nhận hàng</li>
                <li>• Nếu sản phẩm bị hư hỏng trong quá trình vận chuyển, vui lòng từ chối nhận hàng và liên hệ ngay với chúng tôi</li>
                <li>• Thời gian giao hàng có thể bị ảnh hưởng bởi thời tiết hoặc các sự kiện đặc biệt</li>
                <li>• Đối với đơn hàng COD, vui lòng chuẩn bị đúng số tiền để thanh toán</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-white rounded-2xl p-6 text-center shadow-sm">
              <h3 className="text-xl font-display font-bold text-dark-900 mb-2">
                Cần hỗ trợ về vận chuyển?
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

export default ShippingPolicyPage
