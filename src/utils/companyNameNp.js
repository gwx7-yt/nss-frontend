const COMPANY_WORD_MAP = {
  ltd: 'एल टि डि',
  limited: 'एल टि डि',
  company: 'कम्पनी',
  co: 'को',
  power: 'पावर',
  hydro: 'हाइड्रो',
  hydropower: 'हाइड्रोपावर',
  development: 'डेभलपमेन्ट',
  bank: 'बैंक',
  finance: 'फाइनान्स',
  insurance: 'इन्स्योरेन्स',
  microfinance: 'माइक्रोफाइनान्स',
  capital: 'क्यापिटल',
  investment: 'इन्भेस्टमेन्ट',
  holdings: 'होल्डिङ्स',
  trading: 'ट्रेडिङ',
  manufacturing: 'म्यानुफ्याक्चरिङ',
  cement: 'सिमेन्ट',
  telecom: 'टेलिकम',
  electronics: 'इलेक्ट्रोनिक्स',
  hotels: 'होटल्स',
  motors: 'मोटर्स',
  energy: 'इनर्जी',
  infrastructure: 'इन्फ्रास्ट्रक्चर'
};

const COMPANY_REPLACEMENTS = [
  { regex: /\bL\.?T\.?D\.?\b/gi, value: 'एल टि डि' },
  { regex: /\bLimited\b/gi, value: 'एल टि डि' }
];

function transliterateCompanyName(name) {
  if (!name) {
    return '';
  }

  let output = String(name);
  COMPANY_REPLACEMENTS.forEach(({ regex, value }) => {
    output = output.replace(regex, value);
  });

  return output.replace(/[A-Za-z&]+/g, match => {
    const normalized = match.toLowerCase();
    return COMPANY_WORD_MAP[normalized] || match;
  });
}

function companyNameForLang(companyName, language = 'english') {
  if (language !== 'nepali') {
    return companyName || '';
  }
  return transliterateCompanyName(companyName);
}

window.companyNameForLang = companyNameForLang;
