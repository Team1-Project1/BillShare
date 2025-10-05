package vn.backend.backend.service;

import vn.backend.backend.model.CategoryEntity;
import java.util.List;

public interface CategoryService {
    CategoryEntity createCategory(String categoryName, String icon);
    CategoryEntity updateCategory(Long categoryId, String categoryName, String icon);
    void deleteCategory(Long categoryId);
    List<CategoryEntity> getAllCategories();
    CategoryEntity getCategoryById(Long categoryId);
}
