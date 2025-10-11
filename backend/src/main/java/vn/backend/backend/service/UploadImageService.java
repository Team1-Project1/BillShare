package vn.backend.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface UploadImageService {
    String uploadImage (MultipartFile file) throws Exception;

}
