import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const CREDS = { email: 'external@test.com', password: 'ExtPass123' };

test.describe('UI/UX Audit — All Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`);
    await page.getByRole('textbox', { name: 'ایمیل' }).fill(CREDS.email);
    await page.getByRole('textbox', { name: 'رمز عبور' }).fill(CREDS.password);
    await page.getByRole('button', { name: 'ورود', exact: true }).click();
    await page.waitForURL(`${BASE}/`);
  });

  test('01 — Login page', async ({ page }) => {
    // Logout first to see login page
    await page.goto(`${BASE}/login`);
    await page.screenshot({ path: 'audit-screenshots/01-login.png', fullPage: true });
  });

  test('02 — Dashboard', async ({ page }) => {
    await page.screenshot({ path: 'audit-screenshots/02-dashboard.png', fullPage: true });
  });

  test('03 — Customers (empty)', async ({ page }) => {
    await page.goto(`${BASE}/customers`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/03-customers.png', fullPage: true });
  });

  test('04 — Customer New Form', async ({ page }) => {
    await page.goto(`${BASE}/customers/new`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/04-customer-new.png', fullPage: true });
  });

  test('05 — Invoices (empty)', async ({ page }) => {
    await page.goto(`${BASE}/invoices`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/05-invoices.png', fullPage: true });
  });

  test('06 — Invoice New Form', async ({ page }) => {
    await page.goto(`${BASE}/invoices/new`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/06-invoice-new.png', fullPage: true });
  });

  test('07 — Vendors (empty)', async ({ page }) => {
    await page.goto(`${BASE}/vendors`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/07-vendors.png', fullPage: true });
  });

  test('08 — Vendor New Form', async ({ page }) => {
    await page.goto(`${BASE}/vendors/new`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/08-vendor-new.png', fullPage: true });
  });

  test('09 — Journal Entries (empty)', async ({ page }) => {
    await page.goto(`${BASE}/journal-entries`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/09-journal-entries.png', fullPage: true });
  });

  test('10 — Journal Entry New Form', async ({ page }) => {
    await page.goto(`${BASE}/journal-entries/new`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/10-journal-entry-new.png', fullPage: true });
  });

  test('11 — Accounting (Chart of Accounts)', async ({ page }) => {
    await page.goto(`${BASE}/accounting`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/11-accounting.png', fullPage: true });
  });

  test('12 — Reports', async ({ page }) => {
    await page.goto(`${BASE}/reports`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/12-reports.png', fullPage: true });
  });

  test('13 — Settings', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/13-settings.png', fullPage: true });
  });

  test('14 — Login dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${BASE}/login`);
    await page.screenshot({ path: 'audit-screenshots/14-login-dark.png', fullPage: true });
  });

  test('15 — Dashboard dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'audit-screenshots/15-dashboard-dark.png', fullPage: true });
  });

  test('16 — Mobile viewport login', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/login`);
    await page.screenshot({ path: 'audit-screenshots/16-login-mobile.png', fullPage: true });
  });

  test('17 — Mobile viewport dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'audit-screenshots/17-dashboard-mobile.png', fullPage: true });
  });
});
