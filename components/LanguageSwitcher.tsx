import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const languages: { [key in 'id' | 'ar' | 'en']: string } = {
  en: 'English',
  id: 'Indonesia',
  ar: 'العربية',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const selectLanguage = (lang: 'id' | 'ar' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 flex items-center justify-center gap-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors duration-200"
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>
      </button>

      {isOpen && (
        <div 
            className="absolute end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30 animate-fade-in-down"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu-button"
        >
          {(Object.keys(languages) as Array<keyof typeof languages>).map((lang) => (
            <button
              key={lang}
              onClick={() => selectLanguage(lang)}
              className={`w-full text-start px-4 py-2 text-sm ${
                language === lang 
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                : 'text-gray-700 dark:text-gray-200'
              } hover:bg-amber-50 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              {languages[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
