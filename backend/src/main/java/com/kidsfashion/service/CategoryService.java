package com.kidsfashion.service;

import com.kidsfashion.dto.response.CategoryTreeResponse;
import com.kidsfashion.entity.Category;
import com.kidsfashion.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getCategoryTree() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        return rootCategories.stream()
                .map(category -> mapToCategoryTree(category, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getCategoryTreeForAdmin() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullOrderBySortOrderAsc();
        return rootCategories.stream()
                .map(category -> mapToCategoryTree(category, true))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryTreeResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + slug));
        return mapToCategoryTree(category, false);
    }

    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getChildCategories(String parentSlug) {
        Category parent = categoryRepository.findBySlug(parentSlug)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + parentSlug));

        List<Category> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(parent.getId());
        return children.stream()
                .map(category -> mapToCategoryTree(category, false))
                .collect(Collectors.toList());
    }

    private CategoryTreeResponse mapToCategoryTree(Category category, boolean includeInactive) {
        List<CategoryTreeResponse> children = category.getChildren().stream()
                .filter(child -> includeInactive || Boolean.TRUE.equals(child.getIsActive()))
                .map(child -> mapToCategoryTree(child, includeInactive))
                .collect(Collectors.toList());

        return CategoryTreeResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .sortOrder(category.getSortOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .active(category.getIsActive())
                .productCount(categoryRepository.countProductsInCategory(category.getId()))
                .children(children)
                .build();
    }
}

