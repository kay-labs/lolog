package com.lolog.dto.post;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lolog.domain.Post;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class PostResponse {

    private final Long id;
    private final String title;
    private final String content;
    private final Long categoryId;
    private final String categoryName;
    @JsonProperty("isPublic")
    private final boolean isPublic;
    private final Integer sortOrder;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.categoryId = post.getCategory().getId();
        this.categoryName = post.getCategory().getName();
        this.isPublic = post.isPublic();
        this.sortOrder = post.getSortOrder();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }
}
