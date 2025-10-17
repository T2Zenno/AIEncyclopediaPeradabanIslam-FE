
import React from 'react';
import type { Figure } from '../types';
import { useTranslation } from '../lib/translations';

interface FiguresPanelProps {
  figures: Figure[];
}

const FiguresPanel: React.FC<FiguresPanelProps> = ({ figures }) => {
  const { t } = useTranslation();

  if (!figures || figures.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {figures.map((figure, index) => (
        <div key={index} className="bg-amber-50/40 dark:bg-gray-700/30 rounded-lg p-5 flex flex-col transition-transform transform hover:scale-105 duration-300 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500">
            <div className="text-center flex-grow">
                <div className="flex-shrink-0 mb-3 inline-block">
                    <div className="w-16 h-16 rounded-full bg-amber-200 dark:bg-gray-600 flex items-center justify-center ring-2 ring-amber-400/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-700 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-300">{figure.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{figure.lifespan}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{figure.summary}</p>
            </div>
            
            {figure.key_contributions && figure.key_contributions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200 dark:border-gray-600 w-full">
                    <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-300 mb-2">{t('keyContribution')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {figure.key_contributions.map((contribution, cIndex) => (
                            <li key={cIndex}>{contribution}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default FiguresPanel;