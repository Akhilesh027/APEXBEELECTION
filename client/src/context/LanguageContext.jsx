import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default is English ('EN'), options: 'EN' (English default), 'BOTH' (English + Telugu), 'TE' (Telugu)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('portal_lang') || 'EN';
  });

  useEffect(() => {
    localStorage.setItem('portal_lang', language);
  }, [language]);

  /**
   * Helper function to get text according to selected mode
   * @param {string} en - English text (default)
   * @param {string} te - Telugu translation text
   * @param {string} format - 'primary' (shows EN first, TE secondary) | 'inline'
   */
  const t = (en, te) => {
    if (!te) return en;
    if (language === 'EN') return en;
    if (language === 'TE') return te;
    // 'BOTH' format
    return `${en} (${te})`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'EN',
      setLanguage: () => {},
      t: (en) => en,
    };
  }
  return context;
};
