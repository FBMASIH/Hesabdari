import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4000/api/v1';

test.describe('Frontend Pages', () => {
  test('homepage redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hesabdari/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Hesabdari/);
    await expect(page.locator('h3')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
  });

  test('login form has accessible labels', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    await expect(page.locator('label[for="password"]')).toContainText('Password');
  });

  test('login form accepts input', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('TestPass123');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('TestPass123');
  });
});

test.describe('API Health (via browser fetch)', () => {
  test('health endpoint returns healthy', async ({ page }) => {
    const response = await page.request.get(`${API_BASE}/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.services.database).toBe('up');
  });

  test('readiness endpoint returns ready', async ({ page }) => {
    const response = await page.request.get(`${API_BASE}/health/ready`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ready');
  });
});

test.describe('Authentication Flow', () => {
  const email = `pw-test-${Date.now()}@hesabdari.app`;
  const password = 'SecurePass123';
  let accessToken = '';

  test('register → login → access protected route', async ({ page }) => {
    // Register
    const regRes = await page.request.post(`${API_BASE}/auth/register`, {
      data: { email, password, firstName: 'Playwright', lastName: 'Test' },
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

    // Create org
    const orgRes = await page.request.post(`${API_BASE}/organizations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'PW Test Org', slug: `pw-${Date.now()}` },
    });
    expect(orgRes.status()).toBe(201);
    const org = await orgRes.json();
    expect(org.id).toBeTruthy();

    // Access protected route
    const accountsRes = await page.request.get(`${API_BASE}/organizations/${org.id}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(accountsRes.status()).toBe(200);
  });

  test('protected route without token returns 401', async ({ page }) => {
    const res = await page.request.get(`${API_BASE}/organizations/any-id/accounts`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(body.error.code).toBeTruthy();
  });
});

test.describe('Swagger Documentation', () => {
  test('Swagger UI loads', async ({ page }) => {
    await page.goto('http://localhost:4000/api/docs');
    await expect(page).toHaveTitle(/Swagger/);
  });

  test('OpenAPI spec is accessible', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/docs-json');
    expect(response.status()).toBe(200);
    const spec = await response.json();
    expect(spec.openapi).toBeTruthy();
    expect(Object.keys(spec.paths).length).toBeGreaterThan(20);
  });
});

test.describe('Error Handling', () => {
  test('non-existent API route returns 404 with structured error', async ({ page }) => {
    const res = await page.request.get(`${API_BASE}/nonexistent`);
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBeTruthy();
    expect(body.error.message).toBeTruthy();
  });

  test('validation error returns 400 with structured error', async ({ page }) => {
    const res = await page.request.post(`${API_BASE}/auth/register`, {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBeTruthy();
  });
});
