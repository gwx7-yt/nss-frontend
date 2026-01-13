// Store company information globally
let companyDetails = new Map();
let currentSectorFilter = 'All';
let latestSectorCounts = new Map();
const activeSellRequests = new Set();
const BACKEND_BASE_URL = "https://nss-c26z.onrender.com";


// Default credits given to new users (1 lakh)
const DEFAULT_CREDITS = 100000;
// Daily bonus amount
const DAILY_BONUS = 1000;


// Language helpers
const NEPALI_DIGITS_MAP = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९'
};

function getCurrentLanguage() {
  return localStorage.getItem('language') || 'english';
}

function convertDigitsForLanguage(value, language = getCurrentLanguage()) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (language !== 'nepali') {
    return stringValue;
  }

  return stringValue.replace(/[0-9]/g, digit => NEPALI_DIGITS_MAP[digit] || digit);
}

const sectorTranslations = {
  nepali: {
    'Commercial Banks': 'वाणिज्य बैंक',
    'Development Banks': 'विकास बैंक',
    'Finance': 'वित्त',
    'Hotels And Tourism': 'होटल तथा पर्यटन',
    'Hydro Power': 'जलविद्युत',
    'Hydropower': 'जलविद्युत',
    'Investment': 'लगानी',
    'Life Insurance': 'जीवन बीमा',
    'Manufacturing And Processing': 'उत्पादन र प्रशोधन',
    'Microfinance': 'लघुवित्त',
    'Mutual Fund': 'सामूहिक लगानी कोष',
    'Non Life Insurance': 'गैर जीवन बीमा',
    'Others': 'अन्य',
    'Tradings': 'व्यापार',
    'Corporate Debenture': 'कर्पोरेट डिबेन्चर',
    'Corporate Debentures': 'कर्पोरेट डिबेन्चर',
    'Preference Shares': 'प्राथमिकता सेयर',
    'Promoter Share': 'प्रमोटर सेयर',
    'N/A': 'उपलब्ध छैन'
  }
};

function getLocalizedSectorName(sectorName, language = getCurrentLanguage()) {
  if (language === 'nepali') {
    return sectorTranslations.nepali[sectorName] || sectorName;
  }
  return sectorName;
}


// Loading and Tutorial Management
let currentStep = 1;
const totalSteps = 6;

// Check if this is the first visit
function isFirstVisit() {
  return !localStorage.getItem('hasVisitedBefore');
}

// Fetch and store company details
function fetchCompanyDetails() {
  fetch("https://nss-c26z.onrender.com/CompanyList")
    .then(res => res.json())
    .then(data => {
      companyDetails.clear();
      data.forEach(company => {
        companyDetails.set(company.symbol, {
          name: company.companyName,
          sector: company.sectorName,
          type: company.instrumentType
        });
      });
      // After getting company details, load stocks
      loadAllStocks();
    })
    .catch((error) => {
      console.error("⚠️ Error fetching company details:", error);
      // Still try to load stocks even if company details fail
      loadAllStocks();
    });
}

// Handle loading screen and tutorial initialization
document.addEventListener("DOMContentLoaded", () => {
  // Loading screen will automatically fade out after 4 seconds due to CSS animation
  
  // Check if this is the first visit
  if (isFirstVisit()) {
    // Show tutorial after loading screen fades
    setTimeout(() => {
      const tutorialOverlay = document.getElementById('tutorialOverlay');
      tutorialOverlay.style.display = 'flex';
      showTutorialStep(1);
    }, 4000);
  }

  // Initialize other features
  fetchCompanyDetails();
  fetchTopGainers();
  fetchTopLosers();
  initCredits();
  upgradeOldUsers();
  updatePortfolio();
  initNavigation();
  initTradeAnalysisControls();

  if (!localStorage.getItem('allUsers')) {
    addSampleUsers();
  }
});

function fetchTopGainers() {
  fetch("https://nss-c26z.onrender.com/TopGainers")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#gainersTable tbody");
      if (tbody) {
        tbody.innerHTML = "";
      data.slice(0, 10).forEach(item => {
          const row = document.createElement("tr");
          const ltpNumber = parseFloat(item.ltp);
          const percentageNumber = parseFloat(item.percentageChange);
          const ltpDisplay = !Number.isNaN(ltpNumber)
            ? convertDigitsForLanguage(ltpNumber.toFixed(2))
            : convertDigitsForLanguage(item.ltp);
          const percentageDisplay = !Number.isNaN(percentageNumber)
            ? convertDigitsForLanguage(`${percentageNumber >= 0 ? '+' : ''}${percentageNumber.toFixed(2)}%`)
            : convertDigitsForLanguage(`${item.percentageChange}${String(item.percentageChange).includes('%') ? '' : '%'}`);
          row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${ltpDisplay}</td>
            <td class="gain">${percentageDisplay}</td>
          `;
          tbody.appendChild(row);
        });
      }
    })
    .catch(() => {
      console.error("⚠️ Error fetching top gainers");
    });
}

function fetchTopLosers() {
  fetch("https://nss-c26z.onrender.com/TopLosers")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#losersTable tbody");
      if (tbody) {
        tbody.innerHTML = "";
      data.slice(0, 10).forEach(item => {
          const row = document.createElement("tr");
          const ltpNumber = parseFloat(item.ltp);
          const percentageNumber = parseFloat(item.percentageChange);
          const ltpDisplay = !Number.isNaN(ltpNumber)
            ? convertDigitsForLanguage(ltpNumber.toFixed(2))
            : convertDigitsForLanguage(item.ltp);
          const changeClass = !Number.isNaN(percentageNumber) && percentageNumber >= 0 ? 'gain' : 'loss';
          const percentageDisplay = !Number.isNaN(percentageNumber)
            ? convertDigitsForLanguage(`${percentageNumber >= 0 ? '+' : ''}${percentageNumber.toFixed(2)}%`)
            : convertDigitsForLanguage(`${item.percentageChange}${String(item.percentageChange).includes('%') ? '' : '%'}`);
          row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${ltpDisplay}</td>
            <td class="${changeClass}">${percentageDisplay}</td>
          `;
          tbody.appendChild(row);
        });
      }
    })
    .catch(() => {
      console.error("⚠️ Error fetching top losers");
    });
}

function initCredits() {
  const credits = parseInt(localStorage.getItem('credits') || DEFAULT_CREDITS.toString());
  localStorage.setItem('credits', credits.toString());

  // Ensure a user object exists
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    user = {};
  }
  if (!user.credits) {
    user.credits = credits;
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateCreditDisplay();
}

function updateCreditDisplay() {
  const creditBalance = document.getElementById('creditBalance');
  if (creditBalance) {
    const credits = localStorage.getItem('credits') || DEFAULT_CREDITS.toString();
    creditBalance.textContent = convertDigitsForLanguage(credits);
  }
}

// Simple toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// Confetti animation
function launchConfetti() {
    for (let i = 0; i < 30; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = `hsl(${Math.random() * 360},70%,50%)`;
        piece.style.animationDelay = Math.random() + 's';
        document.body.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove());
    }
}

// Display spin result overlay
function showSpinResult(message) {
    const result = document.getElementById('spinResult');
    const container = result?.closest('.spin-wheel');
    if (!result || !container) return;
    result.textContent = message;
    result.classList.remove('hidden');
    container.classList.add('blur');
    launchConfetti();
    setTimeout(() => {
        result.classList.add('hidden');
        container.classList.remove('blur');
    }, 3000);
}

// Upgrade legacy users to new starter pack
function upgradeOldUsers() {
  let user;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = null;
  }
  if (!user) return;
  if (user.credits < DEFAULT_CREDITS && !user.updatedToNewStarterPack) {
    user.credits = DEFAULT_CREDITS;
    user.updatedToNewStarterPack = true;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('credits', user.credits.toString());
    showToast("🎉 You've been upgraded to 1 lakh credits!");
  }
}

// Trade Modal Functions
let currentStockData = null;
const tradeAnalysisState = {
  chart: null,
  candleSeries: null,
  volumeSeries: null,
  symbol: null,
  range: 7,
  isOpen: false,
  resizeHandlerAttached: false
};

function getTradeAnalysisElements() {
  return {
    toggleBtn: document.getElementById("toggleTradeAnalysis"),
    panel: document.getElementById("tradeAnalysisPanel"),
    status: document.getElementById("tradeAnalysisStatus"),
    container: document.getElementById("tradeChartContainer"),
    rangeButtons: document.querySelectorAll(".range-btn")
  };
}

function setTradeAnalysisStatus(message, isError = false) {
  const { status } = getTradeAnalysisElements();
  if (!status) {
    return;
  }
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function ensureTradeChart() {
  const { container } = getTradeAnalysisElements();
  if (!container) {
    return false;
  }
  if (tradeAnalysisState.chart) {
    return true;
  }
  if (typeof LightweightCharts === "undefined") {
    setTradeAnalysisStatus("Chart library failed to load.", true);
    return false;
  }
  tradeAnalysisState.chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    layout: {
      background: { type: "solid", color: "#ffffff" },
      textColor: "#1f2a44",
      fontFamily: "Poppins, sans-serif"
    },
    grid: {
      vertLines: { color: "rgba(0, 0, 0, 0.05)" },
      horzLines: { color: "rgba(0, 0, 0, 0.05)" }
    },
    rightPriceScale: {
      borderColor: "rgba(0, 180, 216, 0.2)"
    },
    timeScale: {
      borderColor: "rgba(0, 180, 216, 0.2)",
      timeVisible: true,
      secondsVisible: false
    }
  });

  tradeAnalysisState.candleSeries = tradeAnalysisState.chart.addCandlestickSeries({
    upColor: "#2ecc71",
    downColor: "#e74c3c",
    borderUpColor: "#2ecc71",
    borderDownColor: "#e74c3c",
    wickUpColor: "#2ecc71",
    wickDownColor: "#e74c3c"
  });

  tradeAnalysisState.volumeSeries = tradeAnalysisState.chart.addHistogramSeries({
    color: "rgba(0, 180, 216, 0.4)",
    priceFormat: { type: "volume" },
    priceScaleId: "",
    scaleMargins: { top: 0.8, bottom: 0 }
  });

  if (!tradeAnalysisState.resizeHandlerAttached) {
    window.addEventListener("resize", () => {
      if (!tradeAnalysisState.chart || !container) {
        return;
      }
      tradeAnalysisState.chart.applyOptions({ width: container.clientWidth });
    });
    tradeAnalysisState.resizeHandlerAttached = true;
  }

  return true;
}

function resetTradeAnalysisPanel() {
  const { panel, toggleBtn, status, rangeButtons } = getTradeAnalysisElements();
  if (panel) {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "View Technical Analysis Chart";
  }
  if (status) {
    status.textContent = "Select a timeframe to load data.";
    status.classList.remove("error");
  }
  rangeButtons.forEach(button => button.classList.remove("active"));
  const defaultButton = document.querySelector('.range-btn[data-range="7"]');
  if (defaultButton) {
    defaultButton.classList.add("active");
  }
  tradeAnalysisState.isOpen = false;
  tradeAnalysisState.range = 7;
}

async function loadTradeAnalysisData() {
  if (!tradeAnalysisState.symbol) {
    setTradeAnalysisStatus("Select a stock to load technical analysis.", true);
    return;
  }
  if (!ensureTradeChart()) {
    return;
  }
  setTradeAnalysisStatus("Loading chart data...");
  const range = tradeAnalysisState.range;
  const url = `${BACKEND_BASE_URL}/api/ohlc/${tradeAnalysisState.symbol}?limit=${range}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load chart data (${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      setTradeAnalysisStatus("No technical analysis data available for this range.", true);
      tradeAnalysisState.candleSeries.setData([]);
      tradeAnalysisState.volumeSeries.setData([]);
      return;
    }
    const candles = data.map(item => ({
      time: item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close)
    }));
    const volumes = data.map(item => {
      const open = parseFloat(item.open);
      const close = parseFloat(item.close);
      return {
        time: item.date,
        value: parseFloat(item.volume),
        color: close >= open ? "rgba(46, 204, 113, 0.5)" : "rgba(231, 76, 60, 0.5)"
      };
    });
    tradeAnalysisState.candleSeries.setData(candles);
    tradeAnalysisState.volumeSeries.setData(volumes);
    tradeAnalysisState.chart.timeScale().fitContent();
    setTradeAnalysisStatus(`Showing last ${range} days of data.`);
  } catch (error) {
    setTradeAnalysisStatus(error.message || "Failed to load chart data.", true);
  }
}

function initTradeAnalysisControls() {
  const { toggleBtn, panel, rangeButtons } = getTradeAnalysisElements();
  if (!toggleBtn || !panel) {
    return;
  }
  toggleBtn.addEventListener("click", () => {
    tradeAnalysisState.isOpen = !tradeAnalysisState.isOpen;
    panel.classList.toggle("is-open", tradeAnalysisState.isOpen);
    panel.setAttribute("aria-hidden", String(!tradeAnalysisState.isOpen));
    toggleBtn.setAttribute("aria-expanded", String(tradeAnalysisState.isOpen));
    toggleBtn.textContent = tradeAnalysisState.isOpen ? "Hide Technical Analysis" : "View Technical Analysis Chart";
    if (tradeAnalysisState.isOpen) {
      loadTradeAnalysisData();
    }
  });

  rangeButtons.forEach(button => {
    button.addEventListener("click", () => {
      rangeButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      const rangeValue = parseInt(button.dataset.range, 10);
      tradeAnalysisState.range = Number.isNaN(rangeValue) ? 7 : rangeValue;
      if (tradeAnalysisState.isOpen) {
        loadTradeAnalysisData();
      } else {
        setTradeAnalysisStatus("Select a timeframe to load data.");
      }
    });
  });
}

function openTradeModal(symbol) {
  resetTradeAnalysisPanel();
  fetch(`${BACKEND_BASE_URL}/StockPrice?symbol=${symbol}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      currentStockData = data;
      const currentLanguage = getCurrentLanguage();

      // Get modal elements
      const modalStockSymbol = document.getElementById("modalStockSymbol");
      const modalStockPrice = document.getElementById("modalStockPrice");
      const modalTradeShares = document.getElementById("modalTradeShares");
      const modalPricePreview = document.getElementById("modalPricePreview");
      const modalBrokerFeePreview = document.getElementById("modalBrokerFeePreview");
      const modalSebonFeePreview = document.getElementById("modalSebonFeePreview");
      const modalDpFeePreview = document.getElementById("modalDpFeePreview");
      const modalCostPreview = document.getElementById("modalCostPreview");
      const tradeModal = document.getElementById("tradeModal");

      // Check if elements exist before setting content
      if (modalStockSymbol) modalStockSymbol.textContent = symbol;
      if (modalStockPrice) modalStockPrice.textContent = convertDigitsForLanguage(parseFloat(data.price).toFixed(2), currentLanguage);
      if (modalTradeShares) {
        modalTradeShares.value = "";
        modalTradeShares.removeEventListener("input", updateCostPreview);
        modalTradeShares.addEventListener("input", updateCostPreview);
      }
      const zeroDisplay = convertDigitsForLanguage('0', currentLanguage);
      if (modalPricePreview) modalPricePreview.textContent = zeroDisplay;
      if (modalBrokerFeePreview) modalBrokerFeePreview.textContent = zeroDisplay;
      if (modalSebonFeePreview) modalSebonFeePreview.textContent = zeroDisplay;
      if (modalDpFeePreview) modalDpFeePreview.textContent = zeroDisplay;
      if (modalCostPreview) modalCostPreview.textContent = zeroDisplay;
      updateCostPreview();
      if (tradeModal) {
        tradeModal.style.display = "block";
        if (modalTradeShares) modalTradeShares.focus();
      }
      tradeAnalysisState.symbol = symbol;
      if (tradeAnalysisState.isOpen) {
        loadTradeAnalysisData();
      }
    })
    .catch(error => {
      console.error("Error fetching stock price:", error);
      showToast(`❌ Error: ${error.message || 'Could not fetch stock price. Please try again.'}`);
    });
}

function closeTradeModal() {
  document.getElementById("tradeModal").style.display = "none";
  currentStockData = null;
  tradeAnalysisState.symbol = null;
  resetTradeAnalysisPanel();
}

function updateCostPreview() {
  const shares = parseFloat(document.getElementById("modalTradeShares").value) || 0;
  const price = currentStockData ? parseFloat(currentStockData.price) : 0;
  const base = shares * price;
  const brokerFee = base * 0.006;
  const sebonFee = base * 0.00015;
  const dpFee = base * 0.001;
  const total = base + brokerFee + sebonFee + dpFee;

  const pricePreview = document.getElementById("modalPricePreview");
  const brokerFeePreview = document.getElementById("modalBrokerFeePreview");
  const sebonFeePreview = document.getElementById("modalSebonFeePreview");
  const dpFeePreview = document.getElementById("modalDpFeePreview");
  const costPreview = document.getElementById("modalCostPreview");

  const currentLanguage = getCurrentLanguage();
  if (pricePreview) pricePreview.textContent = convertDigitsForLanguage(base.toFixed(2), currentLanguage);
  if (brokerFeePreview) brokerFeePreview.textContent = convertDigitsForLanguage(brokerFee.toFixed(2), currentLanguage);
  if (sebonFeePreview) sebonFeePreview.textContent = convertDigitsForLanguage(sebonFee.toFixed(2), currentLanguage);
  if (dpFeePreview) dpFeePreview.textContent = convertDigitsForLanguage(dpFee.toFixed(2), currentLanguage);
  if (costPreview) costPreview.textContent = convertDigitsForLanguage(total.toFixed(2), currentLanguage);
}

function confirmTrade() {
  const shares = parseFloat(document.getElementById("modalTradeShares").value);
  let credits = parseFloat(localStorage.getItem("credits")) || DEFAULT_CREDITS;

  if (!shares || shares <= 0) {
    showToast("❌ Please enter a valid number of shares!");
    return;
  }

  if (shares < 10) {
    showToast("❌ Minimum trade is 10 shares!");

    return;
  }

  const symbol = currentStockData.symbol;
  const price = parseFloat(currentStockData.price);
  const base = shares * price;
  const brokerFee = base * 0.006;
  const sebonFee = base * 0.00015;
  const dpFee = base * 0.001;
  const total = base + brokerFee + sebonFee + dpFee;

  if (total > credits) {
    showToast("❌ Not enough credits!");
    return;
  }

  // Update credits
  credits -= total;
  localStorage.setItem("credits", credits.toString());
  updateCreditDisplay();

  // Save investment
  const investment = {
    symbol,
    amount: total.toString(),
    price: price.toString(),
    quantity: shares.toString(),
    date: new Date().toLocaleDateString()
  };

      const investments = JSON.parse(localStorage.getItem("investments")) || [];
      investments.push(investment);
      localStorage.setItem("investments", JSON.stringify(investments));

  // Update UI
  updatePortfolio();
  closeTradeModal();
  const currentLanguage = getCurrentLanguage();
  const sharesDisplay = convertDigitsForLanguage(shares, currentLanguage);
  const totalDisplay = convertDigitsForLanguage(total.toFixed(2), currentLanguage);
  showToast(`✅ Purchased ${sharesDisplay} shares of ${symbol} for ${totalDisplay} credits!`);
}

// Update search result click handler
function handleSearchResultClick(symbol) {
  const stockRow = document.querySelector(`#allStocksTable tr[data-symbol="${symbol}"]`);
  if (stockRow) {
    stockRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    stockRow.classList.add('highlight');
    setTimeout(() => stockRow.classList.remove('highlight'), 2000);
  }
  openTradeModal(symbol);
}

// Update loadAllStocks function to add data attributes and new trade button
function loadAllStocks() {
  fetch("https://nss-c26z.onrender.com/AllStocks")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#allStocksTable tbody");
      if (tbody) {
        const sectorCounts = new Map();
        tbody.innerHTML = "";
        data.forEach(stock => {
          const row = document.createElement("tr");
          row.setAttribute('data-symbol', stock.symbol);
          const currentLanguage = getCurrentLanguage();
          const priceNumber = parseFloat(stock.price);
          const changeNumber = parseFloat(stock.changePercent);
          let changeClass = !Number.isNaN(changeNumber) && changeNumber >= 0 ? "gain" : "loss";
          let changeSymbol = !Number.isNaN(changeNumber) && changeNumber >= 0 ? "+" : "";
          const companyInfo = companyDetails.get(stock.symbol) || { name: stock.symbol, sector: 'N/A' };
          const sectorName = companyInfo.sector || 'N/A';
          const displaySectorName = getLocalizedSectorName(sectorName, currentLanguage);

          row.dataset.sector = sectorName;
          sectorCounts.set(sectorName, (sectorCounts.get(sectorName) || 0) + 1);

          const priceDisplay = !Number.isNaN(priceNumber)
            ? convertDigitsForLanguage(priceNumber.toFixed(2), currentLanguage)
            : convertDigitsForLanguage(stock.price, currentLanguage);

          let changeDisplay;
          if (!Number.isNaN(changeNumber)) {
            changeDisplay = convertDigitsForLanguage(`${changeSymbol}${changeNumber.toFixed(2)}%`, currentLanguage);
          } else {
            const rawChange = String(stock.changePercent || '0');
            const trimmedChange = rawChange.trim();
            changeClass = trimmedChange.startsWith('-') ? 'loss' : 'gain';
            changeSymbol = trimmedChange.startsWith('+') || trimmedChange.startsWith('-') ? '' : '+';
            const ensurePercent = trimmedChange.includes('%') ? trimmedChange : `${trimmedChange}%`;
            changeDisplay = convertDigitsForLanguage(`${changeSymbol}${ensurePercent}`, currentLanguage);
          }

          const tradeLabel = getTranslationValue('trade', 'Trade');

          row.innerHTML = `
            <td>${stock.symbol}</td>
            <td>${companyInfo.name}</td>
            <td>${displaySectorName}</td>
            <td>${priceDisplay}</td>
            <td class="${changeClass}">${changeDisplay}</td>
            <td><button onclick="openTradeModal('${stock.symbol}')" class="trade-btn">${tradeLabel}</button></td>
          `;
          tbody.appendChild(row);
        });

        latestSectorCounts = new Map(sectorCounts);
        renderSectorFilters(latestSectorCounts);
        applySectorFilter();
      }
    })
    .catch(() => {
      console.error("⚠️ Error loading all stocks");
    });
}

function getTranslationValue(key, fallback = '') {
  const currentLanguage = getCurrentLanguage();
  const languageTexts = translations[currentLanguage] || {};
  return languageTexts[key] || fallback;
}

function renderSectorFilters(sectorCounts) {
  const container = document.getElementById('sectorFilters');
  if (!container) return;

  const countsMap = sectorCounts instanceof Map ? sectorCounts : new Map(sectorCounts);

  if (currentSectorFilter !== 'All' && !countsMap.has(currentSectorFilter)) {
    currentSectorFilter = 'All';
  }

  const totalCount = Array.from(countsMap.values()).reduce((sum, value) => sum + value, 0);
  container.innerHTML = '';

  const currentLanguage = getCurrentLanguage();

  const createChip = (label, count, value) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sector-chip';
    chip.dataset.sector = value;
    chip.innerHTML = `
      <span class="chip-label">${label}</span>
      <span class="chip-count">${convertDigitsForLanguage(count, currentLanguage)}</span>
    `;

    if (value === currentSectorFilter) {
      chip.classList.add('active');
    }

    chip.addEventListener('click', () => {
      currentSectorFilter = value;
      document.querySelectorAll('.sector-chip').forEach(item => item.classList.remove('active'));
      chip.classList.add('active');
      applySectorFilter();
    });

    container.appendChild(chip);
  };

  createChip(getTranslationValue('allSectors', 'All Sectors'), totalCount, 'All');

  Array.from(countsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([sector, count]) => {
      const label = getLocalizedSectorName(sector, currentLanguage);
      createChip(label, count, sector);
    });

  updateSelectedSectorLabel();
}

function updateSelectedSectorLabel() {
  const label = document.getElementById('selectedSectorLabel');
  if (!label) return;

  const currentLanguage = getCurrentLanguage();
  if (currentSectorFilter === 'All') {
    label.textContent = getTranslationValue('allSectors', 'All Sectors');
  } else {
    label.textContent = getLocalizedSectorName(currentSectorFilter, currentLanguage);
  }
}

function applySectorFilter() {
  const tbody = document.querySelector('#allStocksTable tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let visibleCount = 0;

  rows.forEach(row => {
    const sector = row.getAttribute('data-sector') || 'N/A';
    const shouldShow = currentSectorFilter === 'All' || sector === currentSectorFilter;
    row.style.display = shouldShow ? '' : 'none';
    if (shouldShow) {
      visibleCount += 1;
    }
  });

  const emptyState = document.getElementById('sectorEmptyState');
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    if (visibleCount === 0) {
      emptyState.textContent = getTranslationValue('noSectorResults', 'No stocks found for this sector.');
    }
  }

  updateSelectedSectorLabel();
}

// Update search functionality
document.getElementById("stockSearch").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const resultsDiv = document.getElementById("searchResults");
  
  if (searchTerm.length < 2) {
    resultsDiv.style.display = "none";
    return;
  }

  fetch("https://nss-c26z.onrender.com/AllStocks")
    .then(res => res.json())
    .then(data => {
      const currentLanguage = getCurrentLanguage();
      const matches = data.filter(stock => {
        const companyInfo = companyDetails.get(stock.symbol);
        return stock.symbol.toLowerCase().includes(searchTerm) ||
          (companyInfo && companyInfo.name.toLowerCase().includes(searchTerm));
      });

      if (matches.length > 0) {
        resultsDiv.innerHTML = matches.slice(0, 5).map(stock => {
          const companyInfo = companyDetails.get(stock.symbol) || { name: stock.symbol, sector: 'N/A' };
          const priceNumber = parseFloat(stock.price);
          const changeNumber = parseFloat(stock.changePercent);
          let changeClass = !Number.isNaN(changeNumber) && changeNumber >= 0 ? 'gain' : 'loss';
          const priceDisplay = !Number.isNaN(priceNumber)
            ? convertDigitsForLanguage(priceNumber.toFixed(2), currentLanguage)
            : convertDigitsForLanguage(stock.price, currentLanguage);

          let percentageDisplay;
          if (!Number.isNaN(changeNumber)) {
            percentageDisplay = convertDigitsForLanguage(`${changeNumber >= 0 ? '+' : ''}${changeNumber.toFixed(2)}%`, currentLanguage);
          } else {
            const rawChange = String(stock.changePercent || '0').trim();
            changeClass = rawChange.startsWith('-') ? 'loss' : 'gain';
            const prefix = rawChange.startsWith('+') || rawChange.startsWith('-') ? '' : '+';
            const ensurePercent = rawChange.includes('%') ? rawChange : `${rawChange}%`;
            percentageDisplay = convertDigitsForLanguage(`${prefix}${ensurePercent}`, currentLanguage);
          }

          const displaySector = getLocalizedSectorName(companyInfo.sector || 'N/A', currentLanguage);
          return `
            <div class="search-result" onclick="handleSearchResultClick('${stock.symbol}')">
              <div class="stock-info">
                <strong>${stock.symbol}</strong>
                <span>${companyInfo.name}</span>
                <small>${displaySector}</small>
              </div>
              <div class="stock-price ${changeClass}">
                ${priceDisplay}
                (${percentageDisplay})
              </div>
            </div>
          `;
        }).join('');
        resultsDiv.style.display = "block";
      } else {
        resultsDiv.innerHTML = '<div class="no-results">No matches found</div>';
        resultsDiv.style.display = "block";
      }
    })
    .catch(() => {
      console.error("⚠️ Error searching stocks");
    });
});

// Add event listener for trade amount input
document.addEventListener('DOMContentLoaded', () => {
  const modalTradeShares = document.getElementById("modalTradeShares");
  const tradeModal = document.getElementById("tradeModal");
  
  if (modalTradeShares) {
    modalTradeShares.addEventListener("input", updateCostPreview);
  }
  
  if (tradeModal) {
    tradeModal.addEventListener("click", (e) => {
      if (e.target.classList.contains("trade-modal")) {
        closeTradeModal();
      }
    });
  }
  
  // Initialize navigation
  initNavigation();
});

function initNavigation() {
  // Set home as active by default
  updateActiveSection('home');

  // Add click handlers to navigation links
  document.querySelectorAll('.nav-icon').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('href').substring(1); // Remove # from href
      showSection(section);
      updateActiveSection(section);
    });
  });
}

function updateActiveSection(sectionId) {
  // Remove active class from all nav items
  document.querySelectorAll('.nav-icon').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current section's nav item
  const activeNav = document.querySelector(`.nav-icon[href="#${sectionId}"]`);
  if (activeNav) {
    activeNav.classList.add('active');
  }
}

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('main > section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = 'block';
    
    // Update leaderboard when that section is shown
    if (sectionId === 'leaderboard') {
      updateLeaderboard();
    }
  }
}

async function updatePortfolio() {
  const investments = JSON.parse(localStorage.getItem("investments")) || [];
  const tableBody = document.getElementById("investmentHistory");
  const noInvestments = document.getElementById("noInvestments");
  const tableContainer = document.querySelector(".table-container");
  
  if (!tableBody) return;
  
  const tbody = tableBody.getElementsByTagName('tbody')[0];
  tbody.innerHTML = "";

  if (investments.length === 0) {
    tableContainer.style.display = "none";
    noInvestments.style.display = "block";
    return;
  }

  tableContainer.style.display = "block";
  noInvestments.style.display = "none";

  let totalInvested = 0;
  let totalCurrentValue = 0;
  const currentLanguage = getCurrentLanguage();

  for (const investment of investments) {
    try {
      const response = await fetch(`https://nss-c26z.onrender.com/StockPrice?symbol=${investment.symbol}`);
      const data = await response.json();
      
      if (data.error) {
        console.error("Error fetching price for", investment.symbol, ":", data.error);
        continue;
      }

      const buyPrice = parseFloat(investment.price);
      const currentPrice = parseFloat(data.price);
      const creditsInvested = parseFloat(investment.amount);
      const quantity = parseFloat(investment.quantity);
      const creditsNow = quantity * currentPrice;
      const profitLossAmount = creditsNow - creditsInvested;
      const profitLossPercent = (profitLossAmount / creditsInvested) * 100;

      totalInvested += creditsInvested;
      totalCurrentValue += creditsNow;

        const row = document.createElement("tr");
      const profitLossClass = profitLossAmount >= 0 ? 'gain' : 'loss';
      const profitLossSymbol = profitLossAmount >= 0 ? '📈' : '📉';
      const buyPriceDisplay = convertDigitsForLanguage(buyPrice.toFixed(2), currentLanguage);
      const currentPriceDisplay = convertDigitsForLanguage(currentPrice.toFixed(2), currentLanguage);
      const creditsInvestedDisplay = convertDigitsForLanguage(creditsInvested.toFixed(2), currentLanguage);
      const creditsNowDisplay = convertDigitsForLanguage(creditsNow.toFixed(2), currentLanguage);
      const quantityDisplay = convertDigitsForLanguage(quantity.toFixed(4), currentLanguage);
      const profitLossAmountValue = profitLossAmount.toFixed(2);
      const profitLossPercentValue = profitLossPercent.toFixed(2);
      const normalizedAmount = profitLossAmountValue.startsWith('-')
        ? profitLossAmountValue
        : `+${profitLossAmountValue}`;
      const normalizedPercent = profitLossPercentValue.startsWith('-')
        ? `${profitLossPercentValue}%`
        : `+${profitLossPercentValue}%`;
      const profitLossAmountDisplay = convertDigitsForLanguage(normalizedAmount, currentLanguage);
      const profitLossPercentDisplay = convertDigitsForLanguage(normalizedPercent, currentLanguage);
      const sellLabel = getTranslationValue('sell', 'Sell');

        row.innerHTML = `
        <td><strong>${investment.symbol}</strong></td>
        <td>${buyPriceDisplay} 💰</td>
        <td>${currentPriceDisplay} 📊</td>
        <td>${creditsInvestedDisplay} 💵</td>
        <td>${creditsNowDisplay} 💸</td>
        <td>${quantityDisplay} 📊</td>
        <td class="${profitLossClass}">${profitLossAmountDisplay} ${profitLossSymbol}</td>
        <td class="${profitLossClass}">${profitLossPercentDisplay} ${profitLossSymbol}</td>
        <td><button onclick="sellInvestment(${investments.indexOf(investment)}, this)" class="sell-btn">${sellLabel}</button></td>
      `;
      tbody.appendChild(row);
    } catch (error) {
      console.error("Error processing investment:", error);
    }
  }

  // Update summary stats in the home section
  const netWorth = document.getElementById("netWorth");
  const totalInvestedElement = document.getElementById("totalInvested");
  const totalProfit = document.getElementById("totalProfit");

  if (netWorth) {
    const netWorthValue = (parseFloat(localStorage.getItem("credits")) || 0) + totalCurrentValue;
    netWorth.textContent = convertDigitsForLanguage(netWorthValue.toFixed(2), currentLanguage);
  }
  if (totalInvestedElement) totalInvestedElement.textContent = convertDigitsForLanguage(totalInvested.toFixed(2), currentLanguage);
  if (totalProfit) {
    const profitValue = totalCurrentValue - totalInvested;
    totalProfit.textContent = convertDigitsForLanguage(profitValue.toFixed(2), currentLanguage);
    totalProfit.className = profitValue >= 0 ? 'stat-value gain' : 'stat-value loss';
  }
}

function sellInvestment(index, buttonElement) {
  // Get investments from localStorage
  const investments = JSON.parse(localStorage.getItem("investments") || "[]");
  const inv = investments[index];

  if (!inv || !inv.symbol || !inv.quantity) {
    console.error("❌ Invalid investment data:", inv);
    showToast("❌ Investment or quantity missing. Please check your portfolio.");
    return;
  }

  const saleKey = `${inv.symbol}-${inv.quantity}-${inv.price}-${index}`;
  if (activeSellRequests.has(saleKey)) {
    return;
  }
  activeSellRequests.add(saleKey);

  if (buttonElement) {
    buttonElement.disabled = true;
  }

  // Fetch current stock price
  fetch(`https://nss-c26z.onrender.com/StockPrice?symbol=${inv.symbol}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error("PRICE_FETCH_ERROR");
      }

      const currentPrice = parseFloat(data.price);
      const quantity = parseFloat(inv.quantity);
      const sellAmount = quantity * currentPrice;

      // Add sell amount to credits
      let credits = parseFloat(localStorage.getItem("credits")) || 0;
      credits += sellAmount;
      localStorage.setItem("credits", credits.toString());
      updateCreditDisplay();

      // Remove the sold investment
      investments.splice(index, 1);
      localStorage.setItem("investments", JSON.stringify(investments));

      updatePortfolio();
      const currentLanguage = getCurrentLanguage();
      const sellAmountDisplay = convertDigitsForLanguage(sellAmount.toFixed(2), currentLanguage);
      showToast(`✅ Sold ${inv.symbol} for ${sellAmountDisplay} credits!`);
    })
    .catch((error) => {
      if (error && error.message === "PRICE_FETCH_ERROR") {
        showToast("❌ Error fetching current price. Please try again.");
      } else {
        console.error("❌ Error completing sale:", error);
        showToast("❌ Could not fetch the stock price. Please try again.");
      }
    })
    .finally(() => {
      activeSellRequests.delete(saleKey);
      if (buttonElement) {
        buttonElement.disabled = false;
      }
    });
}

// Function to update the leaderboard
function updateLeaderboard() {
    // Get or initialize the global leaderboard data
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboardData') || '[]');
    
    // Update current user's data in the leaderboard
    const userCredits = parseFloat(localStorage.getItem('credits') || DEFAULT_CREDITS);
    const userInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
    
    // Calculate total investment value
    let totalInvestmentValue = 0;
    for (const investment of userInvestments) {
        const currentPrice = parseFloat(investment.currentPrice || investment.price);
        const quantity = parseFloat(investment.quantity);
        totalInvestmentValue += currentPrice * quantity;
    }

    // Calculate net worth (credits + investments)
    const netWorth = userCredits + totalInvestmentValue;

    // Add current user to leaderboard if they have made any trades
    if (userInvestments.length > 0) {
        const userData = {
            name: 'Investor #' + Math.floor(Math.random() * 1000), // Temporary random ID until login is implemented
            netWorth: netWorth,
            lastUpdated: new Date().toISOString()
        };

        // Update or add user to leaderboard
        const userIndex = leaderboardData.findIndex(entry => entry.netWorth === netWorth);
        if (userIndex === -1) {
            leaderboardData.push(userData);
        }
    }

    // Sort by net worth and remove old entries (older than 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    leaderboardData = leaderboardData
        .filter(entry => new Date(entry.lastUpdated) > oneWeekAgo)
        .sort((a, b) => b.netWorth - a.netWorth);

    // Save updated leaderboard
    localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));

    // Update podium spots (top 3)
    const podiumSpots = ['gold', 'silver', 'bronze'];
    podiumSpots.forEach((spot, index) => {
        const spotElement = document.querySelector(`.${spot}`);
        if (spotElement) {
            if (leaderboardData[index]) {
                const user = leaderboardData[index];
                spotElement.querySelector('.name').textContent = user.name;
                spotElement.querySelector('.net-worth').textContent = formatMoney(user.netWorth);
            } else {
                spotElement.querySelector('.name').textContent = '-';
                spotElement.querySelector('.net-worth').textContent = formatMoney(0);
            }
        }
    });

    // Update rankings list (positions 4-50)
    const rankingsList = document.querySelector('.rankings-list');
    if (rankingsList) {
        rankingsList.innerHTML = '';
        
        // Add ranks 4 through 50
        for (let i = 3; i < Math.min(leaderboardData.length, 50); i++) {
            const user = leaderboardData[i];
            const rankItem = document.createElement('div');
            rankItem.className = 'ranking-item';
            rankItem.innerHTML = `
                <div class="rank">#${i + 1}</div>
                <div class="investor-info">
                    <div class="investor-avatar">👤</div>
                    <span class="investor-name">${user.name}</span>
                </div>
                <div class="investor-worth">${formatMoney(user.netWorth)}</div>
            `;
            rankingsList.appendChild(rankItem);
        }

        // If there are less than 4 players, show a message
        if (leaderboardData.length <= 3) {
            const messageItem = document.createElement('div');
            messageItem.className = 'ranking-item message';
            messageItem.innerHTML = `
                <div class="investor-info">
                    <span class="investor-name">Make some trades to appear on the leaderboard!</span>
                </div>
            `;
            rankingsList.appendChild(messageItem);
        }
    }
}

// Helper function to format money values
function formatMoney(amount) {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);

    return convertDigitsForLanguage(formatted);
}

// Update leaderboard after trades and portfolio updates
function onPortfolioChange() {
    updatePortfolio();
    updateLeaderboard();
}

// Modify existing trade confirmation to update leaderboard
const originalConfirmTrade = confirmTrade;
confirmTrade = function() {
    originalConfirmTrade();
    updateLeaderboard();
};

// Modify existing sellInvestment to update leaderboard
const originalSellInvestment = sellInvestment;
sellInvestment = function(...args) {
    originalSellInvestment(...args);
    updateLeaderboard();
};

// For testing purposes, let's add some sample users
function addSampleUsers() {
  // Clear existing users
  localStorage.setItem('allUsers', JSON.stringify([
    'John Doe',
    'Jane Smith',
    'Bob Wilson',
    'Alice Brown',
    'Charlie Davis',
    'Eva Martinez',
    'Frank Johnson',
    'Grace Lee',
    'Henry Taylor',
    'Iris Wang'
  ]));

  // Set some sample investments and credits for each user
  const users = JSON.parse(localStorage.getItem('allUsers'));
  users.forEach((user, index) => {
    // Give each user different credits and investments for testing
    localStorage.setItem(`credits_${user}`, (5000 + (index * 1000)).toString());
    
    // Sample investments
    const sampleInvestments = [
      {
        symbol: 'NABIL',
        quantity: '10',
        price: '1000',
        amount: '10000'
      },
      {
        symbol: 'NTC',
        quantity: '5',
        price: '800',
        amount: '4000'
      }
    ];
    
    localStorage.setItem(`investments_${user}`, JSON.stringify(sampleInvestments));
  });
}

// Settings functionality
const translations = {
    english: {
        welcome: 'Welcome, {name}!',
        netWorth: 'Net Worth',
        netWorthDesc: 'The total value of all your stocks and leftover credits combined.',
        totalProfit: 'Total Profit',
        totalProfitDesc: 'How much money you\'ve gained or lost by trading stocks.',
        invested: 'Invested',
        investedDesc: 'The total amount of credits you\'ve spent buying stocks.',
        market: 'Market',
        portfolio: 'Portfolio',
        leaderboard: 'Leaderboard',
        settings: 'Settings',
        about: 'About',
        teamNav: 'Our Team',
        playgroundNav: 'Playground',
        credits: 'Credits',
        add: 'Add',
        home: 'Home',
        searchStocks: 'Search stocks...',
        gainers: 'Top Gainers',
        losers: 'Top Losers',
        allStocks: 'All Stocks',
        symbol: 'Symbol',
        companyName: 'Company Name',
        sector: 'Sector',
        price: 'Price',
        ltp: 'LTP',
        change: 'Change',
        action: 'Action',
        trade: 'Trade',
        buyPrice: 'Buy Price',
        currentPrice: 'Current Price',
        creditsInvested: 'Credits Invested',
        creditsNow: 'Credits Now',
        quantity: 'Quantity',
        plAmount: 'P/L Amount',
        plPercent: 'P/L %',
        sell: 'Sell',
        topInvestors: 'Top Investors',
        rank: 'Rank',
        investor: 'Investor',
        themeMode: 'Theme Mode',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        textSize: 'Text Size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        language: 'Language',
        english: 'English',
        nepali: 'Nepali',
        tradeStock: 'Trade Stock',
        back: 'Back',
        confirm: 'Confirm Trade',
        settingsSaved: 'Settings saved automatically',
        settingsInfo: 'Your preferences will be saved and applied across all sessions',
        motivation: 'Doing good so far investor!',
        noInvestments: 'No investments yet!',
        startInvesting: 'Start Investing Now',
        startInvestingDesc: 'Head over to the Market section to start your investment journey!',
        buyMore: 'Buy More Stocks',
        searchPlaceholder: '🔍 Search by company name or symbol...',
        portfolioTitle: 'My Investment Portfolio',
        portfolioDesc: 'Track your investments and their performance',
        portfolioEmpty: 'No investments yet!',
        portfolioEmptyDesc: 'Start your investment journey by trading stocks in the market section.',
        portfolioStats: 'Portfolio Statistics',
        portfolioStatsDesc: 'Overview of your investment performance',
        portfolioHistory: 'Investment History',
        portfolioHistoryDesc: 'Detailed record of all your trades',
        portfolioActions: 'Portfolio Actions',
        portfolioActionsDesc: 'Manage your investments',
        portfolioPerformance: 'Portfolio Performance',
        portfolioPerformanceDesc: 'Track your gains and losses',
        portfolioDiversity: 'Portfolio Diversity',
        portfolioDiversityDesc: 'Spread of your investments across different sectors',
        portfolioRisk: 'Risk Assessment',
        portfolioRiskDesc: 'Evaluate your investment risk level',
        portfolioRecommendations: 'Investment Recommendations',
        portfolioRecommendationsDesc: 'Get personalized investment suggestions',
        portfolioAlerts: 'Portfolio Alerts',
        portfolioAlertsDesc: 'Stay updated on your investments',
        portfolioReports: 'Portfolio Reports',
        portfolioReportsDesc: 'Detailed analysis of your portfolio',
        portfolioGoals: 'Investment Goals',
        portfolioGoalsDesc: 'Set and track your investment objectives',
        portfolioAnalysis: 'Portfolio Analysis',
        portfolioAnalysisDesc: 'In-depth analysis of your investment strategy',
        browseBySector: 'Browse by Sector',
        allSectors: 'All Sectors',
        noSectorResults: 'No stocks found for this sector.',
        nssTitle: "Nepal Stock Simulator (NSS)",
        nssDesc: "A virtual stock trading platform designed to help beginners learn about the Nepal Stock Exchange (NEPSE) in a risk-free environment. Practice trading with virtual credits, track your portfolio, and compete with other investors on the leaderboard.",
        feature1: "Virtual Trading",
        feature1Desc: "Trade with virtual credits, no real money involved",
        feature2: "Real-time Data",
        feature2Desc: "Access live NEPSE stock prices and market data",
        feature3: "Learning Tools",
        feature3Desc: "Educational resources for stock market beginners",
        founderTitle: "About the Founder",
        founderName: "Subigya Raj Kharel",
        founderRole: "Student Developer",
        founderBio: "Subigya Raj Kharel is a student developer from Kathmandu, Nepal. Currently studying in grade 9, Subigya loves to code and make different kinds of websites and apps.",
        connectTitle: "Connect With Us",
        instagram: "Instagram",
        youtube: "YouTube",
        playgroundTitle: "Playground",
        playgroundDescription: "Practice faster with mini games built for NSE trading intuition.",
        quizTitle: "NEPSE Quick Quiz",
        quizDescription: "Test your NEPSE basics in quick bites.",
        quizBody: "Quiz experience goes here.",
        chartGameTitle: "Chart Trading Game",
        chartGameSubtitle: "Press and hold to buy, release to sell",
        chartGameDescription: "Master the press-and-hold trading rhythm with simulated NEPSE charts.",
        chartGameHowtoLine1: "Press and hold on the chart to buy at the current price.",
        chartGameHowtoLine2: "Keep holding while the price moves.",
        chartGameHowtoLine3: "Release to sell. Beat the Buy & Hold score.",
        chartGamePlayButton: "Play me!",
        chartGameModalTitle: "Chart Trading Game",
        chartGameProgressLabel: "Progress",
        chartGameCurrentReturnLabel: "Current Return",
        chartGameTotalReturnLabel: "Total Return",
        chartGameHint: "Press & hold to buy",
        chartGameResultsTitle: "Round Results",
        chartGameYourReturnLabel: "Your return",
        chartGameBuyHoldLabel: "Buy & Hold",
        chartGameRestart: "Restart round",
        chartGameNewRound: "New round",
        chartGameExit: "Exit to Playground",
        chartGameMessageGreat: "Outstanding timing! You beat the market rhythm.",
        chartGameMessageGood: "Nice trade control. You kept pace with the chart.",
        chartGameMessageTry: "Keep practicing. The next round is yours.",
        chartGameSectorBank: "Simulated Bank",
        chartGameSectorHydro: "Simulated Hydro",
        chartGameSectorFinance: "Simulated Finance",
        teamTitle: "Our Team",
        teamDescription: "Meet the passionate people guiding the Nepal Stock Simulator and supporting our community of investors.",
        playgroundTitle: "Playground",
        playgroundSubtitle: "Explore interactive learning experiences crafted for NEPSE beginners.",
        managementLabel: "Management & Operations",
        researchLabel: "Research & Development",
        financeLabel: "Finances",
        marketingLabel: "Marketing & Communications",
        ceoRole: "Chief Executive Officer",
        ceoName: "Subigya Raj Kharel",
        cooRole: "Chief Operating Officer",
        cooName: "Agraj Rijal",
        mdRole: "Managing Director",
        mdName: "Nayan Shakya",
        dcooRole: "Deputy Chief Operating Officer",
        dcooName: "Abhinav Pyakurel",
        croRole: "Chief Research Officer",
        croName: "Aarohan Timsina",
        ctoRole: "Chief Technology Officer",
        ctoName: "Agrim Rijal",
        researchVpRole: "VP of Research",
        researchVpName: "Syon Lama",
        cfoRole: "Chief Financial Officer",
        cfoName: "Rachit Bhattarai",
        cmoRole: "Chief Marketing Officer",
        cmoName: "Rushka Sapkota",
        contentRole: "Chief Communication Officer",
        contentName: "Sanskar Sharma",
        communicationsVpRole: "VP of Communications",
        communicationsVpName: "Aarav Dahal",
        dailyBonus: "Daily Bonus",
        weeklySpinTitle: "Weekly Spin",
        spinButton: "Spin Now!",
        claim: "Claim",
        claimed: "Claimed",
        nextAvailable: "Next available in:",
        bonusAmount: "Bonus Amount:",
        spinResult: "Spin Result:",
        closeButton: "Close"
    },
    nepali: {
        welcome: 'स्वागत छ, {name}!',
        netWorth: 'कुल सम्पत्ति',
        netWorthDesc: 'तपाईंको सबै स्टक र बाँकी क्रेडिटको कुल मूल्य।',
        totalProfit: 'कुल नाफा',
        totalProfitDesc: 'स्टक ट्रेडिङबाट कति नाफा वा नोक्सान भयो।',
        invested: 'लगानी गरिएको',
        investedDesc: 'स्टक किन्न खर्च गरिएको कुल क्रेडिट रकम।',
        market: 'बजार',
        portfolio: 'पोर्टफोलियो',
        leaderboard: 'लिडरबोर्ड',
        settings: 'सेटिङ',
        about: 'बारेमा',
        teamNav: 'हाम्रो टीम',
        playgroundNav: 'प्लेग्राउन्ड',
        credits: 'क्रेडिट',
        add: 'थप्नुहोस्',
        home: 'गृह',
        searchStocks: 'शेयर खोज्नुहोस्...',
        gainers: 'आज बढेका',
        losers: 'आज घटेका',
        allStocks: 'सबै शेयर',
        symbol: 'प्रतीक',
        companyName: 'कम्पनी',
        sector: 'सेक्टर',
        price: 'मूल्य',
        ltp: 'अन्तिम मूल्य',
        change: 'परिवर्तन',
        action: 'कार्य',
        trade: 'बेचौं',
        buyPrice: 'किन्दाको मूल्य',
        currentPrice: 'हालको मूल्य',
        creditsInvested: 'लगानी गर्दाको क्रेडिट',
        creditsNow: 'हालको क्रेडिट',
        quantity: 'सङ्ख्या',
        plAmount: 'नाफा/नोक्सान',
        plPercent: 'नाफा/नोक्सान%',
        sell: 'बेचौं',
        topInvestors: 'उत्कृष्ट लगानीकर्ता',
        rank: 'स्थान',
        investor: 'लगानीकर्ता',
        themeMode: 'थीम',
        lightMode: 'मोड',
        darkMode: 'लाइट मोड',
        textSize: 'अक्षर',
        small: 'सानो',
        medium: 'मध्यम',
        large: 'ठूलो',
        language: 'भाषा',
        english: 'अंग्रेजी',
        nepali: 'नेपाली',
        tradeStock: 'शेयर व्यापार',
        back: 'पछाडि',
        confirm: 'व्यापार पुष्टि गर्नुहोस्',
        settingsSaved: 'सेटिङ  सेभ भयो',
        settingsInfo: 'तपाईंको प्राथमिकताहरू सेभ हुनेछ र सबै सत्रहरूमा लागू हुनेछ',
        motivation: 'राम्रो गर्दै हुनुहुन्छ लगानीकर्ता!',
        noInvestments: 'अहिलेसम्म कुनै लगानी छैन!',
        startInvesting: 'लगानी सुरु गर्नुहोस्',
        startInvestingDesc: 'बजार सेक्सनमा जानुहोस् र आफ्नो लगानी यात्रा सुरु गर्नुहोस्!',
        buyMore: 'थप स्टक किन्नुहोस्',
        searchPlaceholder: '🔍 कम्पनीको नाम वा प्रतीक खोज्नुहोस्...',
        portfolioTitle: 'मेरो लगानी पोर्टफोलियो',
        portfolioDesc: 'आफ्नो लगानी र तिनीहरूको प्रदर्शन ट्र्याक गर्नुहोस्',
        portfolioEmpty: 'अहिलेसम्म कुनै लगानी छैन!',
        portfolioEmptyDesc: 'बजार सेक्सनमा स्टक व्यापार गरेर आफ्नो लगानी यात्रा सुरु गर्नुहोस्।',
        portfolioStats: 'पोर्टफोलियो तथ्याङ्क',
        portfolioStatsDesc: 'तपाईंको लगानी प्रदर्शनको अवलोकन',
        portfolioHistory: 'लगानी इतिहास',
        portfolioHistoryDesc: 'तपाईंको सबै व्यापारहरूको विस्तृत रेकर्ड',
        portfolioActions: 'पोर्टफोलियो कार्यहरू',
        portfolioActionsDesc: 'आफ्नो लगानीहरू व्यवस्थापन गर्नुहोस्',
        portfolioPerformance: 'पोर्टफोलियो प्रदर्शन',
        portfolioPerformanceDesc: 'आफ्नो नाफा र नोक्सान ट्र्याक गर्नुहोस्',
        portfolioDiversity: 'पोर्टफोलियो विविधता',
        portfolioDiversityDesc: 'विभिन्न सेक्टरहरूमा तपाईंको लगानीको फैलावट',
        portfolioRisk: 'जोखिम मूल्यांकन',
        portfolioRiskDesc: 'आफ्नो लगानी जोखिम स्तर मूल्यांकन गर्नुहोस्',
        portfolioRecommendations: 'लगानी सिफारिसहरू',
        portfolioRecommendationsDesc: 'व्यक्तिगत लगानी सुझावहरू प्राप्त गर्नुहोस्',
        portfolioAlerts: 'पोर्टफोलियो अलर्टहरू',
        portfolioAlertsDesc: 'आफ्नो लगानीहरूमा अपडेट रहनुहोस्',
        portfolioReports: 'पोर्टफोलियो रिपोर्टहरू',
        portfolioReportsDesc: 'तपाईंको पोर्टफोलियोको विस्तृत विश्लेषण',
        portfolioGoals: 'लगानी लक्ष्यहरू',
        portfolioGoalsDesc: 'आफ्नो लगानी उद्देश्यहरू सेट र ट्र्याक गर्नुहोस्',
        portfolioAnalysis: 'पोर्टफोलियो विश्लेषण',
        portfolioAnalysisDesc: 'तपाईंको लगानी रणनीतिको गहिरो विश्लेषण',
        browseBySector: 'सेक्टर अनुसार हेर्नुहोस्',
        allSectors: 'सबै सेक्टर',
        noSectorResults: 'यस सेक्टरमा कुनै शेयर भेटिएन।',
        nssTitle: "नेपाल स्टक सिमुलेटर (NSS)",
        nssDesc: "जोखिम-मुक्त वातावरणमा नेपाल स्टक एक्सचेन्ज (NEPSE) को बारेमा सिक्न सुरुवात गर्नेहरूलाई मद्दत गर्न डिजाइन गरिएको एक आभासी स्टक ट्रेडिङ प्लेटफर्म। आभासी क्रेडिटहरूसँग अभ्यास गर्नुहोस्, आफ्नो पोर्टफोलियो ट्र्याक गर्नुहोस्, र लिडरबोर्डमा अन्य लगानीकर्ताहरूसँग प्रतिस्पर्धा गर्नुहोस्।",
        feature1: "आभासी ट्रेडिङ",
        feature1Desc: "आभासी क्रेडिटहरूसँग ट्रेड गर्नुहोस्, वास्तविक पैसा होइन",
        feature2: "रियल-टाइम डाटा",
        feature2Desc: "NEPSE स्टक मूल्य र बजार डाटामा पहुँच",
        feature3: "सिक्ने टूल्स",
        feature3Desc: "स्टक मार्केट सुरुवात गर्नेहरूका लागि शैक्षिक स्रोतहरू",
        founderTitle: "संस्थापकको बारेमा",
        founderName: "सुबिज्ञ राज खरेल",
        founderRole: "विद्यार्थी डेभलपर",
        founderBio: "सुबिज्ञ राज खरेल काठमाडौं, नेपालका एक विद्यार्थी डेभलपर हुन्। हाल कक्षा ९ मा अध्ययनरत सुबिज्ञलाई कोडिङ र विभिन्न वेबसाइट र एपहरू बनाउन मन पर्छ।",
        connectTitle: "हामीसँग जोडिनुहोस्",
        instagram: "इन्स्टाग्राम",
        youtube: "युट्युब",
        playgroundTitle: "प्लेग्राउन्ड",
        playgroundDescription: "एनएसई ट्रेडिङ बुझाइका लागि साना खेलमार्फत छिटो अभ्यास गर्नुहोस्।",
        quizTitle: "NEPSE क्विक क्विज",
        quizDescription: "NEPSE का आधारभूत कुरा छोटो प्रश्नमा जाँच्नुहोस्।",
        quizBody: "क्विज अनुभूति यहाँ देखाइनेछ।",
        chartGameTitle: "चार्ट ट्रेडिङ खेल",
        chartGameSubtitle: "किन्न थिचेर राख्नुहोस्, बेच्न छोड्नुहोस्",
        chartGameDescription: "सिमुलेटेड NEPSE चार्टसँग प्रेस-एन्ड-होल्ड ट्रेडिङको लय सिक्नुहोस्।",
        chartGameHowtoLine1: "चार्टमा थिचेर राख्दा सोही क्षणको मूल्यमा किन्नु हुन्छ।",
        chartGameHowtoLine2: "मूल्य चलिरहँदा थिचिराख्नुहोस्।",
        chartGameHowtoLine3: "छोड्दा बेचिन्छ। Buy & Hold भन्दा राम्रो स्कोर बनाउनुहोस्।",
        chartGamePlayButton: "खेल्नुस्!",
        chartGameModalTitle: "चार्ट ट्रेडिङ खेल",
        chartGameProgressLabel: "प्रगति",
        chartGameCurrentReturnLabel: "हालको रिटर्न",
        chartGameTotalReturnLabel: "कुल रिटर्न",
        chartGameHint: "किन्न थिचेर राख्नुहोस्",
        chartGameResultsTitle: "राउण्ड नतिजा",
        chartGameYourReturnLabel: "तपाईंको रिटर्न",
        chartGameBuyHoldLabel: "Buy & Hold",
        chartGameRestart: "राउण्ड पुनः सुरु",
        chartGameNewRound: "नयाँ राउण्ड",
        chartGameExit: "प्लेग्राउन्डमा फर्कनुहोस्",
        chartGameMessageGreat: "उत्कृष्ट टाइमिङ! बजारको लय जित्नुभयो।",
        chartGameMessageGood: "राम्रो नियन्त्रण। चार्टसँगै रहनुभयो।",
        chartGameMessageTry: "अझै अभ्यास गर्नुहोस्। अर्को राउण्ड तपाईंको हो।",
        chartGameSectorBank: "सिमुलेटेड बैंक",
        chartGameSectorHydro: "सिमुलेटेड हाइड्रो",
        chartGameSectorFinance: "सिमुलेटेड फाइनान्स",
        teamTitle: "हाम्रो टीम",
        teamDescription: "नेपाल स्टक सिमुलेटरलाई मार्गदर्शन गर्ने र हाम्रो लगानीकर्ता समुदायलाई समर्थन गर्ने समर्पित टोलीलाई भेट्नुहोस्।",
        playgroundTitle: "प्लेग्राउन्ड",
        playgroundSubtitle: "NEPSE का सुरुवाती सिकाइका लागि बनाइएका अन्तरक्रियात्मक अनुभवहरू।",
        managementLabel: "व्यवस्थापन र सञ्चालन",
        researchLabel: "अनुसन्धान र विकास",
        financeLabel: "वित्त",
        marketingLabel: "मार्केटिङ र सञ्चार",
        ceoRole: "प्रमुख कार्यकारी अधिकृत",
        ceoName: "सुबिज्ञ राज खरेल",
        cooRole: "प्रमुख सञ्चालन अधिकृत",
        cooName: "अग्रज रिजाल",
        mdRole: "प्रबन्ध निर्देशक",
        mdName: "नयन शाक्य",
        dcooRole: "सञ्चालन उपाध्यक्ष",
        dcooName: "अभिनव प्याकुरेल",
        croRole: "प्रमुख अनुसन्धान अधिकृत",
        croName: "आरोहन तिम्सिना",
        ctoRole: "प्रमुख प्रविधि अधिकृत",
        ctoName: "अग्रिम रिजाल",
        researchVpRole: "अनुसन्धान उपाध्यक्ष",
        researchVpName: "सायोन लामा",
        cfoRole: "प्रमुख अर्थ अधिकृत",
        cfoName: "रचित भट्टराई",
        cmoRole: "प्रमुख मार्केटिङ अधिकृत",
        cmoName: "रुष्का सापकोटा",
        contentRole: "प्रमुख सञ्चार अधिकृत",
        contentName: "संस्कार शर्मा",
        communicationsVpRole: "सञ्चार उपाध्यक्ष",
        communicationsVpName: "आरव दाहाल",
        dailyBonus: "दैनिक बोनस",
        weeklySpinTitle: "साप्ताहिक स्पिन",
        spinButton: "स्पिन गर्नुहोस्!",
        claim: "प्राप्त गर्नुहोस्",
        claimed: "प्राप्त गरियो",
        nextAvailable: "अर्को उपलब्ध:",
        bonusAmount: "बोनस रकम:",
        spinResult: "स्पिन नतिजा:",
        closeButton: "बन्द गर्नुहोस्"
    }
};

const quizTranslations = {
    english: {
        quizTitle: "NEPSE Quick Quiz",
        quizSubtitle: "Answer 10 quick questions to test your market basics.",
        quizIntroTitle: "NEPSE Quick Quiz",
        quizIntroDesc: "A short, interactive quiz to warm up your stock market fundamentals before trading.",
        quizLaunch: "Test your knowledge!",
        startQuiz: "Start Quiz",
        nextQuestion: "Next",
        restartQuiz: "Restart Quiz",
        tryTrading: "Try Trading",
        correctLabel: "Correct ✓",
        wrongLabel: "Wrong ✗",
        questionProgress: "Question {current} / {total}",
        scoreLine: "Your score: {score} / {total}",
        scoreMessageLow: "Keep learning—your basics will sharpen with practice.",
        scoreMessageMid: "Nice progress! A little more practice will help.",
        scoreMessageHigh: "Excellent! Your NEPSE fundamentals look strong."
    },
    nepali: {
        quizTitle: "NEPSE छिटो क्विज",
        quizSubtitle: "बजारका आधारभूत कुरा जाँच्न १० छोटा प्रश्नहरू।",
        quizIntroTitle: "NEPSE छिटो क्विज",
        quizIntroDesc: "ट्रेडिङ अघि बजारका आधारभूत कुरा तातो बनाउन छोटो र अन्तरक्रियात्मक क्विज।",
        quizLaunch: "आफ्नो ज्ञान परीक्षण गर्नुहोस्!",
        startQuiz: "क्विज सुरु गर्नुहोस्",
        nextQuestion: "अर्को",
        restartQuiz: "क्विज पुनः सुरु गर्नुहोस्",
        tryTrading: "ट्रेडिङ प्रयास गर्नुहोस्",
        correctLabel: "सही ✓",
        wrongLabel: "गलत ✗",
        questionProgress: "प्रश्न {current} / {total}",
        scoreLine: "तपाईंको स्कोर: {score} / {total}",
        scoreMessageLow: "अझै अभ्यास गर्नुपर्छ—आधारभूत कुरा बलियो बनाऔँ।",
        scoreMessageMid: "राम्रो प्रगति! अलि बढी अभ्यास उपयोगी हुन्छ।",
        scoreMessageHigh: "उत्कृष्ट! तपाईंको NEPSE आधार बलियो छ।"
    }
};

const quizQuestions = [
    {
        prompt: {
            english: "NEPSE stands for",
            nepali: "NEPSE को पूरा रूप के हो"
        },
        options: {
            english: ["Nepal Stock Exchange", "Nepal Securities Exchange Program", "National Equity and Price System"],
            nepali: ["नेपाल स्टक एक्सचेन्ज", "नेपाल सेक्युरिटीज एक्सचेन्ज प्रोग्राम", "नेशनल इक्विटी एन्ड प्राइस सिस्टम"]
        },
        correctIndex: 0,
        explanation: {
            english: "NEPSE is Nepal Stock Exchange, the national stock exchange.",
            nepali: "NEPSE भनेको नेपालको स्टक एक्सचेन्ज हो।"
        }
    },
    {
        prompt: {
            english: "What is the official regulator of the securities market in Nepal",
            nepali: "नेपालमा धितोपत्र बजारको नियामक निकाय कुन हो"
        },
        options: {
            english: ["NRB", "SEBON", "MoF"],
            nepali: ["नेपाल राष्ट्र बैंक", "सेबोन", "अर्थ मन्त्रालय"]
        },
        correctIndex: 1,
        explanation: {
            english: "SEBON regulates Nepal's securities market.",
            nepali: "नेपालको धितोपत्र बजारको नियामक निकाय सेबोन हो।"
        }
    },
    {
        prompt: {
            english: "A share traded on NEPSE is primarily traded in which market",
            nepali: "NEPSE मा कारोबार हुने शेयर मुख्यतया कुन बजारमा पर्छ"
        },
        options: {
            english: ["Primary market", "Black market", "Secondary market"],
            nepali: ["प्राथमिक बजार", "कालो बजार", "द्वितीयक बजार"]
        },
        correctIndex: 2,
        explanation: {
            english: "NEPSE is a secondary market for trading listed shares.",
            nepali: "NEPSE मा सूचीबद्ध शेयरहरूको द्वितीयक बजारमा कारोबार हुन्छ।"
        }
    },
    {
        prompt: {
            english: "IPO stands for",
            nepali: "IPO को पूरा रूप के हो"
        },
        options: {
            english: ["International Price Option", "Initial Public Offering", "Investor Profit Output"],
            nepali: ["अन्तर्राष्ट्रिय मूल्य विकल्प", "प्रारम्भिक सार्वजनिक निष्कासन", "लगानीकर्ता नाफा नतिजा"]
        },
        correctIndex: 1,
        explanation: {
            english: "IPO means Initial Public Offering.",
            nepali: "IPO भनेको प्रारम्भिक सार्वजनिक निष्कासन हो।"
        }
    },
    {
        prompt: {
            english: "In Nepal, most IPO applications are submitted through",
            nepali: "नेपालमा अधिकांश IPO आवेदन कुन माध्यमबाट गरिन्छ"
        },
        options: {
            english: ["ePassport", "Nagarik App only", "MeroShare"],
            nepali: ["इ पासपोर्ट", "केवल नागरिक एप", "मेरोशेयर"]
        },
        correctIndex: 2,
        explanation: {
            english: "Most IPO applications are submitted through MeroShare.",
            nepali: "अधिकांश IPO आवेदन मेरोशेयरबाट गरिन्छ।"
        }
    },
    {
        prompt: {
            english: "What does a Demat account mainly do",
            nepali: "डिम्याट खाता मुख्यतया के का लागि प्रयोग हुन्छ"
        },
        options: {
            english: ["Gives loans to investors", "Sets the share price", "Holds shares in electronic form"],
            nepali: ["लगानीकर्तालाई ऋण दिन", "शेयरको मूल्य तोक्न", "शेयरलाई डिजिटल रूपमा राख्न"]
        },
        correctIndex: 2,
        explanation: {
            english: "A Demat account holds shares in electronic form.",
            nepali: "डिम्याट खाताले शेयरलाई डिजिटल रूपमा राख्छ।"
        }
    },
    {
        prompt: {
            english: "Which term best describes the NEPSE Index",
            nepali: "NEPSE सूचकांक के जनाउँछ"
        },
        options: {
            english: ["A list of only bank shares", "A measure of overall market movement", "A company’s profit report"],
            nepali: ["केवल बैंक शेयरको सूची", "बजारको समग्र चालको मापन", "कम्पनीको नाफा प्रतिवेदन"]
        },
        correctIndex: 1,
        explanation: {
            english: "The NEPSE Index reflects overall market movement.",
            nepali: "NEPSE सूचकांकले बजारको समग्र चाल देखाउँछ।"
        }
    },
    {
        prompt: {
            english: "If more people want to buy a stock than sell it, the price usually",
            nepali: "यदि किन्ने चाहना बेच्नेभन्दा बढी भयो भने मूल्य सामान्यतया"
        },
        options: {
            english: ["Goes up", "Goes down", "Stays fixed"],
            nepali: ["बढ्छ", "घट्छ", "उस्तै रहन्छ"]
        },
        correctIndex: 0,
        explanation: {
            english: "Higher demand than supply generally pushes the price up.",
            nepali: "किन्ने चाहना बढी भए मूल्य सामान्यतया बढ्छ।"
        }
    },
    {
        prompt: {
            english: "The money you deposit to buy shares is generally kept in",
            nepali: "शेयर किन्नका लागि राखिने पैसा सामान्यतया कहाँ हुन्छ"
        },
        options: {
            english: ["Demat account", "Share certificate file", "Bank account"],
            nepali: ["डिम्याट खातामा", "शेयर प्रमाणपत्र फाइलमा", "बैंक खातामा"]
        },
        correctIndex: 2,
        explanation: {
            english: "Funds for buying shares are kept in the linked bank account.",
            nepali: "शेयर किन्नका लागि राखिने पैसा बैंक खातामा हुन्छ।"
        }
    },
    {
        prompt: {
            english: "Diversification means",
            nepali: "विविधीकरण भन्नाले के बुझिन्छ"
        },
        options: {
            english: ["Putting all money in one stock", "Investing in different companies or sectors", "Buying and selling daily without plan"],
            nepali: ["सबै पैसा एउटै शेयरमा राख्नु", "विभिन्न कम्पनी वा क्षेत्रहरुमा लगानी गर्नु", "योजना बिना दैनिक किनबेच गर्नु"]
        },
        correctIndex: 1,
        explanation: {
            english: "Diversification is investing across multiple companies or sectors.",
            nepali: "विविधीकरण भनेको विभिन्न कम्पनी वा क्षेत्रमा लगानी गर्नु हो।"
        }
    }
];

const quizState = {
    isOpen: false,
    isStarted: false,
    isFinished: false,
    currentQuestionIndex: 0,
    selectedOptionIndex: null,
    score: 0,
    hasAnswered: false,
    answers: Array.from({ length: quizQuestions.length }, () => null)
};

let lastQuizView = null;
let lastQuizQuestionIndex = null;

function formatQuizNumber(value, language = getCurrentLanguage()) {
    return convertDigitsForLanguage(value, language);
}

function getQuizTranslations(language = getCurrentLanguage()) {
    return quizTranslations[language] || quizTranslations.english;
}

function resetQuizState() {
    quizState.isStarted = false;
    quizState.isFinished = false;
    quizState.currentQuestionIndex = 0;
    quizState.selectedOptionIndex = null;
    quizState.score = 0;
    quizState.hasAnswered = false;
    quizState.answers = Array.from({ length: quizQuestions.length }, () => null);
    lastQuizView = null;
    lastQuizQuestionIndex = null;
}

function revealQuiz() {
    resetQuizState();
    quizState.isOpen = true;
    quizState.isStarted = true;
    renderQuiz();
}

function startQuiz() {
    resetQuizState();
    quizState.isOpen = true;
    quizState.isStarted = true;
    renderQuiz();
}

function restartQuiz() {
    startQuiz();
}

function updateQuizTranslations(language = getCurrentLanguage()) {
    const texts = getQuizTranslations(language);
    document.querySelectorAll('[data-quiz-translate]').forEach(element => {
        const key = element.getAttribute('data-quiz-translate');
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });
    renderQuiz();
}

function handleOptionSelection(selectedIndex) {
    if (quizState.hasAnswered) {
        return;
    }
    const currentQuestion = quizQuestions[quizState.currentQuestionIndex];
    quizState.selectedOptionIndex = selectedIndex;
    quizState.hasAnswered = true;
    quizState.answers[quizState.currentQuestionIndex] = selectedIndex;
    if (selectedIndex === currentQuestion.correctIndex) {
        quizState.score += 1;
    }
    renderQuiz();
}

function handleNextQuestion() {
    const nextIndex = quizState.currentQuestionIndex + 1;
    if (nextIndex >= quizQuestions.length) {
        quizState.isFinished = true;
    } else {
        quizState.currentQuestionIndex = nextIndex;
    }
    const selectedIndex = quizState.answers[quizState.currentQuestionIndex];
    quizState.selectedOptionIndex = selectedIndex;
    quizState.hasAnswered = selectedIndex !== null && selectedIndex !== undefined;
    renderQuiz();
}

function getScoreMessage(score, texts) {
    if (score <= 3) {
        return texts.scoreMessageLow;
    }
    if (score <= 7) {
        return texts.scoreMessageMid;
    }
    return texts.scoreMessageHigh;
}

function renderQuiz() {
    const container = document.getElementById('quizContent');
    if (!container) {
        return;
    }

    const introPanel = document.querySelector('.playground-quiz-intro');
    if (!quizState.isOpen) {
        container.innerHTML = '';
        container.classList.add('is-hidden');
        if (introPanel) {
            introPanel.classList.remove('is-hidden');
        }
        return;
    }

    container.classList.remove('is-hidden');
    if (introPanel) {
        introPanel.classList.add('is-hidden');
    }

    const language = getCurrentLanguage();
    const texts = getQuizTranslations(language);
    const totalQuestions = quizQuestions.length;
    container.innerHTML = '';

    const view = quizState.isFinished ? 'result' : (quizState.isStarted ? 'question' : 'start');
const shouldAnimate =
  view !== lastQuizView ||
  (view === 'question' && quizState.currentQuestionIndex !== lastQuizQuestionIndex);

if (!quizState.isStarted) {
  const startPanel = document.createElement('div');
  startPanel.className = 'quiz-panel quiz-start';

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.className = 'quiz-primary-btn';
  startButton.textContent = texts.startQuiz;

  // IMPORTANT: mark started only when the user actually clicks start
  startButton.addEventListener('click', () => {
    quizState.isStarted = true;
    startQuiz();
  });

  startPanel.appendChild(startButton);
  container.appendChild(startPanel);

  if (shouldAnimate) {
    requestAnimationFrame(() => startPanel.classList.add('is-visible'));
  } else {
    startPanel.classList.add('is-visible');
  }

  lastQuizView = view;
  return;
}

    if (quizState.isFinished) {
        const resultPanel = document.createElement('div');
        resultPanel.className = 'quiz-panel quiz-result';

        const scoreLine = document.createElement('div');
        scoreLine.className = 'quiz-result-score';
        scoreLine.textContent = texts.scoreLine
            .replace('{score}', formatQuizNumber(quizState.score, language))
            .replace('{total}', formatQuizNumber(totalQuestions, language));

        const scoreMessage = document.createElement('div');
        scoreMessage.className = 'quiz-result-message';
        scoreMessage.textContent = getScoreMessage(quizState.score, texts);

        const actions = document.createElement('div');
        actions.className = 'quiz-actions';

        const tradeButton = document.createElement('button');
        tradeButton.type = 'button';
        tradeButton.className = 'quiz-primary-btn';
        tradeButton.textContent = texts.tryTrading;
        tradeButton.addEventListener('click', () => {
            showSection('market');
            updateActiveSection('market');
        });

        const restartButton = document.createElement('button');
        restartButton.type = 'button';
        restartButton.className = 'quiz-secondary-btn';
        restartButton.textContent = texts.restartQuiz;
        restartButton.addEventListener('click', restartQuiz);

        actions.appendChild(tradeButton);
        actions.appendChild(restartButton);

        resultPanel.appendChild(scoreLine);
        resultPanel.appendChild(scoreMessage);
        resultPanel.appendChild(actions);
        container.appendChild(resultPanel);

        if (shouldAnimate) {
            requestAnimationFrame(() => resultPanel.classList.add('is-visible'));
        } else {
            resultPanel.classList.add('is-visible');
        }
        lastQuizView = view;
        return;
    }

    const currentQuestion = quizQuestions[quizState.currentQuestionIndex];
    const selectedIndex = quizState.answers[quizState.currentQuestionIndex];
    quizState.selectedOptionIndex = selectedIndex;
    quizState.hasAnswered = selectedIndex !== null && selectedIndex !== undefined;

    const questionPanel = document.createElement('div');
    questionPanel.className = 'quiz-panel quiz-question';

    const progressMeta = document.createElement('div');
    progressMeta.className = 'quiz-progress-meta';

    const progressLabel = document.createElement('span');
    progressLabel.textContent = texts.questionProgress
        .replace('{current}', formatQuizNumber(quizState.currentQuestionIndex + 1, language))
        .replace('{total}', formatQuizNumber(totalQuestions, language));

    progressMeta.appendChild(progressLabel);

    const progressBar = document.createElement('div');
    progressBar.className = 'quiz-progress';

    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'quiz-progress-bar';
    progressIndicator.style.width = `${((quizState.currentQuestionIndex + 1) / totalQuestions) * 100}%`;
    progressBar.appendChild(progressIndicator);

const questionCard = document.createElement('div');
questionCard.className = 'quiz-question-card';

const questionText = document.createElement('div');
questionText.className = 'quiz-question-text';
questionText.textContent = currentQuestion.prompt[language];

questionCard.appendChild(questionText);


    const optionsWrapper = document.createElement('div');
    optionsWrapper.className = 'quiz-options';

    currentQuestion.options[language].forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.className = 'quiz-option';
        const optionText = document.createElement('span');
        optionText.className = 'quiz-option-text';
        optionText.textContent = option;
        optionButton.appendChild(optionText);
        optionButton.setAttribute('aria-pressed', selectedIndex === index ? 'true' : 'false');
        if (quizState.hasAnswered) {
            optionButton.disabled = true;
            if (index === currentQuestion.correctIndex) {
                optionButton.classList.add('is-correct');
                const correctIcon = document.createElement('span');
                correctIcon.className = 'quiz-option-icon';
                correctIcon.textContent = '✔';
                correctIcon.setAttribute('aria-hidden', 'true');
                optionButton.appendChild(correctIcon);
            }
            if (index === selectedIndex && selectedIndex !== currentQuestion.correctIndex) {
                optionButton.classList.add('is-wrong');
                const wrongIcon = document.createElement('span');
                wrongIcon.className = 'quiz-option-icon';
                wrongIcon.textContent = '✖';
                wrongIcon.setAttribute('aria-hidden', 'true');
                optionButton.appendChild(wrongIcon);
            }
        } else {
            optionButton.addEventListener('click', () => handleOptionSelection(index));
        }
        optionsWrapper.appendChild(optionButton);
    });

    questionPanel.appendChild(progressMeta);
    questionPanel.appendChild(progressBar);
    questionPanel.appendChild(questionCard);
    questionPanel.appendChild(optionsWrapper);

    if (quizState.hasAnswered) {
        const feedback = document.createElement('div');
        const isCorrect = selectedIndex === currentQuestion.correctIndex;
        feedback.className = `quiz-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;

        const feedbackTitle = document.createElement('strong');
        feedbackTitle.textContent = isCorrect ? texts.correctLabel : texts.wrongLabel;

        const feedbackText = document.createElement('span');
        feedbackText.textContent = currentQuestion.explanation[language];

        feedback.appendChild(feedbackTitle);
        feedback.appendChild(feedbackText);

        const actions = document.createElement('div');
        actions.className = 'quiz-actions';

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'quiz-primary-btn';
        nextButton.textContent = texts.nextQuestion;
        nextButton.addEventListener('click', handleNextQuestion);

        actions.appendChild(nextButton);

        questionPanel.appendChild(feedback);
        questionPanel.appendChild(actions);
    }

    container.appendChild(questionPanel);

    if (shouldAnimate) {
        requestAnimationFrame(() => questionPanel.classList.add('is-visible'));
    } else {
        questionPanel.classList.add('is-visible');
    }

    const feedbackPanel = questionPanel.querySelector('.quiz-feedback');
    if (feedbackPanel) {
        requestAnimationFrame(() => feedbackPanel.classList.add('is-visible'));
    }

    lastQuizView = view;
    lastQuizQuestionIndex = quizState.currentQuestionIndex;
}

document.addEventListener('DOMContentLoaded', () => {
    const launchButton = document.getElementById('quizLaunch');
    if (launchButton) {
        launchButton.addEventListener('click', () => {
            revealQuiz();
            const quizContent = document.getElementById('quizContent');
            if (quizContent) {
                quizContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});

// Initialize settings from localStorage or set defaults
function initializeSettings() {
    // Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById(savedTheme + 'Mode').classList.add('active');

    // Text Size
    const savedTextSize = localStorage.getItem('textSize') || 'medium';
    document.documentElement.setAttribute('data-text-size', savedTextSize);
    document.getElementById(savedTextSize + 'Text').classList.add('active');

    // Language - Set English as default
    const savedLanguage = localStorage.getItem('language') || 'english';
    document.getElementById(savedLanguage + 'Lang').classList.add('active');
    updateLanguage(savedLanguage);
}

// Theme toggle
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.id.replace('Mode', '');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update active state
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Text size toggle
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.id.replace('Text', '');
        document.documentElement.setAttribute('data-text-size', size.toLowerCase());
        localStorage.setItem('textSize', size.toLowerCase());
        
        // Update active state
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Language toggle
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.id.replace('Lang', '');
        localStorage.setItem('language', lang);
        
        // Update active state
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        updateLanguage(lang);
    });
});

// Update text content based on selected language
function updateLanguage(language) {
    const texts = translations[language];
    
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (texts[key]) {
            if (key === 'welcome') {
                const investorName = localStorage.getItem('investorName');
                if (investorName) {
                    if (language === 'english') {
                        element.textContent = `Welcome, ${investorName}!`;
                    } else {
                        element.textContent = `स्वागत छ, ${investorName}!`;
                    }
                } else {
                    element.textContent = texts[key];
                }
            } else if (element.tagName === 'INPUT') {
                element.value = texts[key];
            } else {
                element.textContent = texts[key];
            }
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (texts[key]) {
            element.placeholder = texts[key];
        }
    });

    // Update dynamic content
    updateDynamicContent(language);
    updateChartGameText(language);

    // Update quiz content
    updateQuizTranslations(language);
}

// Update dynamic content that's added through JavaScript
function updateDynamicContent(language) {
    const texts = translations[language];

    // Update trade modal content if it exists
    const tradeModal = document.getElementById('tradeModal');
    if (tradeModal) {
        const modalTitle = tradeModal.querySelector('h2');
        if (modalTitle) modalTitle.textContent = texts.tradeStock || 'Trade Stock';


        const backBtn = tradeModal.querySelector('.modal-btn.back');
        if (backBtn) backBtn.textContent = texts.back || 'Back';

        const confirmBtn = tradeModal.querySelector('.modal-btn.confirm');
        if (confirmBtn) confirmBtn.textContent = texts.confirm || 'Confirm Trade';
    }

    // Update table headers dynamically
    updateTableHeaders(language);

    // Refresh data-driven sections to apply locale formatting
    fetchTopGainers();
    fetchTopLosers();
    loadAllStocks();
    updatePortfolio();
    updateCreditDisplay();

    // Update sector filters with translated labels
    renderSectorFilters(latestSectorCounts);
    applySectorFilter();
}

// Update table headers with translations
function updateTableHeaders(language) {
    const texts = translations[language];

    // Update gainers table
    const gainersTable = document.getElementById('gainersTable');
    if (gainersTable) {
        const headers = gainersTable.querySelectorAll('th');
        headers[0].textContent = texts.symbol || 'Symbol';
        headers[1].textContent = texts.price || 'Price';
        headers[2].textContent = texts.change || 'Change';
    }

    // Update losers table
    const losersTable = document.getElementById('losersTable');
    if (losersTable) {
        const headers = losersTable.querySelectorAll('th');
        headers[0].textContent = texts.symbol || 'Symbol';
        headers[1].textContent = texts.price || 'Price';
        headers[2].textContent = texts.change || 'Change';
    }

    // Update all stocks table
    const allStocksTable = document.getElementById('allStocksTable');
    if (allStocksTable) {
        const headers = allStocksTable.querySelectorAll('th');
        headers[0].textContent = texts.symbol || 'Symbol';
        headers[1].textContent = texts.companyName || 'Company Name';
        headers[2].textContent = texts.sector || 'Sector';
        headers[3].textContent = texts.ltp || 'LTP';
        headers[4].textContent = texts.change || 'Change';
        headers[5].textContent = texts.action || 'Action';
    }

    // Update investment history table
    const investmentHistory = document.getElementById('investmentHistory');
    if (investmentHistory) {
        const headers = investmentHistory.querySelectorAll('th');
        if (headers.length > 0) {
            headers[0].textContent = texts.symbol + ' 🏢';
            headers[1].textContent = texts.buyPrice + ' 💰';
            headers[2].textContent = texts.currentPrice + ' 📈';
            headers[3].textContent = texts.creditsInvested + ' 💵';
            headers[4].textContent = texts.creditsNow + ' 💸';
            headers[5].textContent = texts.quantity + ' 📊';
            headers[6].textContent = texts.plAmount + ' 📊';
            headers[7].textContent = texts.plPercent + ' 📈';
            headers[8].textContent = texts.action + ' ⚡';
        }
    }
}

// Add translation data attributes to HTML elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize settings
    initializeSettings();

    // Apply initial translation
    const currentLanguage = localStorage.getItem('language') || 'english';
    updateLanguage(currentLanguage);
});

// Add click handler for the add credits button
document.querySelector('.add-credits-btn').addEventListener('click', () => {
    showBonusModal();
});

// Create and show the bonus modal
function showBonusModal() {
    const currentLanguage = localStorage.getItem('language') || 'english';
    const texts = translations[currentLanguage];
    
    const modalHTML = `
        <div id="bonusModal" class="bonus-modal">
            <div class="bonus-modal-content">
                <div class="bonus-section daily-bonus">
                    <h2>${texts.dailyBonus}</h2>
                    <p>${texts.bonusAmount} ${DAILY_BONUS} ${texts.credits}</p>
                    <button id="claimDailyBonus" class="bonus-btn">${texts.claim}</button>
                    <p id="dailyTimer" class="timer"></p>
                </div>
                
                <div class="bonus-section weekly-spin">
                    <h2>${texts.weeklySpinTitle}</h2>
                    <div class="spin-wheel">
                        <div class="wheel-container">
                        <div class="wheel-pointer"></div>
                        <canvas id="wheelCanvas" width="300" height="300"></canvas>
                    </div>
                    <button id="spinWheel" class="spin-btn">${texts.spinButton}</button>
                    <div id="spinResult" class="spin-result hidden"></div>
                </div>
                <p id="weeklyTimer" class="timer"></p>
                </div>
                
                <button class="close-modal" onclick="closeBonusModal()">${texts.closeButton}</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    initWheel();
    checkBonusAvailability();
    
    document.getElementById('claimDailyBonus').addEventListener('click', claimDailyBonus);
    document.getElementById('spinWheel').addEventListener('click', startSpinWheel);
}

function closeBonusModal() {
    const modal = document.getElementById('bonusModal');
    if (modal) {
        modal.remove();
    }
}

function checkBonusAvailability() {
    // Check daily bonus
    const lastDailyBonus = localStorage.getItem('lastDailyBonus');
    const now = new Date().getTime();
    
    if (lastDailyBonus) {
        const timeElapsed = now - parseInt(lastDailyBonus);
        if (timeElapsed < 24 * 60 * 60 * 1000) { // 24 hours
            const remainingTime = 24 * 60 * 60 * 1000 - timeElapsed;
            updateDailyTimer(remainingTime);
            document.getElementById('claimDailyBonus').disabled = true;
        }
    }
    
    // Check weekly spin
    const spinBtn = document.getElementById('spinWheel');
    const lastWeeklySpin = localStorage.getItem('lastWeeklySpin');
    if (lastWeeklySpin) {
        const timeElapsed = now - parseInt(lastWeeklySpin, 10);
        if (timeElapsed < 7 * 24 * 60 * 60 * 1000) { // 7 days
            const remainingTime = 7 * 24 * 60 * 60 * 1000 - timeElapsed;
            updateWeeklyTimer(remainingTime);
            if (spinBtn) spinBtn.disabled = true;
        } else {
            if (spinBtn) spinBtn.disabled = false;
            updateWeeklyTimer(0);
        }
    } else if (spinBtn) {
        spinBtn.disabled = false;
    }
}

function updateDailyTimer(remainingTime) {
    const timer = document.getElementById('dailyTimer');
    if (!timer) return;
    
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    
    const currentLanguage = localStorage.getItem('language') || 'english';
    const texts = translations[currentLanguage];
    timer.textContent = `${texts.nextAvailable} ${hours}h ${minutes}m`;
}

function updateWeeklyTimer(remainingTime) {
    const timer = document.getElementById('weeklyTimer');
    if (!timer) return;

    if (remainingTime <= 0) {
        timer.textContent = '';
        return;
    }

    const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    const currentLanguage = localStorage.getItem('language') || 'english';
    const texts = translations[currentLanguage];
    timer.textContent = `${texts.nextAvailable} ${days}d ${hours}h`;
}

function claimDailyBonus() {
    const currentCredits = parseInt(localStorage.getItem('credits') || '0');
    localStorage.setItem('credits', (currentCredits + DAILY_BONUS).toString());
    localStorage.setItem('lastDailyBonus', new Date().getTime().toString());
    
    updateCreditDisplay();
    checkBonusAvailability();
    
    // Show success message
    showToast(`Daily bonus of ${DAILY_BONUS} credits claimed!`);
}

function initWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const values = [0, 1000, 2000, 3000, 4000, 5000];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];
    
    // Clear canvas
    ctx.clearRect(0, 0, 300, 300);
    
    // Draw wheel segments
    const anglePerSegment = (2 * Math.PI) / values.length;
    
    for (let i = 0; i < values.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 140, i * anglePerSegment, (i + 1) * anglePerSegment);
        ctx.lineTo(150, 150);
        ctx.fill();
        ctx.stroke();
        
        // Add text
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(i * anglePerSegment + anglePerSegment / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(values[i].toString(), 120, 0);
        ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.arc(150, 150, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();


    // Add pointer only if it doesn't already exist
    const container = document.querySelector('.wheel-container');
    if (container && !container.querySelector('.wheel-pointer')) {
        const pointer = document.createElement('div');
        pointer.className = 'wheel-pointer';
        pointer.style.position = 'absolute';
        pointer.style.top = '-18px';
        pointer.style.left = '50%';
        pointer.style.transform = 'translateX(-50%)';
        pointer.style.width = '0';
        pointer.style.height = '0';
        pointer.style.borderLeft = '15px solid transparent';
        pointer.style.borderRight = '15px solid transparent';
        pointer.style.borderTop = '25px solid #FF0000';
        pointer.style.zIndex = '1';
        pointer.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        container.appendChild(pointer);
    }

}

function startSpinWheel() {
    const spinButton = document.getElementById('spinWheel');
    spinButton.disabled = true;

    const canvas = document.getElementById('wheelCanvas');
    // Reset any previous rotation
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0deg)';
    // Force reflow so the reset takes effect before spinning
    void canvas.offsetWidth;

    const values = [0, 1000, 2000, 3000, 4000, 5000];
    const randomIndex = Math.floor(Math.random() * values.length);
    const winAmount = values[randomIndex];
    
    // Calculate rotation
    const baseRotations = 5; // Number of full rotations
    const segmentAngle = 360 / values.length;
    const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;
    const pointerOffset = 270; // pointer position at top
    const extraRotation = (pointerOffset - targetAngle + 360) % 360;
    const totalRotation = (baseRotations * 360) + extraRotation;
    
    // Apply rotation with easing
    canvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    canvas.style.transform = `rotate(${totalRotation}deg)`;
    
    // Update credits after spin animation
    setTimeout(() => {
        const currentCredits = parseInt(localStorage.getItem('credits') || '0');
        localStorage.setItem('credits', (currentCredits + winAmount).toString());
        localStorage.setItem('lastWeeklySpin', new Date().getTime().toString());
        
        updateCreditDisplay();
        checkBonusAvailability();
        
        // Show success message
        const currentLanguage = localStorage.getItem('language') || 'english';
        const texts = translations[currentLanguage];
        showSpinResult(`${texts.spinResult} ${winAmount} ${texts.credits}!`);
    }, 4000);
}

// Tutorial Navigation
function showTutorialStep(step) {
  // Hide all steps
  document.querySelectorAll('.tutorial-step').forEach(el => {
    el.classList.remove('active');
  });
  
  // Show current step
  const currentStepElement = document.querySelector(`[data-step="${step}"]`);
  if (currentStepElement) {
    currentStepElement.classList.add('active');
  }
  
  // Update navigation buttons
  const nextButton = document.getElementById('tutorialNext');
  const startButton = document.getElementById('tutorialStart');
  
  if (step === totalSteps) {
    nextButton.style.display = 'none';
    startButton.style.display = 'inline-block';
  } else {
    nextButton.style.display = 'inline-block';
    startButton.style.display = 'none';
  }
}

// Handle tutorial navigation
document.getElementById('tutorialNext')?.addEventListener('click', () => {
  if (currentStep < totalSteps) {
    currentStep++;
    showTutorialStep(currentStep);
  }
});

// Handle tutorial completion
document.getElementById('tutorialStart')?.addEventListener('click', () => {
  const nameInput = document.getElementById('investorName');
  const investorName = nameInput.value.trim();
  
  if (!investorName) {
    showToast('Please enter your name to continue!');
    return;
  }
  
  // Save investor name
  localStorage.setItem('investorName', investorName);
  localStorage.setItem('hasVisitedBefore', 'true');
  
  // Hide tutorial
  document.getElementById('tutorialOverlay').style.display = 'none';
  
  // Initialize the app
  initializeApp();
});

// Initialize app after tutorial
function initializeApp() {
  // Show home section
  showSection('home');
  updateActiveSection('home');
  
  // Update welcome message with investor name
  const investorName = localStorage.getItem('investorName');
  if (investorName) {
    const welcomeMessage = document.querySelector('[data-translate="welcome"]');
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${investorName}!`;
    }
  }
}

const chartGameState = {
  data: null,
  candles: [],
  currentIndex: 0,
  inPosition: false,
  entryPrice: 0,
  currentReturnPercent: 0,
  totalReturnPercent: 0,
  buyHoldPercent: 0,
  initialEquity: 10000,
  equity: 10000,
  playing: false,
  isComplete: false,
  animationFrame: null,
  lastStepTime: 0,
  tickInterval: 220,
  elements: {}
};

const chartGameFiles = {
  bank: Array.from({ length: 20 }, (_, i) => `mockdata/bank_round_${String(i + 1).padStart(2, '0')}.json`),
  hydro: Array.from({ length: 20 }, (_, i) => `mockdata/hydro_round_${String(i + 1).padStart(2, '0')}.json`),
  finance: Array.from({ length: 20 }, (_, i) => `mockdata/finance_round_${String(i + 1).padStart(2, '0')}.json`)
};

function setupChartTradingGame() {
  const modal = document.getElementById('chartGameModal');
  const openBtn = document.getElementById('openChartGame');
  if (!modal || !openBtn) return;

  chartGameState.elements = {
    modal,
    openBtn,
    closeBtn: document.getElementById('chartGameClose'),
    exitBtn: document.getElementById('chartGameExit'),
    restartBtn: document.getElementById('chartGameRestart'),
    newRoundBtn: document.getElementById('chartGameNewRound'),
    progress: document.getElementById('chartGameProgress'),
    currentReturn: document.getElementById('chartGameCurrentReturn'),
    totalReturn: document.getElementById('chartGameTotalReturn'),
    yourReturn: document.getElementById('chartGameYourReturn'),
    buyHold: document.getElementById('chartGameBuyHold'),
    statusMessage: document.getElementById('chartGameStatusMessage'),
    meta: document.getElementById('chartGameMeta'),
    chartArea: document.getElementById('chartGameChartArea'),
    canvas: document.getElementById('chartGameCanvas'),
    results: document.getElementById('chartGameResults')
  };

  openBtn.addEventListener('click', () => {
    openChartGame();
  });

  chartGameState.elements.closeBtn?.addEventListener('click', closeChartGame);
  chartGameState.elements.exitBtn?.addEventListener('click', closeChartGame);
  chartGameState.elements.restartBtn?.addEventListener('click', restartChartGameRound);
  chartGameState.elements.newRoundBtn?.addEventListener('click', startNewChartGameRound);

  chartGameState.elements.chartArea?.addEventListener('pointerdown', handleChartPressStart);
  chartGameState.elements.chartArea?.addEventListener('pointerup', handleChartPressEnd);
  chartGameState.elements.chartArea?.addEventListener('pointerleave', handleChartPressEnd);
  chartGameState.elements.chartArea?.addEventListener('pointercancel', handleChartPressEnd);

  window.addEventListener('resize', () => {
    drawChartGame();
  });

  const howtoBoxes = document.querySelectorAll('[data-animate="howto"]');
  if (howtoBoxes.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.2 });
    howtoBoxes.forEach((box) => observer.observe(box));
  }
}

function openChartGame() {
  const { modal } = chartGameState.elements;
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!chartGameState.data) {
    startNewChartGameRound();
  } else {
    resumeChartGame();
  }
  updateChartGameText(getCurrentLanguage());
}

function closeChartGame() {
  const { modal } = chartGameState.elements;
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopChartGame();
}

function stopChartGame() {
  chartGameState.playing = false;
  if (chartGameState.animationFrame) {
    cancelAnimationFrame(chartGameState.animationFrame);
    chartGameState.animationFrame = null;
  }
}

function resumeChartGame() {
  if (chartGameState.isComplete) {
    drawChartGame();
    return;
  }
  if (!chartGameState.playing) {
    chartGameState.playing = true;
    chartGameState.lastStepTime = 0;
    chartGameState.animationFrame = requestAnimationFrame(runChartGameLoop);
  }
}

function restartChartGameRound() {
  if (!chartGameState.data) {
    startNewChartGameRound();
    return;
  }
  initializeChartGameRound(chartGameState.data);
}

async function startNewChartGameRound() {
  const sectorKeys = Object.keys(chartGameFiles);
  const randomSector = sectorKeys[Math.floor(Math.random() * sectorKeys.length)];
  const files = chartGameFiles[randomSector];
  const file = files[Math.floor(Math.random() * files.length)];
  await loadChartGameData(file);
}

async function loadChartGameData(path) {
  try {
    const response = await fetch(path);
    const data = await response.json();
    initializeChartGameRound(data);
  } catch (error) {
    console.error('Failed to load chart game data', error);
  }
}

function initializeChartGameRound(data) {
  chartGameState.data = data;
  chartGameState.candles = data.candles || [];
  chartGameState.currentIndex = 0;
  chartGameState.inPosition = false;
  chartGameState.entryPrice = 0;
  chartGameState.currentReturnPercent = 0;
  chartGameState.totalReturnPercent = 0;
  chartGameState.buyHoldPercent = 0;
  chartGameState.equity = chartGameState.initialEquity;
  chartGameState.isComplete = false;
  chartGameState.lastStepTime = 0;
  chartGameState.elements.results?.classList.remove('active');
  chartGameState.elements.results?.setAttribute('aria-hidden', 'true');
  resumeChartGame();
  updateChartGameText(getCurrentLanguage());
  drawChartGame();
}

function runChartGameLoop(timestamp) {
  if (!chartGameState.playing) return;
  if (!chartGameState.lastStepTime) {
    chartGameState.lastStepTime = timestamp;
  }
  const elapsed = timestamp - chartGameState.lastStepTime;
  if (elapsed >= chartGameState.tickInterval) {
    chartGameState.lastStepTime = timestamp;
    advanceChartGame();
  }
  drawChartGame();
  chartGameState.animationFrame = requestAnimationFrame(runChartGameLoop);
}

function advanceChartGame() {
  if (chartGameState.currentIndex < chartGameState.candles.length - 1) {
    chartGameState.currentIndex += 1;
    updateChartGameReturns();
  } else {
    completeChartGameRound();
  }
}

function handleChartPressStart(event) {
  if (chartGameState.isComplete || chartGameState.inPosition || !chartGameState.playing) return;
  event.preventDefault();
  const currentPrice = getCurrentChartPrice();
  if (!currentPrice) return;
  chartGameState.inPosition = true;
  chartGameState.entryPrice = currentPrice;
  chartGameState.elements.chartArea?.classList.add('is-pressing');
  updateChartGameReturns();
}

function handleChartPressEnd() {
  if (!chartGameState.inPosition) return;
  const currentPrice = getCurrentChartPrice();
  if (!currentPrice) return;
  const tradeReturn = (currentPrice - chartGameState.entryPrice) / chartGameState.entryPrice;
  chartGameState.equity *= (1 + tradeReturn);
  chartGameState.totalReturnPercent = ((chartGameState.equity / chartGameState.initialEquity) - 1) * 100;
  chartGameState.inPosition = false;
  chartGameState.entryPrice = 0;
  chartGameState.currentReturnPercent = 0;
  chartGameState.elements.chartArea?.classList.remove('is-pressing');
  updateChartGameNumbers();
}

function updateChartGameReturns() {
  if (chartGameState.inPosition) {
    const currentPrice = getCurrentChartPrice();
    if (currentPrice && chartGameState.entryPrice) {
      chartGameState.currentReturnPercent = ((currentPrice - chartGameState.entryPrice) / chartGameState.entryPrice) * 100;
    }
  } else {
    chartGameState.currentReturnPercent = 0;
  }
  updateChartGameNumbers();
}

function getCurrentChartPrice() {
  const candle = chartGameState.candles[chartGameState.currentIndex];
  return candle ? candle.c : 0;
}

function completeChartGameRound() {
  if (chartGameState.isComplete) return;
  chartGameState.isComplete = true;
  chartGameState.playing = false;
  if (chartGameState.inPosition) {
    handleChartPressEnd();
  }
  const first = chartGameState.candles[0];
  const last = chartGameState.candles[chartGameState.candles.length - 1];
  if (first && last) {
    chartGameState.buyHoldPercent = ((last.c - first.o) / first.o) * 100;
  }
  updateChartGameNumbers();
  updateChartGameStatusMessage();
  chartGameState.elements.results?.classList.add('active');
  chartGameState.elements.results?.setAttribute('aria-hidden', 'false');
}

function updateChartGameNumbers() {
  const language = getCurrentLanguage();
  const { progress, currentReturn, totalReturn, yourReturn, buyHold } = chartGameState.elements;
  if (progress) {
    progress.textContent = formatChartGameProgress(language);
  }
  if (currentReturn) {
    currentReturn.textContent = formatChartGamePercent(chartGameState.currentReturnPercent, language);
  }
  if (totalReturn) {
    totalReturn.textContent = formatChartGamePercent(chartGameState.totalReturnPercent, language);
  }
  if (yourReturn) {
    yourReturn.textContent = formatChartGamePercent(chartGameState.totalReturnPercent, language);
  }
  if (buyHold) {
    buyHold.textContent = formatChartGamePercent(chartGameState.buyHoldPercent, language);
  }
}

function updateChartGameStatusMessage() {
  const language = getCurrentLanguage();
  const texts = translations[language] || translations.english;
  const messageEl = chartGameState.elements.statusMessage;
  if (!messageEl) return;
  if (!chartGameState.isComplete) {
    messageEl.textContent = '';
    return;
  }
  if (chartGameState.totalReturnPercent >= chartGameState.buyHoldPercent + 2) {
    messageEl.textContent = texts.chartGameMessageGreat;
  } else if (chartGameState.totalReturnPercent >= chartGameState.buyHoldPercent - 2) {
    messageEl.textContent = texts.chartGameMessageGood;
  } else {
    messageEl.textContent = texts.chartGameMessageTry;
  }
}

function updateChartGameText(language) {
  if (!chartGameState.elements.modal) return;
  const texts = translations[language] || translations.english;
  if (chartGameState.data && chartGameState.elements.meta) {
    const symbol = language === 'nepali' ? chartGameState.data.symbol_np : chartGameState.data.symbol_en;
    const sectorLabel = getChartGameSectorLabel(chartGameState.data.sector, texts);
    chartGameState.elements.meta.textContent = `${symbol} • ${sectorLabel}`;
  } else if (chartGameState.elements.meta) {
    chartGameState.elements.meta.textContent = '';
  }
  updateChartGameNumbers();
  updateChartGameStatusMessage();
}

function getChartGameSectorLabel(sector, texts) {
  if (!sector) return '';
  if (sector.includes('Bank')) return texts.chartGameSectorBank;
  if (sector.includes('Hydro')) return texts.chartGameSectorHydro;
  if (sector.includes('Finance')) return texts.chartGameSectorFinance;
  return sector;
}

function formatChartGameProgress(language) {
  const current = chartGameState.candles.length ? chartGameState.currentIndex + 1 : 0;
  const total = chartGameState.candles.length || 0;
  return `${convertDigitsForLanguage(current.toString(), language)}/${convertDigitsForLanguage(total.toString(), language)}`;
}

function formatChartGamePercent(value, language) {
  const sign = value > 0 ? '+' : '';
  const formatted = value.toFixed(2);
  return `${sign}${convertDigitsForLanguage(formatted, language)}%`;
}

function drawChartGame() {
  const canvas = chartGameState.elements.canvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);
  if (!chartGameState.candles.length) return;

  const visible = chartGameState.candles.slice(0, chartGameState.currentIndex + 1);
  const prices = visible.map((candle) => candle.c);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  const padding = { top: 24, right: 24, bottom: 32, left: 32 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xStep = visible.length > 1 ? chartWidth / (visible.length - 1) : 0;

  const styles = getComputedStyle(document.documentElement);
  const lineColor = styles.getPropertyValue('--primary-color').trim() || '#3498db';
  const glowColor = styles.getPropertyValue('--secondary-color').trim() || '#2ecc71';

  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  visible.forEach((candle, index) => {
    const x = padding.left + index * xStep;
    const y = padding.top + (maxPrice - candle.c) / range * chartHeight;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = lineColor;
  ctx.stroke();

  const lastIndex = visible.length - 1;
  const lastCandle = visible[lastIndex];
  const lastX = padding.left + lastIndex * xStep;
  const lastY = padding.top + (maxPrice - lastCandle.c) / range * chartHeight;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
  ctx.fillStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
}

document.addEventListener('DOMContentLoaded', () => {
  setupChartTradingGame();
});
