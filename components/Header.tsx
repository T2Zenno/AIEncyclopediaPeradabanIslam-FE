import React, { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/translations';
import { useAuth } from '../contexts/LanguageContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
    onShowHistory: () => void;
    onShowDashboard: () => void;
    onNavigateHome: () => void;
    viewMode: 'encyclopedia' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ onShowHistory, onShowDashboard, onNavigateHome, viewMode }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage } = useLanguage();
  const { toggleTheme } = useTheme();

  const languages: { [key in 'id' | 'ar' | 'en']: string } = {
    en: 'English',
    id: 'Indonesia',
    ar: 'العربية',
  };

  const handleSelectLanguage = (lang: 'id' | 'ar' | 'en') => {
    setLanguage(lang);
    setIsLanguageMenuOpen(false);
    setIsMobileMenuOpen(false);
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setIsLanguageMenuOpen(false); // Close language dropdown too
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-gray-600 flex items-center justify-center ring-2 ring-amber-400/50">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <nav className="sticky top-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg z-20 border-b border-gray-300 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onNavigateHome} className="flex items-center gap-2 cursor-pointer" aria-label="Go to homepage">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 1 0-3z"></path>
                <path d="M12 6v-4"></path><path d="M6 12H2"></path><path d="m4.93 4.93 2.83 2.83"></path>
                <path d="M16 12L8 9.5"></path><circle cx="12" cy="12" r="1"></circle>
            </svg>
            <span className="font-bold text-lg hidden sm:block">{t('headerTitleShort')}</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="relative" ref={userMenuRef}>
                <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                <UserAvatar />
                <span className="font-semibold text-sm">{user?.username}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                </button>
                {isUserMenuOpen && (
                <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {viewMode === 'admin' ? (
                        <button
                            onClick={() => { onNavigateHome(); setIsUserMenuOpen(false); }}
                            className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
                            <span>{t('backToEncyclopedia')}</span>
                        </button>
                    ) : (
                        user?.role === 'Admin' && (
                           <button
                                onClick={() => { onShowDashboard(); setIsUserMenuOpen(false); }}
                                className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                                <span>{t('adminDashboard')}</span>
                            </button>
                        )
                    )}
                    <button
                        onClick={() => { onShowHistory(); setIsUserMenuOpen(false); }}
                        className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                        </svg>
                        <span>{t('history')}</span>
                    </button>

                    <button
                    onClick={logout}
                    className="w-full text-start flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>{t('authLogout')}</span>
                    </button>
                </div>
                )}
            </div>
          </div>
          
          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
             <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
            <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden pb-4 animate-fade-in-down">
                <div className="flex flex-col gap-1 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    
                    {/* Admin/Encyclopedia Toggle Section */}
                    {user?.role === 'Admin' && (
                        viewMode === 'admin' ? (
                            <button onClick={() => { onNavigateHome(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('backToEncyclopedia')}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
                            </button>
                        ) : (
                            <button onClick={() => { onShowDashboard(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('adminDashboard')}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                            </button>
                        )
                    )}

                    {/* History Section */}
                    <button onClick={() => { onShowHistory(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('historyPageTitle')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Language Section */}
                    <div>
                        <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono uppercase text-gray-500">{language}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${isLanguageMenuOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isLanguageMenuOpen && (
                             <div className="pt-1 pb-2 ps-4 pe-2 space-y-1">
                                {(Object.keys(languages) as Array<keyof typeof languages>).map((lang) => (
                                    <button
                                    key={lang}
                                    onClick={() => handleSelectLanguage(lang)}
                                    className={`w-full text-start px-3 py-2 text-sm rounded-md ${
                                        language === lang 
                                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                                        : 'text-gray-700 dark:text-gray-200'
                                    } hover:bg-amber-50 dark:hover:bg-gray-700`}
                                    >
                                    {languages[lang]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Theme Section - FIXED */}
                    <div 
                        onClick={toggleTheme} 
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme() }}
                        role="button"
                        tabIndex={0}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme')}</span>
                        <ThemeSwitcher asButton={false} />
                    </div>
                    
                    <hr className="border-gray-200 dark:border-gray-700 my-2" />

                    {/* User Profile Section */}
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <UserAvatar />
                            <div>
                                <p className="font-semibold text-sm truncate">{user?.username}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={logout} title={t('authLogout')} className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700 my-2" />
                    
                    {/* Close Button */}
                    <div className="flex justify-center mt-2">
                         <button onClick={() => setIsMobileMenuOpen(false)} title={t('close')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
