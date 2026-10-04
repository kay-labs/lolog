package com.lolog.config;

import com.lolog.domain.Category;
import com.lolog.domain.Post;
import com.lolog.domain.Role;
import com.lolog.domain.User;
import com.lolog.repository.CategoryRepository;
import com.lolog.repository.PostRepository;
import com.lolog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.initial-password}")
    private String adminInitialPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode(adminInitialPassword))
                    .role(Role.ADMIN)
                    .build());
            log.info("Admin user created");
        }

        backfillPostSortOrder();
        backfillCategorySortOrder();
    }

    private void backfillCategorySortOrder() {
        List<Category> unordered = categoryRepository.findAll().stream()
                .filter(category -> category.getSortOrder() == null)
                .collect(Collectors.toList());

        if (unordered.isEmpty()) return;

        var byParent = unordered.stream()
                .collect(Collectors.groupingBy(category -> category.getParent() == null ? -1L : category.getParent().getId()));

        byParent.values().forEach(categories -> {
            categories.sort(Comparator.comparing(Category::getId));
            for (int i = 0; i < categories.size(); i++) {
                categories.get(i).changeSortOrder(i);
            }
        });

        categoryRepository.saveAll(unordered);
        log.info("Backfilled sortOrder for {} categories", unordered.size());
    }

    private void backfillPostSortOrder() {
        List<Post> unordered = postRepository.findAll().stream()
                .filter(post -> post.getSortOrder() == null)
                .collect(Collectors.toList());

        if (unordered.isEmpty()) return;

        var byCategory = unordered.stream()
                .collect(Collectors.groupingBy(post -> post.getCategory().getId()));

        byCategory.values().forEach(posts -> {
            posts.sort(Comparator.comparing(Post::getCreatedAt));
            for (int i = 0; i < posts.size(); i++) {
                posts.get(i).changeSortOrder(i);
            }
        });

        postRepository.saveAll(unordered);
        log.info("Backfilled sortOrder for {} posts", unordered.size());
    }
}
