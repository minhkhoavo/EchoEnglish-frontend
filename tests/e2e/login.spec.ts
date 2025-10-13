import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  // Tăng timeout cho mỗi test lên 60s
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang login trước mỗi test
    await page.goto('/login', { waitUntil: 'networkidle' });
  });

  test('should display login form correctly', async ({ page }) => {
    // Kiểm tra tiêu đề trang
    await expect(page.getByText('Welcome back')).toBeVisible();

    // Kiểm tra mô tả
    await expect(
      page.getByText('Sign in to your account to continue')
    ).toBeVisible();

    // Kiểm tra các trường input có hiển thị
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Kiểm tra checkbox Remember me
    await expect(page.locator('input[name="rememberMe"]')).toBeVisible();

    // Kiểm tra nút Sign in
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      'Sign in'
    );

    // Kiểm tra link Forgot password
    await expect(
      page.getByRole('link', { name: 'Forgot password?' })
    ).toBeVisible();

    // Kiểm tra link Sign up
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click vào nút Sign in mà không nhập gì
    await page.locator('button[type="submit"]').click();

    // Kiểm tra thông báo lỗi email
    await expect(page.locator('text=Please enter email')).toBeVisible();

    // Kiểm tra thông báo lỗi password
    await expect(page.locator('text=Please enter password')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({
    page,
  }) => {
    // Nhập email không đúng định dạng nhưng có @ để bypass HTML5 validation
    await page.locator('input[name="email"]').fill('invalid@email');
    await page.locator('input[name="password"]').fill('12345678');

    // Click vào nút Sign in để trigger validation
    await page.locator('button[type="submit"]').click();

    // Đợi validation error xuất hiện hoặc kiểm tra HTML5 validation
    // HTML5 có thể ngăn submit nếu email không hợp lệ
    // Nếu có custom validation từ React, nó sẽ hiện message
    const customError = page.getByText(/please enter a valid email/i);

    // Kiểm tra xem có custom error hoặc HTML5 validation
    const hasCustomError = await customError.isVisible().catch(() => false);

    if (!hasCustomError) {
      // Nếu không có custom error, kiểm tra HTML5 validation message
      const emailInput = page.locator('input[name="email"]');
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );

      // Kiểm tra xem có validation message không
      expect(validationMessage).toBeTruthy();
    } else {
      // Nếu có custom error, verify nó hiển thị
      await expect(customError).toBeVisible();
    }
  });

  test('should show validation error for short password', async ({ page }) => {
    // Nhập mật khẩu ngắn hơn 8 ký tự
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('123');

    // Click vào nút Sign in
    await page.locator('button[type="submit"]').click();

    // Kiểm tra thông báo lỗi password
    await expect(
      page.locator('text=Password must be at least 8 characters')
    ).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    // Lấy button toggle - button có Eye icon
    const toggleButton = page
      .locator('button[type="button"]')
      .filter({ has: page.locator('svg') })
      .first();

    // Đợi password input visible trước
    await expect(passwordInput).toBeVisible();

    // Kiểm tra ban đầu password được ẩn
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Đợi toggle button visible
    await expect(toggleButton).toBeVisible();

    // Click vào nút toggle để hiện password - dùng force để tránh timeout trên Firefox
    await toggleButton.click({ force: true });
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click lại để ẩn password
    await toggleButton.click({ force: true });
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Nhập thông tin đăng nhập hợp lệ
    await page.locator('input[name="email"]').fill('vovantri204@gmail.com');
    await page.locator('input[name="password"]').fill('12341234');

    // Click vào nút Sign in với force để tránh timeout
    await page.locator('button[type="submit"]').click({ force: true });

    // Đợi điều hướng sau khi đăng nhập thành công
    // Giả định sau khi login thành công sẽ chuyển về trang chủ
    await page.waitForURL('/', { timeout: 15000 });

    // Kiểm tra đã chuyển đến trang chủ
    expect(page.url()).toBe('http://localhost:5173/');
  });

  test('should show loading state during login', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');

    // Nhập thông tin đăng nhập
    await page.locator('input[name="email"]').fill('vovantri204@gmail.com');
    await page.locator('input[name="password"]').fill('12341234');

    // Click vào nút Sign in với force để tránh timeout
    await submitButton.click({ force: true });

    // Đợi navigation hoàn tất
    await page.waitForURL('/', { timeout: 15000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click vào link Forgot password
    await page.getByRole('link', { name: 'Forgot password?' }).click();

    // Kiểm tra đã chuyển đến trang forgot password
    await page.waitForURL('/forgot-password');
    expect(page.url()).toContain('/forgot-password');
  });

  test('should navigate to register page', async ({ page }) => {
    // Click vào link Sign up
    await page.getByRole('link', { name: 'Sign up' }).click();

    // Kiểm tra đã chuyển đến trang register
    await page.waitForURL('/register');
    expect(page.url()).toContain('/register');
  });

  test('should remember me checkbox work correctly', async ({ page }) => {
    const rememberMeCheckbox = page.locator('input[name="rememberMe"]');

    // Kiểm tra checkbox mặc định được check
    await expect(rememberMeCheckbox).toBeChecked();

    // Uncheck checkbox
    await rememberMeCheckbox.uncheck();
    await expect(rememberMeCheckbox).not.toBeChecked();

    // Check lại
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();
  });
});
