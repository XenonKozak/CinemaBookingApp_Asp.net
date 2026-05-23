import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user to login', async ({ page }) => {
    // Mockowanie endpointu logowania
    await page.route('**/api/Auth/Login', async route => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const payload = Buffer.from(JSON.stringify({ unique_name: 'test', exp })).toString('base64');
      const fakeJwt = `header.${payload}.signature`;

      await route.fulfill({
        status: 200,
        body: fakeJwt,
        contentType: 'text/plain'
      });
    });

    // Wejście na stronę logowania
    await page.goto('/login');
    
    await expect(page.locator('h2')).toContainText('Zaloguj się');
    
    // Wypełnienie formularza
    await page.fill('#login-username', 'testuser');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    // Kliknięcie logowania
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 5000 });
    await expect(page.locator('text=Wyloguj')).toBeVisible();
  });
});
