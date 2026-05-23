import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display movies', async ({ page }) => {
    // Mockowanie API
    await page.route('**/api/Movie*', async route => {
      const json = [{ id: 1, title: 'Incepcja Testowa', duration: 140, imageUrl: '' }];
      await route.fulfill({ json });
    });
    
    await page.route('**/api/Screening*', async route => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const json = [{ id: 101, movieId: 1, date: futureDate.toISOString() }];
      await route.fulfill({ json });
    });

    // Wejście na stronę główną
    await page.goto('/');

    // Weryfikacja
    await expect(page.locator('h1')).toContainText('Odkryj najlepsze');
    await expect(page.locator('.grid-repertoire')).toBeVisible();
    await expect(page.locator('text=Incepcja Testowa')).toBeVisible();
  });
});
