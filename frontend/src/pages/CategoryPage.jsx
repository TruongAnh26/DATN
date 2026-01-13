import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronRight } from 'lucide-react'
import { getProducts } from '../store/slices/productSlice'
import ProductGrid from '../components/product/ProductGrid'

const CategoryPage = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  
  const { products, isLoading } = useSelector((state) => state.product)

  const categoryInfo = {
    boys: { 
      name: 'Bé Trai', 
      icon: '👦',
      description: 'Khám phá bộ sưu tập thời trang đa dạng cho bé trai',
      banner: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1200&h=300&fit=crop'
    },
    girls: { 
      name: 'Bé Gái', 
      icon: '👧',
      description: 'Những thiết kế xinh xắn và đáng yêu cho bé gái',
      banner: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1200&h=300&fit=crop'
    },
    baby: { 
      name: 'Bé Sơ Sinh', 
      icon: '👶',
      description: 'Sản phẩm an toàn và thoải mái cho các bé sơ sinh',
      banner: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=300&fit=crop'
    },
    sale: { 
      name: 'Sale', 
      icon: '🔥',
      description: 'Săn ngay những deal hot nhất!',
      banner: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200&h=300&fit=crop'
    },
  }

  const category = categoryInfo[slug] || { name: slug, icon: '🛍️', description: '' }

  useEffect(() => {
    const filters = {
      size: 12,
      page: 0,
    }

    if (slug === 'boys') {
      filters.gender = 'BOYS'
    } else if (slug === 'girls') {
      filters.gender = 'GIRLS'
    } else if (slug === 'sale') {
      filters.onSale = true
    }

    dispatch(getProducts(filters))
  }, [dispatch, slug])

  return (
    <div className="min-h-screen bg-cream">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-dark-900">
        <img
          src={category.banner}
          alt={category.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <span className="text-4xl mb-2 block">{category.icon}</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {category.name}
            </h1>
            <p className="text-white/80">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-dark-500 hover:text-primary-500">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 text-dark-400" />
            <span className="text-dark-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Products */}
      <div className="container-custom py-8">
        <ProductGrid products={products} loading={isLoading} />
      </div>
    </div>
  )
}

export default CategoryPage

