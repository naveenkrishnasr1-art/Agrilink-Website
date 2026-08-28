/**
 * AgriLink - Frontend Core Controller
 * Handles AI Forecasting, Dynamic Chart.js visualizations, SVG Needle rotations,
 * Bulk Buyer Pooling, Farmer Produce Listing Desk, and Health Probe.
 */

// Configuration
const API_BASE_URL = "http://127.0.0.1:8000";
let isBackendLive = false;
let currentCrop = "Onion";
let currentForecastChart = null;
let registeredFarmerListings = [];

// DOM Elements
const healthProbeBadge = document.getElementById("healthProbeBadge");
const healthProbeText = document.getElementById("healthProbeText");
const tickerTrack = document.getElementById("tickerTrack");

// Tab Navigation
const tabButtons = document.querySelectorAll(".nav-tab-btn");
const tabPanels = document.querySelectorAll(".tab-content-panel");

// Module 01 DOM Elements
const cropChips = document.querySelectorAll(".crop-chip");
const gaugeNeedleArm = document.getElementById("gaugeNeedleArm");
const actionAdvisoryBox = document.getElementById("actionAdvisoryBox");
const advisoryBadgeText = document.getElementById("advisoryBadgeText");
const advisorySubtext = document.getElementById("advisorySubtext");
const statCurrentPrice = document.getElementById("statCurrentPrice");
const statForecastPrice = document.getElementById("statForecastPrice");
const statPriceDiff = document.getElementById("statPriceDiff");
const statConfidence = document.getElementById("statConfidence");
const statLotGain = document.getElementById("statLotGain");
const statMandiLoc = document.getElementById("statMandiLoc");
const marketDriversGrid = document.getElementById("marketDriversGrid");

// Module 02 DOM Elements
const poolCropSelect = document.getElementById("poolCropSelect");
const poolTargetQtyInput = document.getElementById("poolTargetQtyInput");
const btnTriggerPooling = document.getElementById("btnTriggerPooling");
const progressRingFill = document.getElementById("progressRingFill");
const progressPctText = document.getElementById("progressPctText");
const progressRatioText = document.getElementById("progressRatioText");
const poolStatusBadge = document.getElementById("poolStatusBadge");
const summaryFarmersCount = document.getElementById("summaryFarmersCount");
const summaryContractPayout = document.getElementById("summaryContractPayout");
const summaryFpoCharge = document.getElementById("summaryFpoCharge");
const summaryAvgRadius = document.getElementById("summaryAvgRadius");
const farmerContributorsList = document.getElementById("farmerContributorsList");
const btnOpenContractModal = document.getElementById("btnOpenContractModal");

// Module 03 DOM Elements
const farmerListingForm = document.getElementById("farmerListingForm");
const farmerNameInput = document.getElementById("farmerNameInput");
const farmerPhoneInput = document.getElementById("farmerPhoneInput");
const farmerVillageInput = document.getElementById("farmerVillageInput");
const farmerCropSelect = document.getElementById("farmerCropSelect");
const farmerQtyInput = document.getElementById("farmerQtyInput");
const farmerGradeSelect = document.getElementById("farmerGradeSelect");
const farmerTargetPriceInput = document.getElementById("farmerTargetPriceInput");
const intentChips = document.querySelectorAll(".intent-chip");
let selectedIntent = "POOL";

const calcPreviewQty = document.getElementById("calcPreviewQty");
const calcPreviewCrop = document.getElementById("calcPreviewCrop");
const calcTodayValue = document.getElementById("calcTodayValue");
const calcTodayRate = document.getElementById("calcTodayRate");
const calcFutureValue = document.getElementById("calcFutureValue");
const calcFutureRate = document.getElementById("calcFutureRate");
const calcGainCallout = document.getElementById("calcGainCallout");
const registeredFarmersList = document.getElementById("registeredFarmersList");
const registeredCountBadge = document.getElementById("registeredCountBadge");

// Modals
const receiptModal = document.getElementById("receiptModal");
const closeReceiptModalBtn = document.getElementById("closeReceiptModalBtn");
const receiptDetailsList = document.getElementById("receiptDetailsList");
const receiptQrCode = document.getElementById("receiptQrCode");

const contractModal = document.getElementById("contractModal");
const closeContractModalBtn = document.getElementById("closeContractModalBtn");
const contractModalDetails = document.getElementById("contractModalDetails");
const btnConfirmContractCommit = document.getElementById("btnConfirmContractCommit");

const pitchModal = document.getElementById("pitchModal");
const btnPitchModalOpen = document.getElementById("btnPitchModalOpen");
const closePitchModalBtn = document.getElementById("closePitchModalBtn");
const toast = document.getElementById("toastNotification");

// =========================================================================
// 1. Connection Health Probe & Ticker Loader
// =========================================================================

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    if (response.ok) {
      const data = await response.json();
      isBackendLive = true;
      healthProbeBadge.className = "health-probe-badge live";
      healthProbeText.innerHTML = `Backend: Live (FastAPI :8000)`;
    } else {
      throw new Error("Backend response not ok");
    }
  } catch (error) {
    isBackendLive = false;
    healthProbeBadge.className = "health-probe-badge preview";
    healthProbeText.innerHTML = `Preview Mode (Local Engine)`;
  }
}

// Initial health check and 3-second recurring probe
checkBackendHealth();
setInterval(checkBackendHealth, 3000);

async function loadLiveMandiTicker() {
  try {
    let tickerData = [];
    if (isBackendLive) {
      const res = await fetch(`${API_BASE_URL}/api/mandi-ticker`);
      if (res.ok) tickerData = await res.json();
    }
    
    if (!tickerData || tickerData.length === 0) {
      // High-fidelity fallback
      tickerData = [
        { mandi: "Lasalgaon APMC", crop: "Red Onion", icon: "🧅", price: 2380, change_pct: 5.3, direction: "UP" },
        { mandi: "Nashik APMC", crop: "Table Tomato", icon: "🍅", price: 1750, change_pct: -4.8, direction: "DOWN" },
        { mandi: "Pune APMC", crop: "Pukhraj Potato", icon: "🥔", price: 1440, change_pct: 2.5, direction: "UP" },
        { mandi: "Vashi APMC", crop: "Ooty Garlic", icon: "🧄", price: 9550, change_pct: 3.8, direction: "UP" },
        { mandi: "Indore APMC", crop: "Yellow Soybean", icon: "🌱", price: 4620, change_pct: -1.7, direction: "DOWN" },
        { mandi: "Azadpur APMC", crop: "Sharbati Wheat", icon: "🌾", price: 2860, change_pct: 1.4, direction: "UP" }
      ];
    }

    // Render duplicated track items for smooth infinite loop
    let html = "";
    [...tickerData, ...tickerData].forEach(item => {
      const isUp = item.direction === "UP" || item.change_pct >= 0;
      html += `
        <div class="ticker-item">
          <span>${item.icon || '🌾'} <strong>${item.mandi}</strong> (${item.crop}): <strong>₹${item.price.toLocaleString()}/Qtl</strong></span>
          <span class="ticker-change ${isUp ? 'up' : 'down'}">${isUp ? '▲ +' : '▼ '}${item.change_pct}%</span>
        </div>
      `;
    });
    tickerTrack.innerHTML = html;
  } catch (e) {
    console.warn("Ticker load exception:", e);
  }
}
loadLiveMandiTicker();

// =========================================================================
// 2. Tab Navigation Handling
// =========================================================================

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    const targetTabId = btn.getAttribute("data-tab");
    const targetPanel = document.getElementById(targetTabId);
    if (targetPanel) targetPanel.classList.add("active");

    // If switching to forecast tab, re-render chart to ensure proper dimensions
    if (targetTabId === "forecast-tab" && currentForecastChart) {
      currentForecastChart.resize();
    }
  });
});

// =========================================================================
// 3. Module 01: AI Price Forecast Engine
// =========================================================================

async function fetchPricePrediction(cropName, customQty = 25) {
  try {
    let data = null;
    if (isBackendLive) {
      const res = await fetch(`${API_BASE_URL}/api/price-prediction?crop=${cropName}&qty=${customQty}`);
      if (res.ok) data = await res.json();
    }

    if (!data) {
      data = generateFallbackPrediction(cropName, customQty);
    }

    renderForecastData(data);
  } catch (err) {
    console.error("Error fetching price prediction:", err);
    const data = generateFallbackPrediction(cropName, customQty);
    renderForecastData(data);
  }
}

function renderForecastData(data) {
  // 1. Update Gauge Needle and Advisory
  const angle = data.gauge_angle || (data.recommendation_type === "HOLD" ? 65 : -65);
  gaugeNeedleArm.style.transform = `translateX(-50%) rotate(${angle}deg)`;

  const isHold = data.recommendation_type === "HOLD";
  actionAdvisoryBox.className = `action-advisory-box ${isHold ? 'hold' : 'sell'}`;
  advisoryBadgeText.textContent = `RECOMMENDATION: ${data.recommendation}`;
  advisorySubtext.textContent = data.advisory_rationale;

  // 2. Update Stats Grid
  statCurrentPrice.textContent = `₹${data.current_modal_price.toLocaleString()}`;
  statForecastPrice.textContent = `₹${data.predicted_price_7_days.toLocaleString()}`;
  statMandiLoc.textContent = `${data.crop_display_name} Spot`;
  statConfidence.textContent = `${data.confidence_score}%`;

  const isPos = data.price_diff_percent >= 0;
  statPriceDiff.className = `stat-delta ${isPos ? 'positive' : 'negative'}`;
  statPriceDiff.textContent = `${isPos ? '▲ +' : '▼ '}₹${Math.abs(data.price_diff_per_qtl)} / Qtl (${data.price_diff_percent > 0 ? '+' : ''}${data.price_diff_percent}%)`;

  const calc = data.farmer_lot_calculator;
  statLotGain.textContent = `${calc.net_gain_or_loss >= 0 ? '+₹' : '-₹'}${Math.abs(calc.net_gain_or_loss).toLocaleString()}`;
  statLotGain.style.color = calc.net_gain_or_loss >= 0 ? "var(--color-hold)" : "var(--color-sell)";

  // 3. Render Market Drivers
  if (data.market_drivers && data.market_drivers.length > 0) {
    marketDriversGrid.innerHTML = data.market_drivers.map(d => {
      const isBull = d.signal === "BULLISH";
      const isBear = d.signal === "BEARISH";
      const icon = isBull ? "📈" : isBear ? "📉" : "⚖️";
      return `
        <div class="driver-pill">
          <div class="driver-icon">${icon}</div>
          <div class="driver-info">
            <h4>${d.factor}</h4>
            <p>${d.impact}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Render 21-Day Chart
  renderChartVisuals(data.historical_prices, data.projected_prices, data.crop_display_name);
}

function renderChartVisuals(history, forecast, cropName) {
  const ctx = document.getElementById("forecastChartCanvas").getContext("2d");

  // Combine dates and price points
  const labels = [];
  const historicalData = [];
  const forecastData = [];
  const upperBounds = [];
  const lowerBounds = [];

  history.forEach(item => {
    labels.push(item.date);
    historicalData.push(item.price);
    forecastData.push(null);
    upperBounds.push(null);
    lowerBounds.push(null);
  });

  // Connect forecast seamlessly to the last historical point
  const lastHistPrice = history[history.length - 1].price;
  forecastData[forecastData.length - 1] = lastHistPrice;
  upperBounds[upperBounds.length - 1] = lastHistPrice;
  lowerBounds[lowerBounds.length - 1] = lastHistPrice;

  forecast.forEach(item => {
    labels.push(item.date);
    historicalData.push(null);
    forecastData.push(item.predicted_price);
    upperBounds.push(item.upper_bound);
    lowerBounds.push(item.lower_bound);
  });

  if (currentForecastChart) {
    currentForecastChart.destroy();
  }

  currentForecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "14-Day Historical Modal Price",
          data: historicalData,
          borderColor: "#2D6A4F",
          backgroundColor: "rgba(45, 106, 79, 0.08)",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#1B4332"
        },
        {
          label: "7-Day AI Predicted Trajectory",
          data: forecastData,
          borderColor: "#E6A23C",
          borderWidth: 3.5,
          borderDash: [6, 6],
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: "#D97706",
          pointHoverRadius: 7
        },
        {
          label: "Upper Confidence Envelope",
          data: upperBounds,
          borderColor: "rgba(230, 162, 60, 0.3)",
          borderWidth: 1,
          pointRadius: 0,
          fill: "+1",
          backgroundColor: "rgba(230, 162, 60, 0.15)"
        },
        {
          label: "Lower Confidence Envelope",
          data: lowerBounds,
          borderColor: "rgba(230, 162, 60, 0.3)",
          borderWidth: 1,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: { size: 11, family: "Plus Jakarta Sans", weight: "600" },
            boxWidth: 14,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.raw === null) return "";
              return ` ${context.dataset.label}: ₹${context.raw.toLocaleString()}/Qtl`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: value => `₹${value.toLocaleString()}`,
            font: { size: 11 }
          },
          grid: { color: "rgba(226, 232, 240, 0.6)" }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

// Crop Selector Chip Click Handlers
cropChips.forEach(chip => {
  chip.addEventListener("click", () => {
    cropChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentCrop = chip.getAttribute("data-crop");
    fetchPricePrediction(currentCrop);
    
    // Sync dropdowns
    if (poolCropSelect) poolCropSelect.value = currentCrop;
    if (farmerCropSelect) farmerCropSelect.value = currentCrop;
    updateLiveProfitCalculator();
  });
});

// =========================================================================
// 4. Module 02: Bulk Buyer Pooling Engine
// =========================================================================

async function fetchMarketplacePool(cropName, targetQty) {
  try {
    let data = null;
    if (isBackendLive) {
      const res = await fetch(`${API_BASE_URL}/api/marketplace/pool?crop=${cropName}&target_qty=${targetQty}`);
      if (res.ok) data = await res.json();
    }

    if (!data) {
      data = generateFallbackPoolData(cropName, targetQty);
    }

    renderMarketplacePool(data);
  } catch (err) {
    console.error("Error pooling:", err);
    const data = generateFallbackPoolData(cropName, targetQty);
    renderMarketplacePool(data);
  }
}

function renderMarketplacePool(data) {
  // 1. Animate Circular Progress Ring
  const totalCircumference = 2 * Math.PI * 90; // r=90 => ~565.48
  const pct = Math.min(Math.max(data.progress_percentage, 0), 100);
  const strokeOffset = totalCircumference - (pct / 100) * totalCircumference;
  
  progressRingFill.style.strokeDashoffset = strokeOffset;
  progressPctText.textContent = `${pct}%`;
  progressRatioText.textContent = `${data.total_pooled_qty_quintals} / ${data.target_qty_quintals} Qtl`;

  poolStatusBadge.textContent = data.contract_status;
  poolStatusBadge.className = `card-badge ${data.is_fulfilled ? 'green' : 'gold'}`;

  // 2. Financial Summary
  summaryFarmersCount.textContent = data.contributing_farmers_count;
  summaryContractPayout.textContent = `₹${(data.financial_summary.total_contract_value / 100000).toFixed(2)}L`;
  summaryFpoCharge.textContent = `₹${data.financial_summary.fpo_service_charge.toLocaleString()}`;
  summaryAvgRadius.textContent = `${data.logistics_summary.average_transit_radius_km} km`;

  // 3. Sequential Staggered Contributor Farmer List
  farmerContributorsList.innerHTML = "";
  data.contributing_farmers.forEach((farmer, idx) => {
    const row = document.createElement("div");
    row.className = `farmer-row-card ${farmer.is_new_user ? 'highlight-user' : ''}`;
    row.style.animationDelay = `${idx * 140}ms`;

    row.innerHTML = `
      <div class="farmer-profile-info">
        <div class="farmer-avatar">${farmer.name.charAt(0)}</div>
        <div class="farmer-meta">
          <h4>
            ${farmer.name}
            ${farmer.is_new_user ? '<span class="verified-fpo-badge" title="Registered by you">🌟 Newly Added</span>' : '<span class="verified-fpo-badge" title="FPO Verified">✓</span>'}
          </h4>
          <div class="farmer-sub-details">
            <span class="village-tag">📍 ${farmer.village} (${farmer.distance_km} km)</span>
            <span>Grade: <strong>${farmer.quality_grade || 'Grade A'}</strong></span>
            <span>${farmer.phone_masked}</span>
          </div>
        </div>
      </div>
      <div class="farmer-qty-pricing">
        <div class="farmer-qty-badge">${farmer.qty_quintals} Qtl</div>
        <div class="farmer-payout-est">Est. Payout: ₹${farmer.estimated_payout.toLocaleString()}</div>
      </div>
    `;

    farmerContributorsList.appendChild(row);
  });
}

btnTriggerPooling.addEventListener("click", () => {
  const crop = poolCropSelect.value;
  const target = parseFloat(poolTargetQtyInput.value) || 50;
  showToast(`⚡ Running batch aggregation for ${target} Qtl of ${crop}...`);
  fetchMarketplacePool(crop, target);
});

// =========================================================================
// 5. Module 03: Farmer Listing & Direct Sell Desk
// =========================================================================

// Intent chips toggle
intentChips.forEach(chip => {
  chip.addEventListener("click", () => {
    intentChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectedIntent = chip.getAttribute("data-intent");
    updateLiveProfitCalculator();
  });
});

// Live input listener to update AI profit calculation
[farmerQtyInput, farmerCropSelect].forEach(el => {
  el.addEventListener("input", updateLiveProfitCalculator);
  el.addEventListener("change", updateLiveProfitCalculator);
});

function updateLiveProfitCalculator() {
  const qty = parseFloat(farmerQtyInput.value) || 10;
  const crop = farmerCropSelect.value;
  
  calcPreviewQty.textContent = qty;
  calcPreviewCrop.textContent = crop;

  const baselinePrices = {
    Onion: 2350,
    Tomato: 1780,
    Potato: 1420,
    Garlic: 9400,
    Soybean: 4650,
    Wheat: 2840
  };

  const trends = {
    Onion: 1.14,
    Tomato: 0.88,
    Potato: 1.06,
    Garlic: 1.11,
    Soybean: 0.96,
    Wheat: 1.03
  };

  const basePrice = baselinePrices[crop] || 2350;
  const multiplier = trends[crop] || 1.10;
  const futurePrice = Math.round(basePrice * multiplier);

  const todayTotal = Math.round(basePrice * qty);
  const futureTotal = Math.round(futurePrice * qty);
  const diff = futureTotal - todayTotal;

  calcTodayValue.textContent = `₹${todayTotal.toLocaleString()}`;
  calcTodayRate.textContent = `@ ₹${basePrice.toLocaleString()}/Qtl`;
  calcFutureValue.textContent = `₹${futureTotal.toLocaleString()}`;
  calcFutureRate.textContent = `@ ₹${futurePrice.toLocaleString()}/Qtl`;

  if (diff >= 0) {
    calcGainCallout.innerHTML = `
      <span>🌟</span>
      <div>
        <strong>Recommendation:</strong> Holding or pooling your ${qty} quintals is projected to yield an extra <strong>+₹${diff.toLocaleString()} (+${((diff/todayTotal)*100).toFixed(1)}%)</strong> in net profit!
      </div>
    `;
    calcGainCallout.style.background = "rgba(45, 106, 79, 0.3)";
    calcGainCallout.style.borderColor = "rgba(82, 183, 136, 0.5)";
  } else {
    calcGainCallout.innerHTML = `
      <span>⚠️</span>
      <div>
        <strong>Recommendation:</strong> Mandi prices for ${crop} are projected to slide. Selling today secures current high rates and prevents an estimated loss of <strong>-₹${Math.abs(diff).toLocaleString()}</strong>.
      </div>
    `;
    calcGainCallout.style.background = "rgba(217, 119, 6, 0.25)";
    calcGainCallout.style.borderColor = "rgba(230, 162, 60, 0.5)";
  }
}

farmerListingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    farmer_name: farmerNameInput.value.trim(),
    phone: farmerPhoneInput.value.trim(),
    village: farmerVillageInput.value.trim(),
    crop: farmerCropSelect.value,
    quantity_quintals: parseFloat(farmerQtyInput.value),
    quality_grade: farmerGradeSelect.value,
    expected_price_per_qtl: parseFloat(farmerTargetPriceInput.value) || null,
    action_intent: selectedIntent
  };

  let responseData = null;

  try {
    if (isBackendLive) {
      const res = await fetch(`${API_BASE_URL}/api/farmer/listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        responseData = await res.json();
      }
    }
  } catch (err) {
    console.warn("Backend submit error, using local generator:", err);
  }

  if (!responseData) {
    responseData = {
      lot_id: `LOT-${new Date().getMonth()+1}${new Date().getDate()}-${Math.floor(1000 + Math.random()*9000)}`,
      digital_receipt: {
        token: `AGRI-TOKEN-${Math.floor(100000 + Math.random()*900000)}`,
        farmer_name: payload.farmer_name,
        village: payload.village,
        crop: payload.crop,
        qty_quintals: payload.quantity_quintals,
        grade: payload.quality_grade,
        hub_routing: "Lasalgaon FPO Collection Centre #3",
        dispatch_slot: "Tomorrow, 07:00 AM - 11:00 AM"
      }
    };
  }

  // Register locally and in registered lots feed
  registeredFarmerListings.unshift(payload);
  renderRegisteredLotsFeed();

  // Show Receipt Modal
  showReceiptModal(responseData.digital_receipt, payload);

  // Automatically refresh the Bulk Pooling tab with the newly added farmer lot
  fetchMarketplacePool(payload.crop, parseFloat(poolTargetQtyInput.value) || 50);

  showToast(`✅ Produce lot registered for ${payload.farmer_name}! Added to Bulk Pool.`);
});

function renderRegisteredLotsFeed() {
  registeredCountBadge.textContent = `${registeredFarmerListings.length} Registered Lots`;
  
  if (registeredFarmerListings.length === 0) return;

  registeredFarmersList.innerHTML = registeredFarmerListings.map(item => `
    <div class="farmer-row-card highlight-user" style="opacity: 1; transform: none; margin-bottom: 8px;">
      <div class="farmer-profile-info">
        <div class="farmer-avatar">${item.farmer_name.charAt(0)}</div>
        <div class="farmer-meta">
          <h4>${item.farmer_name} <span class="verified-fpo-badge">🌟 Registered</span></h4>
          <div class="farmer-sub-details">
            <span class="village-tag">📍 ${item.village}</span>
            <span>${item.crop} (${item.quality_grade})</span>
          </div>
        </div>
      </div>
      <div class="farmer-qty-pricing">
        <div class="farmer-qty-badge">${item.quantity_quintals} Qtl</div>
        <div class="farmer-payout-est">Status: Ready for Weighbridge</div>
      </div>
    </div>
  `).join('');
}

function showReceiptModal(receipt, payload) {
  receiptQrCode.textContent = receipt.token;
  receiptDetailsList.innerHTML = `
    <div class="receipt-row">
      <span class="receipt-row-label">Farmer Name</span>
      <span class="receipt-row-value">${payload.farmer_name}</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Village / Hub</span>
      <span class="receipt-row-value">${payload.village}</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Commodity & Grade</span>
      <span class="receipt-row-value">${payload.crop} (${payload.quality_grade})</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Committed Volume</span>
      <span class="receipt-row-value">${payload.quantity_quintals} Quintals (${payload.quantity_quintals * 100} kg)</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Collection Depot</span>
      <span class="receipt-row-value">${receipt.hub_routing}</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Weighbridge Time Slot</span>
      <span class="receipt-row-value">${receipt.dispatch_slot}</span>
    </div>
  `;
  receiptModal.classList.add("open");
}

closeReceiptModalBtn.addEventListener("click", () => receiptModal.classList.remove("open"));

// =========================================================================
// 6. Modals & Pitch Guide Handlers
// =========================================================================

btnOpenContractModal.addEventListener("click", () => {
  const crop = poolCropSelect.value;
  const target = poolTargetQtyInput.value;
  contractModalDetails.innerHTML = `
    <div class="receipt-row">
      <span class="receipt-row-label">Contract Reference</span>
      <span class="receipt-row-value">FPO-BATCH-${Math.floor(100000 + Math.random()*900000)}</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Corporate Procurement Buyer</span>
      <span class="receipt-row-value">AgroCorp Direct Exports Ltd.</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Commodity Batch</span>
      <span class="receipt-row-value">${crop} (Target: ${target} Quintals)</span>
    </div>
    <div class="receipt-row">
      <span class="receipt-row-label">Escrow Settlement Terms</span>
      <span class="receipt-row-value">48-Hr Direct Bank Transfer (DBT)</span>
    </div>
  `;
  contractModal.classList.add("open");
});

closeContractModalBtn.addEventListener("click", () => contractModal.classList.remove("open"));

btnConfirmContractCommit.addEventListener("click", () => {
  contractModal.classList.remove("open");
  showToast("🤝 Smart Contract Committed & Escrow Locked!");
});

// Pitch Guide Modal
btnPitchModalOpen.addEventListener("click", () => pitchModal.classList.add("open"));
closePitchModalBtn.addEventListener("click", () => pitchModal.classList.remove("open"));

// Toast utility
function showToast(msg) {
  toast.querySelector("#toastMsg").textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// =========================================================================
// 7. High-Fidelity Fallback Simulators (Ensures demo never breaks)
// =========================================================================

function generateFallbackPrediction(crop, qty) {
  const meta = {
    Onion: { price: 2350, trend: 1.14, rec: "STRONG HOLD", type: "HOLD", conf: 92.4, rationale: "Arrivals in Lasalgaon dropped ~18% due to transit disruptions. Holding stock 4-6 days yields +₹320/Qtl." },
    Tomato: { price: 1780, trend: 0.88, rec: "SELL IMMEDIATELY", type: "SELL", conf: 89.1, rationale: "Southern arrivals flooding local mandis. Perishability risk warrants immediate selling." },
    Potato: { price: 1420, trend: 1.06, rec: "HOLD", type: "HOLD", conf: 94.0, rationale: "Sturdy demand from industrial chip processors. Stagger sales over 7 days." },
    Garlic: { price: 9400, trend: 1.11, rec: "STRONG HOLD", type: "HOLD", conf: 95.2, rationale: "Culinary demand surge and low sowing acreage carryover driving high forward bids." },
    Soybean: { price: 4650, trend: 0.96, rec: "SELL", type: "SELL", conf: 88.7, rationale: "Import duty adjustments softening crushing mill spot purchases." },
    Wheat: { price: 2840, trend: 1.03, rec: "HOLD", type: "HOLD", conf: 91.5, rationale: "Balanced market with steady institutional procurement quota." }
  }[crop] || { price: 2350, trend: 1.14, rec: "HOLD", type: "HOLD", conf: 90.0, rationale: "Optimal market conditions." };

  const baseline = meta.price;
  const pred = Math.round(baseline * meta.trend);
  const diff = pred - baseline;
  const pct = Math.round(((pred - baseline)/baseline)*100);

  const history = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const p = Math.round(baseline * (1 - (meta.trend - 1.0) * (i / 14)) + Math.sin(i)*20);
    history.push({ date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), price: i === 0 ? baseline : p });
  }

  const forecast = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const interp = Math.round(baseline + (pred - baseline) * (i / 7));
    forecast.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      predicted_price: interp,
      upper_bound: Math.round(interp * 1.025),
      lower_bound: Math.round(interp * 0.975)
    });
  }

  return {
    crop: crop,
    crop_display_name: `${crop} Mandi Lot`,
    current_modal_price: baseline,
    predicted_price_7_days: pred,
    price_diff_per_qtl: diff,
    price_diff_percent: pct,
    recommendation: meta.rec,
    recommendation_type: meta.type,
    gauge_angle: meta.type === "HOLD" ? 65 : -65,
    confidence_score: meta.conf,
    historical_prices: history,
    projected_prices: forecast,
    advisory_rationale: meta.rationale,
    market_drivers: [
      { factor: "Mandi Influx Rate", impact: "Fluctuating weekly arrivals", signal: meta.type === "HOLD" ? "BULLISH" : "BEARISH" },
      { factor: "Regional Logistics Corridor", impact: "Transit times calibrated", signal: "STABLE" }
    ],
    farmer_lot_calculator: {
      input_quantity_quintals: qty,
      current_sell_today_value: Math.round(baseline * qty),
      predicted_7d_hold_value: Math.round(pred * qty),
      net_gain_or_loss: Math.round((pred - baseline) * qty),
      is_gain: diff >= 0
    }
  };
}

function generateFallbackPoolData(crop, targetQty) {
  const farmers = [
    { name: "Rameshwar Patil", village: "Chandwad", qty: 14.5, grade: "Grade A Export", km: 14, phone: "+91 98231 •••• 42" },
    { name: "Sunita Jadhav", village: "Yeola", qty: 18.0, grade: "Grade A Export", km: 28, phone: "+91 94220 •••• 19" },
    { name: "Babasaheb Gaikwad", village: "Niphad", qty: 12.0, grade: "Grade A", km: 19, phone: "+91 97635 •••• 88" },
    { name: "Dnyaneshwar Shinde", village: "Sinnar", qty: 11.5, grade: "Grade A Export", km: 32, phone: "+91 88882 •••• 61" },
    { name: "Kavita Bhadane", village: "Deola", qty: 16.0, grade: "Grade A", km: 44, phone: "+91 91580 •••• 73" }
  ];

  // Include registered user listings
  registeredFarmerListings.forEach(item => {
    farmers.unshift({
      name: `${item.farmer_name} (You / Verified)`,
      village: item.village,
      qty: item.quantity_quintals,
      grade: item.quality_grade,
      km: 12,
      phone: "+91 98•• •••• 00",
      is_new_user: true
    });
  });

  let accum = 0;
  const contrib = [];
  const rate = 2450;

  for (const f of farmers) {
    if (accum >= targetQty) break;
    contrib.push({
      ...f,
      qty_quintals: f.qty,
      quality_grade: f.grade,
      distance_km: f.km,
      phone_masked: f.phone,
      estimated_payout: Math.round(f.qty * rate)
    });
    accum += f.qty;
  }

  const total = Math.round(accum * 10) / 10;
  const pct = Math.min(Math.round((total / targetQty) * 100), 100);

  return {
    crop: crop,
    target_qty_quintals: targetQty,
    total_pooled_qty_quintals: total,
    progress_percentage: pct,
    is_fulfilled: total >= targetQty,
    contract_status: total >= targetQty ? "READY TO DISPATCH" : "ACCUMULATING",
    contributing_farmers_count: contrib.length,
    financial_summary: {
      total_contract_value: Math.round(total * rate),
      fpo_service_charge: Math.round(total * rate * 0.015),
      farmers_net_payout: Math.round(total * rate * 0.985)
    },
    logistics_summary: {
      average_transit_radius_km: 26.4
    },
    contributing_farmers: contrib
  };
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  fetchPricePrediction("Onion", 25);
  fetchMarketplacePool("Onion", 50);
  updateLiveProfitCalculator();
});
