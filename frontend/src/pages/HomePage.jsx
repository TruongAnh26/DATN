import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { ArrowRight, Sparkles, TrendingUp, Tag } from 'lucide-react'
import { 
  getFeaturedProducts, 
  getNewArrivals, 
  getSaleProducts,
  getCategories 
} from '../store/slices/productSlice'
import ProductGrid from '../components/product/ProductGrid'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const HomePage = () => {
  const dispatch = useDispatch()
  const { 
    featuredProducts, 
    newArrivals, 
    saleProducts,
    categories,
    isLoading 
  } = useSelector((state) => state.product)

  useEffect(() => {
    dispatch(getFeaturedProducts())
    dispatch(getNewArrivals())
    dispatch(getSaleProducts())
    dispatch(getCategories())
  }, [dispatch])

  const heroSlides = [
    {
      title: 'Bộ sưu tập Đông 2026',
      subtitle: 'Ấm áp & Phong cách',
      description: 'Khám phá những thiết kế mới nhất cho mùa đông năm nay',
      image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1920&h=800&fit=crop',
      buttonText: 'Khám phá ngay',
      buttonLink: '/products',
    },
    {
      title: 'Sale Up To 50%',
      subtitle: 'Siêu ưu đãi cuối năm',
      description: 'Săn ngay những deal hot nhất cho bé yêu',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1920&h=800&fit=crop',
      buttonText: 'Mua sắm ngay',
      buttonLink: '/products?onSale=true',
    },
    {
      title: 'Thời trang học đường',
      subtitle: 'Back To School',
      description: 'Đồng phục và trang phục đi học cho các bé',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=800&fit=crop',
      buttonText: 'Xem ngay',
      buttonLink: '/category/school',
    },
  ]

  const categoryCards = [
    { 
      name: 'Bé Trai', 
      slug: 'boys', 
      icon: '👦',
      image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    { 
      name: 'Bé Gái', 
      slug: 'girls', 
      icon: '👧',
      image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop',
      color: 'from-pink-500/20 to-pink-600/20'
    },
    { 
      name: 'Bé Sơ Sinh', 
      slug: 'baby', 
      icon: '👶',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop',
      color: 'from-yellow-500/20 to-yellow-600/20'
    },
    { 
      name: 'Phụ Kiện', 
      slug: 'accessories', 
      icon: '🎀',
      image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&h=500&fit=crop',
      color: 'from-purple-500/20 to-purple-600/20'
    },
  ]

  return (
    <div>
      {/* Hero Slider */}
      <section className="relative group">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          loop={true}
          className="h-[400px] md:h-[500px] lg:h-[600px] hero-swiper"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container-custom">
                    <div className="max-w-xl text-white animate-slide-up">
                      <p className="text-primary-400 font-semibold mb-2 tracking-wider uppercase">
                        {slide.subtitle}
                      </p>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-lg text-white/80 mb-6">
                        {slide.description}
                      </p>
                      <Link 
                        to={slide.buttonLink}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        {slide.buttonText}
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="section-title">Mua sắm theo danh mục</h2>
            <p className="section-subtitle">Chọn ngay sản phẩm phù hợp cho bé yêu</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categoryCards.map((category, index) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} to-black/40`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl mb-2">{category.icon}</span>
                  <h3 className="text-xl font-display font-bold">{category.name}</h3>
                  <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity mt-2 bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
                    Xem ngay →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-sand">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary-500 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider">Nổi bật</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
                Sản phẩm nổi bật
              </h2>
            </div>
            <Link 
              to="/products?featured=true"
              className="btn-outline text-sm hidden md:inline-flex"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <ProductGrid products={featuredProducts} loading={isLoading} />
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/products?featured=true" className="btn-outline">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-12">
        <div className="container-custom">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1200&h=400&fit=crop"
              alt="Banner"
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-500/70 flex items-center">
              <div className="container-custom text-white">
                <p className="text-lg font-semibold mb-2">Ưu đãi đặc biệt</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Miễn phí vận chuyển<br />cho đơn từ 599K
                </h3>
                <Link to="/products" className="btn bg-white text-primary-600 hover:bg-dark-100">
                  Mua sắm ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider">Mới về</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
                Hàng mới về
              </h2>
            </div>
            <Link 
              to="/products?sortBy=newest"
              className="btn-outline text-sm hidden md:inline-flex"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <ProductGrid products={newArrivals} loading={isLoading} />
        </div>
      </section>

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="section bg-gradient-to-r from-red-500 to-orange-500">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5" />
                  <span className="font-semibold text-sm uppercase tracking-wider">Hot Deal</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">
                  🔥 Flash Sale
                </h2>
              </div>
              <Link 
                to="/products?onSale=true"
                className="btn bg-white text-red-500 hover:bg-dark-100 text-sm hidden md:inline-flex"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl p-4 md:p-6">
              <ProductGrid products={saleProducts} loading={isLoading} />
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="section bg-dark-900 text-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Đăng ký nhận tin
            </h2>
            <p className="text-dark-400 mb-6">
              Nhận ngay ưu đãi 10% cho đơn hàng đầu tiên và cập nhật những xu hướng thời trang mới nhất!
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="input flex-1 bg-dark-800 border-dark-700 text-white placeholder-dark-400"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

