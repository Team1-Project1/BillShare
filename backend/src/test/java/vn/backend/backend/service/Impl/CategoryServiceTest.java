package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.backend.backend.model.CategoryEntity;
import vn.backend.backend.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // BẮT BUỘC
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private CategoryEntity category;
    private final Long categoryId = 1L;
    private final String categoryName = "Electronics";
    private final String icon = "electronics.png";

    @BeforeEach
    void setUp() {
        category = CategoryEntity.builder()
                .categoryId(categoryId)
                .categoryName(categoryName)
                .icon(icon)
                .build();
    }

    @Test
    @DisplayName("createCategory - Tạo danh mục thành công")
    void createCategory_success() {
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> {
            CategoryEntity saved = invocation.getArgument(0);
            saved.setCategoryId(categoryId);
            return saved;
        });

        CategoryEntity result = categoryService.createCategory(categoryName, icon);

        assertThat(result.getCategoryId()).isEqualTo(categoryId);
        assertThat(result.getCategoryName()).isEqualTo(categoryName);
        assertThat(result.getIcon()).isEqualTo(icon);

        verify(categoryRepository).save(argThat(c ->
                c.getCategoryName().equals(categoryName) && c.getIcon().equals(icon)
        ));
    }

    @Test
    @DisplayName("updateCategory - Cập nhật danh mục thành công")
    void updateCategory_success() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any())).thenReturn(category);

        String newName = "Phones";
        String newIcon = "phone.png";

        CategoryEntity updated = categoryService.updateCategory(categoryId, newName, newIcon);

        assertThat(updated.getCategoryName()).isEqualTo(newName);
        assertThat(updated.getIcon()).isEqualTo(newIcon);
    }

    @Test
    @DisplayName("updateCategory - Danh mục không tồn tại")
    void updateCategory_notFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.updateCategory(99L, "a", "b"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Category not found");

        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteCategory - Xóa danh mục thành công")
    void deleteCategory_success() {
        // Không cần doNothing() cho deleteById
        categoryService.deleteCategory(categoryId);

        verify(categoryRepository).deleteById(categoryId);
    }

    @Test
    @DisplayName("getAllCategories - Lấy danh sách tất cả danh mục")
    void getAllCategories_returnsList() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryEntity> result = categoryService.getAllCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategoryName()).isEqualTo(categoryName);
    }

    @Test
    @DisplayName("getCategoryById - Lấy danh mục theo ID thành công")
    void getCategoryById_success() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        CategoryEntity found = categoryService.getCategoryById(categoryId);

        assertThat(found).isEqualTo(category);
    }

    @Test
    @DisplayName("getCategoryById - Danh mục không tồn tại")
    void getCategoryById_notFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getCategoryById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Category not found");
    }
}