#!/bin/bash
set -e

echo "🚀 Building Spring Boot app..."
./mvnw clean package -DskipTests

echo "✅ Build success. Starting app..."
java -jar target/*.jar
