
import React from 'react';
import { useTranslation } from '../lib/translations';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="text-center py-6 mt-12">
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t('footerText')}
        </p>
        <div className="flex items-center gap-4">
            <a href="#about" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                {t('footerAbout')}
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;