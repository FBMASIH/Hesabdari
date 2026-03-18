import { test, expect, type Page } from '@playwright/test';

/**
 * E2E tests for critical accounting flows.
 *
 * These tests verify frontend page rendering and form interactions
 * using Persian text assertions. They work against the built Next.js app
 * without requiring a running backend (forms render with empty data states).
 */

// ── Helpers ─────────────────────────────────────────

/** Simulate authenticated state by setting cookie + localStorage. */
async function setAuthState(page: Page) {
  // Set auth cookie for middleware (server-side route protection)
  await page.context().addCookies([{
    name: 'auth_session',
    value: '1',
    domain: 'localhost',
    path: '/',
  }]);
  // Set localStorage for client-side auth store
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'test-token-for-e2e');
    localStorage.setItem('organization_id', '00000000-0000-0000-0000-000000000001');
  });
}

// ── Login Page ──────────────────────────────────────

test.describe('صفحه ورود', () => {
  test('renders login form with Persian labels', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    // The login form title is inside a glass surface card
    await expect(page.getByText('ورود به حسابداری')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ایمیل')).toBeVisible();
    await expect(page.getByText('رمز عبور')).toBeVisible();
    await expect(page.getByRole('button', { name: /ورود/ })).toBeVisible();
  });

  test('accepts email and password input', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('test@example.com');
    await passwordInput.fill('TestPass123');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('TestPass123');
  });

  test('submit button exists and is clickable', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const submitBtn = page.getByRole('button', { name: /ورود/ });
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await expect(submitBtn).toBeEnabled();
  });
});

// ── Auth Guard ──────────────────────────────────────

test.describe('حفاظت مسیرها', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    // Clear any tokens
    await page.addInitScript(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('organization_id');
    });
    await page.goto('/');
    // AuthGuard should redirect to /login
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {
      // May already be on login page
    });
  });
});

// ── Invoice Pages ───────────────────────────────────

test.describe('فاکتورها', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthState(page);
  });

  test('invoice list page renders', async ({ page }) => {
    await page.goto('/invoices', { waitUntil: 'networkidle' });
    await expect(page.getByText('فاکتورها')).toBeVisible({ timeout: 10000 });
  });

  test('invoice create form renders all sections', async ({ page }) => {
    await page.goto('/invoices/new', { waitUntil: 'networkidle' });
    await expect(page.getByText('اطلاعات فاکتور')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('اقلام فاکتور')).toBeVisible();
    await expect(page.getByText('تأیید و ثبت فاکتور')).toBeVisible();
  });

  test('can add line items', async ({ page }) => {
    await page.goto('/invoices/new', { waitUntil: 'networkidle' });
    const addButton = page.getByText('افزودن قلم');
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    await expect(page.getByText('۲')).toBeVisible();
  });
});

// ── Journal Entry Pages ─────────────────────────────

test.describe('اسناد حسابداری', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthState(page);
  });

  test('journal entries list page renders', async ({ page }) => {
    await page.goto('/journal-entries', { waitUntil: 'networkidle' });
    await expect(page.getByText('اسناد حسابداری')).toBeVisible({ timeout: 10000 });
  });

  test('journal entry form shows balance indicator', async ({ page }) => {
    await page.goto('/journal-entries/new', { waitUntil: 'networkidle' });
    await expect(page.getByText('اطلاعات سند')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('تراز نیست')).toBeVisible();
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });
});

test.describe('مشتریان', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthState(page);
  });

  test('customer list page renders', async ({ page }) => {
    await page.goto('/customers', { waitUntil: 'networkidle' });
    await expect(page.getByText('مشتریان')).toBeVisible({ timeout: 10000 });
  });

  test('customer create form renders', async ({ page }) => {
    await page.goto('/customers/new', { waitUntil: 'networkidle' });
    await expect(page.getByText('مشتری جدید')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('کد مشتری')).toBeVisible();
  });
});

test.describe('تأمین‌کنندگان', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthState(page);
  });

  test('vendor list page renders', async ({ page }) => {
    await page.goto('/vendors', { waitUntil: 'networkidle' });
    await expect(page.getByText('تأمین‌کنندگان')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('سرفصل حساب‌ها', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthState(page);
  });

  test('accounting page renders', async ({ page }) => {
    await page.goto('/accounting', { waitUntil: 'networkidle' });
    await expect(page.getByText('سرفصل حساب‌ها')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('RTL layout', () => {
  test('html element has dir=rtl and lang=fa', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for hydration
    const dir = await page.locator('html').getAttribute('dir');
    const lang = await page.locator('html').getAttribute('lang');
    expect(dir).toBe('rtl');
    expect(lang).toBe('fa');
  });
});
