// Client-side English to Telugu Transliteration and Translation Utility

/**
 * Transliterates an English phonetic text to Telugu using Google's public Input Tools API
 * Example: "Ramesh Jonnalagadda" -> "రమేష్ జొన్నలగడ్డ"
 */
export const transliterateToTelugu = async (englishText) => {
  if (!englishText || !englishText.trim()) return '';

  try {
    const cleanText = englishText.trim();
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(cleanText)}&itc=te-t-i0-und&num=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
      // Map all tokens to their top Telugu suggestions
      const teluguWords = data[1].map((item) => {
        if (item && item[1] && item[1][0]) {
          return item[1][0];
        }
        return item[0] || '';
      });
      return teluguWords.join(' ');
    }
  } catch (err) {
    console.warn('Telugu transliteration error:', err);
  }

  // Fallback: Dictionary for common Telugu electoral terms
  const fallbackDict = {
    'Ramesh': 'రమేష్',
    'Suresh': 'సురేష్',
    'Kumar': 'కుమార్',
    'Rao': 'రావు',
    'Reddy': 'రెడ్డి',
    'Naidu': 'నాయుడు',
    'Guntur': 'గుంటూరు',
    'West': 'పశ్చిమ',
    'Elementary': 'ప్రాథమిక',
    'School': 'పాఠశాల'
  };

  const words = englishText.trim().split(/\s+/);
  return words.map(w => fallbackDict[w] || w).join(' ');
};

/**
 * Common bilingual labels with English as primary default
 */
export const labels = {
  portalTitle: {
    en: 'National Electoral Services Portal',
    te: 'జాతీయ ఓటరు సేవా పోర్టల్',
  },
  govSubtitle: {
    en: 'Government of India • State Election Commission',
    te: 'భారత ప్రభుత్వం • రాష్ట్ర ఎన్నికల సంఘం',
  },
  helpline: {
    en: 'Voter Helpline: 1950 (Toll-Free)',
    te: 'ఓటరు హెల్ప్‌లైన్: 1950',
  },
  searchHeading: {
    en: 'Search Your Details in the Electoral Roll',
    te: 'ఓటరు జాబితాలో మీ వివరాలు వెతకండి',
  },
  searchPlaceholder: {
    en: 'Enter EPIC Card No. (e.g. XBC1893429), Name, or House No...',
    te: 'ఓటరు ఐడి (EPIC No.), పేరు, లేదా ఇంటి సంఖ్య నమోదు చేయండి...',
  },
  searchBtn: {
    en: 'Search Roll',
    te: 'శోధించండి',
  },
  printSlip: {
    en: 'Print Official Voter Slip',
    te: 'అధికారిక ఓటరు పత్రం',
  },
};
