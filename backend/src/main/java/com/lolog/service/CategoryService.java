package com.lolog.service;

import com.lolog.domain.Category;
import com.lolog.dto.category.CategoryRequest;
import com.lolog.dto.category.CategoryResponse;
import com.lolog.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getTree() {
        return categoryRepository.findByParentIsNullOrderBySortOrderAsc().stream()
                .map(CategoryResponse::new)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category parent = null;
        String parentPath = "/";
        long siblingCount;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found"));
            parentPath = parent.getPath();
            siblingCount = categoryRepository.countByParent(parent);
        } else {
            siblingCount = categoryRepository.countByParentIsNull();
        }

        Category category = Category.builder()
                .name(request.getName())
                .parent(parent)
                .path("/")
                .postAllowed(request.isPostAllowed())
                .sortOrder((int) siblingCount)
                .build();

        Category saved = categoryRepository.save(category);
        saved.updatePath(parentPath + saved.getId() + "/");
        return new CategoryResponse(saved);
    }

    @Transactional
    public void reorder(List<Long> orderedCategoryIds) {
        List<Category> categories = categoryRepository.findAllById(orderedCategoryIds);
        for (Category category : categories) {
            category.changeSortOrder(orderedCategoryIds.indexOf(category.getId()));
        }
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.updateName(request.getName());
        category.updatePostAllowed(request.isPostAllowed());
        return new CategoryResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        categoryRepository.delete(category);
    }
}
