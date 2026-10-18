(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const { calculate, findCrossing } = window.PhoneCalculator;
  const catalogue = window.PHONE_CATALOGUE.brands;
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = n => formatter.format(Number.isFinite(n) ? n : 0);
  const num = id => Number($(id).value) || 0;
  const filled = id => $(id).value.trim() !== '';
  const validNumber = (id, { min = 0, max = 1000000, integer = false, required = true } = {}) => {
    const text = $(id).value.trim();
    if (!text) return !required;
    const n = Number(text);
    return Number.isFinite(n) && n >= min && n <= max && (!integer || Number.isInteger(n));
  };
  const moneyOK = id => validNumber(id);
  const optionIDs = ['otpPrice','basicPlan','bonusAmountA','monthlyPayment','contractMonths','upfrontAmount','bonusAmountB',
    'feeA','feeB','riseA','riseB','dataA','speedA','dataB','speedB','compareMonths','carrierA','carrierB'];
  const toggleIDs = ['hasBonusA','hasUpfront','hasBonusB','unlimitedA','unlimitedB','paymentIncludesPlan','paymentPhoneOnly'];
  let chart = null, lookupToken = 0, priceAbort = null, currentCustom = '';

  function status(message, kind = '', link = null) {
    const el = $('priceStatus');
    el.className = 'price-status' + (kind ? ' ' + kind : '');
    const dot = document.createElement('span');
    dot.className = 'status-dot';
    const messageNode = document.createElement('span');
    messageNode.textContent = message;
    if (link && link.href) {
      try {
        const url = new URL(link.href, window.location.href);
        if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === window.location.origin)) {
          const anchor = document.createElement('a');
          anchor.textContent = link.label || 'Open price search ↗';
          anchor.href = url.href;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          messageNode.append(' ', anchor);
        }
      } catch (_) { /* Ignore malformed provider URLs. */ }
    }
    el.replaceChildren(dot, messageNode);
  }
  const priceHint = () => status('Enter an outright price yourself, or check current retailer listings. No live price feed is connected.');
  function stopLookup() {
    lookupToken++;
    if (priceAbort) { priceAbort.abort(); priceAbort = null; }
  }
  function invalidatePhone() {
    stopLookup();
    $('otpPrice').value = '';
    priceHint();
  }
  function modelValue() { return $('brand').value === 'Other' ? $('modelCustom').value.trim() : $('model').value; }
  function selectedPhone() { return [$('brand').value === 'Other' ? '' : $('brand').value, modelValue(), $('storage').value].filter(Boolean).join(' '); }

  function populateModels() {
    const brand = $('brand').value, model = $('model'), custom = $('modelCustom'), storage = $('storage');
    model.replaceChildren(new Option(brand ? 'Choose model' : 'Choose brand first', ''));
    storage.replaceChildren(new Option('Choose storage', ''));
    storage.disabled = true;
    model.hidden = brand === 'Other';
    custom.hidden = brand !== 'Other';
    model.disabled = !brand || brand === 'Other';
    $('modelLabel').htmlFor = brand === 'Other' ? 'modelCustom' : 'model';
    $('customModelHint').hidden = brand !== 'Other';
    if (brand === 'Other') {
      ['64 GB','128 GB','256 GB','512 GB','1 TB','2 TB','Not sure'].forEach(s => storage.add(new Option(s, s)));
      storage.disabled = false;
    } else if (catalogue[brand]) {
      Object.keys(catalogue[brand]).forEach(name => model.add(new Option(name, name)));
    }
  }
  function populateStorage() {
    const brand = $('brand').value, name = modelValue(), storage = $('storage');
    storage.replaceChildren(new Option(name ? 'Choose storage' : 'Choose model first', ''));
    storage.disabled = !name;
    (catalogue[brand]?.[name] || []).forEach(s => storage.add(new Option(s, s)));
  }
  function searchLink() {
    const query = selectedPhone();
    return 'https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=' + encodeURIComponent(query);
  }
  async function lookupPhonePrice() {
    if (!$('brand').value || !modelValue()) {
      status('Enter the phone brand and model to search. For Other, the model is optional if you already know the price.', 'warn');
      return;
    }
    if ($('brand').value !== 'Other' && !$('storage').value) {
      status('Choose the correct storage version before searching.', 'warn');
      return;
    }
    const fallback = searchLink();
    // Static hosting has no /api route. Only call an explicitly configured backend.
    const endpoint = document.querySelector('meta[name="phone-price-api"]')?.content?.trim();
    if (!endpoint) {
      status('Retailer search opened. Enter the best delivered price in the field above.', 'warn',
        { href: fallback, label: 'Search this phone on idealo ↗' });
      window.open(fallback, '_blank', 'noopener,noreferrer');
      return;
    }
    stopLookup();
    const token = lookupToken;
    priceAbort = new AbortController();
    const brand = $('brand').value, model = modelValue(), storage = $('storage').value;
    status('Looking for a current retailer price…');
    try {
      const url = new URL(endpoint, window.location.href);
      if (url.protocol !== 'https:' && url.origin !== window.location.origin) throw new Error('Insecure price endpoint');
      url.searchParams.set('brand', brand);
      url.searchParams.set('model', model);
      url.searchParams.set('storage', storage);
      const response = await fetch(url.href, { headers: { Accept: 'application/json' }, signal: priceAbort.signal });
      if (!response.ok) throw new Error('Price lookup unavailable');
      const offer = await response.json();
      if (token !== lookupToken || selectedPhone() !== [brand === 'Other' ? '' : brand, model, storage].filter(Boolean).join(' ')) return;
      if (typeof offer.price !== 'number' || !Number.isFinite(offer.price) || offer.price <= 0 || offer.price > 1000000) throw new Error('Invalid price');
      $('otpPrice').value = offer.price.toFixed(2);
      syncProgress(false);
      status('Found ' + money(offer.price) + ' via ' + String(offer.source || 'price provider') + '. Check shipping, colour and storage.', 'ok',
        offer.url ? { href: offer.url, label: 'View retailer offer ↗' } : null);
    } catch (error) {
      if (token !== lookupToken || error.name === 'AbortError') return;
      status('Live lookup is unavailable. Search a retailer and enter the price manually.', 'warn',
        { href: fallback, label: 'Search on idealo ↗' });
    } finally {
      if (token === lookupToken) priceAbort = null;
    }
  }

  function step1Complete() {
    const brand = $('brand').value;
    return Boolean(brand && (brand === 'Other' || (modelValue() && $('storage').value))
      && validNumber('otpPrice', { min: 0.01 }));
  }
  function step2Complete() {
    const needed = ['basicPlan','monthlyPayment','feeA','feeB','riseA','riseB'];
    if (!needed.every(id => moneyOK(id))) return false;
    if (!validNumber('riseA',{max:100}) || !validNumber('riseB',{max:100})) return false;
    if (!validNumber('contractMonths',{min:1,max:60,integer:true})) return false;
    if ($('hasBonusA').checked && !moneyOK('bonusAmountA')) return false;
    if ($('hasUpfront').checked && !moneyOK('upfrontAmount')) return false;
    if ($('hasBonusB').checked && !moneyOK('bonusAmountB')) return false;
    return true;
  }
  function updatePeriod() {
    const slider = $('compareMonths');
    const duration = validNumber('contractMonths',{min:1,max:60,integer:true}) ? num('contractMonths') : 6;
    const min = Math.max(6, duration);
    slider.min = String(min);
    if (Number(slider.value) < min) slider.value = String(min);
    const months = num('compareMonths');
    $('compareMonthsLabel').textContent = months + ' months';
    $('periodNotice').textContent = duration > 6
      ? 'The comparison must cover at least the ' + duration + '-month contract commitment.'
      : 'Choose the period you actually want to compare, up to 60 months.';
  }
  function revealStep(id, scroll = false) {
    const el = $(id);
    if (!el.hidden) return;
    el.hidden = false;
    if (scroll && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }
  function hideStep(id) { $(id).hidden = true; }
  function syncProgress(scroll = false) {
    updatePeriod();
    const one = step1Complete();
    const two = one && step2Complete();
    if (one) revealStep('step2', scroll); else hideStep('step2');
    if (two) {
      revealStep('step3', false);
      revealStep('step4', false);
    } else {
      hideStep('step3');
      hideStep('step4');
    }
    $('validationStatus').textContent = one && !two
      ? 'Enter the contract duration and valid non-negative amounts. Optional charges can remain zero.' : '';
    document.querySelectorAll('.progress [data-progress]').forEach((bar, i) => {
      const complete = [one, two, two, two][i];
      bar.classList.toggle('is-complete', complete);
      bar.classList.toggle('is-current', !complete && (i === 0 || [one,two,two][i-1]));
    });
    updateResults();
  }
  function inputData() {
    return {
      months: num('compareMonths'), phone: num('otpPrice'), plan: num('basicPlan'),
      monthly: num('monthlyPayment'), duration: num('contractMonths'),
      includesPlan: $('paymentIncludesPlan').checked,
      upfront: $('hasUpfront').checked ? num('upfrontAmount') : 0,
      bonusA: $('hasBonusA').checked ? num('bonusAmountA') : 0,
      bonusB: $('hasBonusB').checked ? num('bonusAmountB') : 0,
      feeA: num('feeA'), feeB: num('feeB'), riseA: num('riseA'), riseB: num('riseB')
    };
  }
  function planInsights() {
    const insights = [];
    const ua = $('unlimitedA').checked, ub = $('unlimitedB').checked;
    const da = num('dataA'), db = num('dataB'), sa = num('speedA'), sb = num('speedB');
    const dataA = ua || (validNumber('dataA',{min:0.1}) && filled('dataA'));
    const dataB = ub || (validNumber('dataB',{min:0.1}) && filled('dataB'));
    if (dataA && dataB) {
      if (ua !== ub) insights.push(['Mobile data', (ua ? 'Your SIM-only plan' : 'The contract') + ' has unlimited data, while the other has ' + (ua ? db : da) + ' GB.']);
      else if (!ua && da !== db) insights.push(['Mobile data', (db > da ? 'The contract' : 'Your SIM-only plan') + ' includes ' + Math.abs(db-da) + ' GB more per month.']);
      else insights.push(['Mobile data', ua ? 'Both plans include unlimited data.' : 'Both plans include ' + da + ' GB.']);
    }
    if (validNumber('speedA',{min:1}) && validNumber('speedB',{min:1}) && filled('speedA') && filled('speedB')) {
      if (sa === sb) insights.push(['Advertised speed', 'Both plans list up to ' + sa + ' Mbps.']);
      else insights.push(['Advertised speed', (sb > sa ? 'The contract' : 'Your SIM-only plan') + ' advertises up to ' + Math.abs(sb-sa) + ' Mbps more.']);
    }
    return insights;
  }
  function showInsights(d) {
    const list = $('insightList');
    list.replaceChildren();
    const notes = [];
    const cashDiff = Math.abs(d.cashAtCheckoutA-d.cashAtCheckoutB);
    notes.push(['Cash needed at checkout', cashDiff
      ? (d.cashAtCheckoutA > d.cashAtCheckoutB ? 'The contract' : 'Buying outright') + ' requires ' + money(cashDiff) + ' less initially, before any later cashback.'
      : 'Both options have the same listed upfront cash requirement, before any later cashback.']);
    if (d.bonusA) notes.push(['Outright incentive', money(d.bonusA) + ' trade-in / cashback has been deducted from the overall cost.']);
    if (d.bonusB) notes.push(['Contract incentive', money(d.bonusB) + ' joining bonus / cashback has been deducted from the overall cost.']);
    if (d.riseA || d.riseB) notes.push(['Annual price changes', 'Annual increases entered are included from month 13 onwards.']);
    if (d.months > d.duration) notes.push(['After the contract', 'The estimate switches the contract option to the chosen SIM-only tariff in month ' + (d.duration+1) + '.']);
    notes.push(...planInsights());
    for (const [heading, body] of notes) {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = heading + ': ';
      li.append(strong, document.createTextNode(body));
      list.appendChild(li);
    }
  }
  function updateResults() {
    if ($('step4').hidden) return;
    const d = calculate(inputData());
    const months = d.months, difference = Math.abs(d.totalA-d.totalB);
    const aWins = d.totalA < d.totalB, bWins = d.totalB < d.totalA;
    const crossing = findCrossing(d.seriesA,d.seriesB);
    $('totalA').textContent = money(d.totalA);
    $('totalB').textContent = money(d.totalB);
    $('avgA').textContent = money(d.totalA/months);
    $('avgB').textContent = money(d.totalB/months);
    $('subA').textContent = money(d.phone) + ' phone + ' + money(d.plan) + '/month SIM' + (d.feeA ? ' + ' + money(d.feeA) + ' fees' : '') + (d.bonusA ? ' − ' + money(d.bonusA) + ' incentive' : '');
    $('subB').textContent = money(d.upfront) + ' upfront + ' + money(d.monthly) + '/month for ' + d.duration + ' months' + (d.includesPlan ? ' (plan included)' : ' + SIM plan') + (d.feeB ? ' + ' + money(d.feeB) + ' fees' : '') + (d.bonusB ? ' − ' + money(d.bonusB) + ' incentive' : '');
    $('cardA').classList.toggle('winner',aWins);
    $('cardB').classList.toggle('winner',bWins);
    document.querySelectorAll('.winner-pill').forEach(el => el.remove());
    for (const card of aWins ? [$('cardA')] : bWins ? [$('cardB')] : []) {
      const badge = document.createElement('span');
      badge.className = 'winner-pill';
      badge.textContent = 'Lower cost';
      card.appendChild(badge);
    }
    $('resultTitle').textContent = aWins ? 'Buying outright is ' + money(difference) + ' cheaper over ' + months + ' months.'
      : bWins ? 'The contract is ' + money(difference) + ' cheaper over ' + months + ' months.'
      : 'Both options cost the same over ' + months + ' months.';
    $('resultLead').textContent = aWins
      ? 'Buying outright has the lower overall cost with the assumptions entered. Compare the initial cash requirement and plan quality below.'
      : bWins ? 'The contract has the lower overall cost with the assumptions entered. Check the commitment and provider conditions before deciding.'
      : 'Compare initial cash required, contract flexibility and any differences between mobile plans.';
    $('savingMetric').textContent = money(difference);
    $('savingSub').textContent = aWins ? 'Saved by buying outright' : bWins ? 'Saved with the contract' : 'No cost difference';
    $('breakEvenMetric').textContent = crossing !== null ? 'Month ' + crossing : 'No flip';
    $('breakEvenSub').textContent = crossing !== null ? 'The lower-cost option changes here' : 'No change in which option costs less';
    showInsights(d);
    if (typeof window.Chart !== 'function') {
      $('chartUnavailable').hidden = false;
      $('chartUnavailable').textContent = 'Interactive chart is unavailable while Chart.js cannot load. The totals above still work.';
      return;
    }
    $('chartUnavailable').hidden = true;
    const labels = d.seriesA.map((_,i) => 'M' + (i+1));
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = d.seriesA;
      chart.data.datasets[1].data = d.seriesB;
      chart.update('none');
    } else {
      window.Chart.defaults.font.family = "'IBM Plex Mono', monospace";
      chart = new window.Chart($('costChart'), {
        type: 'line',
        data: { labels, datasets: [
          { label:'Buy outright + SIM', data:d.seriesA, borderColor:'#08775f', borderWidth:2.5, pointRadius:0, tension:.15 },
          { label:'Phone contract', data:d.seriesB, borderColor:'#c77a16', borderWidth:2.5, borderDash:[6,4], pointRadius:0, tension:.15 }
        ] },
        options: { responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
          plugins:{ legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:18}},
            tooltip:{callbacks:{label: context => context.dataset.label + ': ' + money(context.parsed.y)}} },
          scales:{x:{ticks:{autoSkip:true,maxTicksLimit:10},grid:{display:false}},
            y:{ticks:{callback:value => money(Number(value))},grid:{color:'#e5e2d8'}}}
        }
      });
    }
  }
  function syncToggle(checkID,fieldID) {
    $(fieldID).classList.toggle('show', $(checkID).checked);
    syncProgress(false);
  }
  function syncUnlimited(checkID,inputID) {
    $(inputID).disabled = $(checkID).checked;
    syncProgress(false);
  }
  function snapshot() {
    const fields = {};
    optionIDs.forEach(id => { fields[id] = $(id).value; });
    toggleIDs.forEach(id => { fields[id] = $(id).checked; });
    fields.brand = $('brand').value;
    fields.model = $('model').value;
    fields.modelCustom = $('modelCustom').value;
    fields.storage = $('storage').value;
    return { version:1, fields };
  }
  function restore(snapshotData) {
    if (!snapshotData || snapshotData.version !== 1 || typeof snapshotData.fields !== 'object' || !snapshotData.fields) throw new Error('Unrecognised comparison');
    const data = snapshotData.fields;
    stopLookup();
    $('brand').value = Object.hasOwn(catalogue, data.brand) || data.brand === 'Other' ? data.brand : '';
    populateModels();
    if ($('brand').value === 'Other') $('modelCustom').value = String(data.modelCustom || '').slice(0,120);
    else {
      $('model').value = String(data.model || '');
      populateStorage();
    }
    $('storage').value = String(data.storage || '');
    optionIDs.forEach(id => {
      if (Object.hasOwn(data,id) && typeof data[id] === 'string') $(id).value = data[id].slice(0,24);
    });
    toggleIDs.forEach(id => { if (typeof data[id] === 'boolean') $(id).checked = data[id]; });
    ['hasBonusA','hasUpfront','hasBonusB'].forEach(id => {
      const target = { hasBonusA:'bonusFieldA',hasUpfront:'upfrontField',hasBonusB:'bonusFieldB' }[id];
      $(target).classList.toggle('show', $(id).checked);
    });
    $('dataA').disabled = $('unlimitedA').checked;
    $('dataB').disabled = $('unlimitedB').checked;
    $('priceStatus').className='price-status';
    priceHint();
    syncProgress(false);
  }
  function actionStatus(message) { $('actionStatus').textContent = message; }
  function saveComparison() {
    try {
      localStorage.setItem('phone-comparison-v1', JSON.stringify(snapshot()));
      actionStatus('Comparison saved in this browser.');
    } catch (_) { actionStatus('This browser blocked local storage. Try Share instead.'); }
  }
  function loadComparison() {
    try {
      const stored = localStorage.getItem('phone-comparison-v1');
      if (!stored) return actionStatus('No saved comparison found in this browser.');
      restore(JSON.parse(stored));
      actionStatus('Saved comparison restored.');
    } catch (_) { actionStatus('The saved comparison could not be restored.'); }
  }
  async function shareComparison() {
    const url = new URL(window.location.href);
    url.searchParams.set('comparison', JSON.stringify(snapshot()));
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      actionStatus('Shareable comparison link copied to clipboard.');
    } catch (_) {
      $('shareLink').hidden = false;
      $('shareLink').value = link;
      $('shareLink').select();
      actionStatus('Copy the link shown below to share your comparison.');
    }
  }

  $('brand').addEventListener('change', () => { invalidatePhone(); $('modelCustom').value=''; populateModels(); syncProgress(false); });
  $('model').addEventListener('change', () => { invalidatePhone(); populateStorage(); syncProgress(false); });
  $('modelCustom').addEventListener('input', () => syncProgress(false));
  $('modelCustom').addEventListener('change', () => {
    if (currentCustom !== $('modelCustom').value) { stopLookup(); currentCustom = $('modelCustom').value; }
    syncProgress(false);
  });
  $('storage').addEventListener('change', () => { invalidatePhone(); syncProgress(false); });
  $('lookupPrice').addEventListener('click', lookupPhonePrice);
  optionIDs.forEach(id => {
    $(id).addEventListener('input', () => syncProgress(false));
    $(id).addEventListener('change', () => syncProgress(false));
  });
  ['paymentIncludesPlan','paymentPhoneOnly'].forEach(id => $(id).addEventListener('change', () => syncProgress(false)));
  [['hasBonusA','bonusFieldA'],['hasUpfront','upfrontField'],['hasBonusB','bonusFieldB']].forEach(([toggle,field]) =>
    $(toggle).addEventListener('change', () => syncToggle(toggle,field)));
  [['unlimitedA','dataA'],['unlimitedB','dataB']].forEach(([toggle,field]) =>
    $(toggle).addEventListener('change', () => syncUnlimited(toggle,field)));
  $('saveComparison').addEventListener('click',saveComparison);
  $('loadComparison').addEventListener('click',loadComparison);
  $('shareComparison').addEventListener('click',shareComparison);
  $('catalogueUpdated').textContent = 'Phone catalogue refreshed ' + window.PHONE_CATALOGUE.updatedAt + '. Availability varies by retailer.';
  populateModels();
  priceHint();
  try {
    const shared = new URLSearchParams(window.location.search).get('comparison');
    if (shared && shared.length < 5000) { restore(JSON.parse(shared)); actionStatus('Shared comparison loaded.'); }
  } catch (_) { actionStatus('The shared comparison link is invalid.'); }
  syncProgress(false);
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
})();
