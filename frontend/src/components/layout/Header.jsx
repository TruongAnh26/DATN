import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Heart,
  LogOut
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { getCategories } from '../../store/slices/productSlice'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)
  const { categories } = useSelector((state) => state.product)

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    setShowUserMenu(false)
    navigate('/')
  }

  const mainCategories = [
    { name: 'Bé Trai', slug: 'boys', icon: '👦' },
    { name: 'Bé Gái', slug: 'girls', icon: '👧' },
    { name: 'Bé Sơ Sinh', slug: 'baby', icon: '👶' },
    { name: 'Sale', slug: 'sale', icon: '🔥', highlight: true },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-dark-900 text-white text-xs py-2">
        <div className="container-custom flex items-center justify-between">
          <p className="hidden sm:block">
            🚚 Miễn phí vận chuyển cho đơn hàng từ 599.000đ
          </p>
          <p className="sm:hidden text-center w-full">
            🚚 Freeship từ 599K
          </p>
          <div className="hidden sm:flex items-center gap-4">
            <a href="tel:1900123456" className="hover:text-primary-400 transition-colors">
              Hotline: 1900 123 456
            </a>
            <span>|</span>
            <Link to="/stores" className="hover:text-primary-400 transition-colors">
              Hệ thống cửa hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md' 
            : 'bg-white'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-xl text-dark-900">
                  Kids<span className="text-primary-500">Fashion</span>
                </h1>
                <p className="text-[10px] text-dark-500 -mt-1 tracking-wider">
                  THỜI TRANG TRẺ EM
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {mainCategories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className={`nav-link flex items-center gap-1.5 ${
                    category.highlight ? 'text-red-500 hover:text-red-600' : ''
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
              <div className="relative group">
                <button className="nav-link flex items-center gap-1">
                  Danh mục
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="p-4 space-y-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="block px-4 py-2 rounded-lg hover:bg-sand transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <button 
                className="p-2 hover:bg-sand rounded-full transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist (Desktop) */}
              <Link 
                to="/wishlist"
                className="hidden sm:flex p-2 hover:bg-sand rounded-full transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* User */}
              <div className="relative">
                {user ? (
                  <button 
                    className="flex items-center gap-2 p-2 hover:bg-sand rounded-full transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user.fullName?.split(' ')[0]}
                    </span>
                  </button>
                ) : (
                  <Link 
                    to="/login"
                    className="p-2 hover:bg-sand rounded-full transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                {/* User Dropdown */}
                {showUserMenu && user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-xl py-2 animate-slide-down">
                    <div className="px-4 py-3 border-b border-dark-100">
                      <p className="font-semibold text-dark-900">{user.fullName}</p>
                      <p className="text-sm text-dark-500">{user.email}</p>
                    </div>
                    <Link 
                      to="/account"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-sand transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Tài khoản
                    </Link>
                    <Link 
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-sand transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Đơn hàng
                    </Link>
                    <button 
                      className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-sand transition-colors text-red-500"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link 
                to="/cart"
                className="relative p-2 hover:bg-sand rounded-full transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />
        <div 
          className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-dark-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {mainCategories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sand transition-colors ${
                  category.highlight ? 'text-red-500' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </Link>
            ))}
            <div className="border-t border-dark-100 pt-4 mt-4">
              <p className="px-4 text-sm font-semibold text-dark-500 mb-2">Danh mục</p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="block px-4 py-2 hover:bg-sand rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Search Modal */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
        />
        <div className="absolute top-0 left-0 right-0 bg-white p-4 animate-slide-down">
          <div className="container-custom">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="input pl-12 py-4 text-lg"
                  autoFocus
                />
              </div>
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header

