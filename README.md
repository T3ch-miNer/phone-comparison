<div align="center">

# 📱 Phone Deal Comparator

### Buy it outright, or take the contract? See what actually costs less.

A clean, interactive phone-cost comparison tool that breaks down the **real cost of buying a handset outright + SIM-only plan** versus taking a **phone contract** — including upfront fees, cashback, joining bonuses, data allowance, speed and long-term cost.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-0f6e56?style=for-the-badge&logo=githubpages&logoColor=white)](https://t3ch-miner.github.io/phone-comparison/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

**Built as a practical decision tool — not just a calculator.**

</div>

---

## ✨ Why I built this

Phone deals are deceptively difficult to compare.

A contract can look cheaper because the upfront cost is low, while buying outright can look expensive because the handset price is paid immediately. Add a SIM-only plan, cashback, joining bonuses, contract length, different data allowances and different speeds — and the comparison quickly becomes unclear.

**Phone Deal Comparator** turns all of those inputs into one simple question:

> **Which option gives me the better deal over the period I actually care about?**

Instead of comparing only the headline monthly price, the app calculates the **total cost of ownership**, shows the **monthly average**, highlights the **saving**, checks for a **break-even point**, and explains what you gain or give up between the two mobile plans.

---

## 🚀 What it does

### 01 — Choose the phone

Select the **brand → model → storage** combination you want to compare.

- Brand and model are linked dynamically
- Storage options update based on the selected handset
- Choosing **Other** makes the model and storage optional, so a valid outright price can unlock the comparison
- The app is prepared for an automatic phone-price endpoint
- If no pricing backend is connected, the price-check action falls back to an **idealo.de search** so the user can enter the best delivered price manually

### 02 — Enter both payment options

Compare two real-world purchasing strategies:

**Option A — Buy outright**

`Phone price + SIM-only plan − trade-in / cashback`

**Option B — Phone contract**

`Upfront payment + contract payments + any separate SIM cost − joining bonus / cashback`

The calculation handles:

- One-off handset price
- Monthly SIM-only cost
- Trade-in / cashback
- Contract monthly payment
- Contract duration
- Optional upfront payment
- Joining bonus / cashback
- Contracts where the monthly payment includes the mobile plan
- Contracts where the phone payment and mobile plan are separate

### 03 — Compare the plans, not just the price

Because the cheapest option is not always the best-value option, the app also compares:

- 📶 Monthly data allowance
- ♾️ Unlimited-data plans
- ⚡ Maximum advertised speed
- 💶 Difference in total cost

### 04 — Get a decision summary

The result screen turns the raw numbers into an understandable comparison:

- **Total saving**
- **Average cost per month** for both options
- **Break-even month**, if the cheaper option changes over time
- **Day-one cash requirement**
- **Plan data difference**
- **Plan speed difference**
- An explanation of **what the extra money buys** when the more expensive option includes a stronger mobile plan
- **Interactive cumulative-cost chart** across the comparison period

---

## 🧠 UX approach

One of the main goals of this project was to avoid presenting the user with a large financial form all at once.

The interface therefore uses **progressive disclosure**:

```text
Choose phone
    ↓
Enter payment options
    ↓
Compare plan benefits
    ↓
See the final comparison
```

The payment stage unlocks after the phone and price are valid. Once payment details are entered, the results appear and plan-quality inputs remain optional.

This makes the calculator feel more like a guided decision flow than a spreadsheet.

---

## 📊 How the comparison works

For every month in the selected comparison period, the app builds a cumulative-cost series for both options.

### Buying outright

```text
Month 1:
Phone price
− trade-in / cashback
+ SIM-only monthly cost

Following months:
+ SIM-only monthly cost
```

### Phone contract

```text
Month 1:
Upfront payment
− joining bonus / cashback
+ monthly contract payment
(+ SIM-only cost when the plan is not included)

During contract:
+ monthly contract payment

After contract ends:
+ SIM-only monthly cost
```

The current version treats bonuses and cashback as **full credits against the overall option cost**, rather than limiting them to the upfront payment.

---

## 📈 Example insight

Instead of only displaying:

> Contract: €720  
> Outright: €797

…the app explains the decision more like this:

```text
The contract is €77 cheaper over 24 months.

Contract average:  €29.99 / month
Outright average:  €33.21 / month
Break-even:         No flip

The contract also requires less cash on day one,
provides more monthly data, and offers a higher stated speed.
```

That distinction is important: **price comparison becomes decision support.**

---

## 🛠️ Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Structure | HTML5 | Semantic application layout |
| Styling | CSS3 | Responsive UI, transitions and custom design system |
| Logic | Vanilla JavaScript | Validation, calculations, dynamic controls and UX flow |
| Visualisation | Chart.js | Interactive cumulative-cost chart |
| Typography | Space Grotesk + IBM Plex Mono | Product UI + calculator/ledger visual identity |
| Deployment | GitHub Pages | Lightweight static hosting |

No frontend framework is required — the current application runs as a lightweight single-page static app.

---

## 🎨 Design language

The interface combines a **dark green shell** with warm paper-like panels and restrained teal / amber accents.

The goal was to make the product feel somewhere between:

**a financial ledger × a modern comparison tool × a product configurator**

rather than another generic blue SaaS calculator.

---

## 🧩 Interesting implementation details

<details>
<summary><strong>Dynamic handset selection</strong></summary>
<br>

Phone options are represented as a small client-side catalogue. Selecting a brand populates its available models, and selecting a model populates storage variants.

For devices outside the catalogue, selecting **Other** switches the model field from a dropdown to a text input.

</details>

<details>
<summary><strong>Progressive form validation</strong></summary>
<br>

The next comparison stage remains hidden until the current stage contains the information needed for a meaningful calculation.

This prevents partially completed forms from generating misleading results and reduces visual overload.

</details>

<details>
<summary><strong>Break-even detection</strong></summary>
<br>

The app compares the difference between the two cumulative cost curves month by month. If their ordering changes, the result identifies the approximate month where the cost advantage flips.

</details>

<details>
<summary><strong>Price lookup architecture</strong></summary>
<br>

The frontend is already prepared to request:

```text
GET /api/phone-price?brand=...&model=...&storage=...
```

A future backend can connect this endpoint to an approved product/price data source and return a response such as:

```json
{
  "price": 849.99,
  "source": "Price provider",
  "url": "https://..."
}
```

Until such a backend is connected, the UI falls back to an idealo.de product search and lets the user enter the discovered price manually.

</details>

---

## 🗺️ Roadmap

- [x] Outright vs contract total-cost comparison
- [x] Upfront payment support
- [x] Joining bonus / cashback support
- [x] Trade-in support
- [x] Contract plan included / phone-only payment modes
- [x] Data and speed comparison
- [x] Dynamic brand → model → storage selector
- [x] Custom model input for unsupported brands
- [x] Progressive multi-step UX
- [x] Break-even analysis
- [x] Interactive cumulative-cost chart
- [x] Responsive layout
- [ ] Live handset price API
- [ ] Automatic lowest-price lookup
- [x] Provider selectors for Telekom / Vodafone / O2 / 1&1 (labels only, not tariff feeds)
- [x] Shareable comparison links
- [x] Save / restore comparisons locally
- [x] Optional annual contract and SIM price increases
- [x] PWA manifest and offline shell (installation support varies by browser)

---

---

## ✅ October 2026 improvements

The application now supports:

- **Other phone without a required model or storage**. Choose Other, enter an outright price and continue.
- **Fair comparison horizons**. The chosen period cannot finish before the contract ends.
- **Optional plan quality**. Data and speed are no longer prerequisites for cost results.
- **One-off costs and annual rises**. Enter shipping/connection fees and optional percentage increases. Contract rises only apply to bundled plans. Annual changes start in month 13, repeating in months 25, 37, etc.
- **Safer price lookup**. The static site no longer attempts a non-existent local API endpoint. It opens an idealo search if no endpoint is configured. Backend price data is checked, and displayed text and links are inserted safely.
- **Save, restore and share**. Save one comparison to local browser storage or copy a link encoding the inputs.
- **Offline app shell**. The service worker caches the calculator's own files. Chart.js and external fonts use CDNs, so the interactive chart may be unavailable offline. Summary calculations remain available.
- **Automated financial tests**. Run `node --test tests/calculator.test.js` with Node.js 18 or later.

### Code layout

```text
index.html                 Interface, CSS and semantic markup
js/catalogue.js            Curated handset models and storage variants
js/calculator.js           Pure, testable financial calculations
js/app.js                  Input validation, price lookup, UI and sharing
tests/calculator.test.js   Unit tests with Node's built-in test runner
app.webmanifest            PWA metadata
service-worker.js          App-shell offline cache
icons/phone.svg            SVG app icon
```

### Curated phone catalogue

The handset selector is maintained manually and was refreshed on **18 October 2026**, including iPhone 18 Pro/Pro Max, Google Pixel 11 family, Galaxy Z Fold8/Flip8, Xiaomi 17 family and selected other models. The catalogue is **not a live inventory database** and does not claim that every colour, capacity or variant is available in every German shop.

The model list was cross-checked against manufacturer information:

- [Apple iPhone model identification](https://support.apple.com/de-de/108044)
- [Samsung Galaxy S26 specifications](https://www.samsung.com/de/smartphones/galaxy-s26-ultra/specs/)
- [Google Pixel device comparison](https://store.google.com/de/magazine/compare_pixel)
- [Xiaomi 17 specifications](https://www.mi.com/de/product/xiaomi-17/specs/)
- [OnePlus 15](https://www.oneplus.com/de/15)
- [Motorola Razr 70 Ultra](https://www.motorola.com/de/de/p/phones/razr/razr-70-ultra/pmipmjk44m2)

To add a model or capacity, edit `js/catalogue.js`. For an unlisted device, users can always select Other and enter the price manually.

### How future automatic pricing is configured

The GitHub Pages deployment is static and **does not have a live handset-price provider**. To enable an authorised provider later, add an API URL through a meta tag in the document head:

```html
<meta name="phone-price-api" content="https://your-domain.example/api/phone-price">
```

The endpoint must accept `brand`, `model` and `storage` query parameters and return a JSON object with a finite positive `price`, optionally `source` and a verified `url`. Use a server-side proxy for any provider secrets. Do not embed API keys in this static frontend.

### Financial assumptions

- Bonuses and cashback are counted towards the **total cost at month one**, regardless of when the provider actually pays them. Cashback timing, credit approval and trade-in eligibility are not modelled.
- The upfront-cash insight uses the handset or contract upfront price plus fees, **before rebates**.
- If a comparison continues beyond the contract, the contract option switches to the selected SIM-only plan, at its then-assumed cost.
- A 'phone only' instalment is treated as fixed, and the same SIM-only plan is charged on both sides of the comparison.
- All prices are estimates entered by the user. Carrier selections are labels, not real carrier integrations.
- Shared URLs contain the entered amounts and device selections. Do not share a link if you want those inputs kept private.


## 🔮 Planned pricing integration

The long-term goal is to remove one of the last manual steps: entering the outright handset price.

Conceptually:

```text
Brand
  ↓
Model
  ↓
Storage
  ↓
Price API
  ↓
Lowest available handset price
  ↓
Comparison recalculates automatically
```

The frontend already contains the integration point, so a pricing service can be added without redesigning the comparison experience.

> **Note:** the current GitHub Pages deployment is a static frontend. Automatic price retrieval requires a backend/API or an approved external price-data integration.

---

## 💡 What I learned

This project started as a straightforward cost calculator, but iterating on it highlighted an important product lesson:

> **A technically correct calculation is not enough — the user still needs to understand the decision.**

The biggest improvements came from treating the result as an explanation rather than an answer:

- showing total cost **and** monthly average,
- separating upfront cash from long-term cost,
- comparing plan quality alongside price,
- revealing inputs progressively,
- and turning contract incentives into transparent parts of the calculation.

That combination of **logic, UX and data visualisation** is what I wanted this project to demonstrate.

---

## ▶️ Run locally

No build process is required.

```bash
git clone https://github.com/T3ch-miNer/phone-comparison.git
cd phone-comparison
```

Then open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8000
```

Visit:

```text
http://localhost:8000
```

---

## 🌐 Live demo

### 👉 [t3ch-miner.github.io/phone-comparison](https://t3ch-miner.github.io/phone-comparison/)

---

<div align="center">

### Built by Rahul Pushpala

**Data · Analytics · Engineering · Useful little products**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rahul%20Pushpala-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rahulpushpala/)

*If this project helped you make sense of a phone deal, give the repo a ⭐.*

</div>
