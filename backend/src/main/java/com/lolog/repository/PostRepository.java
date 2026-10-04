package com.lolog.repository;

import com.lolog.domain.Category;
import com.lolog.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByCategoryInAndIsPublicTrue(List<Category> categories, Pageable pageable);

    Page<Post> findByIsPublicTrue(Pageable pageable);

    Page<Post> findByCategoryIn(List<Category> categories, Pageable pageable);

    long countByCategory(Category category);
}
