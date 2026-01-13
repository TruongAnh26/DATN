package com.kidsfashion.repository;

import com.kidsfashion.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    List<Brand> findByIsActiveTrueOrderByNameAsc();

    Page<Brand> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT b FROM Brand b WHERE " +
            "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Brand> searchBrands(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT b FROM Brand b LEFT JOIN b.products p " +
            "WHERE b.isActive = true GROUP BY b ORDER BY COUNT(p) DESC")
    List<Brand> findPopularBrands(Pageable pageable);
}

