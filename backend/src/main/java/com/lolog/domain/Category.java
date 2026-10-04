package com.lolog.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    @Column(nullable = false)
    private String path;

    @Column(nullable = false)
    private boolean postAllowed;

    private Integer sortOrder;

    public void updatePath(String path) {
        this.path = path;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updatePostAllowed(boolean postAllowed) {
        this.postAllowed = postAllowed;
    }

    public void changeSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
