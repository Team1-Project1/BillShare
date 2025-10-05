package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.backend.model.CategoryEntity;
import vn.backend.backend.repository.CategoryRepository;
import vn.backend.backend.service.CategoryService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public CategoryEntity createCategory(String categoryName, String icon) {
        return categoryRepository.save(CategoryEntity.builder()
                .categoryName(categoryName)
                .icon(icon)
                .build());
    }

    @Override
    public CategoryEntity updateCategory(Long categoryId, String categoryName, String icon) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setCategoryName(categoryName);
        category.setIcon(icon);
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    @Override
    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public CategoryEntity getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
}
