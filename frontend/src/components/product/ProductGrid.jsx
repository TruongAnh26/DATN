import ProductCard from './ProductCard'

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[3/4] bg-sand rounded-xl mb-4" />
            <div className="h-3 bg-sand rounded w-1/3 mb-2" />
            <div className="h-4 bg-sand rounded w-full mb-2" />
            <div className="h-4 bg-sand rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🛍️</span>
        </div>
        <h3 className="text-lg font-semibold text-dark-700 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-dark-500">
          Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

export default ProductGrid

