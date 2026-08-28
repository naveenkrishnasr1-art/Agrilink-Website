# 🌾 AgriLink — Intelligent Mandi & Farmer Marketplace Platform

AgriLink is an intelligent Mandi and Marketplace platform designed to solve two major problems faced by farmers and Farmer Producer Organizations (FPOs):

1. **Price Blindness & Exploitation:** Farmers often sell immediately post-harvest at distress market lows because they lack visibility into future price trends.
2. **Supply Fragmentation:** Smallholder farmers harvest small quantities, making it difficult to directly supply large corporate or B2B buyers who demand bulk orders.

---

## 🚀 Core Features & Modules

### 1. 📊 Module 01 — AI Price Forecast Engine
- **7-Day Forward Price Modeling:** Predicts price trends for commodities (Onion, Tomato, Potato, Garlic, Soybean, Wheat).
- **Market Advisory Dial:** Animated gauge needle pointing to **SELL** (Harvest Gold `#E8A33D`) vs **HOLD** (Deep Green `#2F6E4F`).
- **Interactive Visualizations:** 14-day historical modal prices + 7-day predicted trajectory curve with upper/lower confidence bands.
- **Actionable Farmer Insights:** Influx disruption alerts, monsoon transit impact, and storage buffer analysis.

### 2. 📦 Module 02 — Bulk Buyer Pooling Engine
- **B2B Bulk Aggregation:** Automatically pools smallholder farmers from regional village clusters (Chandwad, Yeola, Niphad, Sinnar, etc.) to fulfill corporate orders (e.g. 50–500 quintals).
- **Animated Circular Progress Ring:** Visual progress meter (0% to 100%) with gradient fill.
- **Sequential Contributor Pop-in:** Staggered animated farmer cards with soil-brown accent borders (`#8B5E3C`).

### 3. 🌾 Module 03 — Farmer Listing & Sell Desk
- **Farmer Produce Registration:** Enter Farmer Name, Contact, Village, Crop, Quantity in Quintals, and Quality Grade.
- **Instant AI Revenue Forecaster:** Dynamically compares "Sell Today at Spot" vs "7-Day Hold / Pool", calculating potential extra earnings.
- **Digital QR Lot Receipts:** Instantly generates a printable weighbridge dispatch token.
- **Live Integration:** Newly registered farmer lots immediately flow into the Bulk Pooling Engine in real-time.

### 4. ⚡ Supporting Capabilities
- **Live Mandi Ticker Marquee:** Continuous ticker across major APMCs (Lasalgaon, Nashik, Pune, Vashi, Azadpur, Indore) flashing green (`#10B981`) for increases and red (`#EF4444`) for decreases.
- **Connection Health Probe:** Background heartbeat pinging the FastAPI backend at `/health` with automatic fallback to high-fidelity offline simulation.
- **CORS-Enabled FastAPI Backend:** Fully asynchronous, clean Pydantic schemas, and built-in interactive Swagger documentation (`/docs`).

---

## 🛠️ Quick Start Guide

### Step 1: Start the Backend Server
```bash
cd C:\Users\user\.gemini\antigravity-ide\scratch\agrilink
python start_server.py
```
*The FastAPI backend will start on `http://127.0.0.1:8000` with Swagger UI at `http://127.0.0.1:8000/docs`.*

### Step 2: Open the Frontend
Open `index.html` in your web browser or double click `start.bat`.

---

## 🎨 Design System & Color Palette
- **SELL Indicator:** Harvest Gold (`#E8A33D` / `#D97706`)
- **HOLD Indicator:** Deep Green (`#2F6E4F` / `#1B4332`)
- **Card & Gauge Background:** Soft Warm Cream (`#FAF8F5` / `#FBF7EF`)
- **Contributor Row Borders:** Soil Brown (`#8B5E3C`)
- **Price Surges / Dips:** Emerald Green (`#10B981`) / Crimson Red (`#EF4444`)
