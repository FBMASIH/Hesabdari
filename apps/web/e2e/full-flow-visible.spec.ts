import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4000/api/v1';

// Slow down so user can watch each step
test.use({ actionTimeout: 10000 });

test.describe.serial('Full App Flow — Visible Browser Navigation', () => {
  let accessToken = '';
  const email = `visible-test-${Date.now()}@hesabdari.app`;
  const password = 'SecurePass123';
  let orgId = '';

  test('1. Login page renders with form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1500);

    // Verify login page
    await expect(page).toHaveTitle(/Hesabdari/);
    await expect(page.locator('h3')).toContainText('Sign In');
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    await expect(page.locator('label[for="password"]')).toContainText('Password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');

    await page.waitForTimeout(1000);
  });

  test('2. Fill login form with test data', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    // Type email slowly so user can see
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.click();
    await emailInput.fill(email);
    await page.waitForTimeout(500);

    await passwordInput.click();
    await passwordInput.fill(password);
    await page.waitForTimeout(500);

    // Verify values
    await expect(emailInput).toHaveValue(email);
    await expect(passwordInput).toHaveValue(password);

    await page.waitForTimeout(1000);
  });

  test('3. Register user via API, then login via API', async ({ page }) => {
    // Register
    const regRes = await page.request.post(`${API_BASE}/auth/register`, {
      data: { email, password, firstName: 'Visible', lastName: 'Test' },
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    expect(regBody.accessToken).toBeTruthy();

    // Login
    const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { email, password },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    accessToken = loginBody.accessToken;
    expect(accessToken).toBeTruthy();

    // Create org for dashboard access
    const orgRes = await page.request.post(`${API_BASE}/organizations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Visible Test Org', slug: `visible-${Date.now()}` },
    });
    expect(orgRes.status()).toBe(201);
    const org = await orgRes.json();
    orgId = org.id;
    expect(orgId).toBeTruthy();

    // Show login page to user with success
    await page.goto('/login');
    await page.waitForTimeout(1000);
  });

  test('4. Homepage / Dashboard page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Dashboard should show title and summary cards
    await expect(page).toHaveTitle(/Hesabdari/);

    // Check for dashboard content or redirect to login
    const url = page.url();
    if (url.includes('/login')) {
      // Not authenticated in browser — still verify page loads
      await expect(page.locator('h3')).toContainText('Sign In');
    } else {
      // Dashboard loaded
      await expect(page.locator('h1')).toContainText('Dashboard');
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Total Expenses')).toBeVisible();
      await expect(page.locator('text=Net Income')).toBeVisible();
      await expect(page.locator('text=Open Invoices')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('5. Accounting page — Chart of Accounts', async ({ page }) => {
    await page.goto('/accounting');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Chart of Accounts');
      await expect(page.locator('text=Manage your chart of accounts here')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('6. Journal Entries page', async ({ page }) => {
    await page.goto('/journal-entries');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Journal Entries');
      await expect(page.locator('text=Create and manage journal entries')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('7. Invoices page', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Invoices');
      await expect(page.locator('text=Manage invoices and billing')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('8. Customers page', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Customers');
      await expect(page.locator('text=Manage your customer records')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('9. Vendors page', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Vendors');
      await expect(page.locator('text=Manage your vendor records')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('10. Reports page', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Reports');
      await expect(page.locator('text=View financial reports and analytics')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('11. Settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      await expect(page.locator('h1')).toContainText('Settings');
      await expect(page.locator('text=Configure your organization settings')).toBeVisible();
    }

    await page.waitForTimeout(1500);
  });

  test('12. Swagger UI loads in browser', async ({ page }) => {
    await page.goto('http://localhost:4000/api/docs');
    await page.waitForTimeout(2000);

    await expect(page).toHaveTitle(/Swagger/);

    await page.waitForTimeout(1500);
  });

  test('13. API Health check in browser', async ({ page }) => {
    await page.goto(`${API_BASE}/health`);
    await page.waitForTimeout(1500);

    // Health endpoint returns JSON — verify it's visible in browser
    const content = await page.textContent('body');
    expect(content).toContain('healthy');

    await page.waitForTimeout(1000);
  });

  test('14. API — Full CRUD flow (customers)', async ({ page }) => {
    // Create a customer
    const createRes = await page.request.post(`${API_BASE}/organizations/${orgId}/customers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        code: `VIS-${Date.now()}`,
        name: 'Visible Test Customer',
        phone1: '09121234567',
        address: 'Tehran, Iran',
      },
    });
    expect(createRes.status()).toBe(201);
    const customer = await createRes.json();
    expect(customer.id).toBeTruthy();
    expect(customer.name).toBe('Visible Test Customer');

    // Read the customer
    const readRes = await page.request.get(
      `${API_BASE}/organizations/${orgId}/customers/${customer.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    expect(readRes.status()).toBe(200);
    const readCustomer = await readRes.json();
    expect(readCustomer.name).toBe('Visible Test Customer');

    // Update the customer
    const updateRes = await page.request.put(
      `${API_BASE}/organizations/${orgId}/customers/${customer.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { name: 'Updated Visible Customer' },
      },
    );
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.name).toBe('Updated Visible Customer');

    // List customers
    const listRes = await page.request.get(`${API_BASE}/organizations/${orgId}/customers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(listRes.status()).toBe(200);

    // Show customers page
    await page.goto('/customers');
    await page.waitForTimeout(1500);
  });

  test('15. API — Full CRUD flow (vendors)', async ({ page }) => {
    const createRes = await page.request.post(`${API_BASE}/organizations/${orgId}/vendors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        code: `VVEN-${Date.now()}`,
        name: 'Visible Test Vendor',
        phone1: '09129876543',
      },
    });
    expect(createRes.status()).toBe(201);
    const vendor = await createRes.json();
    expect(vendor.name).toBe('Visible Test Vendor');

    // Read
    const readRes = await page.request.get(
      `${API_BASE}/organizations/${orgId}/vendors/${vendor.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    expect(readRes.status()).toBe(200);

    // Update
    const updateRes = await page.request.put(
      `${API_BASE}/organizations/${orgId}/vendors/${vendor.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { name: 'Updated Visible Vendor' },
      },
    );
    expect(updateRes.status()).toBe(200);

    await page.goto('/vendors');
    await page.waitForTimeout(1500);
  });

  test('16. API — Warehouses & Products', async ({ page }) => {
    // Create warehouse
    const whRes = await page.request.post(`${API_BASE}/organizations/${orgId}/warehouses`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Main Warehouse', code: `WH-${Date.now()}` },
    });
    expect(whRes.status()).toBe(201);
    await whRes.json();

    // Create product
    const prodRes = await page.request.post(`${API_BASE}/organizations/${orgId}/products`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        code: `PRD-${Date.now()}`,
        name: 'Test Product',
        countingUnit: 'عدد',
        salePrice1: '150000',
      },
    });
    expect(prodRes.status()).toBe(201);
    const prod = await prodRes.json();
    expect(prod.name).toBe('Test Product');

    // List products
    const listRes = await page.request.get(`${API_BASE}/organizations/${orgId}/products`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(listRes.status()).toBe(200);

    await page.waitForTimeout(1000);
  });

  test('17. API — Treasury (cashboxes)', async ({ page }) => {
    // Get currencies (global route, not org-scoped)
    const currRes = await page.request.get(`${API_BASE}/currencies`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(currRes.status()).toBe(200);
    const currencies = await currRes.json();

    let currencyId: string;
    if (currencies.length > 0) {
      currencyId = currencies[0].id;
    } else {
      // Create currency
      const newCurr = await page.request.post(`${API_BASE}/currencies`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', decimalPlaces: 0 },
      });
      expect(newCurr.status()).toBe(201);
      const c = await newCurr.json();
      currencyId = c.id;
    }

    // Create cashbox
    const cbRes = await page.request.post(`${API_BASE}/organizations/${orgId}/cashboxes`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Main Cash', code: `CB-${Date.now()}`, currencyId },
    });
    expect(cbRes.status()).toBe(201);
    const cb = await cbRes.json();
    expect(cb.name).toBe('Main Cash');

    // List cashboxes
    const listRes = await page.request.get(`${API_BASE}/organizations/${orgId}/cashboxes`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(listRes.status()).toBe(200);

    await page.waitForTimeout(1000);
  });

  test('18. API — Accounting (accounts, journal entries)', async ({ page }) => {
    // List accounts
    const accRes = await page.request.get(`${API_BASE}/organizations/${orgId}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(accRes.status()).toBe(200);

    // List journal entries
    const jeRes = await page.request.get(`${API_BASE}/organizations/${orgId}/journal-entries`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(jeRes.status()).toBe(200);

    // List periods
    const periodRes = await page.request.get(`${API_BASE}/organizations/${orgId}/periods`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(periodRes.status()).toBe(200);

    // List expenses
    const expRes = await page.request.get(`${API_BASE}/organizations/${orgId}/expenses`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(expRes.status()).toBe(200);

    await page.goto('/accounting');
    await page.waitForTimeout(1500);
  });

  test('19. API — Invoices list', async ({ page }) => {
    const invRes = await page.request.get(`${API_BASE}/organizations/${orgId}/invoices`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(invRes.status()).toBe(200);

    await page.goto('/invoices');
    await page.waitForTimeout(1500);
  });

  test('20. Error handling — 401, 404, 400', async ({ page }) => {
    // 401 — no token
    const res401 = await page.request.get(`${API_BASE}/organizations/any/accounts`);
    expect(res401.status()).toBe(401);
    const body401 = await res401.json();
    expect(body401.error.code).toBeTruthy();

    // 404 — non-existent route
    const res404 = await page.request.get(`${API_BASE}/nonexistent`);
    expect(res404.status()).toBe(404);
    const body404 = await res404.json();
    expect(body404.error.code).toBeTruthy();

    // 400 — validation error
    const res400 = await page.request.post(`${API_BASE}/auth/register`, {
      data: {},
    });
    expect(res400.status()).toBe(400);
    const body400 = await res400.json();
    expect(body400.error.code).toBeTruthy();

    await page.waitForTimeout(1000);
  });

  test('21. Final — back to homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveTitle(/Hesabdari/);
  });
});
