import { useState } from 'react'
import { ChevronDown, ShoppingBag, Truck, RefreshCw, CreditCard, Shield } from 'lucide-react'

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqCategories = [
    {
      icon: ShoppingBag,
      title: 'Đặt hàng & Thanh toán',
      questions: [
        {
          q: 'Làm thế nào để đặt hàng?',
          a: 'Bạn có thể đặt hàng trực tuyến trên website bằng cách: 1) Chọn sản phẩm yêu thích, 2) Thêm vào giỏ hàng, 3) Điền thông tin giao hàng, 4) Chọn phương thức thanh toán và hoàn tất đơn hàng.'
        },
        {
          q: 'Các phương thức thanh toán nào được chấp nhận?',
          a: 'Chúng tôi chấp nhận thanh toán qua VNPay, MoMo, và COD (Thanh toán khi nhận hàng). Bạn có thể chọn phương thức phù hợp khi đặt hàng.'
        },
        {
          q: 'Tôi có thể hủy đơn hàng sau khi đã đặt không?',
          a: 'Có, bạn có thể hủy đơn hàng trong vòng 2 giờ sau khi đặt. Sau thời gian này, vui lòng liên hệ hotline 1900 123 456 để được hỗ trợ.'
        },
        {
          q: 'Làm sao để kiểm tra trạng thái đơn hàng?',
          a: 'Bạn có thể kiểm tra trạng thái đơn hàng bằng cách: 1) Đăng nhập tài khoản và vào mục "Đơn hàng của tôi", 2) Hoặc sử dụng mã đơn hàng để tra cứu tại trang "Theo dõi đơn hàng".'
        }
      ]
    },
    {
      icon: Truck,
      title: 'Vận chuyển',
      questions: [
        {
          q: 'Phí vận chuyển là bao nhiêu?',
          a: 'Chúng tôi miễn phí vận chuyển cho đơn hàng từ 599.000₫. Đơn hàng dưới 599.000₫ sẽ có phí vận chuyển 30.000₫.'
        },
        {
          q: 'Thời gian giao hàng là bao lâu?',
          a: 'Thời gian giao hàng từ 2-5 ngày làm việc tùy theo khu vực. Đối với TP. Hồ Chí Minh và Hà Nội: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày.'
        },
        {
          q: 'Tôi có thể thay đổi địa chỉ giao hàng không?',
          a: 'Bạn có thể thay đổi địa chỉ giao hàng trong vòng 2 giờ sau khi đặt hàng. Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ.'
        },
        {
          q: 'Làm sao để theo dõi đơn hàng?',
          a: 'Sau khi đơn hàng được xác nhận, bạn sẽ nhận được mã vận đơn qua email/SMS. Bạn có thể sử dụng mã này để theo dõi trên website của đơn vị vận chuyển.'
        }
      ]
    },
    {
      icon: RefreshCw,
      title: 'Đổi trả',
      questions: [
        {
          q: 'Chính sách đổi trả như thế nào?',
          a: 'Bạn có thể đổi trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện: sản phẩm còn nguyên tem, chưa sử dụng, còn nguyên bao bì và hóa đơn.'
        },
        {
          q: 'Tôi có thể đổi size/ màu sắc không?',
          a: 'Có, bạn có thể đổi size hoặc màu sắc trong vòng 7 ngày kể từ ngày nhận hàng. Phí đổi hàng là 30.000₫ (miễn phí nếu lỗi từ phía chúng tôi).'
        },
        {
          q: 'Làm thế nào để yêu cầu đổi trả?',
          a: 'Bạn có thể yêu cầu đổi trả bằng cách: 1) Đăng nhập tài khoản và vào mục "Đơn hàng", 2) Chọn đơn hàng cần đổi trả và click "Yêu cầu đổi trả", 3) Điền lý do và gửi yêu cầu.'
        },
        {
          q: 'Thời gian xử lý đổi trả là bao lâu?',
          a: 'Sau khi nhận được sản phẩm đổi trả, chúng tôi sẽ kiểm tra và xử lý trong vòng 3-5 ngày làm việc. Tiền hoàn lại sẽ được chuyển về tài khoản của bạn trong vòng 7-10 ngày.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Chất lượng & Bảo hành',
      questions: [
        {
          q: 'Sản phẩm có đảm bảo chất lượng không?',
          a: 'Tất cả sản phẩm của PhanKid đều được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng. Chúng tôi cam kết 100% chính hãng và an toàn cho trẻ em.'
        },
        {
          q: 'Chính sách bảo hành như thế nào?',
          a: 'Chúng tôi bảo hành chất lượng sản phẩm trong vòng 6 tháng kể từ ngày mua. Nếu sản phẩm có lỗi do nhà sản xuất, chúng tôi sẽ đổi mới hoặc hoàn tiền.'
        },
        {
          q: 'Tôi nhận được sản phẩm bị lỗi, phải làm sao?',
          a: 'Nếu bạn nhận được sản phẩm bị lỗi, vui lòng chụp ảnh và liên hệ ngay hotline 1900 123 456 hoặc email info@phankid.vn. Chúng tôi sẽ đổi mới miễn phí cho bạn.'
        }
      ]
    }
  ]

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Câu hỏi thường gặp
            </h1>
            <p className="text-xl text-white/90">
              Tìm câu trả lời cho những thắc mắc của bạn
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-dark-900">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`
                    const isOpen = openIndex === key

                    return (
                      <div
                        key={questionIndex}
                        className="border border-dark-200 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-dark-50 transition-colors"
                        >
                          <span className="font-semibold text-dark-900 pr-4">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-dark-400 flex-shrink-0 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 py-4 bg-dark-50 border-t border-dark-200">
                            <p className="text-dark-600 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-sm">
            <h3 className="text-2xl font-display font-bold text-dark-900 mb-4">
              Vẫn còn thắc mắc?
            </h3>
            <p className="text-dark-600 mb-6">
              Liên hệ với chúng tôi để được hỗ trợ tốt nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:1900123456"
                className="btn-primary"
              >
                Gọi hotline: 1900 123 456
              </a>
              <a
                href="mailto:info@phankid.vn"
                className="btn-outline"
              >
                Gửi email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQPage
