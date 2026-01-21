import { MapPin, Phone, Clock, Mail, Navigation } from 'lucide-react'

const StoresPage = () => {
  const stores = [
    {
      id: 1,
      name: 'PhanKid - Quận 1',
      address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      phone: '028 3829 1234',
      email: 'store1@phankid.vn',
      hours: {
        weekdays: '9:00 - 21:00',
        weekend: '9:00 - 22:00'
      },
      coordinates: { lat: 10.7769, lng: 106.7009 },
      features: ['Có chỗ đậu xe', 'Thử đồ miễn phí', 'Dịch vụ may đo']
    },
    {
      id: 2,
      name: 'PhanKid - Quận 7',
      address: '456 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
      phone: '028 3775 5678',
      email: 'store2@phankid.vn',
      hours: {
        weekdays: '9:00 - 21:00',
        weekend: '9:00 - 22:00'
      },
      coordinates: { lat: 10.7296, lng: 106.7227 },
      features: ['Có chỗ đậu xe', 'Thử đồ miễn phí']
    },
    {
      id: 3,
      name: 'PhanKid - Hà Nội',
      address: '789 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
      phone: '024 3825 9012',
      email: 'store3@phankid.vn',
      hours: {
        weekdays: '8:30 - 21:30',
        weekend: '9:00 - 22:00'
      },
      coordinates: { lat: 21.0285, lng: 105.8542 },
      features: ['Có chỗ đậu xe', 'Thử đồ miễn phí', 'Dịch vụ may đo', 'Khu vui chơi cho trẻ']
    },
    {
      id: 4,
      name: 'PhanKid - Đà Nẵng',
      address: '321 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng',
      phone: '0236 3821 3456',
      email: 'store4@phankid.vn',
      hours: {
        weekdays: '9:00 - 21:00',
        weekend: '9:00 - 21:30'
      },
      coordinates: { lat: 16.0544, lng: 108.2022 },
      features: ['Có chỗ đậu xe', 'Thử đồ miễn phí']
    }
  ]

  const handleGetDirections = (store) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Hệ thống cửa hàng
            </h1>
            <p className="text-xl text-white/90">
              Tìm cửa hàng PhanKid gần bạn nhất
            </p>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-dark-900 mb-2">
                      {store.name}
                    </h3>
                    <div className="flex items-start gap-3 text-dark-600 mb-3">
                      <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{store.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="text-dark-600 hover:text-primary-600 text-sm">
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <a href={`mailto:${store.email}`} className="text-dark-600 hover:text-primary-600 text-sm">
                      {store.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="text-dark-600 text-sm">
                      <p>Thứ 2 - Thứ 6: {store.hours.weekdays}</p>
                      <p>Thứ 7 - Chủ nhật: {store.hours.weekend}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {store.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleGetDirections(store)}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Chỉ đường
                </button>
              </div>
            ))}
          </div>

          {/* Map Section */}
          <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-dark-900 mb-6 text-center">
              Bản đồ hệ thống cửa hàng
            </h2>
            <div className="bg-sand rounded-xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <p className="text-dark-600 mb-2">Bản đồ tương tác</p>
                <p className="text-sm text-dark-500">
                  Click vào nút "Chỉ đường" ở trên để xem vị trí cửa hàng trên Google Maps
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-display font-bold mb-4">
              Cần hỗ trợ?
            </h3>
            <p className="text-white/90 mb-6">
              Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:1900123456" className="btn bg-white text-primary-600 hover:bg-dark-100">
                Hotline: 1900 123 456
              </a>
              <a href="mailto:info@phankid.vn" className="btn bg-white/10 text-white border-2 border-white hover:bg-white/20">
                Email: info@phankid.vn
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StoresPage
