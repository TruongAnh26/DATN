package com.kidsfashion.service;

import com.kidsfashion.dto.request.ProductFilterRequest;
import com.kidsfashion.dto.response.ProductResponse;
import com.kidsfashion.entity.*;
import com.kidsfashion.entity.enums.ProductStatus;
import com.kidsfashion.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(ProductFilterRequest filter) {
        Specification<Product> spec = buildSpecification(filter);
        Pageable pageable = buildPageable(filter);

        return productRepository.findAll(spec, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + slug));

        // Increment view count (requires write transaction)
        productRepository.incrementViewCount(product.getId());

        return mapToDetailedProductResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));

        return mapToDetailedProductResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByIsFeaturedTrueAndStatus(ProductStatus.ACTIVE, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getNewArrivals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByStatus(ProductStatus.ACTIVE, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getOnSaleProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findOnSaleProducts(ProductStatus.ACTIVE, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getRelatedProducts(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findRelatedProducts(productId, ProductStatus.ACTIVE, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(String categorySlug, int page, int size) {
        Category category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + categorySlug));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByCategoryId(category.getId(), ProductStatus.ACTIVE, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByBrand(String brandSlug, int page, int size) {
        Brand brand = brandRepository.findBySlug(brandSlug)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found: " + brandSlug));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByBrandIdAndStatus(brand.getId(), ProductStatus.ACTIVE, pageable)
                .map(this::mapToProductResponse);
    }

    private Specification<Product> buildSpecification(ProductFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter active products
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            // Keyword search
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String keyword = "%" + filter.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), keyword),
                        cb.like(cb.lower(root.get("description")), keyword)
                ));
            }

            // Category filter
            if (filter.getCategoryIds() != null && !filter.getCategoryIds().isEmpty()) {
                Join<Product, Category> categoryJoin = root.join("categories");
                predicates.add(categoryJoin.get("id").in(filter.getCategoryIds()));
            }

            // Brand filter
            if (filter.getBrandIds() != null && !filter.getBrandIds().isEmpty()) {
                predicates.add(root.get("brand").get("id").in(filter.getBrandIds()));
            }

            // Gender filter
            if (filter.getGender() != null) {
                predicates.add(cb.equal(root.get("gender"), filter.getGender()));
            }

            // Age filter
            if (filter.getAgeMin() != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("ageMax")),
                        cb.greaterThanOrEqualTo(root.get("ageMax"), filter.getAgeMin())
                ));
            }
            if (filter.getAgeMax() != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("ageMin")),
                        cb.lessThanOrEqualTo(root.get("ageMin"), filter.getAgeMax())
                ));
            }

            // Price filter
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        cb.coalesce(root.get("salePrice"), root.get("basePrice")),
                        filter.getMinPrice()
                ));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        cb.coalesce(root.get("salePrice"), root.get("basePrice")),
                        filter.getMaxPrice()
                ));
            }

            // On sale filter
            if (Boolean.TRUE.equals(filter.getOnSale())) {
                predicates.add(cb.isNotNull(root.get("salePrice")));
                predicates.add(cb.lessThan(root.get("salePrice"), root.get("basePrice")));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Pageable buildPageable(ProductFilterRequest filter) {
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";
        Sort.Direction direction = "ASC".equalsIgnoreCase(filter.getSortDirection())
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Map frontend sort fields to entity fields
        String sortField = switch (sortBy) {
            case "price" -> "basePrice";
            case "name" -> "name";
            case "newest" -> "createdAt";
            case "popular" -> "viewCount";
            default -> "createdAt";
        };

        return PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, sortField));
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDescription())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .effectivePrice(product.getEffectivePrice())
                .discountPercentage(product.getDiscountPercentage())
                .onSale(product.isOnSale())
                .brand(mapBrandResponse(product.getBrand()))
                .gender(product.getGender())
                .ageMin(product.getAgeMin())
                .ageMax(product.getAgeMax())
                .status(product.getStatus())
                .isFeatured(product.getIsFeatured())
                .primaryImageUrl(product.getPrimaryImageUrl())
                .inStock(variantRepository.hasAvailableStock(product.getId()))
                .createdAt(product.getCreatedAt())
                .build();
    }

    private ProductResponse mapToDetailedProductResponse(Product product) {
        ProductResponse response = mapToProductResponse(product);
        response.setDescription(product.getDescription());
        response.setMaterial(product.getMaterial());
        response.setViewCount(product.getViewCount());
        response.setCategories(product.getCategories().stream()
                .map(this::mapCategoryResponse)
                .collect(Collectors.toSet()));
        response.setImages(product.getImages().stream()
                .map(this::mapImageResponse)
                .collect(Collectors.toList()));
        response.setVariants(product.getVariants().stream()
                .filter(ProductVariant::getIsActive)
                .map(this::mapVariantResponse)
                .collect(Collectors.toList()));
        return response;
    }

    private ProductResponse.BrandResponse mapBrandResponse(Brand brand) {
        return ProductResponse.BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .build();
    }

    private ProductResponse.CategoryResponse mapCategoryResponse(Category category) {
        return ProductResponse.CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }

    private ProductResponse.ProductImageResponse mapImageResponse(ProductImage image) {
        return ProductResponse.ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .sortOrder(image.getSortOrder())
                .isPrimary(image.getIsPrimary())
                .build();
    }

    private ProductResponse.VariantResponse mapVariantResponse(ProductVariant variant) {
        return ProductResponse.VariantResponse.builder()
                .id(variant.getId())
                .skuVariant(variant.getSkuVariant())
                .size(ProductResponse.SizeResponse.builder()
                        .id(variant.getSize().getId())
                        .name(variant.getSize().getName())
                        .build())
                .color(ProductResponse.ColorResponse.builder()
                        .id(variant.getColor().getId())
                        .name(variant.getColor().getName())
                        .hexCode(variant.getColor().getHexCode())
                        .build())
                .priceAdjustment(variant.getPriceAdjustment())
                .finalPrice(variant.getFinalPrice())
                .imageUrl(variant.getImageUrl())
                .isActive(variant.getIsActive())
                .availableQuantity(variant.getAvailableQuantity())
                .inStock(variant.isInStock())
                .build();
    }
}

