const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, findCrossing } = require('../js/calculator.js');
const base = { months: 24, duration: 24, phone: 600, plan: 10, monthly: 60, includesPlan: true };
test('24 month cost comparison', () => {
  const result = calculate(base);
  assert.equal(result.totalA, 840);
  assert.equal(result.totalB, 1440);
});
test('contract ends and switches to SIM-only', () => {
  const result = calculate({ ...base, months: 36 });
  assert.equal(result.totalA, 960);
  assert.equal(result.totalB, 1560);
});
test('phone-only contract also requires SIM plan', () => {
  const result = calculate({ ...base, includesPlan: false });
  assert.equal(result.totalB, 1680);
});
test('fees and cashback are counted once', () => {
  const result = calculate({ ...base, feeA: 10, feeB: 20, bonusA: 100, bonusB: 200, upfront: 30 });
  assert.equal(result.totalA, 750);
  assert.equal(result.totalB, 1290);
  assert.equal(result.cashAtCheckoutA, 610);
  assert.equal(result.cashAtCheckoutB, 50);
});
test('annual rise starts in month 13', () => {
  const result = calculate({ ...base, months: 24, plan: 10, riseA: 10, monthly: 30, riseB: 10 });
  assert.equal(result.totalA, 852);
  assert.equal(result.totalB, 756);
});
test('phone-only instalment does not receive plan inflation', () => {
  const result = calculate({ ...base, includesPlan: false, riseB: 10, plan: 0 });
  assert.equal(result.totalB, 1440);
});
test('all-month ties are not break-even flips', () => {
  assert.equal(findCrossing([10,20,30], [10,20,30]), null);
});
test('temporary equality is not a flip', () => {
  assert.equal(findCrossing([10,20,30,40],[20,20,20,20]), 3);
  assert.equal(findCrossing([10,20,30],[20,20,40]), null);
});
test('final month reversal is counted', () => {
  assert.equal(findCrossing([10,30],[20,20]), 2);
});
test('decimal arithmetic rounds each monthly charge', () => {
  const result = calculate({ ...base, months: 24, phone: 0, plan: 0.1, monthly: 0.2 });
  assert.equal(result.totalA, 2.4);
  assert.equal(result.totalB, 4.8);
});
