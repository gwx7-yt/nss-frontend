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

const COMPANY_NAME_OVERRIDES = {
  'Aarambha Chautari Laghubitta Bittiya Sanstha Limited': 'आरम्भ चौतारी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Aatmanirbhar Laghubitta Bittiya Sanstha Limited': 'आत्मनिर्भर लघुवित्त वित्तीय संस्था लिमिटेड',
  'Agricultural Development Bank Limited': 'कृषि विकास बैंक लिमिटेड',
  'Ankhu Khola Jalvidhyut Company Limited': 'अंकु खोला जलविद्युत कम्पनी लिमिटेड',
  'API Power Company Limited': 'एपीआई पावर कम्पनी लिमिटेड',
  'Arun Kabeli Power Limited': 'अरुण केबेली पावर लिमिटेड',
  'Arun Valley Hydropower Development Company Limited': 'अरुण भ्याली हाइड्रोपावर डेभलपमेन्ट कम्पनी लिमिटेड',
  'Asha Laghubitta Bittiya Sanstha Limited': 'आशा लघुवित्त वित्तीय संस्था लिमिटेड',
  'Asian Hydropower Limited': 'एशियन हाइड्रोपावर लिमिटेड',
  'Asian Life Insurance Company Limited': 'एशियन लाइफ इन्स्योरेन्स कम्पनी लिमिटेड',
  'Aviyan Laghubitta Bittiya Sanstha Limited': 'अवियन लघुवित्त वित्तीय संस्था लिमिटेड',
  'Balephi Hydropower Limited': 'बलेफी हाइड्रोपावर लिमिटेड',
  'Bandipur Cable Car and Tourism Limited': 'बन्दीपुर केबल कार एण्ड टुरिज्म लिमिटेड',
  'Barahi Hydropower Public Limited': 'बाराही हाइड्रोपावर पब्लिक लिमिटेड',
  'Barun Jalvidhyut Company Limited': 'बरुण जलविद्युत कम्पनी लिमिटेड',
  'Best Finance Company Limited': 'बेस्ट फाइनान्स कम्पनी लिमिटेड',
  'Bhagwati Jalvidhyut Development Company Limited': 'भगवती जलविद्युत विकास कम्पनी लिमिटेड',
  'Bhugol Energy Development Company Limited': 'भुगोल इनर्जी डेभलपमेन्ट कम्पनी लिमिटेड',
  'Vikas Jalvidhyut Company Limited': 'विकास जलविद्युत कम्पनी लिमिटेड',
  'Bindhyabasini Jalvidhyut Development Company Limited': 'बिन्ध्यवासिनी जलविद्युत विकास कम्पनी लिमिटेड',
  'Bishal Bazar Company Limited': 'विशाल बजार कम्पनी लिमिटेड',
  'Bottlers Nepal (Balaju) Limited': 'बोटलर्स नेपाल (बालाजु) लिमिटेड',
  'Bottlers Nepal (Terai) Limited': 'बोटलर्स नेपाल (तराई) लिमिटेड',
  'Buddhabhumi Nepal Jalvidhyut Company Limited': 'बुद्धभूमि नेपाल जलविद्युत कम्पनी लिमिटेड',
  'Bungal Hydro Limited': 'बुंगल हाइड्रो लिमिटेड',
  'Butwal Power Company Limited': 'बुटवल पावर कम्पनी लिमिटेड',
  'CEDB Hydropower Development Company Limited': 'CEDB जलविद्युत विकास कम्पनी लिमिटेड',
  'Kendriya Finance Company Limited': 'केन्द्रीय वित्त कम्पनी लिमिटेड',
  'Chandragiri Hills Limited': 'चन्द्रागिरी हिल्स लिमिटेड',
  'Chhimek Laghubitta Bittiya Sanstha Limited': 'छिमेक लघुवित्त वित्तीय संस्था लिमिटेड',
  'Chyangdi Hydropower Limited': 'छ्याङ्दी हाइड्रोपावर लिमिटेड',
  'Chilime Hydropower Company Limited': 'चिलिमे जलविद्युत कम्पनी लिमिटेड',
  'Chirkhwa Hydropower Limited': 'चिरख्वा हाइड्रोपावर लिमिटेड',
  'Citizen Investment Trust': 'नागरिक लगानी कोष',
  'Citizen Life Insurance Company Limited': 'नागरिक जीवन बीमा कम्पनी लिमिटेड',
  'Citizens Bank International Limited': 'सिटिजन्स बैंक इन्टरनेशनल लिमिटेड',
  'City Hotel Limited': 'सिटी होटल लिमिटेड',
  'Corporate Development Bank Limited': 'कर्पोरेट डेभलपमेन्ट बैंक लिमिटेड',
  'Crest Micro Life Insurance Limited': 'क्रेस्ट माइक्रो लाइफ इन्स्योरेन्स लिमिटेड',
  'CYC Nepal Laghubitta Bittiya Sanstha Limited': 'CYC नेपाल लघुवित्त वित्तीय संस्था लिमिटेड',
  'Daramkhola Hydro Energy Limited': 'दरमखोला हाइड्रो इनर्जी लिमिटेड',
  'Deprosc Laghubitta Bittiya Sanstha Limited': 'डेप्रोस्क लघुवित्त वित्तीय संस्था लिमिटेड',
  'Dhaulagiri Laghubitta Bittiya Sanstha Limited': 'धौलागिरी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Divyashwori Hydropower Limited': 'दिव्यश्वरी जलविद्युत लिमिटेड',
  'Dolti Power Company Limited': 'डोल्टी पावर कम्पनी लिमिटेड',
  'Dordi Khola Jalvidhyut Company Limited': 'दोर्दी खोला जलविद्युत कम्पनी लिमिटेड',
  'Purbi Hydropower Limited': 'पूर्वी जलविद्युत लिमिटेड',
  'Emerging Nepal Limited': 'इमर्जिङ नेपाल लिमिटेड',
  'Everest Bank Limited': 'एभरेष्ट बैंक लिमिटेड',
  'Excel Development Bank Limited': 'एक्सेल डेभलपमेन्ट बैंक लिमिटेड',
  'First Microfinance Laghubitta Bittiya Sanstha Limited': 'फर्स्ट माइक्रोफाइनान्स लघुवित्त वित्तीय संस्था लिमिटेड',
  'Forward Microfinance Laghubitta Bittiya Sanstha Limited': 'फरवार्ड माइक्रोफाइनान्स लघुवित्त वित्तीय संस्था लिमिटेड',
  'Ganapati Laghubitta Bittiya Sanstha Limited': 'गणपति लघुवित्त वित्तीय संस्था लिमिटेड',
  'Garima Bikas Bank Limited': 'गरिमा विकास बैंक लिमिटेड',
  'Ghalemdi Hydro Limited': 'घलेम्दी हाइड्रो लिमिटेड',
  'Ghorahi Cement Industry Limited': 'घोराही सिमेन्ट उद्योग लिमिटेड',
  'Global IME Bank Limited': 'ग्लोबल आइएमई बैंक लिमिटेड',
  'Global IME Laghubitta Bittiya Sanstha Limited': 'ग्लोबल आइएमई लघुवित्त वित्तीय संस्था लिमिटेड',
  'Goodwill Finance Limited': 'गुडविल फाइनान्स लिमिटेड',
  'Grameen Bikas Laghubitta Bittiya Sanstha Limited': 'ग्रामीण विकास लघुवित्त वित्तीय संस्था लिमिटेड',
  'Green Development Bank Limited': 'ग्रिन डेभलपमेन्ट बैंक लिमिटेड',
  'Green Ventures Limited': 'ग्रीन भेन्चर्स लिमिटेड',
  'Greenlife Hydropower Limited': 'ग्रीनलाइफ हाइड्रोपावर लिमिटेड',
  'Guardian Micro Life Insurance Limited': 'गार्डियन माइक्रो लाइफ इन्स्योरेन्स लिमिटेड',
  'Guheshwori Merchant Banking and Finance Limited': 'गुहेश्वरी मर्चेन्ट बैंकिङ एण्ड फाइनान्स लिमिटेड',
  'Gurans Laghubitta Bittiya Sanstha Limited': 'गुराँस लघुवित्त वित्तीय संस्था लिमिटेड',
  'Gorkhas Finance Limited': 'गोर्खाज फाइनान्स लिमिटेड',
  'Hathway Investment Nepal Limited': 'हाथवे इन्भेस्टमेन्ट नेपाल लिमिटेड',
  'Himal Dolakha Hydropower Company Limited': 'हिमाल दोलखा जलविद्युत कम्पनी लिमिटेड',
  'Himalaya Energy Development Company Limited': 'हिमालय उर्जा विकास कम्पनी लिमिटेड',
  'Himalayan Bank Limited': 'हिमालयन बैंक लिमिटेड',
  'Himalayan Distillery Limited': 'हिमालयन डिस्टिलरी लिमिटेड',
  'Himalayan Everest Insurance Limited': 'हिमालयन एभरेस्ट इन्स्योरेन्स लिमिटेड',
  'Himalayan Hydropower Limited': 'हिमालयन हाइड्रोपावर लिमिटेड',
  'Himalayan Laghubitta Bittiya Sanstha Limited': 'हिमालयन लघुवित्त वित्तीय संस्था लिमिटेड',
  'Himalayan Life Insurance Limited': 'हिमालयन लाइफ इन्स्योरेन्स लिमिटेड',
  'Himalayan Power Partner Limited': 'हिमालयन पावर पार्टनर लिमिटेड',
  'Himalayan Reinsurance Limited': 'हिमालयन पुनर्बीमा लिमिटेड',
  'Himstar Energy Company Limited': 'हिमस्टार उर्जा कम्पनी लिमिटेड',
  'Hydroelectricity Investment and Development Company Limited': 'जलविद्युत लगानी तथा विकास कम्पनी लिमिटेड',
  'IME Life Insurance Company Limited': 'आइएमई लाइफ इन्स्योरेन्स कम्पनी लिमिटेड',
  'ICFC Finance Limited': 'आईसीएफसी फाइनान्स लिमिटेड',
  'IGI Prudential Insurance Limited': 'आईजीआई प्रुडेन्सियल इन्स्योरेन्स लिमिटेड',
  'Infinity Laghubitta Bittiya Sanstha Limited': 'इन्फिनिटी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Ingwa Hydropower Limited': 'इङ्वा हाइड्रोपावर लिमिटेड',
  'Janaki Finance Company Limited': 'जानकी फाइनान्स कम्पनी लिमिटेड',
  'Janautthan Samudayik Laghubitta Bittiya Sanstha Limited': 'जनउत्थान सामुदायिक लघुवित्त वित्तीय संस्था लिमिटेड',
  'Jeevan Bikas Laghubitta Bittiya Sanstha Limited': 'जीवन विकास लघुवित्त वित्तीय संस्था लिमिटेड',
  'Jhapa Energy Limited': 'झापा इनर्जी लिमिटेड',
  'Joshi Hydropower Development Company Limited': 'जोशी जलविद्युत विकास कम्पनी लिमिटेड',
  'Jyoti Bikas Bank Limited': 'ज्योति विकास बैंक लिमिटेड',
  'Kalika Laghubitta Bittiya Sanstha Limited': 'कालिका लघुवित्त वित्तीय संस्था लिमिटेड',
  'Kalika Power Company Limited': 'कालिका पावर कम्पनी लिमिटेड',
  'Kalinchowk Darshan Limited': 'कालिंचोक दर्शन लिमिटेड',
  'Kamana Sewa Bikas Bank Limited': 'कामना सेवा विकास बैंक लिमिटेड',
  'Khanikhola Hydropower Company Limited': 'खानीखोला हाइड्रोपावर कम्पनी लिमिटेड',
  'Kumari Bank Limited': 'कुमारी बैंक लिमिटेड',
  'Kutheli Bukhari Small Hydropower Limited': 'कुथेली बुखारी साना जलविद्युत लिमिटेड',
  'Laxmi Laghubitta Bittiya Sanstha Limited': 'लक्ष्मी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Laxmi Sunrise Bank Limited': 'लक्ष्मी सनराइज बैंक लिमिटेड',
  'Liberty Energy Company Limited': 'लिबर्टी इनर्जी कम्पनी लिमिटेड',
  'Life Insurance Corporation (Nepal) Limited': 'जीवन बीमा निगम (नेपाल) लिमिटेड',
  'Lumbini Bikas Bank Limited': 'लुम्बिनी विकास बैंक लिमिटेड',
  'Mabilung Energy Limited': 'माबिलुङ इनर्जी लिमिटेड',
  'Machhapuchhre Bank Limited': 'माछापुच्छ्रे बैंक लिमिटेड',
  'Madhya Bhotekoshi Hydropower Company Limited': 'मध्य भोटेकोशी जलविद्युत कम्पनी लिमिटेड',
  'Mahalaxmi Bikas Bank Limited': 'महालक्ष्मी विकास बैंक लिमिटेड',
  'Mahila Laghubitta Bittiya Sanstha Limited': 'महिला लघुवित्त वित्तीय संस्था लिमिटेड',
  'Mahuli Laghubitta Bittiya Sanstha Limited': 'महुली लघुवित्त वित्तीय संस्था लिमिटेड',
  'Maikhola Hydropower Limited': 'माईखोला हाइड्रोपावर लिमिटेड',
  'Mailung Khola Jalvidhyut Company Limited': 'मैलुङ खोला जलविद्युत कम्पनी लिमिटेड',
  'Makar Jitumaya Suri Hydropower Limited': 'मकर जितुमाया सुरी हाइड्रोपावर लिमिटेड',
  'Manakamana Engineering Hydropower Limited': 'मनकामना इन्जिनियरिङ हाइड्रोपावर लिमिटेड',
  'Mandakini Hydropower Limited': 'मन्दाकिनी हाइड्रोपावर लिमिटेड',
  'Mandu Hydropower Limited': 'मान्डु हाइड्रोपावर लिमिटेड',
  'Manjushree Finance Limited': 'मञ्जुश्री फाइनान्स लिमिटेड',
  'Manushi Laghubitta Bittiya Sanstha Limited': 'मानुषी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Upper Melamchi Khola Hydropower Limited': 'माथिल्लो मेलम खोला जलविद्युत लिमिटेड',
  'Matribhumi Laghubitta Bittiya Sanstha Limited': 'मातृभूमि लघुवित्त वित्तीय संस्था लिमिटेड',
  'Maya Khola Jalvidhyut Company Limited': 'माया खोला जलविद्युत कम्पनी लिमिटेड',
  'Menchhyam Hydropower Limited': 'मेन्छियाम हाइड्रोपावर लिमिटेड',
  'Mero Microfinance Laghubitta Bittiya Sanstha Limited': 'मेरो माइक्रोफाइनान्स लघुवित्त वित्तीय संस्था लिमिटेड',
  'Mid Solu Hydropower Limited': 'मिड सोलु हाइड्रोपावर लिमिटेड',
  'Miteri Bikas Bank Limited': 'मितेरी विकास बैंक लिमिटेड',
  'Mithila Laghubitta Bittiya Sanstha Limited': 'मिथिला लघुवित्त वित्तीय संस्था लिमिटेड',
  'Modi Energy Limited': 'मोदी इनर्जी लिमिटेड',
  'Molung Hydropower Company Limited': 'मोलुङ हाइड्रोपावर कम्पनी लिमिटेड',
  'Mountain Energy Nepal Limited': 'माउन्टेन इनर्जी नेपाल लिमिटेड',
  'Mountain Hydro Nepal Limited': 'माउन्टेन हाइड्रो नेपाल लिमिटेड',
  'Muktinath Bikas Bank Limited': 'मुक्तिनाथ विकास बैंक लिमिटेड',
  'Muktinath Krishi Company Limited': 'मुक्तिनाथ कृषि कम्पनी लिमिटेड',
  'Bahuudeshiya Finance Company Limited': 'बहुउद्देश्यीय वित्त कम्पनी लिमिटेड',
  'Nabil Bank Limited': 'नबिल बैंक लिमिटेड',
  'Nadep Laghubitta Bittiya Sanstha Limited': 'नादेप लघुवित्त वित्तीय संस्था लिमिटेड',
  'Narayani Bikas Bank Limited': 'नारायणी विकास बैंक लिमिटेड',
  'Rastriya Laghubitta Bittiya Sanstha Limited': 'राष्ट्रिय लघुवित्त वित्तीय संस्था लिमिटेड',
  'Rastriya Jalvidhyut Company Limited': 'राष्ट्रिय जलविद्युत कम्पनी लिमिटेड',
  'Rastriya Jeevan Beema Company Limited': 'राष्ट्रिय जीवन बीमा कम्पनी लिमिटेड',
  'Neco Insurance Limited': 'नेको इन्स्योरेन्स लिमिटेड',
  'Nepal Bank Limited': 'नेपाल बैंक लिमिटेड',
  'Nepal Doorsanchar Company Limited': 'नेपाल दूरसञ्चार कम्पनी लिमिटेड',
  'Nepal Finance Limited': 'नेपाल फाइनान्स लिमिटेड',
  'Nepal Hydro Developers Limited': 'नेपाल हाइड्रो डेभलपर्स लिमिटेड',
  'Nepal Infrastructure Bank Limited': 'नेपाल इन्फ्रास्ट्रक्चर बैंक लिमिटेड',
  'Nepal Insurance Company Limited': 'नेपाल इन्स्योरेन्स कम्पनी लिमिटेड',
  'Nepal Investment Mega Bank Limited': 'नेपाल इन्भेष्टमेन्ट मेगा बैंक लिमिटेड',
  'Nepal Life Insurance Company Limited': 'नेपाल लाइफ इन्स्योरेन्स कम्पनी लिमिटेड',
  'Nepal Micro Insurance Company Limited': 'नेपाल माइक्रो इन्स्योरेन्स कम्पनी लिमिटेड',
  'Nepal Reinsurance Company Limited': 'नेपाल पुनर्बीमा कम्पनी लिमिटेड',
  'Nepal Republic Media Limited': 'नेपाल रिपब्लिक मिडिया लिमिटेड',
  'Nepal SBI Bank Limited': 'नेपाल एसबीआई बैंक लिमिटेड',
  'Nepal Warehousing Company Limited': 'नेपाल वेयरहाउसिङ कम्पनी लिमिटेड',
  'Nerude Mirmire Laghubitta Bittiya Sanstha Limited': 'नेरुडे मिरमिरे लघुवित्त वित्तीय संस्था लिमिटेड',
  'Nesdo Samriddha Laghubitta Bittiya Sanstha Limited': 'नेस्डो समृद्ध लघुवित्त वित्तीय संस्था लिमिटेड',
  'Ngadi Group Power Limited': 'न्गादी ग्रुप पावर लिमिटेड',
  'NIC Asia Bank Limited': 'एनआईसी एशिया बैंक लिमिटेड',
  'NIC Asia Laghubitta Bittiya Sanstha Limited': 'एनआईसी एशिया लघुवित्त वित्तीय संस्था लिमिटेड',
  'Nirdhan Utthan Laghubitta Bittiya Sanstha Limited': 'निर्धन उत्थान लघुवित्त वित्तीय संस्था लिमिटेड',
  'NLG Insurance Company Limited': 'एनएलजी इन्स्योरेन्स कम्पनी लिमिटेड',
  'NMB Laghubitta Bittiya Sanstha Limited': 'एनएमबी लघुवित्त वित्तीय संस्था लिमिटेड',
  'NMB Bank Limited': 'एनएमबी बैंक लिमिटेड',
  'NRN Infrastructure and Development Limited': 'एनआरएन इन्फ्रास्ट्रक्चर एण्ड डेभलपमेन्ट लिमिटेड',
  'Nyadi Hydropower Limited': 'न्यादी हाइड्रोपावर लिमिटेड',
  'Om Megashree Pharmaceuticals Limited': 'ओम मेगाश्री फार्मास्युटिकल्स लिमिटेड',
  'Oriental Hotels Limited': 'ओरिएन्टल होटल्स लिमिटेड',
  'Panchakanya Mai Hydropower Limited': 'पञ्चकन्या माई हाइड्रोपावर लिमिटेड',
  'Panchthar Power Company Limited': 'पाँचथर पावर कम्पनी लिमिटेड',
  'Peoples Hydropower Company Limited': 'पिपल्स हाइड्रोपावर कम्पनी लिमिटेड',
  'Peoples Power Limited': 'पिपल्स पावर लिमिटेड',
  'Pokhara Finance Limited': 'पोखरा फाइनान्स लिमिटेड',
  'Prabhu Bank Limited': 'प्रभु बैंक लिमिटेड',
  'Prabhu Insurance Limited': 'प्रभु इन्स्योरेन्स लिमिटेड',
  'Prabhu Mahalaxmi Life Insurance Limited': 'प्रभु महालक्ष्मी लाइफ इन्स्योरेन्स लिमिटेड',
  'Prime Commercial Bank Limited': 'प्राइम कमर्सियल बैंक लिमिटेड',
  'Progressive Finance Limited': 'प्रोग्रेसिभ फाइनान्स लिमिटेड',
  'Pure Energy Limited': 'प्योर इनर्जी लिमिटेड',
  'Radhy Hydropower Company Limited': 'राधी जलविद्युत कम्पनी लिमिटेड',
  'Rapti Hydro and General Construction Limited': 'राप्ती हाइड्रो एण्ड जनरल कन्स्ट्रक्सन लिमिटेड',
  'Rastriya Beema Company Limited': 'राष्ट्रिय बीमा कम्पनी लिमिटेड',
  'Rasuwagadhi Hydropower Company Limited': 'रसुवागढी जलविद्युत कम्पनी लिमिटेड',
  'Rawa Energy Development Limited': 'रवा इनर्जी डेभलपमेन्ट लिमिटेड',
  'Reliable Nepal Life Insurance Limited': 'रिलायबल नेपाल लाइफ इन्स्योरेन्स लिमिटेड',
  'Reliance Finance Limited': 'रिलायन्स फाइनान्स लिमिटेड',
  'Ridi Power Company Limited': 'रिडी पावर कम्पनी लिमिटेड',
  'River Falls Power Limited': 'रिभर फल्स पावर लिमिटेड',
  'RSDC Laghubitta Bittiya Sanstha Limited': 'RSDC लघुवित्त वित्तीय संस्था लिमिटेड',
  'Ru Ru Jalvidhyut Project Limited': 'रु रु जलविद्युत परियोजना लिमिटेड',
  'Sagar Distillery Limited': 'सागर डिस्टिलरी लिमिटेड',
  'Sagarmatha Hydropower Company Limited': 'सगरमाथा जलविद्युत कम्पनी लिमिटेड',
  'Sagarmatha Lumbini Insurance Company Limited': 'सगरमाथा लुम्बिनी इन्स्योरेन्स कम्पनी लिमिटेड',
  'Sahas Energy Limited': 'सहस उर्जा लिमिटेड',
  'Salt Trading Corporation': 'साल्ट ट्रेडिंग कर्पोरेशन',
  'Samata Gharelu Laghubitta Bittiya Sanstha Limited': 'समता घरेलु लघुवित्त वित्तीय संस्था लिमिटेड',
  'Samling Power Company Limited': 'सामलिङ पावर कम्पनी लिमिटेड',
  'Sampada Laghubitta Bittiya Sanstha Limited': 'सम्पदा लघुवित्त वित्तीय संस्था लिमिटेड',
  'Samriddhi Finance Company Limited': 'समृद्धि फाइनान्स कम्पनी लिमिटेड',
  'Samudayik Laghubitta Bittiya Sanstha Limited': 'सामुदायिक लघुवित्त वित्तीय संस्था लिमिटेड',
  'Sana Kisan Bikas Laghubitta Bittiya Sanstha Limited': 'साना किसान विकास लघुवित्त वित्तीय संस्था लिमिटेड',
  'Sanima Bank Limited': 'सानिमा बैंक लिमिटेड',
  'Sanima GIC Insurance Limited': 'सानिमा जीआईसी इन्स्योरेन्स लिमिटेड',
  'Sanima Mai Hydropower Limited': 'सानिमा माई हाइड्रोपावर लिमिटेड',
  'Sanima Middle Tamor Hydropower Limited': 'सानिमा मिडल तमोर हाइड्रोपावर लिमिटेड',
  'Sanima Reliance Life Insurance Limited': 'सानिमा रिलायन्स लाइफ इन्स्योरेन्स लिमिटेड',
  'Sanjhen Hydropower Company Limited': 'सान्जेन जलविद्युत कम्पनी लिमिटेड',
  'Sanvi Energy Limited': 'सान्वी इनर्जी लिमिटेड',
  'Saptakoshi Bikas Bank Limited': 'सप्तकोशी विकास बैंक लिमिटेड',
  'Sarvottam Cement Limited': 'सर्वोत्तम सिमेन्ट लिमिटेड',
  'Sayapatri Hydropower Limited': 'सयपत्री हाइड्रोपावर लिमिटेड',
  'Shangri La Development Bank Limited': 'शाङ्ग्री ला डेभलपमेन्ट बैंक लिमिटेड',
  'Shikhar Insurance Company Limited': 'शिखर इन्स्योरेन्स कम्पनी लिमिटेड',
  'Shine Resunga Development Bank Limited': 'शाइन रेसुङ्गा डेभलपमेन्ट बैंक लिमिटेड',
  'Shivashree Hydropower Limited': 'शिवश्री हाइड्रोपावर लिमिटेड',
  'Shivam Cements Limited': 'शिवम सिमेन्ट्स लिमिटेड',
  'Shree Investment Finance Company Limited': 'श्री इन्भेस्टमेन्ट फाइनान्स कम्पनी लिमिटेड',
  'Shrinagar Agritech Industries Limited': 'श्रीनगर एग्रीटेक इन्डस्ट्रिज लिमिटेड',
  'Shrijanshil Laghubitta Bittiya Sanstha Limited': 'श्रीजनशील लघुवित्त वित्तीय संस्था लिमिटेड',
  'Shubham Power Limited': 'शुभम पावर लिमिटेड',
  'Siddhartha Bank Limited': 'सिद्धार्थ बैंक लिमिटेड',
  'Siddhartha Premier Insurance Limited': 'सिद्धार्थ प्रिमियर इन्स्योरेन्स लिमिटेड',
  'Sikles Hydropower Limited': 'सिक्लेस हाइड्रोपावर लिमिटेड',
  'Sindhu Bikas Bank Limited': 'सिन्धु विकास बैंक लिमिटेड',
  'Singati Hydro Energy Limited': 'सिंगटी हाइड्रो इनर्जी लिमिटेड',
  'Soaltee Hotel Limited': 'सोल्टी होटल लिमिटेड',
  'Sonapur Minerals and Oil Limited': 'सोनापुर मिनरल्स एण्ड आयल लिमिटेड',
  'Standard Chartered Bank Nepal Limited': 'स्ट्यान्डर्ड चार्टर्ड बैंक नेपाल लिमिटेड',
  'Sun Nepal Life Insurance Company Limited': 'सन नेपाल लाइफ इन्स्योरेन्स कम्पनी लिमिटेड',
  'Super Madi Hydropower Limited': 'सुपर माडी हाइड्रोपावर लिमिटेड',
  'Supermai Hydropower Limited': 'सुपरमाई हाइड्रोपावर लिमिटेड',
  'SuryaJyoti Life Insurance Company Limited': 'सूर्यज्योति लाइफ इन्स्योरेन्स कम्पनी लिमिटेड',
  'Suryodaya Womi Laghubitta Bittiya Sanstha Limited': 'सूर्योदय वोमी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Swabalamban Laghubitta Bittiya Sanstha Limited': 'स्वाबलम्बन लघुवित्त वित्तीय संस्था लिमिटेड',
  'Swabhimaan Laghubitta Bittiya Sanstha Limited': 'स्वभुमान लघुवित्त वित्तीय संस्था लिमिटेड',
  'Swarojgar Laghubitta Bittiya Sanstha Limited': 'स्वरोजगार लघुवित्त वित्तीय संस्था लिमिटेड',
  'Swastik Laghubitta Bittiya Sanstha Limited': 'स्वस्तिक लघुवित्त वित्तीय संस्था लिमिटेड',
  'Swet Ganga Hydropower and Construction Limited': 'स्वेट गंगा हाइड्रोपावर एण्ड कन्स्ट्रक्सन लिमिटेड',
  'SY Panel Nepal Limited': 'एसवाई प्यानल नेपाल लिमिटेड',
  'Synergy Power Development Limited': 'सिनर्जी पावर डेभलपमेन्ट लिमिटेड',
  'Taragaon Regency Hotel Limited': 'तारागाउँ रिजेन्सी होटल लिमिटेड',
  'Terhathum Power Company Limited': 'तेह्रथुम पावर कम्पनी लिमिटेड',
  'Three Star Hydropower Limited': 'थ्री स्टार हाइड्रोपावर लिमिटेड',
  'Trade Tower Limited': 'ट्रेड टावर लिमिटेड',
  'Trishuli Hydropower Company Limited': 'त्रिशूली जलविद्युत कम्पनी लिमिटेड',
  'Unilever Nepal Limited': 'युनिलिभर नेपाल लिमिटेड',
  'Union Hydropower Limited': 'युनियन हाइड्रोपावर लिमिटेड',
  'Unique Nepal Laghubitta Bittiya Sanstha Limited': 'युनिक नेपाल लघुवित्त वित्तीय संस्था लिमिटेड',
  'United Ajod Insurance Limited': 'युनाइटेड अजोड इन्स्योरेन्स लिमिटेड',
  'United Idi Mardi and RB Hydropower Limited': 'युनाइटेड इदी मार्डी एण्ड आरबी हाइड्रोपावर लिमिटेड',
  'United Modi Hydropower Limited': 'युनाइटेड मोदी हाइड्रोपावर लिमिटेड',
  'Universal Power Company Limited': 'युनिभर्सल पावर कम्पनी लिमिटेड',
  'Unnati Sahakari Laghubitta Bittiya Sanstha Limited': 'उन्नति सहकारी लघुवित्त वित्तीय संस्था लिमिटेड',
  'Upakar Laghubitta Bittiya Sanstha Limited': 'उपकार लघुवित्त वित्तीय संस्था लिमिटेड',
  'Upper Hewakhola Hydropower Company Limited': 'माथिल्लो हेवाखोला जलविद्युत कम्पनी लिमिटेड',
  'Upper Lohor Khola Hydropower Company Limited': 'माथिल्लो लोहोर खोला जलविद्युत कम्पनी लिमिटेड',
  'Upper Solu Electric Company Limited': 'माथिल्लो सोलु इलेक्ट्रिक कम्पनी लिमिटेड',
  'Upper Syange Hydropower Limited': 'माथिल्लो स्याङ्गे जलविद्युत लिमिटेड',
  'Upper Tamakoshi Hydropower Limited': 'माथिल्लो तामाकोशी जलविद्युत लिमिटेड',
  'Vijaya Laghubitta Bittiya Sanstha Limited': 'विजय लघुवित्त वित्तीय संस्था लिमिटेड',
  'Vision Lumbini Energy Company Limited': 'भिजन लुम्बिनी उर्जा कम्पनी लिमिटेड',
  'Wean Nepal Laghubitta Bittiya Sanstha Limited': 'वीन नेपाल लघुवित्त वित्तीय संस्था लिमिटेड'
};

const NORMALIZED_OVERRIDES = Object.entries(COMPANY_NAME_OVERRIDES).reduce((acc, [englishName, nepaliName]) => {
  const key = String(englishName || '').trim().toLowerCase();
  if (key) {
    acc[key] = nepaliName;
  }
  return acc;
}, {});

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

function normalizeCompanyName(name) {
  return String(name || '').trim().toLowerCase();
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

  const overrideKey = normalizeCompanyName(name);
  if (NORMALIZED_OVERRIDES[overrideKey]) {
    return NORMALIZED_OVERRIDES[overrideKey];
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
