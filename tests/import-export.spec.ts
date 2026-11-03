import { test, expect } from '@playwright/test';
import { MapAppPage } from '@pages/MapAppPage';

test.describe('Import / Export', () => {
  test('imports valid GeoJSON sample', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();
    const before = await app.pointsCountFromHeading();

    await app.importFile(app.fixturePath('monitoring-points-sample.geojson'));
    await app.expectMessage(/Успішно імпортовано/);
    await expect.poll(async () => app.pointsCountFromHeading()).toBeGreaterThan(before);
  });

  test('shows error for invalid CSV without coordinates', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();

    await app.importFile(app.fixturePath('invalid.csv'));
    await app.expectMessage(/широт|координат|не знайдено|CSV/i);
  });

  test('rejects GeoJSON point outside all fields without binding to another field', async ({
    page,
  }) => {
    const app = new MapAppPage(page);
    await app.open();
    const before = await app.pointsCountFromHeading();

    await app.importFile(app.fixturePath('outside-field.geojson'));

    // Expected: import fails or warns — point must not be silently attached to field-1
    await expect(app.message.filter({ hasText: /Успішно імпортовано/ })).toHaveCount(0);
    await app.expectMessage(/помилк|поза|меж|не вдалося|відхил/i);

    const assigned = await page.evaluate(() => {
      const raw = localStorage.getItem('agtech_monitoring_points_v1');
      const points = raw ? JSON.parse(raw) : [];
      return points.find((p: { id: string }) => p.id === 'outside-pt-1');
    });

    expect(assigned, 'out-of-field point must not be stored').toBeFalsy();
    await expect.poll(async () => app.pointsCountFromHeading()).toBe(before);
  });

  test('assigns imported point by geometry when fieldId conflicts with coordinates', async ({
    page,
  }) => {
    const app = new MapAppPage(page);
    await app.open();

    await app.importFile(app.fixturePath('wrong-field-id.geojson'));
    await app.expectMessage(/Успішно імпортовано/);

    const assigned = await page.evaluate(() => {
      const raw = localStorage.getItem('agtech_monitoring_points_v1');
      const points = raw ? JSON.parse(raw) : [];
      return points.find((p: { id: string }) => p.id === 'wrong-field-id-pt');
    });

    // Coordinates [30.495, 50.415] are inside field-1 — fieldId must follow geometry
    expect(assigned).toBeTruthy();
    expect(assigned.fieldId).toBe('field-1');
    expect(assigned.coordinates).toEqual({ lat: 50.415, lng: 30.495 });
  });
});
