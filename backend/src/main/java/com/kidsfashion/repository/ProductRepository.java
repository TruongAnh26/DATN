package com.kidsfashion.repository;

import com.kidsfashion.entity.Product;
import com.kidsfashion.entity.enums.Gender;
import com.kidsfashion.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    // Find active products
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    // Find by brand
    Page<Product> findByBrandIdAndStatus(Integer brandId, ProductStatus status, Pageable pageable);

    // Find by category
    @Query("SELECT p FROM Product p JOIN p.categories c WHERE c.id = :categoryId AND p.status = :status")
    Page<Product> findByCategoryId(@Param("categoryId") Integer categoryId, 
                                    @Param("status") ProductStatus status, 
                                    Pageable pageable);

    // Find by gender
    Page<Product> findByGenderAndStatus(Gender gender, ProductStatus status, Pageable pageable);

    // Find featured products
    Page<Product> findByIsFeaturedTrueAndStatus(ProductStatus status, Pageable pageable);

    // Find products on sale
    @Query("SELECT p FROM Product p WHERE p.salePrice IS NOT NULL AND p.salePrice < p.basePrice AND p.status = :status")
    Page<Product> findOnSaleProducts(@Param("status") ProductStatus status, Pageable pageable);

    // Find by age range
    @Query("SELECT p FROM Product p WHERE " +
            "(p.ageMin IS NULL OR p.ageMin <= :age) AND " +
            "(p.ageMax IS NULL OR p.ageMax >= :age) AND " +
            "p.status = :status")
    Page<Product> findByAgeRange(@Param("age") Integer age, 
                                  @Param("status") ProductStatus status, 
                                  Pageable pageable);

    // Find by price range
    @Query("SELECT p FROM Product p WHERE " +
            "COALESCE(p.salePrice, p.basePrice) BETWEEN :minPrice AND :maxPrice AND " +
            "p.status = :status")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                    @Param("maxPrice") BigDecimal maxPrice,
                                    @Param("status") ProductStatus status, 
                                    Pageable pageable);

    // Search products by name/description
    @Query("SELECT p FROM Product p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "p.status = :status")
    Page<Product> searchProducts(@Param("keyword") String keyword, 
                                  @Param("status") ProductStatus status,
                                  Pageable pageable);

    // Get newest products
    @Query("SELECT p FROM Product p WHERE p.status = :status ORDER BY p.createdAt DESC")
    Page<Product> findNewestProducts(@Param("status") ProductStatus status, Pageable pageable);

    // Get best selling (most ordered) products
    @Query("SELECT p FROM Product p JOIN p.variants v JOIN OrderItem oi ON oi.variant = v " +
            "WHERE p.status = :status " +
            "GROUP BY p ORDER BY SUM(oi.quantity) DESC")
    Page<Product> findBestSellingProducts(@Param("status") ProductStatus status, Pageable pageable);

    // Increment view count
    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :productId")
    void incrementViewCount(@Param("productId") Long productId);

    // Get related products (same category)
    @Query("SELECT DISTINCT p FROM Product p JOIN p.categories c " +
            "WHERE c IN (SELECT c2 FROM Product p2 JOIN p2.categories c2 WHERE p2.id = :productId) " +
            "AND p.id != :productId AND p.status = :status")
    Page<Product> findRelatedProducts(@Param("productId") Long productId, 
                                       @Param("status") ProductStatus status,
                                       Pageable pageable);

    // Count by status
    long countByStatus(ProductStatus status);

    // Get min and max prices
    @Query("SELECT MIN(COALESCE(p.salePrice, p.basePrice)), MAX(COALESCE(p.salePrice, p.basePrice)) " +
            "FROM Product p WHERE p.status = 'ACTIVE'")
    List<Object[]> findPriceRange();
}

