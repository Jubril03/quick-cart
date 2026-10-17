# 🛒 QuickCart: AI Supermarket Order Bot

**Turn handwritten grocery lists, receipts, and messy Pidgin/English texts into confirmed shopping carts in seconds.**

🔗 **Live demo:** https://quick-cart-ggpt.onrender.com/

---

## The Problem

In Nigerian supermarkets, many shoppers don't browse e-commerce apps with dozens of filters. They walk in with a torn page from a notebook, a crumpled receipt, or a WhatsApp message like *"2 bag of rice, tin tomato, spag"*. Slang, irregular handwriting, and photo glare break normal keyword search, and typing 20 items into a small phone screen takes too long.

## The Solution

QuickCart lets a customer **snap a photo or type a messy list**. A multimodal AI model reads it, the app matches each item to the store's verified catalog, and the customer gets an itemized bill in Naira (₦). One tap then sends the order to the store manager on WhatsApp.

## Features

- 📸 **Multimodal input:** photo of a handwritten list, uploaded image, or typed text
- 🧠 **Colloquial understanding:** maps slang like "spag" or "tin tomato" to real products
- 🧾 **Verified pricing:** the AI never calculates money; prices come from the catalog
- ✏️ **Review and edit stage:** quantity steppers, add, remove, or swap items before confirming
- 📍 **Delivery zones:** Moniya pickup or delivery across Ibadan zones, with a fee calculator
- 💬 **WhatsApp checkout:** pre-filled order message sent to the store, including location
- 🛠️ **Store admin dashboard:** order status pipeline (Received → Packing → Ready / Out for Delivery → Delivered)
- 🔔 **Audio and browser alerts:** Web Audio chime and notification when an order changes status
- 📴 **Offline fallback:** client-side regex and fuzzy matching for typed lists when the network is poor

## How It Works

```
[Photo / Text input]
        │  (Base64 JPEG or text)
        ▼
[/api/parse backend]
        │
        ├─► Gemini multimodal model (gemini-2.5-flash)
        │     • reads handwriting and receipts
        │     • extracts items with strict JSON schema
        │       (itemName, quantity, unit, notes)
        │
        ├─► Catalog matcher
        │     • exact SKU / alias match
        │     • fuzzy fallback (Levenshtein / token distance)
        │
        └─► Itemized ₦ bill + delivery zone fee
```

**Design principle:** the AI only *reads*. Everything involving money is deterministic code, so the app cannot invent a price or a total.

## Tech Stack

- **Frontend:** React + TypeScript
- **Backend:** Express (`server.ts`); `api/parse.ts` also runs as a Vercel serverless function
- **AI:** Google Gen AI SDK, Gemini 2.5 Flash (multimodal, structured JSON output)
- **Hosting:** Render
- **Catalog:** static TypeScript SKU database with Naira prices and aliases

## Project Structure

```
├── api/
│   └── parse.ts               # Multimodal AI parser (Vercel serverless & Express)
├── src/
│   ├── catalogData.ts         # SKU database with Naira prices & aliases
│   ├── locationData.ts        # Moniya store, Ibadan delivery zones, fee calculator
│   ├── types.ts               # TypeScript interfaces for orders, items, status
│   ├── components/
│   │   ├── OrderTimeline.tsx     # Order lifecycle stepper & status pills
│   │   └── NotificationToast.tsx # Web Audio chime & browser notifications
│   ├── utils/
│   │   ├── imageHelper.ts     # Image pre-processing & sample test receipts
│   │   └── geocodeHelper.ts   # GPS coordinates → Ibadan zones
│   └── App.tsx                # App state, tab switcher & WhatsApp dispatch
├── server.ts                  # Local Express dev server mounting /api/parse
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
git clone https://github.com/Jubril03/quick-cart.git
cd quick-cart
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

> Never commit your `.env` file or expose your API key in frontend code.

### Run Locally

```bash
npm run dev
```

Then open the local URL shown in your terminal.

## Usage

1. Open the app and upload a photo of a grocery list, or type one (try a sample list).
2. Click **Scan & Generate Instant Bill**.
3. Review the parsed items and adjust quantities.
4. Choose **pickup** (Moniya store) or **delivery** (Ibadan zone).
5. Click **Confirm Order** to send the order to the store on WhatsApp.
6. Store staff track and update the order status in the admin view.

## Delivery Zones

| Zone | Area |
|------|------|
| 1 | Moniya Central & Akinyele |
| 2 | Ojoo, Shasha & Akingbile |
| 3 | University of Ibadan (UI) & Agbowo |
| 4 | Bodija Market area & Secretariat |
| 5 | Dugbe Commercial District & Challenge / Ring Road |

Expanding to a new city only requires updating `locationData.ts` with store coordinates and zone radii.

## Current Limitations

This is a prototype. Honest notes on what's next:

- Orders are not yet saved in a database (a DB such as Supabase or Postgres is the next step)
- The catalog is a static file, not yet editable by the store owner from the dashboard
- Admin access is demo-level protection; production needs server-side authentication
- Image reading requires the AI API; offline fallback works for typed text only
- Payment is by bank transfer or POS on delivery; online payment (Paystack/Flutterwave) is planned

## Roadmap

- [ ] Persistent order storage and real-time sync between customer and admin
- [ ] Owner-editable catalog and inventory
- [ ] Official WhatsApp Business API integration
- [ ] Online payments (Paystack / Flutterwave)
- [ ] Voice-note grocery lists
- [ ] POS and inventory system integration
- [ ] More cities and stores

## Contributing

Contributions are welcome, especially for Hacktoberfest. Fork the repo, create a branch, make your changes, and open a pull request. Issues and ideas are also appreciated.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Jubril03

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Built for the Hacktoberfest 2026 Open-Source AI Challenge 🇳🇬
