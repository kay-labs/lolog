package com.lolog.service;

import com.lolog.domain.Category;
import com.lolog.domain.Post;
import com.lolog.domain.User;
import com.lolog.dto.post.PostRequest;
import com.lolog.dto.post.PostResponse;
import com.lolog.repository.CategoryRepository;
import com.lolog.repository.PostRepository;
import com.lolog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<PostResponse> getAllPosts(boolean isAdmin, Pageable pageable) {
        if (isAdmin) {
            return postRepository.findAll(pageable).map(PostResponse::new);
        }
        return postRepository.findByIsPublicTrue(pageable).map(PostResponse::new);
    }

    public Page<PostResponse> getPostsByCategory(Long categoryId, boolean isAdmin, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        List<Category> targetCategories = categoryRepository.findPostAllowedDescendants(category.getPath());

        if (category.isPostAllowed()) {
            targetCategories.add(category);
        }

        if (isAdmin) {
            return postRepository.findByCategoryIn(targetCategories, pageable).map(PostResponse::new);
        }
        return postRepository.findByCategoryInAndIsPublicTrue(targetCategories, pageable).map(PostResponse::new);
    }

    public PostResponse getPost(Long id, boolean isAdmin) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (!isAdmin && !post.isPublic()) {
            throw new IllegalArgumentException("Post not found");
        }

        return new PostResponse(post);
    }

    @Transactional
    public PostResponse create(PostRequest request, String username) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (!category.isPostAllowed()) {
            throw new IllegalArgumentException("This category does not allow posts");
        }

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .isPublic(request.isPublic())
                .sortOrder((int) postRepository.countByCategory(category))
                .build();

        return new PostResponse(postRepository.save(post));
    }

    @Transactional
    public void reorder(List<Long> orderedPostIds) {
        List<Post> posts = postRepository.findAllById(orderedPostIds);
        for (Post post : posts) {
            post.changeSortOrder(orderedPostIds.indexOf(post.getId()));
        }
    }

    @Transactional
    public PostResponse update(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        post.update(request.getTitle(), request.getContent(), request.isPublic());
        return new PostResponse(post);
    }

    @Transactional
    public void delete(Long id) {
        postRepository.deleteById(id);
    }
}
