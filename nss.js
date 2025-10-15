// Store company information globally
let companyDetails = new Map();
let currentSectorFilter = 'All';
let latestSectorCounts = new Map();


// Default credits given to new users (1 lakh)
const DEFAULT_CREDITS = 100000;
// Daily bonus amount
const DAILY_BONUS = 1000;


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
        const sectorName = (company.sectorName || '').trim();
        companyDetails.set(company.symbol, {
          name: company.companyName,
          sector: sectorName || 'N/A',
          type: (company.instrumentType || '').trim()
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
          row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${parseFloat(item.ltp).toFixed(2)}</td>
            <td class="gain">+${item.percentageChange}%</td>
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
          row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${parseFloat(item.ltp).toFixed(2)}</td>
            <td class="loss">${item.percentageChange}%</td>
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
    creditBalance.textContent = credits;
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

function openTradeModal(symbol) {
  fetch(`https://nss-c26z.onrender.com/StockPrice?symbol=${symbol}`)
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
      if (modalStockPrice) modalStockPrice.textContent = parseFloat(data.price).toFixed(2);
      if (modalTradeShares) {
        modalTradeShares.value = "";
        modalTradeShares.removeEventListener("input", updateCostPreview);
        modalTradeShares.addEventListener("input", updateCostPreview);
      }
      if (modalPricePreview) modalPricePreview.textContent = "0";
      if (modalBrokerFeePreview) modalBrokerFeePreview.textContent = "0";
      if (modalSebonFeePreview) modalSebonFeePreview.textContent = "0";
      if (modalDpFeePreview) modalDpFeePreview.textContent = "0";
      if (modalCostPreview) modalCostPreview.textContent = "0";
      updateCostPreview();
      if (tradeModal) {
        tradeModal.style.display = "block";
        if (modalTradeShares) modalTradeShares.focus();
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

  if (pricePreview) pricePreview.textContent = base.toFixed(2);
  if (brokerFeePreview) brokerFeePreview.textContent = brokerFee.toFixed(2);
  if (sebonFeePreview) sebonFeePreview.textContent = sebonFee.toFixed(2);
  if (dpFeePreview) dpFeePreview.textContent = dpFee.toFixed(2);
  if (costPreview) costPreview.textContent = total.toFixed(2);
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
  showToast(`✅ Purchased ${shares} shares of ${symbol} for ${total.toFixed(2)} credits!`);
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
          const changeClass = parseFloat(stock.changePercent) >= 0 ? "gain" : "loss";
          const changeSymbol = parseFloat(stock.changePercent) >= 0 ? "+" : "";
          const companyInfo = companyDetails.get(stock.symbol) || { name: stock.symbol, sector: 'N/A' };
          const normalizedSector = (companyInfo.sector || 'N/A').trim() || 'N/A';
          const sectorDisplay = translateSectorName(normalizedSector);

          row.dataset.sector = normalizedSector;
          sectorCounts.set(normalizedSector, (sectorCounts.get(normalizedSector) || 0) + 1);

          row.innerHTML = `
            <td>${stock.symbol}</td>
            <td>${companyInfo.name}</td>
            <td>${sectorDisplay}</td>
            <td>${parseFloat(stock.price).toFixed(2)}</td>
            <td class="${changeClass}">${changeSymbol}${stock.changePercent}%</td>
            <td><button onclick="openTradeModal('${stock.symbol}')" class="trade-btn">Trade</button></td>
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

function getCurrentLanguage() {
  return localStorage.getItem('language') || 'english';
}

function translateSectorName(sectorName, language = getCurrentLanguage()) {
  const normalized = (sectorName || '').trim();
  const texts = translations[language] || {};
  if (!normalized) {
    return texts.sectorNotAvailable || 'N/A';
  }
  const normalizedUpper = normalized.toUpperCase();
  if (normalizedUpper === 'N/A') {
    return texts.sectorNotAvailable || 'N/A';
  }
  const sectorTranslations = texts.sectorNames || {};
  if (sectorTranslations[normalized]) {
    return sectorTranslations[normalized];
  }
  const lowerNormalized = normalized.toLowerCase();
  const matchedKey = Object.keys(sectorTranslations).find(
    key => key.toLowerCase() === lowerNormalized
  );
  if (matchedKey) {
    return sectorTranslations[matchedKey];
  }
  return normalized;
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
  const language = getCurrentLanguage();

  if (currentSectorFilter !== 'All' && !countsMap.has(currentSectorFilter)) {
    currentSectorFilter = 'All';
  }

  const totalCount = Array.from(countsMap.values()).reduce((sum, value) => sum + value, 0);
  container.innerHTML = '';

  const createChip = (label, count, value) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sector-chip';
    chip.dataset.sector = value;
    chip.innerHTML = `
      <span class="chip-label">${label}</span>
      <span class="chip-count">${count}</span>
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

  const sortedSectors = Array.from(countsMap.entries())
    .map(([sector, count]) => ({
      sector,
      count,
      label: translateSectorName(sector, language)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  sortedSectors.forEach(({ sector, count, label }) => {
    createChip(label, count, sector);
  });

  updateSelectedSectorLabel();
}

function updateSelectedSectorLabel() {
  const label = document.getElementById('selectedSectorLabel');
  if (!label) return;

  const language = getCurrentLanguage();
  if (currentSectorFilter === 'All') {
    label.textContent = getTranslationValue('allSectors', 'All Sectors');
  } else {
    label.textContent = translateSectorName(currentSectorFilter, language);
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

function updateSectorCellLanguage(language = getCurrentLanguage()) {
  const rows = document.querySelectorAll('#allStocksTable tbody tr');
  rows.forEach(row => {
    const sectorKey = row.getAttribute('data-sector') || 'N/A';
    const cell = row.querySelector('td:nth-child(3)');
    if (cell) {
      cell.textContent = translateSectorName(sectorKey, language);
    }
  });
}

function updateSearchResultLanguage(language = getCurrentLanguage()) {
  const entries = document.querySelectorAll('#searchResults .search-result .stock-info small');
  entries.forEach(entry => {
    const sectorKey = entry.getAttribute('data-sector-key');
    if (sectorKey) {
      const decodedKey = sectorKey
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
      entry.textContent = translateSectorName(decodedKey, language);
    }
  });
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
      const matches = data.filter(stock => {
        const companyInfo = companyDetails.get(stock.symbol);
        return stock.symbol.toLowerCase().includes(searchTerm) ||
          (companyInfo && companyInfo.name.toLowerCase().includes(searchTerm));
      });

      if (matches.length > 0) {
        resultsDiv.innerHTML = matches.slice(0, 5).map(stock => {
          const companyInfo = companyDetails.get(stock.symbol) || { name: stock.symbol, sector: 'N/A' };
          const normalizedSector = (companyInfo.sector || 'N/A').trim() || 'N/A';
          const sectorAttr = normalizedSector
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;');
          const sectorDisplay = translateSectorName(normalizedSector);
          return `
            <div class="search-result" onclick="handleSearchResultClick('${stock.symbol}')">
              <div class="stock-info">
                <strong>${stock.symbol}</strong>
                <span>${companyInfo.name}</span>
                <small data-sector-key="${sectorAttr}">${sectorDisplay}</small>
              </div>
              <div class="stock-price ${parseFloat(stock.changePercent) >= 0 ? 'gain' : 'loss'}">
                ${parseFloat(stock.price).toFixed(2)}
                (${parseFloat(stock.changePercent) >= 0 ? '+' : ''}${stock.changePercent}%)
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
      const profitLossSign = profitLossAmount >= 0 ? '+' : '';

        row.innerHTML = `
        <td><strong>${investment.symbol}</strong></td>
        <td>${buyPrice.toFixed(2)} 💰</td>
        <td>${currentPrice.toFixed(2)} 📊</td>
        <td>${creditsInvested.toFixed(2)} 💵</td>
        <td>${creditsNow.toFixed(2)} 💸</td>
        <td>${quantity.toFixed(4)} 📊</td>
        <td class="${profitLossClass}">${profitLossSign}${profitLossAmount.toFixed(2)} ${profitLossSymbol}</td>
        <td class="${profitLossClass}">${profitLossSign}${profitLossPercent.toFixed(2)}% ${profitLossSymbol}</td>
        <td><button onclick="sellInvestment(${investments.indexOf(investment)})" class="sell-btn">Sell</button></td>
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

  if (netWorth) netWorth.textContent = (parseFloat(localStorage.getItem("credits")) + totalCurrentValue).toFixed(2);
  if (totalInvestedElement) totalInvestedElement.textContent = totalInvested.toFixed(2);
  if (totalProfit) {
    const profitValue = totalCurrentValue - totalInvested;
    totalProfit.textContent = profitValue.toFixed(2);
    totalProfit.className = profitValue >= 0 ? 'stat-value gain' : 'stat-value loss';
  }
}

function sellInvestment(index) {
  // Get investments from localStorage
  const investments = JSON.parse(localStorage.getItem("investments") || "[]");
  const inv = investments[index];

  if (!inv || !inv.symbol || !inv.quantity) {
    console.error("❌ Invalid investment data:", inv);
    showToast("❌ Investment or quantity missing. Please check your portfolio.");
    return;
  }

  // Fetch current stock price
  fetch(`https://nss-c26z.onrender.com/StockPrice?symbol=${inv.symbol}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showToast("❌ Error fetching current price. Please try again.");
        return;
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
      showToast(`✅ Sold ${inv.symbol} for ${sellAmount.toFixed(2)} credits!`);
    })
    .catch(() => {
      showToast("❌ Could not fetch the stock price. Please try again.");
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
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
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
sellInvestment = function(index) {
    originalSellInvestment(index);
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
        sectorNames: {
            'Commercial Banks': 'Commercial Banks',
            'Commercial Bank': 'Commercial Bank',
            'Development Banks': 'Development Banks',
            'Development Bank': 'Development Bank',
            'Finance': 'Finance',
            'Hotels And Tourism': 'Hotels and Tourism',
            'Hotels and Tourism': 'Hotels and Tourism',
            'Hotels & Tourism': 'Hotels and Tourism',
            'Hydro Power': 'Hydro Power',
            'HydroPower': 'Hydro Power',
            'Hydropower': 'Hydro Power',
            'Investment': 'Investment',
            'Life Insurance': 'Life Insurance',
            'Manufacturing And Processing': 'Manufacturing and Processing',
            'Manufacturing and Processing': 'Manufacturing and Processing',
            'Manufacturing & Processing': 'Manufacturing and Processing',
            'Microfinance': 'Microfinance',
            'Micro Finance': 'Microfinance',
            'Mutual Fund': 'Mutual Fund',
            'Mutual Funds': 'Mutual Funds',
            'Non Life Insurance': 'Non-Life Insurance',
            'Non-Life Insurance': 'Non-Life Insurance',
            'Others': 'Others',
            'Other': 'Other',
            'Trading': 'Trading',
            'Tradings': 'Trading',
            'Corporate Debenture': 'Corporate Debenture',
            'Corporate Debentures': 'Corporate Debentures',
            'Promoter Share': 'Promoter Share',
            'Promoter Shares': 'Promoter Shares',
            'Preferred Stock': 'Preferred Stock',
            'Preference Share': 'Preference Share',
            'Preference Shares': 'Preference Shares',
            'N/A': 'Not Available'
        },
        sectorNotAvailable: 'Not Available',
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
        teamTitle: "Our Team",
        teamDescription: "Meet the passionate people guiding the Nepal Stock Simulator and supporting our community of investors.",
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
        sectorNames: {
            'Commercial Banks': 'व्यावसायिक बैंक',
            'Commercial Bank': 'व्यावसायिक बैंक',
            'Development Banks': 'विकास बैंक',
            'Development Bank': 'विकास बैंक',
            'Finance': 'वित्त',
            'Hotels And Tourism': 'होटल र पर्यटन',
            'Hotels and Tourism': 'होटल र पर्यटन',
            'Hotels & Tourism': 'होटल र पर्यटन',
            'Hydro Power': 'जलविद्युत',
            'HydroPower': 'जलविद्युत',
            'Hydropower': 'जलविद्युत',
            'Investment': 'लगानी',
            'Life Insurance': 'जीवन बीमा',
            'Manufacturing And Processing': 'उत्पादन र प्रशोधन',
            'Manufacturing and Processing': 'उत्पादन र प्रशोधन',
            'Manufacturing & Processing': 'उत्पादन र प्रशोधन',
            'Microfinance': 'सूक्ष्मवित्त',
            'Micro Finance': 'सूक्ष्मवित्त',
            'Mutual Fund': 'म्युचुअल फन्ड',
            'Mutual Funds': 'म्युचुअल फन्ड',
            'Non Life Insurance': 'गैरजीवन बीमा',
            'Non-Life Insurance': 'गैरजीवन बीमा',
            'Others': 'अन्य',
            'Other': 'अन्य',
            'Trading': 'व्यापार',
            'Tradings': 'व्यापार',
            'Corporate Debenture': 'कर्पोरेट डिबेन्चर',
            'Corporate Debentures': 'कर्पोरेट डिबेन्चर',
            'Promoter Share': 'प्रवर्धक सेयर',
            'Promoter Shares': 'प्रवर्धक सेयर',
            'Preferred Stock': 'प्राथमिकता सेयर',
            'Preference Share': 'प्राथमिकता सेयर',
            'Preference Shares': 'प्राथमिकता सेयर',
            'N/A': 'उपलब्ध छैन'
        },
        sectorNotAvailable: 'उपलब्ध छैन',
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
        teamTitle: "हाम्रो टीम",
        teamDescription: "नेपाल स्टक सिमुलेटरलाई मार्गदर्शन गर्ने र हाम्रो लगानीकर्ता समुदायलाई समर्थन गर्ने समर्पित टोलीलाई भेट्नुहोस्।",
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

    // Update sector filters with translated labels
    renderSectorFilters(latestSectorCounts);
    applySectorFilter();
    updateSectorCellLanguage(language);
    updateSearchResultLanguage(language);
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
