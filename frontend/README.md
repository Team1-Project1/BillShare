# Hướng dẫn cài đặt môi trường Node.js

## 1. Tải Node.js về máy
- Truy cập: [https://nodejs.org](https://nodejs.org)
- Chọn phiên bản **LTS (Long Term Support)** để cài đặt.
- Tải về và chạy file cài đặt.
- Sau khi cài đặt, kiểm tra bằng cách mở Terminal (Command Prompt / PowerShell) và gõ:
  ```bash
  node -v
  npm -v

## 2. Cài đặt NPX toàn cục

- Sau khi đã có Node.js và npm, chạy lệnh sau (chỉ cần chạy 1 lần, nếu báo lỗi thì không cần chạy nữa mà làm bước sau vì bạn đã có npx):
  ```bash
  npm install -g npx


- Kiểm tra cài đặt thành công:
  ```bash
  npx -v

## 3. Cài đặt các gói package.json
  ```bash
  npm install --force
  ```

## 4. Chạy chương trình
  ```bash
  npm run dev
