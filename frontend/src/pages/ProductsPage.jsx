import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, X, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react'
import { getProducts, getCategories } from '../store/slices/productSlice'
import ProductGrid from '../components/product/ProductGrid'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [gridCols, setGridCols] = useState(4)
  
  const dispatch = useDispatch()
  const { 
    products, 
    categories,
    totalPages, 
    totalElements,
    currentPage,
    isLoading 
  } = useSelector((state) => state.product)

  // Get filters from URL
  const filters = {
    keyword: searchParams.get('keyword') || '',
    categoryIds: searchParams.getAll('categoryIds').map(Number),
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    onSale: searchParams.get('onSale') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortDirection: searchParams.get('sortDirection') || 'DESC',
    page: parseInt(searchParams.get('page') || '0'),
    size: parseInt(searchParams.get('size') || '12'),
  }

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  useEffect(() => {
    dispatch(getProducts(filters))
  }, [dispatch, searchParams])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === '' || value === false || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key)
    } else if (Array.isArray(value)) {
      newParams.delete(key)
      value.forEach(v => newParams.append(key, v))
    } else {
      newParams.set(key, value)
    }
    newParams.set('page', '0') // Reset page when filter changes
    setSearchParams(newParams)
  }

  const updatePriceRange = (min, max) => {
    const newParams = new URLSearchParams(searchParams)
    if (min === '' || min === null || min === undefined) {
      newParams.delete('minPrice')
    } else {
      newParams.set('minPrice', min)
    }
    if (max === '' || max === null || max === undefined) {
      newParams.delete('maxPrice')
    } else {
      newParams.set('maxPrice', max)
    }
    newParams.set('page', '0')
    setSearchParams(newParams)
  }

  const clearAllFilters = () => {
    setSearchParams({})
  }

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt', direction: 'DESC' },
    { label: 'Giá thấp đến cao', value: 'basePrice', direction: 'ASC' },
    { label: 'Giá cao đến thấp', value: 'basePrice', direction: 'DESC' },
    { label: 'Tên A-Z', value: 'name', direction: 'ASC' },
    { label: 'Phổ biến nhất', value: 'viewCount', direction: 'DESC' },
  ]

  const priceRanges = [
    { label: 'Dưới 200K', min: 0, max: 200000 },
    { label: '200K - 500K', min: 200000, max: 500000 },
    { label: '500K - 1 triệu', min: 500000, max: 1000000 },
    { label: 'Trên 1 triệu', min: 1000000, max: '' },
  ]

  const genderOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Bé trai', value: 'BOYS' },
    { label: 'Bé gái', value: 'GIRLS' },
    { label: 'Unisex', value: 'UNISEX' },
  ]

  const hasActiveFilters = filters.keyword || filters.categoryIds.length > 0 || 
    filters.gender || filters.minPrice || filters.maxPrice || filters.onSale

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-dark-100">
        <div className="container-custom py-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
            {filters.keyword ? `Kết quả tìm kiếm: "${filters.keyword}"` : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-dark-500 mt-1">
            {totalElements} sản phẩm
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Bộ lọc</h3>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-primary-500 hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh mục</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categoryIds.includes(category.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...filters.categoryIds, category.id]
                            : filters.categoryIds.filter(id => id !== category.id)
                          updateFilter('categoryIds', newIds)
                        }}
                        className="w-4 h-4 text-primary-500 rounded border-dark-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-dark-700">{category.name}</span>
                      {category.productCount > 0 && (
                        <span className="text-xs text-dark-400">({category.productCount})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Giới tính</h4>
                <div className="space-y-2">
                  {genderOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={filters.gender === option.value}
                        onChange={() => updateFilter('gender', option.value)}
                        className="w-4 h-4 text-primary-500 border-dark-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-dark-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Khoảng giá</h4>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={String(filters.minPrice) === String(range.min) && String(filters.maxPrice) === String(range.max)}
                        onChange={() => updatePriceRange(range.min, range.max)}
                        className="w-4 h-4 text-primary-500 border-dark-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-dark-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sale Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => updateFilter('onSale', e.target.checked)}
                    className="w-4 h-4 text-primary-500 rounded border-dark-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-700">Chỉ sản phẩm giảm giá</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button 
                  className="lg:hidden btn-outline flex items-center gap-2"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                  {hasActiveFilters && (
                    <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={`${filters.sortBy}-${filters.sortDirection}`}
                    onChange={(e) => {
                      const [sortBy, sortDirection] = e.target.value.split('-')
                      updateFilter('sortBy', sortBy)
                      updateFilter('sortDirection', sortDirection)
                    }}
                    className="appearance-none bg-transparent pr-8 py-2 text-sm font-medium cursor-pointer focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option 
                        key={`${option.value}-${option.direction}`} 
                        value={`${option.value}-${option.direction}`}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                </div>
              </div>

              {/* Grid Toggle - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded ${gridCols === 3 ? 'bg-dark-100' : 'hover:bg-dark-50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded ${gridCols === 4 ? 'bg-dark-100' : 'hover:bg-dark-50'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.keyword && (
                  <span className="badge bg-dark-100 text-dark-700 flex items-center gap-1">
                    Từ khóa: {filters.keyword}
                    <button onClick={() => updateFilter('keyword', '')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.gender && (
                  <span className="badge bg-dark-100 text-dark-700 flex items-center gap-1">
                    {genderOptions.find(g => g.value === filters.gender)?.label}
                    <button onClick={() => updateFilter('gender', '')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.onSale && (
                  <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                    Đang giảm giá
                    <button onClick={() => updateFilter('onSale', false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            <ProductGrid products={products} loading={isLoading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => updateFilter('page', index)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === index
                        ? 'bg-primary-500 text-white'
                        : 'bg-white hover:bg-dark-100 text-dark-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity ${
          showFilters ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowFilters(false)}
        />
        <div 
          className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white transform transition-transform ${
            showFilters ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-dark-100 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Bộ lọc</h2>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            {/* Same filter content as sidebar */}
            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Danh mục</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...filters.categoryIds, category.id]
                          : filters.categoryIds.filter(id => id !== category.id)
                        updateFilter('categoryIds', newIds)
                      }}
                      className="w-4 h-4 text-primary-500 rounded border-dark-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button 
              onClick={() => setShowFilters(false)}
              className="btn-primary w-full"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage

