# ----- Giai đoạn 1: Build ứng dụng -----
# Sử dụng image Maven với Java 17
FROM maven:3.9-eclipse-temurin-17 AS build

# Đặt thư mục làm việc
WORKDIR /build

# Copy chỉ các file cần thiết cho việc build của Maven từ thư mục 'backend'
# Điều này giúp tận dụng cache của Docker
COPY backend/mvnw .
COPY backend/mvnw.cmd .
COPY backend/.mvn ./.mvn
COPY backend/pom.xml .

# Tải dependencies về trước
RUN ./mvnw dependency:go-offline

# Copy toàn bộ source code của backend
COPY backend/src ./src

# Build ứng dụng, kích hoạt profile 'prod' và bỏ qua test
RUN ./mvnw clean package -DskipTests -Pprod

# ----- Giai đoạn 2: Chạy ứng dụng -----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy file .jar đã build từ giai đoạn 1
COPY --from=build /build/target/backend.jar app.jar

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]