package vn.backend.backend.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.service.UploadImageService;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UploadImageServiceImpl implements UploadImageService {
    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty() || file.getOriginalFilename() == null) {
            log.warn("File upload trống hoặc không hợp lệ");
            return null;
        }
        String publicValue=generatePublicValue(file.getOriginalFilename());
        String extension=getFileName(file.getOriginalFilename())[1];
        File fileUpload=convert(file);

        cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id",publicValue));
        cleanDisk(fileUpload);

        return cloudinary.url().generate(StringUtils.join(publicValue,".",extension));
    }
    public File convert(MultipartFile file) throws Exception{
        assert file.getOriginalFilename() != null;
        File convFile = new File(generatePublicValue(file.getOriginalFilename()) + "." + getFileName(file.getOriginalFilename())[1]);
        try(InputStream is=file.getInputStream()){
            Files.copy(is,convFile.toPath());
        }
        return convFile;
    }
    public void cleanDisk(File file){
        try{
            Path filePath=file.toPath();
            Files.delete(filePath);
        }catch (Exception e){
            log.error("Error clean disk",e);
        }
    }
    public String generatePublicValue(String originalName){
        String fileName=getFileName(originalName)[0];
        return StringUtils.join(UUID.randomUUID().toString(),"_",fileName);
    }

    public String[] getFileName(String originalName){
        String[] parts = originalName.split("\\.");
        if (parts.length < 2) {
            return new String[]{parts[0], ""}; // không có phần mở rộng
        }
        // nếu tên có nhiều dấu chấm, ví dụ: "my.photo.image.png"
        String extension = parts[parts.length - 1];
        String name = String.join(".", java.util.Arrays.copyOf(parts, parts.length - 1));
        return new String[]{name, extension};
    }
}
