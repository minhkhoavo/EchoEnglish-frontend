import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
  });

  // Helper function to wait for toast message
  const waitForToast = async (page: import('@playwright/test').Page) => {
    // Wait for actual toast item to appear (not just container)
    await page.waitForSelector('[data-sonner-toast]', {
      state: 'visible',
      timeout: 10000,
    });
    // Wait a bit for toast animation
    await page.waitForTimeout(500);
  };

  test('LOGIN_01: Empty email should show server error', async ({ page }) => {
    // Nhập email rỗng
    await page.locator('input[name="email"]').fill('');
    await page.locator('input[name="password"]').fill('12345678');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for toast and check error message from server
    await waitForToast(page);

    // Check for toast error message - "Email is invalid" từ server
    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toBeVisible();

    // Should show "Email is invalid" from server
    await expect(toast).toContainText(/email.*invalid/i);
  });

  test('LOGIN_02: Invalid email format should show server error', async ({
    page,
  }) => {
    // Nhập email sai định dạng
    await page.locator('input[name="email"]').fill('vovantri204@');
    await page.locator('input[name="password"]').fill('12345678');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for toast and check error message
    await waitForToast(page);

    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toBeVisible();

    // Should show "Email is invalid" from server
    await expect(toast).toContainText(/email.*invalid/i);
  });

  test('LOGIN_03: Valid email with empty password should show server error', async ({
    page,
  }) => {
    // Email hợp lệ, password rỗng
    await page.locator('input[name="email"]').fill('vovantri204@gmail.com');
    await page.locator('input[name="password"]').fill('');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for toast and check error message
    await waitForToast(page);

    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toBeVisible();

    // Should show "Password must be at least 8 characters" from server
    await expect(toast).toContainText(/password.*8.*characters/i);
  });

  test('LOGIN_04: Valid email with password < 8 characters should show server error', async ({
    page,
  }) => {
    // Password < 8 ký tự
    await page.locator('input[name="email"]').fill('abc@gmail.com');
    await page.locator('input[name="password"]').fill('1234567');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for toast and check error message
    await waitForToast(page);

    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toBeVisible();

    // Should show "Password must be at least 8 characters" from server
    await expect(toast).toContainText(/password.*8.*characters/i);
  });

  test('LOGIN_05: Valid email with 8 character password (wrong password) should show server error', async ({
    page,
  }) => {
    // Password đúng độ dài nhưng sai
    await page.locator('input[name="email"]').fill('vovantri204@gmail.com');
    await page.locator('input[name="password"]').fill('12345678');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for toast and check error message
    await waitForToast(page);

    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toBeVisible();

    // Should show "Password is incorrect" from server
    await expect(toast).toContainText(/password.*incorrect/i);
  });

  test('LOGIN_06: Valid email not existing in system should show server error', async ({
    page,
  }) => {
    // Email không tồn tại
    await page.locator('input[name="email"]').fill('notfound404@gmail.com');
    await page.locator('input[name="password"]').fill('12341234');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for toast and check error message
    await waitForToast(page);

    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toBeVisible();

    // Should show "User not found" from server
    await expect(toast).toContainText(/user.*not.*found/i);
  });

  test('LOGIN_07: Valid credentials should login successfully', async ({
    page,
  }) => {
    // Thông tin đúng - password đúng là 12341234
    await page.locator('input[name="email"]').fill('vovantri204@gmail.com');
    await page.locator('input[name="password"]').fill('12341234');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for success toast
    await waitForToast(page);

    const successToast = page.locator(
      '[data-sonner-toast][data-type="success"]'
    );
    await expect(successToast).toBeVisible();

    // Should show "Login successful!"
    await expect(successToast).toContainText(/login.*successful/i);

    // Should redirect to homepage
    await page.waitForURL('/', { timeout: 15000 });
    expect(page.url()).toContain('/');
  });

  test('LOGIN_08: Wrong password 3 times consecutively should show different warnings', async ({
    page,
  }) => {
    const wrongPassword = 'wrongpass123';

    for (let i = 1; i <= 3; i++) {
      // Fill form
      await page.locator('input[name="email"]').fill('vovantri204@gmail.com');
      await page.locator('input[name="password"]').fill(wrongPassword);

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Wait for error toast
      await waitForToast(page);

      const toast = page.locator('[data-sonner-toast][data-type="error"]');
      await expect(toast).toBeVisible();

      // Different warnings for consecutive wrong password attempts
      if (i < 3) {
        // password incorrect
        await expect(toast).toContainText(/password.*incorrect/i);
      } else {
        // Third attempt: account lockout warning
        // Your account will be locked after 2 more failed attempts
        await expect(toast).toContainText(
          /account.*lock|lock.*account|too.*many.*attempts/i
        );
      }

      // Clear form for next attempt (if not last iteration)
      if (i < 3) {
        await page.locator('input[name="email"]').clear();
        await page.locator('input[name="password"]').clear();
        // Wait for toast to disappear before next attempt
        await page.waitForTimeout(3000);
      }
    }
  });

  test('LOGIN_09: UI Placeholder should display correctly', async ({
    page,
  }) => {
    // Kiểm tra placeholder của email
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute(
      'placeholder',
      'example@gmail.com'
    );

    // Kiểm tra placeholder của password
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
  });

  test('LOGIN_10: UI Show password functionality should work', async ({
    page,
  }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page
      .locator('button[type="button"]')
      .filter({
        has: page.locator('svg'),
      })
      .first();

    // Nhập password để test
    await passwordInput.fill('testpassword');

    // Kiểm tra ban đầu password bị ẩn
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle để hiện password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Kiểm tra password hiển thị
    await expect(passwordInput).toHaveValue('testpassword');

    // Click lại để ẩn password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('LOGIN_11: UI Focus states should work correctly', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    // Test focus trên email input
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Test focus chuyển sang password
    await passwordInput.focus();
    await expect(passwordInput).toBeFocused();

    // Test Tab navigation
    await emailInput.focus();
    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    // Test focus styles (kiểm tra class có focus-related classes)
    await emailInput.focus();
    const emailClass = await emailInput.getAttribute('class');
    expect(emailClass).toContain('focus:border-blue-500');

    await passwordInput.focus();
    const passwordClass = await passwordInput.getAttribute('class');
    expect(passwordClass).toContain('focus:border-blue-500');

    // Test remember me checkbox focus
    const rememberMeCheckbox = page.locator('input[name="rememberMe"]');
    await rememberMeCheckbox.focus();
    await expect(rememberMeCheckbox).toBeFocused();

    // Test submit button focus
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.focus();
    await expect(submitButton).toBeFocused();
  });
});
