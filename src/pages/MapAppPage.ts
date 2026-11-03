import { type Locator, type Page, expect } from '@playwright/test';
import path from 'node:path';

export class MapAppPage {
  readonly page: Page;
  readonly appTitle: Locator;
  readonly fieldsHeading: Locator;
  readonly pointsHeading: Locator;
  readonly searchInput: Locator;
  readonly map: Locator;
  readonly message: Locator;
  readonly addPointDialog: Locator;
  readonly typeSelect: Locator;
  readonly descriptionInput: Locator;
  readonly savePointButton: Locator;
  readonly importExportButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appTitle = page.getByRole('heading', { name: 'AgTech Fields GIS' });
    this.fieldsHeading = page.locator('#fields-heading');
    this.pointsHeading = page.locator('#points-heading');
    this.searchInput = page.locator('#points-search-input');
    this.map = page.locator('.leaflet-container');
    this.message = page.getByRole('status');
    this.addPointDialog = page.getByRole('dialog').filter({
      hasText: 'Додати моніторингову точку',
    });
    this.typeSelect = page.locator('#point-type-select');
    this.descriptionInput = page.getByPlaceholder(
      'Введіть спостереження або деталі заміру...',
    );
    this.savePointButton = page.getByRole('button', { name: 'Зберегти точку' });
    this.importExportButton = page.getByTitle('Експорт та імпорт моніторингових даних');
    this.resetButton = page.getByTitle('Скинути до початкових демо-точок');
  }

  async open(): Promise<void> {
    await this.page.goto('/#/test');
    await expect(this.appTitle).toBeVisible();
    await expect(this.map).toBeVisible();
    await this.page.evaluate(() => localStorage.removeItem('agtech_monitoring_points_v1'));
    await this.page.reload();
    await expect(this.appTitle).toBeVisible();
    await expect(this.map).toBeVisible();
  }

  fieldCard(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name }).first();
  }

  async selectField(name: string | RegExp): Promise<void> {
    const card = this.fieldCard(name);
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
  }

  async filterByType(label: string): Promise<void> {
    await this.page.getByRole('button', { name: label, exact: true }).click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async pointsCountFromHeading(): Promise<number> {
    const text = (await this.pointsHeading.textContent()) ?? '';
    const match = text.match(/\((\d+)\)/);
    return match ? Number(match[1]) : -1;
  }

  async clickMapCenter(): Promise<void> {
    const box = await this.map.boundingBox();
    if (!box) throw new Error('Map bounding box is unavailable');
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  async clickMapCorner(): Promise<void> {
    const box = await this.map.boundingBox();
    if (!box) throw new Error('Map bounding box is unavailable');
    await this.page.mouse.click(box.x + 24, box.y + 24);
  }

  async addPointFromMap(options: {
    type: 'SOIL_SAMPLE' | 'PESTS' | 'PLANT_DISEASE' | 'OTHER';
    description: string;
  }): Promise<void> {
    await this.clickMapCenter();
    await expect(this.addPointDialog).toBeVisible();
    await this.typeSelect.selectOption(options.type);
    await this.descriptionInput.fill(options.description);
    await this.savePointButton.click();
    await expect(this.addPointDialog).toBeHidden();
  }

  async openImportExportMenu(): Promise<void> {
    await this.importExportButton.click();
  }

  async importFile(filePath: string): Promise<void> {
    await this.openImportExportMenu();
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async importDemoSample(): Promise<void> {
    await this.openImportExportMenu();
    await this.page.getByRole('button', { name: 'Завантажити демо-зразок' }).click();
  }

  async exportGeoJson(): Promise<void> {
    await this.openImportExportMenu();
    await this.page.getByRole('button', { name: 'GeoJSON (.geojson)' }).click();
  }

  async resetDemoData(): Promise<void> {
    this.page.once('dialog', async (dialog) => dialog.accept());
    await this.resetButton.click();
  }

  async expectMessage(text: RegExp | string): Promise<void> {
    await expect(this.message.filter({ hasText: text })).toBeVisible();
  }

  pointInList(description: string): Locator {
    return this.page
      .locator('[aria-labelledby="points-heading"] article')
      .filter({ hasText: description });
  }

  fixturePath(fileName: string): string {
    return path.join(__dirname, '..', 'fixtures', fileName);
  }
}
