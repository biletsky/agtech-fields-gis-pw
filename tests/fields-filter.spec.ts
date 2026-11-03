import { test, expect } from '@playwright/test';
import { MapAppPage } from '@pages/MapAppPage';

test.describe('Fields, filters and search', () => {
  test('selecting a field marks it active', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();

    await app.selectField(/Поле №2 - Соняшник/);
    await expect(app.fieldCard(/Поле №2 - Соняшник/)).toHaveAttribute('aria-pressed', 'true');
    await expect(app.fieldCard(/Поле №1 - Озима пшениця/)).toHaveAttribute('aria-pressed', 'false');
  });

  test('type filter and search narrow the points list', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();

    await app.filterByType('Проба ґрунту');
    await expect(app.pointsHeading).toContainText(/\(\d+\)/);
    await expect(
      page.locator('[aria-labelledby="points-heading"] article').filter({ hasText: 'Шкідники' }),
    ).toHaveCount(0);

    await app.filterByType('Всі');
    await app.search('черепашки');
    await expect(app.pointInList('черепашки')).toBeVisible();
    await expect.poll(async () => app.pointsCountFromHeading()).toBe(1);

    await app.search('неіснуючий-запит-xyz');
    await expect(app.pointsHeading).toContainText('(0)');
  });
});
