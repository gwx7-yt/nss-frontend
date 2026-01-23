const DIGIT_MAP = {
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

function toNepaliNumerals(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/\d/g, digit => DIGIT_MAP[digit] || digit);
}

function isNepaliLanguage(language) {
  const normalized = String(language || '').trim().toLowerCase();
  return normalized === 'nepali' || normalized === 'ne' || normalized === 'np';
}

function formatNumber(value, opts = {}, language = 'english') {
  const { decimals, useCommas = false, prefix = '', suffix = '' } = opts;
  if (value === null || value === undefined || value === '') {
    return '';
  }

  let numericValue = null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    numericValue = value;
  } else if (typeof value === 'string') {
    const cleaned = value.trim().replace(/,/g, '');
    if (cleaned && !Number.isNaN(Number(cleaned))) {
      numericValue = Number(cleaned);
    }
  }

  let formatted = '';
  if (numericValue !== null) {
    if (typeof decimals === 'number') {
      formatted = numericValue.toFixed(decimals);
    } else {
      formatted = String(numericValue);
    }

    if (useCommas) {
      const sign = formatted.startsWith('-') ? '-' : '';
      const unsigned = sign ? formatted.slice(1) : formatted;
      const [integerPart, fractionalPart] = unsigned.split('.');
      const withCommas = Number(integerPart).toLocaleString('en-US');
      formatted = fractionalPart !== undefined ? `${sign}${withCommas}.${fractionalPart}` : `${sign}${withCommas}`;
    }
  } else {
    formatted = String(value);
  }

  const output = `${prefix}${formatted}${suffix}`;
  return isNepaliLanguage(language) ? toNepaliNumerals(output) : output;
}

function formatCurrencyNPR(value, language = 'english', opts = {}) {
  const prefix = isNepaliLanguage(language) ? 'रु. ' : 'Rs. ';
  return formatNumber(value, { ...opts, prefix }, language);
}

function formatPercent(value, language = 'english', opts = {}) {
  if (!Number.isFinite(Number(value))) {
    return '—';
  }
  const { decimals = 2, showSign = true } = opts;
  const numericValue = Number(value);
  const sign = showSign && numericValue > 0 ? '+' : '';
  const formatted = formatNumber(numericValue, { decimals }, language);
  return `${sign}${formatted}%`;
}

window.toNepaliNumerals = toNepaliNumerals;
window.isNepaliLanguage = isNepaliLanguage;
window.formatNumber = formatNumber;
window.formatCurrencyNPR = formatCurrencyNPR;
window.formatPercent = formatPercent;
