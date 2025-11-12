package vn.backend.backend.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UploadImageServiceImplTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private UploadImageServiceImpl uploadImageService;

    @TempDir
    Path tempDir;               // để test việc xóa file tạm

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void uploadImage_success() throws Exception {
        // GIVEN
        MultipartFile file = new MockMultipartFile(
                "file", "my-photo.jpg", "image/jpeg", "fake image content".getBytes());

        // mock upload trả về map chứa url
        when(uploader.upload(any(File.class), any(Map.class)))
                .thenReturn(Map.of("secure_url", "https://res.cloudinary.com/demo/image/upload/v1/my-photo.jpg"));

        // mock generate url
        when(cloudinary.url()).thenReturn(mock(com.cloudinary.Url.class));
        when(cloudinary.url().generate(anyString()))
                .thenAnswer(invocation -> "https://res.cloudinary.com/demo/image/upload/v1/" + invocation.getArgument(0));

        // WHEN
        String result = uploadImageService.uploadImage(file);

        // THEN
        assertNotNull(result);
        assertTrue(result.contains("my-photo.jpg"));

        // verify public_id được truyền đúng dạng UUID_my-photo
        ArgumentCaptor<Map> mapCaptor = ArgumentCaptor.forClass(Map.class);
        verify(uploader).upload(any(File.class), mapCaptor.capture());
        Map<String, Object> uploadedOptions = mapCaptor.getValue();
        String publicId = (String) uploadedOptions.get("public_id");
        assertTrue(publicId.matches("[0-9a-f\\-]{36}_my-photo"));

        // verify file tạm đã bị xóa
        verify(uploader).upload(any(File.class), any(Map.class));
    }

    @Test
    void uploadImage_fileNull_returnNull() throws Exception {
        String result = uploadImageService.uploadImage(null);
        assertNull(result);
    }

    @Test
    void uploadImage_fileEmpty_returnNull() throws Exception {
        MultipartFile emptyFile = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);
        String result = uploadImageService.uploadImage(emptyFile);
        assertNull(result);
    }

    @Test
    void uploadImage_noExtension_success() throws Exception {
        MultipartFile file = new MockMultipartFile(
                "file", "noextension", "image/jpeg", "fake image content".getBytes());

        when(uploader.upload(any(File.class), any(Map.class)))
                .thenReturn(Map.of());

        when(cloudinary.url()).thenReturn(mock(com.cloudinary.Url.class));
        when(cloudinary.url().generate(anyString()))
                .thenAnswer(i -> "https://res.cloudinary.com/demo/image/upload/v1/" + i.getArgument(0));

        String result = uploadImageService.uploadImage(file);

        assertNotNull(result);
        assertTrue(result.endsWith("/" + result.substring(result.lastIndexOf("/") + 1)));
    }

    @Test
    void uploadImage_multipleDotsInName_success() throws Exception {
        MultipartFile file = new MockMultipartFile(
                "file", "my.photo.version.2.final.png", "image/png", "fake".getBytes());

        when(uploader.upload(any(File.class), any(Map.class)))
                .thenReturn(Map.of());

        when(cloudinary.url()).thenReturn(mock(com.cloudinary.Url.class));
        when(cloudinary.url().generate(anyString()))
                .thenAnswer(i -> "https://res.cloudinary.com/demo/image/upload/v1/" + i.getArgument(0));

        String result = uploadImageService.uploadImage(file);

        assertNotNull(result);
        assertTrue(result.contains("my.photo.version.2.final.png"));
    }

    @Test
    void uploadImage_uploadThrowsException_propagateException() throws Exception {
        MultipartFile file = new MockMultipartFile(
                "file", "error.jpg", "image/jpeg", "fake".getBytes());

        when(uploader.upload(any(File.class), any(Map.class)))
                .thenThrow(new RuntimeException("Cloudinary error"));

        assertThrows(Exception.class, () -> uploadImageService.uploadImage(file));
    }

    @Test
    void generatePublicValue_containsUUIDAndOriginalName() {
        String originalName = "test.jpg";
        String publicValue = uploadImageService.generatePublicValue(originalName);

        assertTrue(publicValue.matches("[0-9a-f\\-]{36}_test"));
    }

    @Test
    void getFileName_noExtension_returnsEmptyExtension() {
        String[] parts = uploadImageService.getFileName("justname");
        assertEquals("justname", parts[0]);
        assertEquals("", parts[1]);
    }

    @Test
    void getFileName_multipleDots_correctNameAndExtension() {
        String[] parts = uploadImageService.getFileName("my.file.name.jpg");
        assertEquals("my.file.name", parts[0]);
        assertEquals("jpg", parts[1]);
    }

    @Test
    void convert_createsTempFile() throws Exception {
        MultipartFile file = new MockMultipartFile(
                "file", "temp.jpg", "image/jpeg", "content".getBytes());

        File converted = uploadImageService.convert(file);

        assertTrue(converted.exists());
        assertTrue(converted.length() > 0);
        assertTrue(converted.getName().matches("[0-9a-f\\-]{36}_temp\\.jpg"));

        // cleanup
        converted.delete();
    }

    @Test
    void cleanDisk_deletesFile() throws Exception {
        File tempFile = File.createTempFile("test", ".tmp");
        uploadImageService.cleanDisk(tempFile);
        assertFalse(tempFile.exists());
    }
}