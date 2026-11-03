import { test, expect } from '@playwright/test';
import { MapAppPage } from '@pages/MapAppPage';

test.describe('Negative map interactions', () => {
  test('click outside active field shows validation message', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();
    await app.selectField(/Поле №1 - Озима пшениця/);

    await app.clickMapCorner();
    await app.expectMessage(/в межах обраного поля/i);
    await expect(app.addPointDialog).toHaveCount(0);
  });

  test('description longer than 250 chars is rejected', async ({ page }) => {
    const app = new MapAppPage(page);
    await app.open();
    await app.selectField(/Поле №1 - Озима пшениця/);
    await app.clickMapCenter();
    await expect(app.addPointDialog).toBeVisible();

    await app.descriptionInput.fill('x'.repeat(251));
    await app.savePointButton.click();
    await expect(page.getByRole('alert')).toContainText('Опис не повинен перевищувати 250 символів');
    await expect(app.addPointDialog).toBeVisible();
  });
});
