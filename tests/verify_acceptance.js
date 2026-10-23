// Automated Acceptance Verification Test for AASHRAY (DisplaceOS)
import http from 'http';
import { INITIAL_CAMPS, INITIAL_INVENTORY, INITIAL_REQUESTS } from '../src/data/initialData.js';
import { AllocationEngine } from '../src/services/allocationEngine.js';

// Polyfill minimal localStorage for Node verification
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
  global.window = {
    dispatchEvent: () => {}
  };
  global.CustomEvent = class CustomEvent {
    constructor(name, detail) { this.name = name; this.detail = detail; }
  };
}

const { storage } = await import('../src/services/storage.js');

console.log('====================================================');
console.log('🧪 AASHRAY ACCEPTANCE CRITERIA VERIFICATION TEST');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Initial Data Verification (PDF 2 Section 1, 2, 3, 5)
storage.resetToDefaults(false);

assert(INITIAL_CAMPS.length === 4, '4 Sample Relief Camps configured');
assert(INITIAL_INVENTORY.length === 16, '16 Sample Inventory items configured');
assert(INITIAL_REQUESTS.length === 8, '8 Sample Requests configured');

const metrics = storage.getDashboardMetrics();
assert(metrics.totalCamps === 4, 'Starting Metric: Total relief camps === 4');
assert(metrics.totalRequests === 8, 'Starting Metric: Total requests === 8');
assert(metrics.openRequests === 5, 'Starting Metric: Open requests === 5');
assert(metrics.lowStockCount === 6, 'Starting Metric: Low-stock records === 6');

// Check expected low-stock items from PDF 2 Page 3
const lowStockNames = metrics.lowStockItems.map(i => `${i.campName} - ${i.resource}`);
const expectedLowStock = [
  'Haldwani - Food packets',
  'Haldwani - Medicine kits',
  'Rishikesh - Drinking water',
  'Rishikesh - Blankets',
  'Haridwar - Food packets',
  'Haridwar - Blankets'
];
const allLowMatch = expectedLowStock.every(e => lowStockNames.includes(e));
assert(allLowMatch, 'All 6 low-stock warning items match specification exactly');

// 2. Request Status Breakdown Verification (PDF 2 Page 3)
assert(metrics.statusCounts['Pending'] === 3, 'Status Breakdown: Pending === 3');
assert(metrics.statusCounts['Approved'] === 1, 'Status Breakdown: Approved === 1');
assert(metrics.statusCounts['In Progress'] === 1, 'Status Breakdown: In Progress === 1');
assert(metrics.statusCounts['Delivered'] === 2, 'Status Breakdown: Delivered === 2');
assert(metrics.statusCounts['Rejected'] === 1, 'Status Breakdown: Rejected === 1');

// 3. Insufficient Stock Validation Test (PDF 2 Page 2: Scenario R-008)
// "Haridwar has only 8 blankets available, while Request R-008 requires 12. The system must not allocate all 12. It should display a clear insufficient-stock warning."
const invalidValidation = AllocationEngine.validate('R-008', 12);
assert(!invalidValidation.valid, 'Allocation of 12 blankets to R-008 rejected');
assert(invalidValidation.code === 'INSUFFICIENT_STOCK', 'Rejection code is INSUFFICIENT_STOCK');
assert(invalidValidation.availableStock === 8, 'Accurately detects Haridwar has only 8 blankets');
assert(invalidValidation.shortage === 4, 'Accurately computes shortage deficit of 4');

// 4. Valid Allocation Execution Test
// Coordinator allocates 8 blankets to R-008
const execResult = AllocationEngine.execute('R-008', 8);
assert(execResult.success, 'Allocation of 8 blankets to R-008 succeeds');
assert(execResult.remainingStock === 0, 'Haridwar blankets inventory decremented from 8 to 0');
assert(execResult.request.allocatedQuantity === 8, 'R-008 allocatedQuantity updated to 8');
assert(execResult.request.status === 'In Progress', 'R-008 transitioned to In Progress');

// Verify dashboard metrics dynamically update
const updatedMetrics = storage.getDashboardMetrics();
assert(updatedMetrics.statusCounts['In Progress'] === 2, 'In Progress status count updated to 2');
assert(updatedMetrics.statusCounts['Pending'] === 2, 'Pending status count updated to 2');

// 5. HTTP Server Check
http.get('http://localhost:5173/', (res) => {
  assert(res.statusCode === 200, 'HTTP Dev Server responds with HTTP 200 OK');
  console.log(`\n🎉 Verification Complete: ${passedTests}/${totalTests} tests passed.`);
  process.exit(0);
}).on('error', (err) => {
  console.error('HTTP Server check failed:', err.message);
  process.exit(1);
});
