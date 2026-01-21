const PhanKidLogo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: { container: 'w-16 h-16', text: 'text-xs', tagline: 'text-[8px]' },
    default: { container: 'w-20 h-20', text: 'text-sm', tagline: 'text-[9px]' },
    large: { container: 'w-32 h-32', text: 'text-lg', tagline: 'text-xs' }
  }

  const currentSize = sizes[size] || sizes.default

  return (
    <div className="flex items-center gap-2">
      {/* Logo Image */}
      <div className={`${currentSize.container} relative flex-shrink-0`}>
        <img
          src="/logo.png"
          alt="PhanKid Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Thử các format khác nếu png không có
            const formats = ['jpg', 'jpeg', 'svg', 'webp']
            const currentSrc = e.target.src
            const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('.'))
            let formatIndex = 0
            
            const tryNextFormat = () => {
              if (formatIndex < formats.length) {
                e.target.src = `${basePath}.${formats[formatIndex]}`
                formatIndex++
              } else {
                // Fallback nếu không tìm thấy logo
                console.warn('Logo image not found. Please add logo.png/jpg/svg to public folder')
                e.target.style.display = 'none'
                const fallback = e.target.parentElement
                if (fallback && !fallback.querySelector('.logo-fallback')) {
                  const fallbackDiv = document.createElement('div')
                  fallbackDiv.className = 'logo-fallback w-full h-full bg-gradient-to-br from-primary-500 via-primary-600 to-pink-500 rounded-xl flex items-center justify-center'
                  fallbackDiv.innerHTML = '<span class="text-white font-display font-bold text-lg">PK</span>'
                  fallback.appendChild(fallbackDiv)
                }
              }
            }
            
            e.target.onerror = tryNextFormat
            tryNextFormat()
          }}
        />
      </div>
      
      {/* Logo Text (for header/footer) */}
      {showText && (
        <div>
          <h1 className={`${currentSize.text} font-display font-bold text-dark-900`}>
            Phan<span className="text-primary-500">Kid</span>
          </h1>
          <p className={`${currentSize.tagline} text-dark-500 -mt-1 tracking-wider`}>
            THỜI TRANG TRẺ EM
          </p>
        </div>
      )}
    </div>
  )
}

export default PhanKidLogo
