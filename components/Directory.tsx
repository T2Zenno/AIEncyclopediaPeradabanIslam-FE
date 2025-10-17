import React, { useMemo } from 'react';
import { useTranslation } from '../lib/translations';
import type { DirectoryData, DirectoryCategory, LanguageCode } from '../types';

const iconMap: { [key: string]: React.ReactElement } = {
  "Era & Kekhalifahan": <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  "Ilmu Pengetahuan & Filsafat": <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2.25 2.25 0 003.182-3.182l-5.483-5.484a2.25 2.25 0 00-3.182 0l-1.618 1.618a2.25 2.25 0 000 3.182l5.483 5.484z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 13.5L13.5 16.5m3-3l-3 3m3-3l-3 3M12 3.75l-3.75 3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75L15.75 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12l3.75-3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15.75L3.75 12" /></svg>,
  "Seni & Arsitektur": <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>,
  "Perdagangan & Ekonomi": <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.78-5.652-2.095m0 0c-1.512 1.315-3.52 2.095-5.652 2.095-1.045 0-2.036-.12-2.885-.355a1.02 1.02 0 01-.589-1.202L5.25 5.491m0 0c.99-.203 1.99-.377 3-.52m0 0l-2.62 10.726" /></svg>,
  "Kehidupan Sosial & Budaya": <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  "Tokoh-Tokoh Penting": <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
};


interface DirectoryProps {
  onTopicClick: (query: string) => void;
  directoryData: DirectoryData;
}

const Directory: React.FC<DirectoryProps> = ({ onTopicClick, directoryData }) => {
  const { t, lang } = useTranslation();

  const currentLangData = useMemo(() => {
    return directoryData[lang as LanguageCode] || [];
  }, [lang, directoryData]);

  return (
    <div className="bg-white/60 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-300 dark:border-gray-700 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{t('directoryTitle')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('directorySubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentLangData.map((section: DirectoryCategory) => (
          <div key={section.category} className="bg-amber-50/40 dark:bg-gray-700/30 p-5 rounded-lg">
            <div className="flex flex-col items-center text-center mb-3">
              {iconMap[section.category] || iconMap["Era & Kekhalifahan"]}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{section.category}</h3>
            </div>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => onTopicClick(item)} 
                    className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-300 hover:underline transition-colors duration-200"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Directory;