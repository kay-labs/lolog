package com.lolog.dto.post;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class PostRequest {
    private String title;
    private String content;
    private Long categoryId;
    @JsonProperty("isPublic")
    private boolean isPublic;
}
