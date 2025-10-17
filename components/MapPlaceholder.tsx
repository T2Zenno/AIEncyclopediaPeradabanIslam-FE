
import React from 'react';
import { useTranslation } from '../lib/translations';

interface MapPlaceholderProps {
  loading: boolean;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ loading }) => {
  const { t } = useTranslation();

  const icon = loading ? (
    <svg className="mx-auto h-12 w-12 mb-2 animate-spin text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 10v-5.25m0 5.25l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10v-5.25m0 5.25l-6-3" />
    </svg>
  );

  const text = loading ? t('mapLoading') : t('mapNoData');
  const ariaLabel = loading ? t('mapLoading') : t('mapNoData');

  return (
    <div className={`h-96 w-full bg-gray-200 dark:bg-gray-700/50 rounded-lg flex items-center justify-center ${loading ? 'animate-pulse' : ''}`} aria-label={ariaLabel}>
      <div className="text-center text-gray-500 dark:text-gray-400">
        {icon}
        <p className="text-lg font-medium">{text}</p>
      </div>
    </div>
  );
};

export default MapPlaceholder;
