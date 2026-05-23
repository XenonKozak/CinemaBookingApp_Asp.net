import { test, expect } from '@playwright/test';

test.describe('Reservation Flow', () => {
  test('should allow user to book a seat', async ({ page }) => {
    // 1. Zmockowanie autoryzacji (ustawienie tokena w localStorage)
    await page.addInitScript(() => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const payload = btoa(JSON.stringify({ unique_name: 'test', exp }));
      localStorage.setItem('token', `header.${payload}.signature`);
    });

    // 2. Zmockowanie szczegółów seansu
    await page.route('**/api/Screening/101/Details', async route => {
      await route.fulfill({
        json: {
          id: 101,
          movieTitle: 'Testowy Hit Kina',
          duration: 120,
          reservations: [] // sala jest pusta
        }
      });
    });

    // 3. Zmockowanie wysłania rezerwacji POST
    await page.route('**/api/Reservation', async route => {
      await route.fulfill({ status: 201 });
    });

    // Wejście na stronę wyboru miejsc
    await page.goto('/screening/101');

    // Weryfikacja czy załadowały się fotele (klasa .seat)
    const firstAvailableSeat = page.locator('.seat-available').first();
    await expect(firstAvailableSeat).toBeVisible();

    // Wybranie pierwszego wolnego miejsca
    await firstAvailableSeat.click();

    // Potwierdzenie rezerwacji (przycisk w stopce)
    await page.click('text=Potwierdź rezerwację');

    // Sprawdzenie czy przeniosło na ekran sukcesu
    await page.waitForURL('**/success*');
    await expect(page.locator('h1')).toContainText('Rezerwacja potwierdzona');
    await expect(page.locator('text=Testowy Hit Kina')).toBeVisible();
  });
});
