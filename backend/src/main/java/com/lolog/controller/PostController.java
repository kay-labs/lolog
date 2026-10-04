package com.lolog.controller;

import com.lolog.dto.post.PostRequest;
import com.lolog.dto.post.PostResponse;
import com.lolog.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getPosts(
            @RequestParam(required = false) Long categoryId,
            Authentication authentication,
            @PageableDefault(size = 20, sort = "sortOrder") Pageable pageable) {
        boolean isAdmin = isAdmin(authentication);
        if (categoryId == null) {
            return ResponseEntity.ok(postService.getAllPosts(isAdmin, pageable));
        }
        return ResponseEntity.ok(postService.getPostsByCategory(categoryId, isAdmin, pageable));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedPostIds) {
        postService.reorder(orderedPostIds);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(postService.getPost(id, isAdmin(authentication)));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(@RequestBody PostRequest request, Authentication authentication) {
        return ResponseEntity.ok(postService.create(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(@PathVariable Long id, @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
