import { Link } from 'react-router-dom'
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react'
import PhanKidLogo from './PhanKidLogo'

const Footer = () => {
  const features = [
    { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 599K' },
    { icon: RefreshCw, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 30 ngày' },
    { icon: Shield, title: 'Bảo hành chất lượng', desc: '100% chính hãng' },
    { icon: CreditCard, title: 'Thanh toán an toàn', desc: 'Nhiều phương thức' },
  ]

  return (
    <footer className="bg-dark-900 text-white">
      {/* Features */}
      <div className="border-b border-dark-700">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-dark-400 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 inline-block">
              <PhanKidLogo size="default" showText={true} />
            </Link>
            <p className="text-dark-400 text-sm mb-4">
              Thương hiệu thời trang trẻ em hàng đầu Việt Nam với sứ mệnh mang đến 
              những sản phẩm chất lượng, an toàn và thời trang cho các bé.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/boys" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Thời trang bé trai
                </Link>
              </li>
              <li>
                <Link to="/category/girls" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Thời trang bé gái
                </Link>
              </li>
              <li>
                <Link to="/category/baby" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Đồ sơ sinh
                </Link>
              </li>
              <li>
                <Link to="/products?onSale=true" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Sản phẩm mới
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-400 text-sm">
                  123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <a href="tel:1900123456" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  1900 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <a href="mailto:info@phankid.vn" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                  info@phankid.vn
                </a>
              </li>
            </ul>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Phương thức thanh toán</p>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-dark-800 rounded text-xs">Stripe</div>
                <div className="px-3 py-1.5 bg-dark-800 rounded text-xs">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-400 text-sm text-center md:text-left">
              © 2024 PhanKid. All rights reserved. Graduation Project.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="text-dark-400 hover:text-primary-400 transition-colors">
                Chính sách bảo mật
              </Link>
              <span className="text-dark-600">|</span>
              <Link to="/terms" className="text-dark-400 hover:text-primary-400 transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

