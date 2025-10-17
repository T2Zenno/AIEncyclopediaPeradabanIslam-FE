import React from 'react';
import { useTranslation } from '../lib/translations';

interface FooterBannerProps {
  onStartJourney: () => void;
}

const FooterBanner: React.FC<FooterBannerProps> = ({ onStartJourney }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
      <div className="relative bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:via-amber-600 dark:to-amber-700 rounded-lg shadow-xl overflow-hidden p-8 md:p-12">
        <div 
          className="absolute inset-0 bg-repeat opacity-10" 
          style={{backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="%23000" fill-opacity="0.4"><path d="M50 0 L100 50 L50 100 L0 50 Z M50 12.5 L87.5 50 L50 87.5 L12.5 50 Z"/></g></svg>')`}}
        ></div>
        <div className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {t('bannerTitle')}
          </h2>
          <p className="mt-4 text-lg text-amber-100 max-w-2xl mx-auto">
            {t('bannerSubtitle')}
          </p>
          <div className="mt-8">
            <button
              onClick={onStartJourney}
              className="bg-white hover:bg-amber-50 text-amber-600 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 duration-300 shadow-lg text-lg flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              {t('bannerButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterBanner;
