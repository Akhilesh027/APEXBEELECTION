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
    en: 'Ward Voter Search Portal',
    te: 'వార్డు ఓటర్ల శోధన పోర్టల్',
  },
  govSubtitle: {
    en: 'Ward Voter Directory & Search Access',
    te: 'వార్డు ఓటర్ల జాబితా శోధన',
  },
  searchHeading: {
    en: 'Search Voter Details in the Roll',
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
    en: 'Print Voter Slip',
    te: 'ఓటరు పత్రం',
  },
};

/**
 * Masks a voter card / EPIC number for viewer privacy
 * Example: "XBC0705111" -> "XBC0X0X1X1"
 */
export const maskVoterId = (id) => {
  if (!id) return '';
  const str = id.toString().trim();
  return str
    .split('')
    .map((char, index) => {
      if (index >= 4 && (index - 4) % 2 === 0) {
        return 'X';
      }
      return char;
    })
    .join('');
};
