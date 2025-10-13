# E2E Testing với Playwright

## Giới thiệu

Project này sử dụng Playwright để thực hiện end-to-end testing cho giao diện người dùng.

## Cài đặt

Các dependencies đã được cài đặt. Nếu cần cài đặt lại:

```bash
pnpm add -D @playwright/test (hoặc pnpm install)
pnpm playwright install
```

## Chạy Tests

### Chạy tất cả tests (headless mode)

```bash
pnpm run test:e2e
```

### Chạy tests với UI mode (xem test chạy trực tiếp)

```bash
pnpm run test:e2e:ui
```

### Chạy tests với headed mode (mở browser để xem)

```bash
pnpm run test:e2e:headed
```

### Xem báo cáo test

```bash
pnpm run test:e2e:report
```

### Chạy một test file cụ thể

```bash
pnpm exec playwright test tests/e2e/login.spec.ts
```

### Chạy một test cụ thể

```bash
pnpm exec playwright test -g "should successfully login"
```

### Chạy tests trên một browser cụ thể

```bash
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit
```

## Debug Tests

### Debug mode với Playwright Inspector

```bash
pnpm exec playwright test --debug
```

### Debug một test cụ thể

```bash
pnpm exec playwright test tests/e2e/login.spec.ts --debug
```

## Cấu trúc Tests

```
tests/
  └── e2e/
      └── login.spec.ts   # Tests cho trang login
```

## Test Cases cho Login Page

File `tests/e2e/login.spec.ts` bao gồm các test cases sau:

1. **Display Test** - Kiểm tra giao diện hiển thị đúng
2. **Validation Tests** - Kiểm tra các validation:
   - Empty fields
   - Invalid email format
   - Short password
3. **UI Interaction Tests**:
   - Toggle password visibility
   - Remember me checkbox
4. **Navigation Tests**:
   - Navigate to forgot password page
   - Navigate to register page
5. **Login Test** - Test đăng nhập với credentials:
   - Email: vovantri204@gmail.com
   - Password: 12341234

## Lưu ý

- Tests sẽ tự động khởi động dev server trước khi chạy (port 5173)
- Đảm bảo backend API đang chạy nếu test cần tương tác với API
- Screenshots sẽ được tự động chụp khi test fail
- Traces sẽ được thu thập khi test retry

## Tài liệu tham khảo

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
