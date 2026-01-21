import { Heart, Award, Users, Target } from 'lucide-react'

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Chất lượng hàng đầu',
      description: 'Cam kết mang đến những sản phẩm chất lượng cao, an toàn cho trẻ em'
    },
    {
      icon: Award,
      title: 'Thương hiệu uy tín',
      description: 'Được tin tưởng bởi hàng nghìn gia đình Việt Nam'
    },
    {
      icon: Users,
      title: 'Đội ngũ chuyên nghiệp',
      description: 'Luôn lắng nghe và phục vụ khách hàng tận tâm'
    },
    {
      icon: Target,
      title: 'Sứ mệnh',
      description: 'Mang đến niềm vui và tự tin cho các bé qua từng bộ trang phục'
    }
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Về PhanKid
            </h1>
            <p className="text-xl text-white/90">
              Thương hiệu thời trang trẻ em hàng đầu Việt Nam
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <h2 className="text-3xl font-display font-bold text-dark-900 mb-6">
                Câu chuyện của chúng tôi
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 space-y-4">
                <p>
                  PhanKid được thành lập với sứ mệnh mang đến những sản phẩm thời trang trẻ em 
                  chất lượng cao, an toàn và phù hợp với từng lứa tuổi. Chúng tôi hiểu rằng trẻ em 
                  cần những bộ trang phục không chỉ đẹp mà còn phải thoải mái, an toàn và phù hợp 
                  với hoạt động hàng ngày.
                </p>
                <p>
                  Với hơn 5 năm kinh nghiệm trong ngành thời trang trẻ em, chúng tôi đã xây dựng 
                  được mạng lưới đối tác uy tín và đội ngũ thiết kế chuyên nghiệp. Mỗi sản phẩm 
                  của PhanKid đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng và an toàn cho 
                  sức khỏe của trẻ.
                </p>
                <p>
                  Chúng tôi tự hào là đối tác tin cậy của hàng nghìn gia đình Việt Nam, mang đến 
                  niềm vui và sự tự tin cho các bé qua từng bộ trang phục.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Giá trị cốt lõi</h2>
            <p className="section-subtitle">
              Những điều chúng tôi cam kết mang đến cho khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-cream rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-dark-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-dark-600 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">50K+</div>
              <div className="text-white/80">Khách hàng</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">10K+</div>
              <div className="text-white/80">Sản phẩm</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">5+</div>
              <div className="text-white/80">Năm kinh nghiệm</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">98%</div>
              <div className="text-white/80">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
