/* Pure calculation helpers. Values are rounded to cents at each monthly charge. */
(function (root) {
  'use strict';
  const toCents = value => Math.round((Number(value) || 0) * 100);
  const fromCents = value => value / 100;
  const monthlyCents = (amount, annualRise, month) =>
    Math.round(toCents(amount) * Math.pow(1 + (Number(annualRise) || 0) / 100, Math.floor((month - 1) / 12)));
  function calculate(input) {
    const months = Math.max(1, Math.min(60, Math.trunc(input.months)));
    const duration = Math.max(1, Math.min(60, Math.trunc(input.duration)));
    const plan = Number(input.plan) || 0;
    const monthly = Number(input.monthly) || 0;
    const includesPlan = Boolean(input.includesPlan);
    const riseA = Number(input.riseA) || 0;
    const riseB = includesPlan ? Number(input.riseB) || 0 : 0;
    const phone = Number(input.phone) || 0;
    const upfront = Number(input.upfront) || 0;
    const feeA = Number(input.feeA) || 0;
    const feeB = Number(input.feeB) || 0;
    const bonusA = Number(input.bonusA) || 0;
    const bonusB = Number(input.bonusB) || 0;
    let a = toCents(phone + feeA - bonusA);
    let b = toCents(upfront + feeB - bonusB);
    const seriesA = [], seriesB = [];
    for (let month = 1; month <= months; month++) {
      const sim = monthlyCents(plan, riseA, month);
      a += sim;
      b += month <= duration
        ? monthlyCents(monthly, riseB, month) + (includesPlan ? 0 : sim)
        : sim;
      seriesA.push(fromCents(a));
      seriesB.push(fromCents(b));
    }
    return {
      months, duration, plan, monthly, includesPlan, phone, upfront, feeA, feeB, bonusA, bonusB,
      riseA, riseB, seriesA, seriesB, totalA: fromCents(a), totalB: fromCents(b),
      cashAtCheckoutA: phone + feeA, cashAtCheckoutB: upfront + feeB
    };
  }
  // Equal months are not a change in the winner; detect only a true sign reversal.
  function findCrossing(a, b) {
    let previousSign = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const difference = Math.round((a[i] - b[i]) * 100);
      const sign = Math.sign(difference);
      if (sign && previousSign && sign !== previousSign) return i + 1;
      if (sign) previousSign = sign;
    }
    return null;
  }
  const api = { calculate, findCrossing };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PhoneCalculator = api;
})(typeof window !== 'undefined' ? window : null);
