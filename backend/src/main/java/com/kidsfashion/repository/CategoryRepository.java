package com.kidsfashion.repository;

import com.kidsfashion.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // Find root categories (no parent)
    List<Category> findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();

    // Find root categories (no parent) including inactive
    List<Category> findByParentIsNullOrderBySortOrderAsc();

    // Find children of a category
    List<Category> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(Integer parentId);

    // Find all active categories
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();

    // Search categories
    @Query("SELECT c FROM Category c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Category> searchCategories(@Param("keyword") String keyword, Pageable pageable);

    // Get category tree (root with children loaded)
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent IS NULL AND c.isActive = true ORDER BY c.sortOrder")
    List<Category> findCategoryTree();

    // Count products in category
    @Query("SELECT COUNT(p) FROM Product p JOIN p.categories c WHERE c.id = :categoryId")
    long countProductsInCategory(@Param("categoryId") Integer categoryId);
}

