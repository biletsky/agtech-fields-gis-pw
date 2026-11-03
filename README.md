# AgTech Fields GIS — Playwright + TypeScript

Тестовий проєкт для веб-застосунку **AgTech Fields GIS**  
https://main.d8gkeeaiko6qy.amplifyapp.com/

## Структура

```
docs/
  CHECKLIST.pdf      # чек-лист мануального прогону
  TEST_CASES.pdf     # позитивні / негативні кейси
  BUG_REPORTS.pdf    # баг-репорти
src/
  pages/             # Page Objects
  fixtures/          # файли для імпорту
tests/               # Playwright specs
playwright.config.ts
```

## Встановлення

```bash
cp .env.example .env   # вказати HTTP_PASS
npm install
npx playwright install chromium
```

## Запуск

```bash
npm test                 # усі тести
npm run test:smoke       # ключовий сценарій (@smoke)
npm run test:headed      # з UI браузера
npm run test:ui          # Playwright UI mode
npm run report           # HTML-звіт
```