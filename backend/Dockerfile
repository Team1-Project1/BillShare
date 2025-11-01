# syntax=docker/dockerfile:1

# Stage 1: Build JAR file
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy toàn bộ source code
COPY . .

# Build file jar (bỏ qua test)
RUN mvn clean package -DskipTests

# Stage 2: Run ứng dụng
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy file jar từ stage build sang
COPY --from=build /app/target/*.jar app.jar

# Mở port 8080
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
