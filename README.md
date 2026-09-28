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
- Choosing **Other** turns the model selector into a free-text field
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

Each stage unlocks only after the required inputs from the previous stage are complete. The next section then fades in and scrolls naturally into view.

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
- [ ] Carrier presets for Telekom / Vodafone / O2 and others
- [ ] Shareable comparison links
- [ ] Save / restore comparisons locally
- [ ] Include annual contract price increases
- [ ] PWA / installable mobile experience

---

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
