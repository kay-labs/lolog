package com.lolog.dto.category;

import lombok.Getter;

@Getter
public class CategoryRequest {
    private String name;
    private Long parentId;
    private boolean postAllowed;
}
