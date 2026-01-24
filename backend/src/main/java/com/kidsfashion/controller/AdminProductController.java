package com.kidsfashion.controller;

import com.kidsfashion.dto.ApiResponse;
import com.kidsfashion.dto.ProductDTO;
import com.kidsfashion.entity.*;
import com.kidsfashion.entity.enums.Gender;
import com.kidsfashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SizeRepository sizeRepository;
    private final ColorRepository colorRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Get categories (first one for form)
        Long categoryId = product.getCategories().stream()
                .findFirst()
                .map(cat -> cat.getId().longValue())
                .orElse(null);
        
        // Get images
        List<Map<String, Object>> images = new ArrayList<>();
        for (ProductImage img : product.getImages()) {
            Map<String, Object> imageMap = new HashMap<>();
            imageMap.put("url", img.getImageUrl() != null ? img.getImageUrl() : "");
            imageMap.put("alt", img.getAltText() != null ? img.getAltText() : "");
            imageMap.put("isPrimary", img.getIsPrimary() != null && img.getIsPrimary());
            imageMap.put("displayOrder", img.getSortOrder() != null ? img.getSortOrder() : 0);
            images.add(imageMap);
        }
        
        // Get variants with inventory
        List<Map<String, Object>> variants = new ArrayList<>();
        for (ProductVariant variant : product.getVariants()) {
            Inventory inventory = inventoryRepository.findByVariantId(variant.getId()).orElse(null);
            Map<String, Object> variantMap = new HashMap<>();
            variantMap.put("sizeId", variant.getSize().getId());
            variantMap.put("colorId", variant.getColor().getId());
            variantMap.put("sizeName", variant.getSize().getName());
            variantMap.put("colorName", variant.getColor().getName());
            variantMap.put("colorCode", variant.getColor().getHexCode() != null ? variant.getColor().getHexCode() : "");
            variantMap.put("priceAdjustment", variant.getPriceAdjustment() != null ? variant.getPriceAdjustment().doubleValue() : 0.0);
            variantMap.put("quantity", inventory != null ? inventory.getQuantity() : 0);
            variants.add(variantMap);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", product.getId());
        result.put("name", product.getName() != null ? product.getName() : "");
        result.put("sku", product.getSku() != null ? product.getSku() : "");
        result.put("description", product.getDescription() != null ? product.getDescription() : "");
        result.put("shortDescription", product.getShortDescription() != null ? product.getShortDescription() : "");
        result.put("basePrice", product.getBasePrice() != null ? product.getBasePrice().doubleValue() : 0.0);
        result.put("salePrice", product.getSalePrice() != null ? product.getSalePrice().doubleValue() : null);
        result.put("categoryId", categoryId);
        result.put("brandId", product.getBrand() != null ? product.getBrand().getId() : null);
        result.put("gender", product.getGender() != null ? product.getGender().name() : "UNISEX");
        // Build ageGroup from ageMin and ageMax
        String ageGroup = "";
        if (product.getAgeMin() != null && product.getAgeMax() != null) {
            ageGroup = product.getAgeMin() + "-" + product.getAgeMax();
        } else if (product.getAgeMin() != null) {
            ageGroup = product.getAgeMin().toString();
        }
        result.put("ageGroup", ageGroup);
        result.put("material", product.getMaterial() != null ? product.getMaterial() : "");
        result.put("careInstructions", "");
        result.put("featured", product.getIsFeatured() != null && product.getIsFeatured());
        result.put("active", product.getStatus() == com.kidsfashion.entity.enums.ProductStatus.ACTIVE);
        result.put("metaTitle", "");
        result.put("metaDescription", "");
        result.put("images", images);
        result.put("variants", variants);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createProduct(@RequestBody ProductDTO dto) {
        // Validate sale price
        if (dto.getSalePrice() != null && dto.getBasePrice() != null) {
            if (dto.getSalePrice() > dto.getBasePrice()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Giá khuyến mãi không được lớn hơn giá gốc"));
            }
        }
        
        Product product = new Product();
        mapDtoToProduct(dto, product);
        
        // Generate slug if not provided
        if (product.getSlug() == null || product.getSlug().isEmpty()) {
            product.setSlug(generateSlug(dto.getName()));
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Save images
        if (dto.getImages() != null) {
            saveProductImages(savedProduct, dto.getImages());
        }
        
        // Save variants
        if (dto.getVariants() != null) {
            saveProductVariants(savedProduct, dto.getVariants());
        }
        
        // Return simple response to avoid serialization issues
        Map<String, Object> result = Map.of(
            "id", savedProduct.getId(),
            "name", savedProduct.getName(),
            "sku", savedProduct.getSku(),
            "message", "Product created successfully"
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO dto) {
        
        // Validate sale price
        if (dto.getSalePrice() != null && dto.getBasePrice() != null) {
            if (dto.getSalePrice() > dto.getBasePrice()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Giá khuyến mãi không được lớn hơn giá gốc"));
            }
        }
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        mapDtoToProduct(dto, product);
        
        Product savedProduct = productRepository.save(product);
        
        // Update images if provided
        if (dto.getImages() != null) {
            productImageRepository.deleteAllByProductId(id);
            saveProductImages(savedProduct, dto.getImages());
        }
        
        // Update variants if provided
        if (dto.getVariants() != null) {
            updateProductVariants(savedProduct, dto.getVariants());
        }
        
        // Return simple response to avoid serialization issues
        Map<String, Object> result = Map.of(
            "id", savedProduct.getId(),
            "name", savedProduct.getName(),
            "sku", savedProduct.getSku(),
            "message", "Product updated successfully"
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Delete related entities
        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        for (ProductVariant v : variants) {
            inventoryRepository.deleteByVariantId(v.getId());
        }
        productVariantRepository.deleteByProductId(id);
        productImageRepository.deleteAllByProductId(id);
        
        productRepository.delete(product);
        
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    private void mapDtoToProduct(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setBasePrice(dto.getBasePrice() != null ? BigDecimal.valueOf(dto.getBasePrice()) : null);
        product.setSalePrice(dto.getSalePrice() != null ? BigDecimal.valueOf(dto.getSalePrice()) : null);
        product.setMaterial(dto.getMaterial());
        product.setIsFeatured(dto.getFeatured() != null && dto.getFeatured());
        
        // Set status based on active flag
        if (dto.getActive() == null || dto.getActive()) {
            product.setStatus(com.kidsfashion.entity.enums.ProductStatus.ACTIVE);
        } else {
            product.setStatus(com.kidsfashion.entity.enums.ProductStatus.INACTIVE);
        }
        
        if (dto.getGender() != null) {
            try {
                product.setGender(Gender.valueOf(dto.getGender()));
            } catch (Exception e) {
                product.setGender(Gender.UNISEX);
            }
        }
        
        // Category is ManyToMany, add to categories set
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId())
                    .ifPresent(category -> {
                        product.getCategories().clear();
                        product.getCategories().add(category);
                    });
        }
        
        if (dto.getBrandId() != null) {
            brandRepository.findById(dto.getBrandId())
                    .ifPresent(product::setBrand);
        }
    }

    private void saveProductImages(Product product, List<Map<String, Object>> images) {
        List<ProductImage> productImages = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            Map<String, Object> img = images.get(i);
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl((String) img.getOrDefault("url", img.get("imageUrl")));
            image.setAltText((String) img.getOrDefault("alt", img.get("altText")));
            image.setSortOrder(i);
            image.setIsPrimary(Boolean.TRUE.equals(img.get("isPrimary")) || i == 0);
            productImages.add(image);
        }
        productImageRepository.saveAll(productImages);
    }

    private void updateProductVariants(Product product, List<Map<String, Object>> newVariants) {
        List<ProductVariant> oldVariants = productVariantRepository.findByProductId(product.getId());
        
        // Create a map of new variants by (sizeId, colorId) for quick lookup
        Map<String, Map<String, Object>> newVariantMap = new HashMap<>();
        for (Map<String, Object> v : newVariants) {
            // Normalize IDs to Integer for consistent key comparison
            Integer sizeId = Integer.valueOf(v.get("sizeId").toString());
            Integer colorId = Integer.valueOf(v.get("colorId").toString());
            String key = sizeId + "-" + colorId;
            newVariantMap.put(key, v);
        }
        
        // Process old variants
        for (ProductVariant oldVariant : oldVariants) {
            String key = oldVariant.getSize().getId() + "-" + oldVariant.getColor().getId();
            Map<String, Object> newVariantData = newVariantMap.get(key);
            
            if (newVariantData != null) {
                // Variant exists in both old and new - update it
                updateVariant(oldVariant, newVariantData, product);
                newVariantMap.remove(key); // Mark as processed
            } else {
                // Variant not in new list - check if it's used in orders
                if (orderItemRepository.existsByVariantId(oldVariant.getId())) {
                    // Variant is used in orders - mark as inactive instead of deleting
                    oldVariant.setIsActive(false);
                    productVariantRepository.save(oldVariant);
                } else {
                    // Variant not used in orders - safe to delete
                    inventoryRepository.deleteByVariantId(oldVariant.getId());
                    productVariantRepository.delete(oldVariant);
                }
            }
        }
        
        // Create new variants that don't exist yet
        for (Map<String, Object> v : newVariantMap.values()) {
            createVariant(product, v);
        }
    }
    
    private void updateVariant(ProductVariant variant, Map<String, Object> variantData, Product product) {
        // Update price adjustment
        Object priceAdjustment = variantData.get("priceAdjustment");
        if (priceAdjustment != null) {
            variant.setPriceAdjustment(BigDecimal.valueOf(Double.parseDouble(priceAdjustment.toString())));
        } else {
            variant.setPriceAdjustment(BigDecimal.ZERO);
        }
        
        // Update SKU in case product SKU changed
        variant.setSkuVariant(product.getSku() + "-" + variant.getSize().getName() + "-" + variant.getColor().getName());
        variant.setIsActive(true);
        productVariantRepository.save(variant);
        
        // Update inventory
        Object quantity = variantData.get("quantity");
        Inventory inventory = inventoryRepository.findByVariantId(variant.getId()).orElse(null);
        if (quantity != null) {
            int qty = Integer.parseInt(quantity.toString());
            if (inventory != null) {
                inventory.setQuantity(qty);
                inventoryRepository.save(inventory);
            } else {
                inventory = new Inventory();
                inventory.setVariant(variant);
                inventory.setQuantity(qty);
                inventory.setReservedQuantity(0);
                inventory.setLowStockThreshold(5);
                inventoryRepository.save(inventory);
            }
        }
    }
    
    private void createVariant(Product product, Map<String, Object> variantData) {
        Long sizeId = Long.valueOf(variantData.get("sizeId").toString());
        Long colorId = Long.valueOf(variantData.get("colorId").toString());
        
        Size size = sizeRepository.findById(sizeId).orElse(null);
        Color color = colorRepository.findById(colorId).orElse(null);
        
        if (size == null || color == null) return;
        
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(size);
        variant.setColor(color);
        variant.setSkuVariant(product.getSku() + "-" + size.getName() + "-" + color.getName());
        
        Object priceAdjustment = variantData.get("priceAdjustment");
        if (priceAdjustment != null) {
            variant.setPriceAdjustment(BigDecimal.valueOf(Double.parseDouble(priceAdjustment.toString())));
        } else {
            variant.setPriceAdjustment(BigDecimal.ZERO);
        }
        
        variant.setIsActive(true);
        ProductVariant savedVariant = productVariantRepository.save(variant);
        
        // Create inventory
        Object quantity = variantData.get("quantity");
        if (quantity != null) {
            Inventory inventory = new Inventory();
            inventory.setVariant(savedVariant);
            inventory.setQuantity(Integer.parseInt(quantity.toString()));
            inventory.setReservedQuantity(0);
            inventory.setLowStockThreshold(5);
            inventoryRepository.save(inventory);
        }
    }

    private void saveProductVariants(Product product, List<Map<String, Object>> variants) {
        for (Map<String, Object> v : variants) {
            createVariant(product, v);
        }
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}

