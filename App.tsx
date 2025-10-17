import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import Navbar from './components/Header';
import SearchBar from './components/SearchBar';
import ResponseDisplay from './components/ResponseDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Directory from './components/Directory';
import Footer from './components/Footer';
import FooterBanner from './components/FooterBanner';
import About from './components/About';
import History from './components/History';
import MapPanel from './components/MapPanel';
import { fetchAnswer, authService, contentService } from './services/geminiService';
import type { MultiLangGeminiResponse, MapData, HistoryItem, HistoryListItem, User, LanguageCode, UserWithStats, DirectoryData, DirectoryCategory, Role } from './types';
import { useTranslation } from './lib/translations';
import { useAuth, useStatus } from './contexts/LanguageContext';
import AuthPage from './components/Welcome';

const defaultDirectoryData: DirectoryData = {
  id: [
    { category: "Era & Kekhalifahan", icon: "Era & Kekhalifahan", items: [ "Masa Khulafaur Rasyidin", "Kekhalifahan Umayyah di Damaskus", "Kekhalifahan Abbasiyah di Baghdad", "Keemasan Islam di Al-Andalus", "Kesultanan Utsmaniyah", "Dinasti Seljuk", ] },
    { category: "Ilmu Pengetahuan & Filsafat", icon: "Ilmu Pengetahuan & Filsafat", items: [ "Kontribusi Al-Khawarizmi dalam Aljabar", "Penemuan Ibnu Sina di bidang Kedokteran", "Karya optik Ibnu al-Haytham", "Filsafat Ibnu Rusyd (Averroes)", "Rumah Kebijaksanaan (Bayt al-Hikmah)", "Observatorium Maragheh", ] },
    { category: "Seni & Arsitektur", icon: "Seni & Arsitektur", items: [ "Arsitektur Masjid Agung Cordoba", "Keindahan Kaligrafi Kufi dan Naskh", "Istana Alhambra di Granada", "Pengaruh Seni Islam di Eropa", "Pola Geometris dalam Seni Islam", "Masjid Biru (Blue Mosque) di Istanbul", ] },
    { category: "Perdagangan & Ekonomi", icon: "Perdagangan & Ekonomi", items: [ "Jalur Sutra dan Peran Pedagang Muslim", "Sistem Mata Uang: Dinar dan Dirham", "Konsep Wakaf dan Peranannya dalam Ekonomi", "Teknik Perbankan Awal: Cek dan Hawala", "Pasar-pasar Terkenal di Dunia Islam", "Peraturan Perdagangan dan Hisbah", ] },
    { category: "Kehidupan Sosial & Budaya", icon: "Kehidupan Sosial & Budaya", items: [ "Peran pasar (souk) dalam masyarakat", "Sistem pendidikan: Madrasah dan Kuttab", "Pakaian dan mode di era Abbasiyah", "Perayaan hari besar Islam secara historis", "Peran wanita dalam keilmuan Islam", "Musik dan puisi di Andalusia" ] },
    { category: "Tokoh-Tokoh Penting", icon: "Tokoh-Tokoh Penting", items: [ "Biografi Salahuddin Al-Ayyubi", "Perjalanan Ibnu Battuta", "Sultan Muhammad Al-Fatih", "Al-Zahrawi, Bapak Bedah Modern", "Fatima al-Fihri, pendiri universitas", "Jalaluddin Rumi dan sufisme", ] }
  ],
  ar: [
    { category: "العصور والخلافات", icon: "Era & Kekhalifahan", items: [ "عصر الخلفاء الراشدين", "الخلافة الأموية في دمشق", "الخلافة العباسية في بغداد", "العصر الذهبي للإسلام في الأندلس", "السلطنة العثمانية", "الدولة السلجوقية" ] },
    { category: "العلوم والفلسفة", icon: "Ilmu Pengetahuan & Filsafat", items: [ "مساهمات الخوارزمي في الجبر", "اكتشافات ابن سينا في الطب", "أعمال ابن الهيثم في البصريات", "فلسفة ابن رشد", "بيت الحكمة", "مرصد مراغة" ] },
    { category: "الفن والعمارة", icon: "Seni & Arsitektur", items: [ "عمارة جامع قرطبة الكبير", "جماليات الخط الكوفي والنسخ", "قصر الحمراء في غرناطة", "تأثير الفن الإسلامي في أوروبا", "الأنماط الهندسية في الفن الإسلامي", "المسجد الأزرق في اسطنبول" ] },
    { category: "التجارة والاقتصاد", icon: "Perdagangan & Ekonomi", items: [ "طريق الحرير ودور التجار المسلمين", "نظام العملات: الدينار والدرهم", "مفهوم الوقف ودوره في الاقتصاد", "تقنيات مصرفية مبكرة: الشيكات والحوالة", "الأسواق الشهيرة في العالم الإسلامي", "تنظيم التجارة والحسبة" ] },
    { category: "الحياة الاجتماعية والثقافة", icon: "Kehidupan Sosial & Budaya", items: [ "دور السوق في المجتمع الإسلامي", "نظام التعليم: المدرسة والكُتّاب", "الملابس والموضة في العصر العباسي", "الاحتفال بالأعياد الإسلامية تاريخياً", "دور المرأة في العلوم الإسلامية", "الموسيقى والشعر في الأندلس" ] },
    { category: "شخصيات بارزة", icon: "Tokoh-Tokoh Penting", items: [ "سيرة صلاح الدين الأيوبي", "رحلات ابن بطوطة", "السلطان محمد الفاتح", "الزهراوي، أبو الجراحة الحديثة", "فاطمة الفهرية، مؤسسة الجامعة", "جلال الدين الرومي والتصوف" ] }
  ],
  en: [
    { category: "Eras & Caliphates", icon: "Era & Kekhalifahan", items: [ "Era of the Rashidun Caliphate", "Umayyad Caliphate in Damascus", "Abbasid Caliphate in Baghdad", "Islamic Golden Age in Al-Andalus", "The Ottoman Empire", "The Seljuk Dynasty", ] },
    { category: "Science & Philosophy", icon: "Ilmu Pengetahuan & Filsafat", items: [ "Al-Khwarizmi's Contributions to Algebra", "Ibn Sina's Discoveries in Medicine", "Ibn al-Haytham's works on Optics", "The Philosophy of Ibn Rushd (Averroes)", "The House of Wisdom (Bayt al-Hikmah)", "The Maragheh Observatory", ] },
    { category: "Art & Architecture", icon: "Seni & Arsitektur", items: [ "Architecture of the Great Mosque of Cordoba", "The Beauty of Kufic and Naskh Calligraphy", "The Alhambra Palace in Granada", "Influence of Islamic Art in Europe", "Geometric Patterns in Islamic Art", "The Blue Mosque in Istanbul", ] },
    { category: "Trade & Economy", icon: "Perdagangan & Ekonomi", items: [ "The Silk Road and Muslim Traders", "Currency System: Dinar and Dirham", "The Concept of Waqf (Endowment)", "Early Banking: Cheques and Hawala", "Famous Bazaars of the Islamic World", "Trade Regulations and Hisbah", ] },
    { category: "Social Life & Culture", icon: "Kehidupan Sosial & Budaya", items: [ "The role of the souk (market) in society", "Education system: Madrasah and Kuttab", "Clothing and fashion in the Abbasid era", "Historical celebration of Islamic holidays", "The role of women in Islamic scholarship", "Music and poetry in Andalusia" ] },
    { category: "Key Figures", icon: "Tokoh-Tokoh Penting", items: [ "Biography of Saladin", "The Travels of Ibn Battuta", "Sultan Mehmed the Conqueror", "Al-Zahrawi, Father of Modern Surgery", "Fatima al-Fihri, university founder", "Jalaluddin Rumi and Sufism", ] }
  ],
};


// --- New PDF Content Component (for rendering exportable content) ---
const PdfContent: React.FC<{ item: HistoryItem; lang: LanguageCode; t: (key: string, replacements?: any) => string }> = ({ item, lang, t }) => {
    const response = item.response[lang];

    const formattedContent = useMemo(() => {
        const processInlineMarkdown = (line: string) => {
            return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        };

        return response.text.split('\n').map((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('#')) {
                const text = trimmedLine.replace(/^(#\s*)+/, '');
                return `<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #333;">${text}</h2>`;
            }
            if (trimmedLine.startsWith('*')) {
                return `<li style="margin-left: 1.5rem; margin-bottom: 0.5rem; line-height: 1.6;">${processInlineMarkdown(trimmedLine.substring(1).trim())}</li>`;
            }
            if (trimmedLine.length === 0) return '';
            return `<p style="margin-bottom: 1rem; line-height: 1.6;">${processInlineMarkdown(line)}</p>`;
        }).join('');
    }, [response.text]);

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#000', padding: '40px', background: '#fff', width: '100%' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem', color: '#111' }}>
                {item.query}
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2rem' }}>
                {t('searchedOn')}: {new Date(item.timestamp).toLocaleString()}
            </p>
            
            <div dangerouslySetInnerHTML={{ __html: `<ul>${formattedContent}</ul>` }} />

            {response.keyTerms && response.keyTerms.length > 0 && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>{t('tabKeyTerms')}</h3>
                    {response.keyTerms.map(term => (
                        <div key={term.term} style={{ marginBottom: '1rem' }}>
                            <strong style={{ display: 'block', color: '#111' }}>{term.term}</strong>
                            <p style={{ margin: '0.25rem 0' }}>{term.definition}</p>
                        </div>
                    ))}
                </div>
            )}
            
             {response.timeline && response.timeline.length > 0 && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>{t('tabTimeline')}</h3>
                    {response.timeline.map(event => (
                        <div key={event.title} style={{ marginBottom: '1rem' }}>
                            <strong style={{ display: 'block', color: '#111' }}>{event.year}: {event.title}</strong>
                            <p style={{ margin: '0.25rem 0' }}>{event.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Enhanced History Page Component ---
const HistoryPage: React.FC<{
  history: HistoryListItem[];
  lang: LanguageCode;
  onClose: () => void;
  onView: (item: HistoryListItem) => void;
  onDelete: (timestamp: number) => void;
  onClearAll: () => void;
}> = ({ history, lang, onClose, onView, onDelete, onClearAll }) => {
  const { t } = useTranslation();
  const { loadingMessage, showLoading, hideLoading } = useStatus();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item =>
      item.query.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const getFullHistoryItem = useCallback((item: HistoryListItem): HistoryItem | null => {
      const content = authService.getHistoryContent(item.timestamp);
      if (!content) return null;
      return { ...item, response: content };
  }, []);

  const handleExport = async (itemsToExport: HistoryListItem[]) => {
      if (itemsToExport.length === 0) return;
      
      const fullItemsToExport = itemsToExport
          .map(getFullHistoryItem)
          .filter((item): item is HistoryItem => item !== null);

      if (fullItemsToExport.length === 0) {
          alert(t('historyNoContentToExport'));
          return;
      }
      if (fullItemsToExport.length < itemsToExport.length) {
          alert(t('historyPartialContentToExport'));
      }
      
      showLoading(t('generatingPDF'));
  
      try {
          // @ts-ignore
          const { jsPDF } = window.jspdf;
          // @ts-ignore
          const html2canvas = window.html2canvas;
  
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-297mm'; // A4 width off-screen
          container.style.width = '210mm'; // A4 width for rendering
          container.style.background = '#fff';
          document.body.appendChild(container);
          const pdfRoot = ReactDOM.createRoot(container);
  
          for (let i = 0; i < fullItemsToExport.length; i++) {
              const item = fullItemsToExport[i];
              
              pdfRoot.render(<PdfContent item={item} lang={lang} t={t} />);
              await new Promise(resolve => setTimeout(resolve, 150));
              
              const canvas = await html2canvas(container, { scale: 2, useCORS: true });
              const imgData = canvas.toDataURL('image/png');
              
              const imgProps = pdf.getImageProperties(imgData);
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
              
              let heightLeft = pdfHeight;
              let position = 0;
              const pageHeight = pdf.internal.pageSize.getHeight();

              if (i > 0) {
                  pdf.addPage();
              }
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
              heightLeft -= pageHeight;

              while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
              }
          }
          
          pdfRoot.unmount();
          document.body.removeChild(container);
          
          const fileName = fullItemsToExport.length > 1 
            ? `history-export-${new Date().toISOString().split('T')[0]}.pdf`
            : `${fullItemsToExport[0].query.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.pdf`;

          pdf.save(fileName);
  
      } catch (error) {
          console.error("Failed to export history to PDF:", error);
          alert(t('pdfExportFailed'));
      } finally {
          hideLoading();
      }
  };

  const handleClear = () => {
    if (window.confirm(t('confirmClearHistory'))) {
      onClearAll();
    }
  };
  
  const isActionInProgress = !!loadingMessage;

  return (
    <div 
      className="fixed inset-0 bg-gray-800/70 dark:bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 shrink-0 gap-4">
          <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-300">{t('historyPageTitle')}</h2>
          <div className="relative w-full sm:w-auto sm:max-w-xs">
             <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 start-3 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
             <input 
                type="text"
                placeholder={t('searchHistoryPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm ps-9 pe-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
             />
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors sm:absolute sm:top-4 sm:end-4"
            aria-label={t('close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-xl font-semibold">{t('historyEmptyStateTitle')}</h3>
                <p className="mt-1">{searchTerm ? t('historyEmpty') : t('historyEmptyStateSubtitle')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredHistory.map(item => (
                <li key={item.timestamp} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-grow min-w-0 w-full">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate" title={item.query}>{item.query}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 mt-2 sm:mt-0">
                    <button onClick={() => handleExport([item])} disabled={isActionInProgress || !getFullHistoryItem(item)} className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait">
                      {t('exportToPDF')}
                    </button>
                    <button onClick={() => onView(item)} className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900 rounded-md transition-colors">{t('viewHistoryItem')}</button>
                    <button onClick={() => onDelete(item.timestamp)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" title={t('deleteHistoryItem')}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-300 dark:border-gray-700 shrink-0 gap-3">
            <button onClick={() => handleExport(filteredHistory)} disabled={filteredHistory.length === 0 || isActionInProgress} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                {t('exportAllToPDF')}
            </button>
            <button onClick={handleClear} disabled={history.length === 0} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-red-100 bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {t('clearAllHistory')}
            </button>
        </footer>
      </div>
    </div>
  );
};

// --- START: Admin Directory Editor ---
const DirectoryEditor: React.FC<{
    initialData: DirectoryData;
    onSave: (newData: DirectoryData) => void;
}> = ({ initialData, onSave }) => {
    const { t } = useTranslation();
    const [editedData, setEditedData] = useState<DirectoryData>(() => JSON.parse(JSON.stringify(initialData)));
    const [isDirty, setIsDirty] = useState(false);
    const { showLoading, hideLoading } = useStatus();

    const handleCategoryChange = (catIndex: number, lang: LanguageCode, value: string) => {
        setEditedData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next[lang][catIndex].category = value;
            // If Indonesian name is changed, also update the icon key
            if (lang === 'id') {
                next.id[catIndex].icon = value;
                next.ar[catIndex].icon = value;
                next.en[catIndex].icon = value;
            }
            return next;
        });
        setIsDirty(true);
    };

    const handleItemChange = (catIndex: number, itemIndex: number, lang: LanguageCode, value: string) => {
        setEditedData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next[lang][catIndex].items[itemIndex] = value;
            return next;
        });
        setIsDirty(true);
    };

    const handleAddCategory = () => {
        const newCategoryName = prompt(t('adminPromptCategory'));
        if (!newCategoryName || !newCategoryName.trim()) return;

        setEditedData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const newCat: DirectoryCategory = { category: newCategoryName, icon: newCategoryName, items: [] };
            const newCatAr: DirectoryCategory = { category: '', icon: newCategoryName, items: [] };
            const newCatEn: DirectoryCategory = { category: '', icon: newCategoryName, items: [] };
            next.id.push(newCat);
            next.ar.push(newCatAr);
            next.en.push(newCatEn);
            return next;
        });
        setIsDirty(true);
    };

    const handleRemoveCategory = (catIndex: number) => {
        if (!window.confirm(t('adminConfirmDeleteCategory', { name: editedData.id[catIndex].category }))) return;
        setEditedData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.id.splice(catIndex, 1);
            next.ar.splice(catIndex, 1);
            next.en.splice(catIndex, 1);
            return next;
        });
        setIsDirty(true);
    };

    const handleAddItem = (catIndex: number) => {
        setEditedData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.id[catIndex].items.push('');
            next.ar[catIndex].items.push('');
            next.en[catIndex].items.push('');
            return next;
        });
        setIsDirty(true);
    };

    const handleRemoveItem = (catIndex: number, itemIndex: number) => {
        if (!window.confirm(t('adminConfirmDeleteItem', { name: editedData.id[catIndex].items[itemIndex] || 'this item' }))) return;
        setEditedData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.id[catIndex].items.splice(itemIndex, 1);
            next.ar[catIndex].items.splice(itemIndex, 1);
            next.en[catIndex].items.splice(itemIndex, 1);
            return next;
        });
        setIsDirty(true);
    };

    const handleSave = async () => {
        showLoading(t('saving'));
        try {
            await onSave(editedData);
            setIsDirty(false);
        } catch (error) {
            console.error('Failed to save directory data:', error);
            alert(t('saveFailed'));
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={handleAddCategory} className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors">{t('adminAddCategory')}</button>
                <button onClick={handleSave} disabled={!isDirty} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('adminSave')}</button>
            </div>

            <div className="space-y-4">
                {editedData.id.map((cat, catIndex) => (
                    <div key={catIndex} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-600">
                             <h4 className="text-lg font-bold text-amber-600 dark:text-amber-300">{t('adminCategory')} #{catIndex + 1}</h4>
                             <button onClick={() => handleRemoveCategory(catIndex)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" title={t('adminDelete')}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('adminIconHelpText')}: <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">{editedData.id[catIndex].icon}</code></p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <InputField label={t('adminIndonesian')} value={editedData.id[catIndex].category} onChange={e => handleCategoryChange(catIndex, 'id', e.target.value)} />
                            <InputField label={t('adminArabic')} value={editedData.ar[catIndex].category} onChange={e => handleCategoryChange(catIndex, 'ar', e.target.value)} dir="rtl" />
                            <InputField label={t('adminEnglish')} value={editedData.en[catIndex].category} onChange={e => handleCategoryChange(catIndex, 'en', e.target.value)} />
                        </div>
                        
                        <h5 className="font-semibold mt-6 mb-2">{t('adminItems')}</h5>
                        <div className="space-y-3">
                            {cat.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
                                        <InputField label={`${t('adminIndonesian')} #${itemIndex + 1}`} value={editedData.id[catIndex].items[itemIndex]} onChange={e => handleItemChange(catIndex, itemIndex, 'id', e.target.value)} />
                                        <InputField label={`${t('adminArabic')} #${itemIndex + 1}`} value={editedData.ar[catIndex].items[itemIndex]} onChange={e => handleItemChange(catIndex, itemIndex, 'ar', e.target.value)} dir="rtl" />
                                        <InputField label={`${t('adminEnglish')} #${itemIndex + 1}`} value={editedData.en[catIndex].items[itemIndex]} onChange={e => handleItemChange(catIndex, itemIndex, 'en', e.target.value)} />
                                    </div>
                                    <button onClick={() => handleRemoveItem(catIndex, itemIndex)} className="mt-6 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" title={t('adminDelete')}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => handleAddItem(catIndex)} className="mt-4 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md transition-colors">{t('adminAddItem')}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <input {...props} className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
    </div>
);
// --- END: Admin Directory Editor ---


// --- REFACTORED: Admin Dashboard Page ---
const AdminDashboardPage: React.FC<{
    directoryData: DirectoryData;
    onDirectoryDataChange: (newData: DirectoryData) => void;
}> = ({ directoryData, onDirectoryDataChange }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalQueries: 0, queriesToday: 0, topTopics: [], recentQueries: [] });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<Role | 'All'>('All');


    const { showLoading, hideLoading } = useStatus();
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const lowerSearchTerm = userSearchTerm.toLowerCase();
            const searchMatch = user.username.toLowerCase().includes(lowerSearchTerm) ||
                                user.email.toLowerCase().includes(lowerSearchTerm);
            const roleMatch = userRoleFilter === 'All' || user.role === userRoleFilter;
            return searchMatch && roleMatch;
        });
    }, [users, userSearchTerm, userRoleFilter]);

    const handleExportUsers = () => {
        if (filteredUsers.length === 0) {
            alert(t('adminNoUsersToExport'));
            return;
        }

        const headers = ['id', 'username', 'email', 'role', 'queryCount', 'createdAt'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(user => {
                const createdAtDate = user.createdAt ? new Date(user.createdAt) : null;
                const createdAtStr = createdAtDate && !isNaN(createdAtDate.getTime()) ? createdAtDate.toISOString() : 'N/A';
                const userData = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    queryCount: user.queryCount,
                    createdAt: createdAtStr
                };
                return headers.map(header => {
                    const value = userData[header as keyof typeof userData];
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const refreshData = useCallback(async () => {
        try {
            const usersWithStats = await authService.getAllUsers();
            const allHistory = await authService.getAllHistory();

            setUsers(usersWithStats);

            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const queriesToday = allHistory.filter(h => h.timestamp >= startOfToday.getTime()).length;

            const topicCounts = allHistory.reduce((acc: Record<string, number>, curr) => {
                acc[curr.query] = (acc[curr.query] || 0) + 1;
                return acc;
            }, {});

            const topTopics = Object.entries(topicCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([query, count]) => ({ query, count }));

            const recentQueries = allHistory.slice(0, 5);

            setStats({ totalUsers: usersWithStats.length, totalQueries: allHistory.length, queriesToday, topTopics, recentQueries });
        } catch (error) {
            console.error('Failed to refresh admin data:', error);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleOpenUserModal = (user: UserWithStats | null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = (userData: Partial<User> & { password?: string }) => {
        showLoading(t('saving'));
        setTimeout(() => { // Simulate network delay
            try {
                if (userData.id) { // Editing
                    authService.updateUser(userData.id, { username: userData.username, role: userData.role });
                } else { // Creating
                    if (!userData.email || !userData.password || !userData.username) {
                        throw new Error("Email, username, and password are required for new users.");
                    }
                    authService.addUser(userData.username, userData.email, userData.password, userData.role || 'User');
                }
                refreshData(); // Refresh all data to reflect changes
            } catch (error: any) {
                alert(error.message);
            } finally {
                setIsUserModalOpen(false);
                setEditingUser(null);
                hideLoading();
            }
        }, 1000);
    };
    
    const handleDeleteUser = (user: UserWithStats) => {
        if (window.confirm(t('adminConfirmDeleteUser', { name: user.username }))) {
            showLoading(t('deleting'));
            setTimeout(() => { // Simulate network delay
                try {
                    authService.deleteUser(user.id);
                    refreshData();
                } catch (error: any) {
                    alert(error.message);
                } finally {
                    hideLoading();
                }
            }, 1000);
        }
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'users': return <UserManagementTab 
                users={filteredUsers} 
                onEdit={handleOpenUserModal} 
                onDelete={handleDeleteUser} 
                onAddUser={() => handleOpenUserModal(null)}
                searchTerm={userSearchTerm}
                onSearchTermChange={setUserSearchTerm}
                roleFilter={userRoleFilter}
                onRoleFilterChange={setUserRoleFilter}
                onExport={handleExportUsers}
            />;
            case 'content': return <ContentManagementTab 
                directoryData={directoryData} 
                onDirectoryDataChange={onDirectoryDataChange} 
            />;
            case 'overview': default: return <OverviewTab stats={stats} />;
        }
    };
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            {isUserModalOpen && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setIsUserModalOpen(false)}
                    onSave={handleSaveUser}
                />
            )}
            <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-300 mb-6">{t('adminDashboardTitle')}</h2>
            <div className="flex flex-col md:flex-row md:gap-8">
                <aside className="md:w-56 shrink-0 md:pe-8">
                    {/* Desktop Vertical Nav */}
                    <nav className="hidden md:flex flex-col gap-2">
                        <DashboardTabButton label={t('adminOverview')} isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <DashboardTabButton label={t('adminUserManagement')} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                        <DashboardTabButton label={t('adminContentManagement')} isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                    </nav>
                    {/* Mobile Dropdown Nav */}
                    <div className="md:hidden mb-6">
                        <label htmlFor="admin-nav-select" className="sr-only">{t('adminMobileNavLabel')}</label>
                        <select
                            id="admin-nav-select"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full px-4 py-3 text-base font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="overview">{t('adminOverview')}</option>
                            <option value="users">{t('adminUserManagement')}</option>
                            <option value="content">{t('adminContentManagement')}</option>
                        </select>
                    </div>
                </aside>
                <main className="flex-grow bg-white/60 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-300 dark:border-gray-700 min-w-0">
                    {renderContent()}
                </main>
            </div>
            <BackToTopButton />
        </div>
    );
};

const ContentManagementTab: React.FC<{
    directoryData: DirectoryData;
    onDirectoryDataChange: (newData: DirectoryData) => void;
}> = ({ directoryData, onDirectoryDataChange }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('adminDirectoryEditor')}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('adminDirectoryDesc')}</p>
            </div>
            <div className="mt-4">
                 <DirectoryEditor initialData={directoryData} onSave={onDirectoryDataChange} />
            </div>
        </div>
    );
};


const DashboardTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-start px-3 py-2 text-sm font-medium rounded-md transition-colors shrink-0 ${
            isActive 
            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
    >
        {label}
    </button>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-6">
        <div className="text-amber-500 dark:text-amber-400">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('adminTotalUsers')} value={stats.totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 6a4.5 4.5 0 00-3 1.22V18a2 2 0 002 2h2.5a2 2 0 002-2v-1.78A4.5 4.5 0 0010.5 12h-3zm6-3a3 3 0 100-6 3 3 0 000 6zm-1.5 6a4.5 4.5 0 00-3 1.22V18a2 2 0 002 2h2.5a2 2 0 002-2v-1.78A4.5 4.5 0 0016.5 12h-3z" /></svg>} />
                <StatCard title={t('adminTotalQueries')} value={stats.totalQueries} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>} />
                <StatCard title={t('adminQueriesToday')} value={stats.queriesToday} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">{t('adminTopTopics')}</h3>
                    <ul className="space-y-3">
                        {stats.topTopics.map((topic: any, index: number) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <span className="truncate pr-4">{topic.query}</span>
                                <span className="font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{topic.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-semibold mb-4">{t('adminRecentQueries')}</h3>
                     <ul className="space-y-3">
                         {stats.recentQueries.map((item: any) => (
                             <li key={item.timestamp} className="text-sm">
                                 <p className="truncate font-medium">{item.query}</p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{item.username} - {new Date(item.timestamp).toLocaleString()}</p>
                             </li>
                         ))}
                     </ul>
                </div>
            </div>
        </div>
    );
};

interface UserManagementTabProps {
    users: UserWithStats[];
    onEdit: (user: UserWithStats) => void;
    onDelete: (user: UserWithStats) => void;
    onAddUser: () => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    roleFilter: Role | 'All';
    onRoleFilterChange: (role: Role | 'All') => void;
    onExport: () => void;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ 
    users, onEdit, onDelete, onAddUser,
    searchTerm, onSearchTermChange, roleFilter, onRoleFilterChange, onExport
}) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 start-3 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder={t('adminSearchUserPlaceholder')}
                            className="w-full sm:w-64 text-sm ps-9 pe-4 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => onRoleFilterChange(e.target.value as Role | 'All')}
                        aria-label={t('adminFilterByRole')}
                        className="text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    >
                        <option value="All">{t('adminAllRoles')}</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
                    <button onClick={onExport} className="flex-grow lg:flex-grow-0 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        {t('adminExportCSV')}
                    </button>
                    <button onClick={onAddUser} className="flex-grow lg:flex-grow-0 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors">
                        {t('adminAddUser')}
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('adminTableUser')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('adminTableRole')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('adminTableQueryCount')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('adminTableJoined')}</th>
                            <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('adminTableActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">{user.queryCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEdit(user)} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title={t('adminEdit')}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                        <button onClick={() => onDelete(user)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400" title={t('adminDelete')}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserEditModal: React.FC<{
    user: Partial<User> | null;
    onClose: () => void;
    onSave: (user: Partial<User> & { password?: string }) => void;
}> = ({ user, onClose, onSave }) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('User');

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setRole(user.role || 'User');
            setPassword('');
        } else {
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('User');
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: Partial<User> & { password?: string } = {
            id: user?.id,
            username,
            email,
            role,
        };
        if (!user?.id && password) { // Only include password if it's a new user
            userData.password = password;
        }
        onSave(userData);
    };

    const isNewUser = !user?.id;

    return (
        <div className="fixed inset-0 bg-gray-800/70 dark:bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{isNewUser ? t('adminCreateUserTitle') : t('adminEditUserTitle')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('username')}</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('authEmail')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!isNewUser} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50" />
                    </div>
                    {isNewUser && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('role')}</label>
                        <select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md">{t('close')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md">{t('adminSave')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface EncyclopediaViewProps {
    onShowHistory: () => void;
    directoryData: DirectoryData;
    searchHistory: HistoryListItem[];
    onViewHistoryItem: (item: HistoryListItem) => void;
    // State and handlers lifted to App
    query: string;
    setQuery: (q: string) => void;
    geminiResponse: MultiLangGeminiResponse | null;
    isLoading: boolean;
    error: string | null;
    activeQuery: string;
    mapData: MapData | null;
    onSearch: (q: string) => void;
}

const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({
    onShowHistory,
    directoryData,
    searchHistory,
    onViewHistoryItem,
    query,
    setQuery,
    geminiResponse,
    isLoading,
    error,
    activeQuery,
    mapData,
    onSearch,
}) => {
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [historyKeywordFilter, setHistoryKeywordFilter] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('all');

  const searchSectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleHashChange = () => {
      setShowAbout(window.location.hash === '#about');
    };
    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
    onSearch(exampleQuery);
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartJourney = () => {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHistoryQuickClick = (item: HistoryListItem) => {
    onViewHistoryItem(item);
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredHistory = useMemo(() => {
    return searchHistory.filter(item => {
      const keywordMatch = item.query.toLowerCase().includes(historyKeywordFilter.toLowerCase());
      if (!keywordMatch) return false;
      
      const itemDate = new Date(item.timestamp);
      const now = new Date();
      switch (historyDateFilter) {
        case 'today': return itemDate.toDateString() === now.toDateString();
        case 'week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return itemDate >= oneWeekAgo;
        default: return true;
      }
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [searchHistory, historyKeywordFilter, historyDateFilter]);

  const { t, lang } = useTranslation();

  return (
    <>
      <div 
        className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-5 dark:opacity-10" 
        style={{backgroundImage: "url('https://picsum.photos/seed/islamicart/1920/1080')"}}
      ></div>
      
      {showAbout && <About onClose={() => setShowAbout(false)} />}

      <main className="relative z-10 flex flex-col flex-grow w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-amber-500 dark:text-amber-300 tracking-wider">
                        {t('headerTitle')}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{t('headerSubtitle')}</p>
                </div>

                <div ref={searchSectionRef} className="scroll-mt-8">
                    <SearchBar 
                      query={query}
                      setQuery={setQuery}
                      onSearch={onSearch} 
                      isLoading={isLoading} 
                    />
                    {searchHistory.length > 0 && (
                      <History 
                        history={filteredHistory} 
                        onHistoryClick={handleHistoryQuickClick}
                        onShowHistory={onShowHistory}
                        keywordFilter={historyKeywordFilter}
                        setKeywordFilter={setHistoryKeywordFilter}
                        dateFilter={historyDateFilter}
                        setDateFilter={setHistoryDateFilter}
                      />
                    )}
                </div>

                <div>
                     <MapPanel mapData={mapData} onReset={() => {}} isLoading={isLoading} />
                </div>
                
                <div id="response-section">
                  {isLoading && <LoadingSpinner />}
                  {error && <div className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>}
                  
                  {!isLoading && !error && geminiResponse && (
                    <ResponseDisplay response={geminiResponse[lang]} query={activeQuery} />
                  )}
                  
                  {!isLoading && !error && !geminiResponse && (
                    <Directory onTopicClick={handleExampleClick} directoryData={directoryData} />
                  )}
                </div>
            </div>
        </div>

        {!isLoading && !geminiResponse && <FooterBanner onStartJourney={handleStartJourney} />}

        <Footer />
      </main>
    </>
  );
};

// --- New "Back to Top" Button Component ---
const BackToTopButton: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = useCallback(() => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [toggleVisibility]);

    return (
        <button
            onClick={scrollToTop}
            aria-label={t('backToTop')}
            className={`fixed bottom-5 right-5 z-30 p-3 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
};

const GlobalLoadingIndicator: React.FC = () => {
    const { loadingMessage } = useStatus();

    if (!loadingMessage) {
        return null;
    }

    return (
        <div className="fixed bottom-5 left-5 z-50 bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in">
             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{loadingMessage}</span>
        </div>
    );
};


const App: React.FC = () => {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const { t, lang } = useTranslation();
    const [viewMode, setViewMode] = useState<'encyclopedia' | 'admin'>('encyclopedia');
    const [showHistoryPage, setShowHistoryPage] = useState<boolean>(false);
    const [searchHistory, setSearchHistory] = useState<HistoryListItem[]>([]);
    const [directoryData, setDirectoryData] = useState<DirectoryData>(defaultDirectoryData);

    useEffect(() => {
        const loadDirectoryData = async () => {
            try {
                const data = await contentService.getDirectoryData();
                if (data) {
                    setDirectoryData(data);
                }
            } catch (error) {
                console.error('Failed to load directory data:', error);
            }
        };
        loadDirectoryData();
    }, []);

    // --- STATE LIFTED FROM ENCYCLOPEDIA VIEW ---
    const [query, setQuery] = useState<string>('');
    const [geminiResponse, setGeminiResponse] = useState<MultiLangGeminiResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeQuery, setActiveQuery] = useState<string>('');
    const [mapData, setMapData] = useState<MapData | null>(null);

    const searchSectionRef = useRef<HTMLDivElement>(null);

    const defaultMapData: MapData = useMemo(() => ({
        center: [25, 45],
        zoom: 4,
        markers: [
            { position: [21.4225, 39.8262], popupContent: t('map_mecca') },
            { position: [24.4686, 39.6142], popupContent: t('map_medina') },
            { position: [31.7683, 35.2137], popupContent: t('map_jerusalem') },
            { position: [33.3152, 44.3661], popupContent: t('map_baghdad') },
            { position: [30.0444, 31.2357], popupContent: t('map_cairo') },
            { position: [41.0082, 28.9784], popupContent: t('map_istanbul') }
        ]
    }), [t]);

    // Effect to set the map data
    useEffect(() => {
        if (!geminiResponse) {
            setMapData(defaultMapData);
        } else {
            setMapData(geminiResponse[lang].map || defaultMapData);
        }
    }, [lang, geminiResponse, defaultMapData]);

    // --- LOGIC LIFTED FROM ENCYCLOPEDIA VIEW ---
    const handleSearch = useCallback(async (searchQuery: string) => {
        console.log('Starting search for query:', searchQuery);
        if (!searchQuery.trim() || !user) {
            setError(t('errorInvalidSearch'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeminiResponse(null);
        setMapData(null);

        try {
            console.log('Fetching answer from Gemini...');
            const response = await fetchAnswer(searchQuery);
            console.log('Received response:', response);
            setActiveQuery(searchQuery);
            setGeminiResponse(response);
            console.log('Gemini response set successfully');

            const newHistoryItem: HistoryItem = {
                query: searchQuery,
                timestamp: Date.now(),
                response: response,
                userId: user.id
            };

            await authService.addHistoryItem(newHistoryItem);

            setSearchHistory(prevHistory => {
                const otherHistory = prevHistory.filter(item => item.query !== searchQuery);
                const newListItem: HistoryListItem = { query: newHistoryItem.query, timestamp: newHistoryItem.timestamp, userId: user.id };
                return [newListItem, ...otherHistory].slice(0, 50);
            });

        } catch (err) {
            console.error('Error during search:', err);
            setError(t('errorFetching'));
            setMapData(defaultMapData);
        } finally {
            setIsLoading(false);
            console.log('Search completed');
        }
    }, [lang, t, defaultMapData, user, setSearchHistory]);
    
    // --- HISTORY MANAGEMENT ---
    useEffect(() => {
        const loadHistory = async () => {
            if (!user) return;
            try {
                const history = await authService.getHistoryListForUser();
                setSearchHistory(history);
            } catch (error) {
                console.error('Failed to load history:', error);
                setSearchHistory([]);
            }
        };
        loadHistory();
    }, [user]);
    
    const handleDeleteHistoryItem = async (timestamp: number) => {
        if (!user) return;
        try {
            await authService.deleteHistoryItemForUser(timestamp);
            setSearchHistory(prev => prev.filter(item => item.timestamp !== timestamp));
        } catch (error) {
            console.error('Failed to delete history item:', error);
        }
    };

    const handleClearHistory = async () => {
        if (!user) return;
        try {
            await authService.clearHistoryForUser();
            setSearchHistory([]);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    const handleViewHistoryItem = (item: HistoryListItem) => {
        const content = authService.getHistoryContent(item.timestamp);
        if (content) {
            setQuery(item.query);
            setActiveQuery(item.query);
            setGeminiResponse(content);
            setMapData(content[lang].map || defaultMapData);
            setError(null);
            setIsLoading(false);
        } else {
            // Content not in local cache, re-fetch it
            handleSearch(item.query);
        }
        setShowHistoryPage(false);
        searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDirectoryDataChange = async (newData: DirectoryData) => {
        setDirectoryData(newData);
        await contentService.saveDirectoryData(newData);
    };

    if (isInitializing) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthPage />;
    }
    
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-300">
        <Navbar 
          viewMode={viewMode}
          onShowHistory={() => setShowHistoryPage(true)} 
          onShowDashboard={() => setViewMode('admin')} 
          onNavigateHome={() => setViewMode('encyclopedia')}
        />
        
        {showHistoryPage && (
          <HistoryPage 
              history={searchHistory}
              lang={lang}
              onClose={() => setShowHistoryPage(false)}
              onView={handleViewHistoryItem}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearHistory}
          />
        )}
        
        <div ref={searchSectionRef}>
            {viewMode === 'encyclopedia' && (
                <EncyclopediaView 
                    onShowHistory={() => setShowHistoryPage(true)} 
                    directoryData={directoryData} 
                    searchHistory={searchHistory} 
                    onViewHistoryItem={handleViewHistoryItem}
                    query={query}
                    setQuery={setQuery}
                    geminiResponse={geminiResponse}
                    isLoading={isLoading}
                    error={error}
                    activeQuery={activeQuery}
                    mapData={mapData}
                    onSearch={handleSearch}
                />
            )}
        </div>
        {viewMode === 'admin' && user?.role === 'Admin' && <AdminDashboardPage directoryData={directoryData} onDirectoryDataChange={handleDirectoryDataChange} />}

        <BackToTopButton />
        <GlobalLoadingIndicator />
      </div>
    );
};

export default App;
