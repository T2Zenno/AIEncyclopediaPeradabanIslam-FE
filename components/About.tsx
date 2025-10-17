import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../lib/translations';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <div 
      className="fixed inset-0 bg-gray-800/70 dark:bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 end-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          aria-label={t('aboutCloseButton')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-300 mb-4">{t('aboutTitle')}</h2>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p>
                <strong>{t('headerTitle')}</strong> {t('aboutIntro')}
            </p>
            <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400 !mt-6 !mb-2">{t('aboutMissionTitle')}</h3>
            <p>
                {t('aboutMissionText')}
            </p>
            <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400 !mt-6 !mb-2">{t('aboutTechTitle')}</h3>
            <ul>
                <li>{t('aboutTechAI')}</li>
                <li>{t('aboutTechWebSearch')}</li>
                <li>{t('aboutTechInterface')}</li>
                <li>{t('aboutTechViz')}</li>
            </ul>
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                {t('aboutDisclaimer')}
            </p>
        </div>
      </div>
    </div>
  );
};

export default About;
