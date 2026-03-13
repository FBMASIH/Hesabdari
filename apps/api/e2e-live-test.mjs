/**
 * Comprehensive live E2E test for Hesabdari API
 * Tests all modules against running API server on port 4000
 */

const BASE = 'http://localhost:4000/api/v1';
const results = [];
let TOKEN = '';
let REFRESH = '';
let ORG_ID = '';

const state = {};

async function req(method, path, body = null, auth = true) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

function record(module, test, status, httpCode, detail = '') {
  results.push({ module, test, status, httpCode, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${module}] ${test} → HTTP ${httpCode} ${detail}`);
}

function check(module, test, res, expectedStatus, validator = null) {
  const pass = res.status === expectedStatus && (!validator || validator(res.data));
  record(module, test, pass ? 'PASS' : 'FAIL', res.status,
    pass ? '' : `Expected ${expectedStatus}, got ${res.status}. ${JSON.stringify(res.data).slice(0, 300)}`);
  return pass;
}

// Paginated list validator (returns {data:[], total, page, pageSize})
function isPaginated(d) { return d && Array.isArray(d.data) && typeof d.total === 'number'; }

// ============= HEALTH MODULE =============
async function testHealth() {
  let r = await req('GET', '/health', null, false);
  check('Health', 'GET /health — liveness check', r, 200, d => d.status === 'healthy' && d.services?.database === 'up');

  r = await req('GET', '/health/ready', null, false);
  check('Health', 'GET /health/ready — readiness check', r, 200, d => d.status === 'ready');
}

// ============= IDENTITY MODULE =============
async function testIdentity() {
  const email = 'live-test-' + Date.now() + '@hesabdari.app';

  // Register new user
  let r = await req('POST', '/auth/register', { email, password: 'SecurePass123', firstName: 'Live', lastName: 'Tester' }, false);
  check('Identity', 'POST /auth/register — create user', r, 201, d => !!d.accessToken && !!d.refreshToken);
  if (r.status === 201) { TOKEN = r.data.accessToken; REFRESH = r.data.refreshToken; }

  // Login
  r = await req('POST', '/auth/login', { email, password: 'SecurePass123' }, false);
  check('Identity', 'POST /auth/login — authenticate', r, 200, d => !!d.accessToken);
  if (r.status === 200) { TOKEN = r.data.accessToken; REFRESH = r.data.refreshToken; }

  // Refresh token
  r = await req('POST', '/auth/refresh', { refreshToken: REFRESH }, false);
  check('Identity', 'POST /auth/refresh — refresh token', r, 200, d => !!d.accessToken);
  if (r.status === 200) { TOKEN = r.data.accessToken; REFRESH = r.data.refreshToken; }

  // Invalid login — password too short (caught by ValidationPipe → 400)
  r = await req('POST', '/auth/login', { email: 'wrong@x.com', password: 'short' }, false);
  check('Identity', 'POST /auth/login — short password → 400', r, 400);

  // Invalid login — wrong credentials (valid format)
  r = await req('POST', '/auth/login', { email: 'wrong@example.com', password: 'WrongPass123' }, false);
  check('Identity', 'POST /auth/login — wrong creds → 401', r, 401);

  // Missing fields
  r = await req('POST', '/auth/register', { email: 'x@x.com' }, false);
  check('Identity', 'POST /auth/register — validation → 400', r, 400);

  // Duplicate registration
  r = await req('POST', '/auth/register', { email, password: 'SecurePass123', firstName: 'Dup', lastName: 'User' }, false);
  check('Identity', 'POST /auth/register — duplicate email → 409', r, 409);
}

// ============= ORGANIZATIONS MODULE =============
async function testOrganizations() {
  let r = await req('POST', '/organizations', { name: 'E2E Test Org ' + Date.now(), slug: 'e2e-' + Date.now() });
  check('Organizations', 'POST /organizations — create org', r, 201, d => !!d.id && !!d.name);
  if (r.status === 201) ORG_ID = r.data.id;

  r = await req('GET', `/organizations/${ORG_ID}`);
  check('Organizations', 'GET /organizations/:id — read org', r, 200, d => d.id === ORG_ID);

  // Non-existent org
  r = await req('GET', '/organizations/00000000-0000-0000-0000-000000000000');
  check('Organizations', 'GET /organizations/:id — not found → 404', r, 404);
}

// ============= ACCOUNTING MODULE =============
async function testAccounting() {
  // Currencies (global)
  let r = await req('GET', '/currencies');
  check('Accounting', 'GET /currencies — list currencies', r, 200, d => Array.isArray(d));
  if (r.status === 200 && r.data.length > 0) state.currencyId = r.data[0].id;

  r = await req('POST', '/currencies', { code: 'TS' + Date.now().toString().slice(-3), name: 'Test Currency', symbol: 'T', decimalPlaces: 0 });
  if (r.status === 201) {
    check('Accounting', 'POST /currencies — create currency', r, 201, d => !!d.id);
    state.currencyId = r.data.id;
  } else {
    record('Accounting', 'POST /currencies — create (may exist)', 'WARN', r.status);
  }

  // Accounts (org-scoped)
  r = await req('GET', `/organizations/${ORG_ID}/accounts`);
  check('Accounting', 'GET /accounts — list chart of accounts', r, 200, d => Array.isArray(d));

  r = await req('POST', `/organizations/${ORG_ID}/accounts`, { code: 'TST-' + Date.now(), name: 'Test Account', type: 'ASSET' });
  check('Accounting', 'POST /accounts — create account', r, 201, d => !!d.id);
  if (r.status === 201) state.accountId = r.data.id;

  if (state.accountId) {
    r = await req('GET', `/organizations/${ORG_ID}/accounts/${state.accountId}`);
    check('Accounting', 'GET /accounts/:id — read account', r, 200, d => d.id === state.accountId);
  }

  // Periods
  r = await req('GET', `/organizations/${ORG_ID}/periods`);
  check('Accounting', 'GET /periods — list accounting periods', r, 200, d => Array.isArray(d));

  // Journal entries
  r = await req('GET', `/organizations/${ORG_ID}/journal-entries`);
  check('Accounting', 'GET /journal-entries — list journal entries', r, 200, d => Array.isArray(d));

  // Expenses
  r = await req('GET', `/organizations/${ORG_ID}/expenses`);
  check('Accounting', 'GET /expenses — list expenses', r, 200, d => Array.isArray(d));
}

// ============= CUSTOMERS MODULE =============
async function testCustomers() {
  let r = await req('GET', `/organizations/${ORG_ID}/customers`);
  check('Customers', 'GET /customers — list (paginated)', r, 200, isPaginated);

  r = await req('POST', `/organizations/${ORG_ID}/customers`, {
    code: 'CUST-' + Date.now(), name: 'Test Customer', phone1: '09121234567', nationalId: '0012345678'
  });
  check('Customers', 'POST /customers — create customer', r, 201, d => !!d.id);
  if (r.status === 201) state.customerId = r.data.id;

  if (state.customerId) {
    r = await req('GET', `/organizations/${ORG_ID}/customers/${state.customerId}`);
    check('Customers', 'GET /customers/:id — read customer', r, 200, d => d.id === state.customerId);

    r = await req('PUT', `/organizations/${ORG_ID}/customers/${state.customerId}`, { name: 'Updated Customer' });
    check('Customers', 'PUT /customers/:id — update customer', r, 200, d => d.name === 'Updated Customer');

    r = await req('GET', `/organizations/${ORG_ID}/customers/search?q=Updated`);
    check('Customers', 'GET /customers/search — search by name', r, 200, d => Array.isArray(d) && d.length > 0);

    // Soft delete
    r = await req('DELETE', `/organizations/${ORG_ID}/customers/${state.customerId}`);
    check('Customers', 'DELETE /customers/:id — soft delete', r, 200);
  }

  // Opening balances
  r = await req('GET', `/organizations/${ORG_ID}/customers/opening-balances`);
  check('Customers', 'GET /customers/opening-balances — list', r, 200);
}

// ============= VENDORS MODULE =============
async function testVendors() {
  let r = await req('GET', `/organizations/${ORG_ID}/vendors`);
  check('Vendors', 'GET /vendors — list (paginated)', r, 200, isPaginated);

  r = await req('POST', `/organizations/${ORG_ID}/vendors`, {
    code: 'VND-' + Date.now(), name: 'Test Vendor', phone1: '02112345678', economicCode: 'EC001'
  });
  check('Vendors', 'POST /vendors — create vendor', r, 201, d => !!d.id);
  if (r.status === 201) state.vendorId = r.data.id;

  if (state.vendorId) {
    r = await req('GET', `/organizations/${ORG_ID}/vendors/${state.vendorId}`);
    check('Vendors', 'GET /vendors/:id — read vendor', r, 200, d => d.id === state.vendorId);

    r = await req('PUT', `/organizations/${ORG_ID}/vendors/${state.vendorId}`, { name: 'Updated Vendor' });
    check('Vendors', 'PUT /vendors/:id — update vendor', r, 200, d => d.name === 'Updated Vendor');

    r = await req('GET', `/organizations/${ORG_ID}/vendors/search?q=Updated`);
    check('Vendors', 'GET /vendors/search — search by name', r, 200, d => Array.isArray(d) && d.length > 0);

    // Soft delete
    r = await req('DELETE', `/organizations/${ORG_ID}/vendors/${state.vendorId}`);
    check('Vendors', 'DELETE /vendors/:id — soft delete', r, 200);
  }

  // Opening balances
  r = await req('GET', `/organizations/${ORG_ID}/vendors/opening-balances`);
  check('Vendors', 'GET /vendors/opening-balances — list', r, 200);
}

// ============= INVENTORY MODULE =============
async function testInventory() {
  // Warehouses (may return paginated)
  let r = await req('GET', `/organizations/${ORG_ID}/warehouses`);
  check('Inventory', 'GET /warehouses — list', r, 200);

  r = await req('POST', `/organizations/${ORG_ID}/warehouses`, { name: 'Test Warehouse', code: 'WH-' + Date.now() });
  check('Inventory', 'POST /warehouses — create warehouse', r, 201, d => !!d.id);
  if (r.status === 201) state.warehouseId = r.data.id;

  if (state.warehouseId) {
    r = await req('GET', `/organizations/${ORG_ID}/warehouses/${state.warehouseId}`);
    check('Inventory', 'GET /warehouses/:id — read warehouse', r, 200);

    r = await req('PUT', `/organizations/${ORG_ID}/warehouses/${state.warehouseId}`, { name: 'Updated Warehouse' });
    check('Inventory', 'PUT /warehouses/:id — update warehouse', r, 200);
  }

  // Products
  r = await req('GET', `/organizations/${ORG_ID}/products`);
  check('Inventory', 'GET /products — list', r, 200);

  r = await req('POST', `/organizations/${ORG_ID}/products`, {
    code: 'PRD-' + Date.now(), name: 'Test Product', unit: 'عدد', productType: 'GOODS'
  });
  check('Inventory', 'POST /products — create product', r, 201, d => !!d.id);
  if (r.status === 201) state.productId = r.data.id;

  if (state.productId) {
    r = await req('GET', `/organizations/${ORG_ID}/products/${state.productId}`);
    check('Inventory', 'GET /products/:id — read product', r, 200);

    r = await req('PUT', `/organizations/${ORG_ID}/products/${state.productId}`, { name: 'Updated Product' });
    check('Inventory', 'PUT /products/:id — update product', r, 200);

    r = await req('GET', `/organizations/${ORG_ID}/products/search?q=Updated`);
    check('Inventory', 'GET /products/search — search products', r, 200);

    r = await req('GET', `/organizations/${ORG_ID}/products/${state.productId}/warehouse-stocks`);
    check('Inventory', 'GET /products/:id/warehouse-stocks — list', r, 200);

    // Soft delete
    r = await req('DELETE', `/organizations/${ORG_ID}/products/${state.productId}`);
    check('Inventory', 'DELETE /products/:id — soft delete', r, 200);
  }
}

// ============= TREASURY MODULE =============
async function testTreasury() {
  // Banks (global — seeded with 22 Iranian banks)
  let r = await req('GET', '/banks');
  check('Treasury', 'GET /banks — list banks', r, 200, d => Array.isArray(d));
  if (r.status === 200 && r.data.length > 0) state.bankId = r.data[0].id;

  // Bank accounts
  r = await req('GET', `/organizations/${ORG_ID}/bank-accounts`);
  check('Treasury', 'GET /bank-accounts — list', r, 200);

  // Cashboxes
  r = await req('GET', `/organizations/${ORG_ID}/cashboxes`);
  check('Treasury', 'GET /cashboxes — list', r, 200);

  // Create cashbox (requires currencyId)
  if (state.currencyId) {
    r = await req('POST', `/organizations/${ORG_ID}/cashboxes`, {
      name: 'Test Cashbox', code: 'CB-' + Date.now(), currencyId: state.currencyId
    });
    check('Treasury', 'POST /cashboxes — create cashbox', r, 201, d => !!d.id);
    if (r.status === 201) state.cashboxId = r.data.id;
  }

  if (state.cashboxId) {
    r = await req('GET', `/organizations/${ORG_ID}/cashboxes/${state.cashboxId}`);
    check('Treasury', 'GET /cashboxes/:id — read cashbox', r, 200);

    r = await req('PUT', `/organizations/${ORG_ID}/cashboxes/${state.cashboxId}`, { name: 'Updated Cashbox' });
    check('Treasury', 'PUT /cashboxes/:id — update cashbox', r, 200);

    // Soft delete cashbox
    r = await req('DELETE', `/organizations/${ORG_ID}/cashboxes/${state.cashboxId}`);
    check('Treasury', 'DELETE /cashboxes/:id — soft delete', r, 200);
  }

  // Opening balances
  r = await req('GET', `/organizations/${ORG_ID}/bank-accounts/opening-balances`);
  check('Treasury', 'GET /bank-accounts/opening-balances — list', r, 200);

  r = await req('GET', `/organizations/${ORG_ID}/cashboxes/opening-balances`);
  check('Treasury', 'GET /cashboxes/opening-balances — list', r, 200);

  // Cheques
  r = await req('GET', `/organizations/${ORG_ID}/received-cheques`);
  check('Treasury', 'GET /received-cheques — list', r, 200);

  r = await req('GET', `/organizations/${ORG_ID}/paid-cheques`);
  check('Treasury', 'GET /paid-cheques — list', r, 200);

  // Zod validation: cashbox without required currencyId
  r = await req('POST', `/organizations/${ORG_ID}/cashboxes`, { name: 'Bad', code: 'BAD' });
  check('Treasury', 'POST /cashboxes — missing currencyId → 400', r, 400,
    d => d.error && (d.error.code === 'VALIDATION_ERROR' || d.error.code === 'Bad Request'));
}

// ============= INVOICES MODULE =============
async function testInvoices() {
  let r = await req('GET', `/organizations/${ORG_ID}/invoices`);
  check('Invoices', 'GET /invoices — list invoices', r, 200);
}

// ============= GUARD & ERROR HANDLING =============
async function testGuardsAndErrors() {
  // Deny-by-default: unauthenticated
  let r = await req('GET', `/organizations/${ORG_ID}/accounts`, null, false);
  check('Guards', 'Protected route without token → 401', r, 401);

  // Invalid token
  const savedToken = TOKEN;
  TOKEN = 'invalid-token-xyz';
  r = await req('GET', `/organizations/${ORG_ID}/accounts`);
  check('Guards', 'Invalid token → 401', r, 401);
  TOKEN = savedToken;

  // 404
  r = await req('GET', '/nonexistent-route');
  check('Guards', 'Non-existent route → 404', r, 404);

  // Structured error shape
  r = await req('GET', `/organizations/${ORG_ID}/accounts`, null, false);
  check('Guards', 'Error shape: {error:{code,message}}', r, 401,
    d => d.error && typeof d.error.code === 'string' && typeof d.error.message === 'string');

  // Validation error shape
  r = await req('POST', '/auth/register', {}, false);
  check('Guards', 'ValidationPipe error → 400', r, 400, d => d.error && d.error.code);

  // BigInt serialization (check that financial fields serialize as numbers)
  if (state.customerId) {
    r = await req('GET', `/organizations/${ORG_ID}/customers/${state.customerId}`);
    if (r.status === 200 && r.data.creditLimit !== undefined) {
      check('Guards', 'BigInt serialized as number (creditLimit)', r, 200,
        d => typeof d.creditLimit === 'number');
    }
  }
}

// ============= SWAGGER DOCS =============
async function testSwagger() {
  let r = await fetch('http://localhost:4000/api/docs');
  record('Swagger', 'GET /api/docs — Swagger UI', r.status === 200 || r.status === 301 ? 'PASS' : 'FAIL', r.status);

  r = await fetch('http://localhost:4000/api/docs-json');
  if (r.status === 200) {
    const doc = await r.json();
    const pathCount = Object.keys(doc.paths || {}).length;
    record('Swagger', 'GET /api/docs-json — OpenAPI spec', 'PASS', 200, `${pathCount} paths documented`);
  } else {
    record('Swagger', 'GET /api/docs-json — OpenAPI spec', 'FAIL', r.status);
  }
}

// ============= RUN ALL =============
async function main() {
  console.log('\n🏁 Hesabdari Live E2E API Test Suite\n' + '='.repeat(60) + '\n');

  await testHealth();
  await testIdentity();
  await testOrganizations();

  if (!ORG_ID) {
    console.error('\n❌ Cannot proceed without organization. Aborting.');
    process.exit(1);
  }

  await testAccounting();
  await testCustomers();
  await testVendors();
  await testInventory();
  await testTreasury();
  await testInvoices();
  await testGuardsAndErrors();
  await testSwagger();

  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  console.log(`\n📊 RESULTS: ${passed} PASSED, ${failed} FAILED, ${warned} WARNINGS out of ${results.length} tests\n`);

  if (failed > 0) {
    console.log('❌ FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  [${r.module}] ${r.test}`);
      if (r.detail) console.log(`    → ${r.detail}`);
    });
  }

  // Save JSON
  const output = { summary: { total: results.length, passed, failed, warned, timestamp: new Date().toISOString() }, results };
  const fs = await import('fs');
  fs.writeFileSync('e2e-results.json', JSON.stringify(output, null, 2));
  console.log('\n📁 Full results saved to e2e-results.json');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
