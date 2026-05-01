# Shiphit Chatbot Widget

A floating, embeddable chatbot for [Shiphit.com](https://www.shiphit.com) that helps visitors get quick answers about international shipping rates, delivery times, and terms & conditions.

---

## Project Structure

```
shiphit-chatbot/
├── index.html     ← Demo page (the chatbot embedded on a sample site)
├── chatbot.js     ← All bot logic + UI (the embeddable script)
├── chatbot.css    ← Widget styles (auto-loaded by chatbot.js)
├── data.js        ← Static data: rates, T&Cs, FAQs, delivery times
└── README.md      ← This file
```

**The data is fully separated from the logic.** You can update any rate, T&C, or delivery estimate by editing `data.js` alone — no code changes needed.

---

## How to Embed on Any Site

Add these **two lines** before the closing `</body>` tag of any HTML page:

```html
<script src="data.js"></script>
<script src="chatbot.js"></script>
```

That's it. The widget will appear as a floating button in the bottom-right corner.

> If you host the files on a CDN, replace the relative paths with full URLs:
> ```html
> <script src="https://your-cdn.com/shiphit/data.js"></script>
> <script src="https://your-cdn.com/shiphit/chatbot.js"></script>
> ```

---

## Running Locally

No build step needed. Just open `index.html` in any browser:

```bash
# Option 1 — Python dev server (recommended)
cd shiphit-chatbot
python3 -m http.server 8080
# Open: http://localhost:8080

# Option 2 — VS Code Live Server extension
# Right-click index.html → Open with Live Server

# Option 3 — npx serve
npx serve .
```

---

## Updating the Data

All updates are made in `data.js` only.

### Change a shipping rate

```js
// In data.js → rates.IN
US: {
  slab3: 4600,   // ← change this value for 1–2 kg to USA
}
```

### Add a new destination country

1. Add the country to `supportedCountries`:
   ```js
   { code: "JP", name: "Japan" }
   ```

2. Add a rate row under `rates.IN`:
   ```js
   JP: { slab1: 1400, slab2: 2200, slab3: 3500, slab4: 7000, slab5: 12500, slab6: 22000, slab7: 32000 }
   ```

3. Add a delivery estimate under `deliveryEstimates.IN`:
   ```js
   JP: { min: 4, max: 6 }
   ```

### Add a T&C topic

Add a new entry in `terms`:
```js
warranty: {
  title: "Warranty Disclaimer",
  keywords: ["warranty", "guarantee"],
  body: "Shiphit does not provide product warranties..."
}
```

### Add an FAQ

Push a new object into `faqs`:
```js
{
  keywords: ["invoice", "bill", "receipt"],
  question: "Can I get an invoice?",
  answer: "Yes, invoices are automatically emailed upon booking confirmation."
}
```

---

## What the Bot Can Handle

| Intent | Description |
|---|---|
| **Shipping rate** | Collects origin → destination → weight, returns INR rate + ETA |
| **Delivery time** | Asks destination, returns estimated days |
| **T&C queries** | Keyword-matched: refunds, prohibited items, insurance, claims, customs, packaging |
| **FAQs** | Tracking, pickup, payment, weight limits, size limits |
| **Human handoff** | "Talk to a human" → shows support email and phone |
| **Fallback** | Unknown input → friendly prompt listing available topics |

---

## Test Cases

| From | To | Weight | Expected |
|---|---|---|---|
| India | USA | 1.5 kg | ₹4,600 · 5–7 days |
| India | UAE | 0.3 kg | ₹990 · 2–3 days |
| India | Singapore | 8 kg | ₹10,500 · 3–5 days |
| USA | India | 1 kg | Unsupported origin message |
| India | Japan | 1 kg | Unsupported destination message |
| India | USA | 35 kg | Overweight message |
| India | USA | "abc" | Invalid weight message |

---

## Assumptions & Decisions

- **Rule-based only** — no LLM or external API used. All intent detection is keyword/regex matching.
- **Standard tier only** — service tiers (Express, Priority) are defined in `data.js` but not surfaced in the UI. The multiplier logic is ready to add.
- **Ships from India only** — the bot explicitly checks this and uses the pre-written `fallback.unsupportedOrigin` message verbatim.
- **CSS auto-loaded** — `chatbot.js` injects a `<link>` tag for `chatbot.css` automatically. The host page doesn't need to include it separately.
- **No Shadow DOM** — styles are scoped with the `.shiphit-widget` class prefix to minimise host page conflicts. Shadow DOM can be added as a further isolation step if needed.
- **Typing indicator** — a 700 ms fake "thinking" delay is used before each bot response to feel natural.
- **Mobile responsive** — the panel slides up from the bottom on screens under 480 px width.

---

## Submission Checklist

- [x] Single `<script>` embed (plus `data.js`)
- [x] All four intents: rate, T&C, delivery time, fallback
- [x] Step-by-step conversation flow with state
- [x] Data separated from logic
- [x] Edge cases: unsupported origin, unsupported route, overweight, invalid weight
- [x] Fallback messages used verbatim from `data.js`
- [x] Mobile responsive UI
- [x] Typing indicator
- [x] Human handoff option
- [x] README with embed instructions and data update guide
