

import React from 'react';
// Fix: Change HistoryItem to HistoryListItem as this component only deals with the list representation, not the full response content.
import type { HistoryListItem } from '../types';
import { useTranslation } from '../lib/translations';

interface HistoryProps {
  // Fix: The history prop receives an array of items without the full response, so HistoryListItem[] is the correct type.
  history: HistoryListItem[];
  // Fix: The click handler is called with an item from the history list, so it should be HistoryListItem.
  onHistoryClick: (item: HistoryListItem) => void;
  onShowHistory: () => void;
  keywordFilter: string;
  setKeywordFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, onHistoryClick, onShowHistory, keywordFilter, setKeywordFilter, dateFilter, setDateFilter }) => {
  const { t } = useTranslation();
  const displayHistory = history.slice(0, 5);
  
  return (
    <div className="mt-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-grow min-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 start-3 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
                type="text"
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                placeholder={t('historyFilterPlaceholder')}
                className="w-full text-sm ps-9 pe-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
        >
          <option value="all">{t('dateAll')}</option>
          <option value="today">{t('dateToday')}</option>
          <option value="week">{t('dateWeek')}</option>
        </select>
      </div>

      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 px-1">{t('historyTitle')}</h3>
      
      {history.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {displayHistory.map((item) => (
            <button
              key={item.timestamp}
              onClick={() => onHistoryClick(item)}
              className="bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-sm py-1 px-3 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-300 transition-all duration-200 border border-gray-300 dark:border-gray-600 transform hover:scale-105"
              title={t('historyReopen', { query: item.query })}
            >
              {item.query}
            </button>
          ))}
          {history.length > 5 && (
            <button
              onClick={onShowHistory}
              className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline px-3 py-1 ml-2"
            >
              {t('historyViewAll')}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
          {t('historyEmpty')}
        </p>
      )}
    </div>
  );
};

export default History;
