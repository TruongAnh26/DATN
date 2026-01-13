package com.kidsfashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTreeResponse {

    private Integer id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer sortOrder;
    private Integer parentId;
    private Boolean active;
    private long productCount;
    private List<CategoryTreeResponse> children;
}

