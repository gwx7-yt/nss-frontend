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

const VOWEL_MATRAS = {
  a: '',
  aa: 'ा',
  i: 'ि',
  ii: 'ी',
  ee: 'ी',
  u: 'ु',
  uu: 'ू',
  oo: 'ू',
  e: 'े',
  ai: 'ै',
  o: 'ो',
  au: 'ौ'
};

const INDEPENDENT_VOWELS = {
  a: 'अ',
  aa: 'आ',
  i: 'इ',
  ii: 'ई',
  ee: 'ई',
  u: 'उ',
  uu: 'ऊ',
  oo: 'ऊ',
  e: 'ए',
  ai: 'ऐ',
  o: 'ओ',
  au: 'औ'
};

const CONSONANTS = [
  ['ksh', 'क्ष'],
  ['chh', 'छ'],
  ['kh', 'ख'],
  ['gh', 'घ'],
  ['ch', 'च'],
  ['jh', 'झ'],
  ['th', 'थ'],
  ['dh', 'ध'],
  ['ph', 'फ'],
  ['bh', 'भ'],
  ['sh', 'श'],
  ['ng', 'ङ'],
  ['ny', 'ञ'],
  ['tr', 'त्र'],
  ['gy', 'ज्ञ'],
  ['gn', 'ज्ञ'],
  ['k', 'क'],
  ['g', 'ग'],
  ['c', 'क'],
  ['j', 'ज'],
  ['t', 'ट'],
  ['d', 'ड'],
  ['n', 'न'],
  ['p', 'प'],
  ['b', 'ब'],
  ['m', 'म'],
  ['y', 'य'],
  ['r', 'र'],
  ['l', 'ल'],
  ['v', 'व'],
  ['w', 'व'],
  ['s', 'स'],
  ['h', 'ह'],
  ['f', 'फ'],
  ['z', 'ज'],
  ['q', 'क'],
  ['x', 'क्स']
];

const VOWEL_PATTERNS = ['aa', 'ai', 'au', 'ii', 'ee', 'uu', 'oo', 'a', 'i', 'u', 'e', 'o'];

function isNepaliLanguage(language) {
  const normalized = String(language || '').trim().toLowerCase();
  return normalized === 'nepali' || normalized === 'ne' || normalized === 'np';
}

function matchConsonant(input) {
  const lowered = input.toLowerCase();
  for (const [pattern, nepali] of CONSONANTS) {
    if (lowered.startsWith(pattern)) {
      return { nepali, length: pattern.length };
    }
  }
  return null;
}

function matchVowel(input) {
  const lowered = input.toLowerCase();
  for (const pattern of VOWEL_PATTERNS) {
    if (lowered.startsWith(pattern)) {
      return { pattern, length: pattern.length };
    }
  }
  return null;
}

function transliterateLatinWord(word) {
  if (!word) return '';
  if (/^[A-Z]{2,5}$/.test(word)) {
    return word;
  }

  let output = '';
  let i = 0;
  while (i < word.length) {
    const slice = word.slice(i);
    const vowelMatch = matchVowel(slice);
    if (vowelMatch) {
      output += INDEPENDENT_VOWELS[vowelMatch.pattern] || slice[0];
      i += vowelMatch.length;
      continue;
    }

    const consonantMatch = matchConsonant(slice);
    if (!consonantMatch) {
      output += word[i];
      i += 1;
      continue;
    }

    output += consonantMatch.nepali;
    i += consonantMatch.length;

    const vowelAfter = matchVowel(word.slice(i));
    if (vowelAfter) {
      output += VOWEL_MATRAS[vowelAfter.pattern] ?? '';
      i += vowelAfter.length;
    }
  }
  return output;
}

function transliterateCompanyName(name) {
  if (!name) {
    return '';
  }

  let output = String(name);
  COMPANY_REPLACEMENTS.forEach(({ regex, value }) => {
    output = output.replace(regex, value);
  });

  return output.replace(/[A-Za-z]+/g, match => {
    const normalized = match.toLowerCase();
    if (COMPANY_WORD_MAP[normalized]) {
      return COMPANY_WORD_MAP[normalized];
    }
    return transliterateLatinWord(match);
  });
}

function companyNameForLang(companyName, language = 'english') {
  if (!isNepaliLanguage(language)) {
    return companyName || '';
  }
  return transliterateCompanyName(companyName);
}

window.companyNameForLang = companyNameForLang;
