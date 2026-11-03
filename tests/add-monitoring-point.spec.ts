import { test, expect } from '@playwright/test';
import { MapAppPage } from '@pages/MapAppPage';

/**
 * Key business scenario:
 * select a field → click inside the polygon → save a monitoring point → see it in the list.
 */
test.describe('Add monitoring point @smoke', () => {
  test('user can add a monitoring point inside the active field', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();

    await app.selectField(/Поле №1 - Озима пшениця/);
    const before = await app.pointsCountFromHeading();

    const description = `PW автотест ${Date.now()}`;
    await app.addPointFromMap({ type: 'PESTS', description });

    await expect(app.pointInList(description)).toBeVisible();
    await expect.poll(async () => app.pointsCountFromHeading()).toBe(before + 1);

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('agtech_monitoring_points_v1');
      return raw ? JSON.parse(raw) : [];
    });
    expect(stored.some((p: { description?: string }) => p.description === description)).toBe(true);
  });
});
