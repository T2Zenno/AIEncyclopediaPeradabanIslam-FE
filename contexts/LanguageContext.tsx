import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '../types';
import { authService } from '../services/geminiService';

// --- Language Context ---
type Language = 'id' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('language') as Language;
      if (storedLang && ['id', 'ar', 'en'].includes(storedLang)) {
        return storedLang;
      }
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'ar') return 'ar';
      if (browserLang === 'id') return 'id';
    }
    return 'en'; // Default to English
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const value = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to initialize auth state", e);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, password_confirmation: string) => {
    const user = await authService.register(username, email, password, password_confirmation);
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = { user, isAuthenticated, isInitializing, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// --- Status Context ---
interface StatusContextType {
  loadingMessage: string | null;
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const showLoading = (message: string) => {
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setLoadingMessage(null);
  };

  return (
    <StatusContext.Provider value={{ loadingMessage, showLoading, hideLoading }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = (): StatusContextType => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};