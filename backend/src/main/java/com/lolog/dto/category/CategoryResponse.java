package com.lolog.dto.category;

import com.lolog.domain.Category;
import lombok.Getter;

import java.util.List;

@Getter
public class CategoryResponse {

    private final Long id;
    private final String name;
    private final boolean postAllowed;
    private final List<CategoryResponse> children;

    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.postAllowed = category.isPostAllowed();
        this.children = category.getChildren().stream()
                .map(CategoryResponse::new)
                .toList();
    }
}
