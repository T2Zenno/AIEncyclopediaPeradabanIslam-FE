

import React, { Suspense, lazy } from 'react';
import type { MapData } from '../types';
import MapPlaceholder from './MapPlaceholder';
import { useTranslation } from '../lib/translations';

const InteractiveMap = lazy(() => import('./InteractiveMap'));

interface MapPanelProps {
  mapData: MapData | null;
  onReset: () => void;
  isLoading: boolean;
}

const MapPanel: React.FC<MapPanelProps> = ({ mapData, onReset, isLoading }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full bg-white/60 dark:bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-gray-300 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">{t('mapTitle')}</h3>
        <button
          onClick={onReset}
          className="text-xs py-1 px-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          title={t('mapReset')}
        >
          {t('mapReset')}
        </button>
      </div>
      <div className="w-full">
        {isLoading ? (
          <MapPlaceholder loading={true} />
        ) : mapData ? (
          <Suspense fallback={<MapPlaceholder loading={true} />}>
            <InteractiveMap mapData={mapData} />
          </Suspense>
        ) : (
          <MapPlaceholder loading={false} />
        )}
      </div>
    </div>
  );
};

export default MapPanel;