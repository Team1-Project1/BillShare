 ____             _                  _   ____                  _
| __ )  __ _  ___| | _____ _ __   __| | / ___|  ___ _ ____   _(_) ___ ___
|  _ \ / _` |/ __| |/ / _ \ '_ \ / _` | \___ \ / _ \ '__\ \ / / |/ __/ _ \
| |_) | (_| | (__|   <  __/ | | | (_| |  ___) |  __/ |   \ V /| | (_|  __/
|____/ \__,_|\___|_|\_\___|_| |_|\__,_| |____/ \___|_|    \_/ |_|\___\___|

## 1. Prerequisite
- Cài đặt JDK 17+ nếu chưa thì cài đặt JDK
- Install Maven 3.5+ nếu chưa thì cài đặt Maven
- Install IntelliJ nếu chưa thì cài đặt IntelliJ
- Install Docker nếu chưa thì cài đặt Docker

## 2. Technical Stacks
- Java 17
- Maven 3.9.11
- Spring Boot 3.5.5
- Spring Data Validation
- Spring Data JPA
- Postgres
- Lombok
- DevTools



## 3. Build & Run Application
– Run application bởi mvnw tại folder backend
```
 ./mvnw spring-boot:run
```
## 4.swagger
-http://localhost:8080/swagger-ui/index.html#

## 5.test
-Run test bởi mvnw tại folder backend
```
 mvn test   
 ./mvnw test


```
-mở web hiển thị độ bao phủ
```
   start target\site\jacoco\index.html
```