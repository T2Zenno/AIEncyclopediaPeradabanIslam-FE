import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { GeminiResponse, ChartData, KeyTerm, TimelineEvent, Figure } from '../types';
import { ResponsiveContainer, LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../lib/translations';
import Timeline from './Timeline';
import FiguresPanel from './FiguresPanel';

const TabButton: React.FC<{
    name: string;
    icon: React.ReactElement;
    isActive: boolean;
    onClick: () => void;
}> = ({ name, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 shrink-0 ${
                isActive
                    ? 'bg-white/80 dark:bg-gray-800/80 border-b-2 border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            {icon}
            {name}
        </button>
    );
};

// Helper component for chart tooltips
const CustomChartTooltip: React.FC<{
    active?: boolean;
    payload?: any[];
    label?: string | number;
    xAxisKey: string;
}> = ({ active, payload, label, xAxisKey }) => {
    if (active && payload && payload.length) {
        const formattedLabelKey = xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1);
        return (
            <div className="bg-gray-100 dark:bg-gray-700 p-2 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <p className="label text-gray-800 dark:text-gray-200 font-bold">{`${formattedLabelKey}: ${label}`}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`item-${index}`} style={{ color: entry.color }}>
                        {`${entry.name} : ${entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Sub-component for rendering charts
const DataVisualization: React.FC<{ chartData: ChartData }> = ({ chartData }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    
    const sanitizedChartData = useMemo(() => {
        // 1. Lakukan validasi struktural awal. Jika ini gagal, kita tidak bisa pulih.
        if (
            !chartData ||
            typeof chartData !== 'object' ||
            !chartData.type ||
            !['bar', 'timeline', 'line'].includes(chartData.type) ||
            !Array.isArray(chartData.data) ||
            !chartData.xAxisKey ||
            typeof chartData.xAxisKey !== 'string' ||
            !Array.isArray(chartData.dataKeys) ||
            !chartData.dataKeys.every(key => typeof key === 'string') ||
            chartData.dataKeys.length === 0 // Bagan tanpa kunci data tidak berguna
        ) {
            console.warn("Struktur data bagan tidak valid atau kunci data kosong:", chartData);
            return null; // Menunjukkan data tidak valid
        }

        // 2. Bersihkan dan validasi larik data.
        const sanitizedData = chartData.data
            .map(item => {
                // Pastikan item adalah objek yang valid
                if (item === null || typeof item !== 'object') {
                    return null;
                }

                const sanitizedItem: { [key: string]: any } = { ...item };
                
                // Pastikan xAxisKey ada dan memiliki nilai. Jika tidak, titik data ini tidak berguna.
                if (!(chartData.xAxisKey in sanitizedItem) || sanitizedItem[chartData.xAxisKey] == null) {
                    return null;
                }

                // Pastikan semua dataKeys ada, dan nilainya adalah numerik.
                // Recharts membutuhkan angka untuk sumbu Y dan nilai batang/garis.
                for (const key of chartData.dataKeys) {
                    const val = sanitizedItem[key];
                    if (val === null || val === undefined) {
                        sanitizedItem[key] = null; // Pastikan itu null, bukan undefined
                        continue;
                    }
                    
                    let numVal: number | null = null;
                    if (typeof val === 'number' && isFinite(val)) {
                        numVal = val;
                    } else if (typeof val === 'string') {
                        // Tangani string seperti "1,234" atau "500 M" dengan menghapus karakter non-numerik
                        // Ini meningkatkan kemungkinan parsing yang berhasil.
                        const parsed = parseFloat(String(val).replace(/[^0-9.-]+/g,""));
                        if (!isNaN(parsed) && isFinite(parsed)) {
                           numVal = parsed;
                        }
                    }
                    
                    // Ganti nilai asli dengan nilai numerik yang dibersihkan, atau null jika tidak dapat di-parse.
                    sanitizedItem[key] = numVal;
                }

                return sanitizedItem;
            })
            .filter(item => {
                // Hapus item yang null atau di mana semua titik data menjadi null setelah sanitasi.
                if (!item) return false;
                // Simpan item jika setidaknya satu dari kuncinya memiliki nilai numerik.
                return chartData.dataKeys.some(key => typeof item[key] === 'number');
            });

        // Jika setelah sanitasi tidak ada data yang valid, itu tidak valid.
        if (sanitizedData.length === 0) {
            console.warn("Data bagan menjadi kosong setelah sanitasi:", chartData);
            return null;
        }

        return { ...chartData, data: sanitizedData as any[] };

    }, [chartData]);


    // Tangani data bagan yang tidak lengkap atau tidak valid dari API dengan baik
    if (!sanitizedChartData) {
        return (
            <div className="flex items-center justify-center min-h-[300px] text-center p-4">
                <div className="text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{t('invalidChartData')}</p>
                </div>
            </div>
        );
    }
    
    const { title, type, data, xAxisKey, dataKeys, yAxisLabel } = sanitizedChartData;
    
    const lightColors = ['#D97706', '#B45309', '#92400E', '#78350F'];
    const darkColors = ['#FBBF24', '#F59E0B', '#D97706', '#B45309']; 
    
    const colors = theme === 'dark' ? darkColors : lightColors;

    const renderTooltipContent = useCallback((props: any) => {
        const { active, payload, label } = props;
        return <CustomChartTooltip active={active} payload={payload} label={label} xAxisKey={xAxisKey} />;
    }, [xAxisKey]);

    const renderChart = () => {
        const isLineChart = type === 'timeline' || type === 'line';
        const ChartComponent = isLineChart ? LineChart : BarChart;
        const ChartElement = isLineChart ? Line : Bar;
        const textColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
        const gridColor = theme === 'dark' ? '#374151' : '#d1d5db';

        return (
            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey={xAxisKey} stroke={textColor} tick={{ fontSize: 12, fill: textColor }} />
                    <YAxis 
                        stroke={textColor} 
                        tick={{ fontSize: 12, fill: textColor }} 
                        domain={['dataMin', 'dataMax']} 
                        allowDataOverflow={true} 
                        label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: textColor, style: { textAnchor: 'middle' } } : undefined}
                    />
                    <Tooltip content={renderTooltipContent} />
                    <Legend wrapperStyle={{ color: textColor }} />
                    {dataKeys.map((key, index) => (
                        <ChartElement
                            key={key}
                            {...(isLineChart && { type: 'monotone' })}
                            dataKey={key}
                            stroke={colors[index % colors.length]}
                            fill={colors[index % colors.length]}
                        />
                    ))}
                </ChartComponent>
            </ResponsiveContainer>
        );
    };
    
    return (
        <div className="mt-4">
            {title && <h4 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">{title}</h4>}
            {renderChart()}
        </div>
    )
};


const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace and replace _ with -
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
};

interface Heading {
  text: string;
  id: string;
}

const TableOfContents: React.FC<{
    headings: Heading[];
    t: (key: string) => string;
}> = ({ headings, t }) => {
    if (headings.length <= 1) {
        return null;
    }
    return (
        <div className="mb-8 p-4 bg-amber-50/50 dark:bg-gray-700/50 border-s-4 border-amber-500 dark:border-amber-400 rounded-e-lg" role="navigation" aria-label={t('tocTitle')}>
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-300 mb-2">{t('tocTitle')}</h3>
            <ol className="list-decimal list-inside space-y-1">
            {headings.map((heading) => (
                <li key={heading.id}>
                <a href={`#${heading.id}`} className="text-gray-700 dark:text-gray-300 hover:underline hover:text-amber-600 dark:hover:text-amber-300 transition-colors">
                    {heading.text}
                </a>
                </li>
            ))}
            </ol>
        </div>
    );
};

const SummaryTab: React.FC<{ response: GeminiResponse }> = ({ response }) => {
    const { t } = useTranslation();
    const headings = useMemo<Heading[]>(() => {
        return response.text
        .split('\n')
        .filter(line => line.trim().startsWith('#'))
        .map(line => {
            const text = line.trim().replace(/^(#\s*)+/, '');
            return {
                text: text,
                id: slugify(text)
            };
        });
    }, [response.text]);

    const formattedContent = useMemo(() => {
        let headingIndex = 0;
        
        const processInlineMarkdown = (line: string) => {
            return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        };
        
        const lines = response.text.split('\n').filter(line => !line.trim().toLowerCase().startsWith('table of contents'));

        return lines.map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('#')) {
                const currentHeading = headings[headingIndex];
                headingIndex++;
                const text = trimmedLine.replace(/^(#\s*)+/, '');
                
                if (!text) return null;

                return (
                    <h2 
                        key={index} 
                        id={currentHeading?.id} 
                        className="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-6 mb-3 scroll-mt-20"
                    >
                        {text}
                    </h2>
                );
            }

            if (trimmedLine.startsWith('*')) {
                const content = processInlineMarkdown(trimmedLine.substring(1).trim());
                return <li key={index} className="ms-6 mb-2 list-disc" dangerouslySetInnerHTML={{ __html: content }} />;
            }

            if (trimmedLine.startsWith('>')) {
                const content = processInlineMarkdown(trimmedLine.substring(1).trim());
                return (
                    <blockquote key={index} className="border-s-4 border-gray-300 dark:border-gray-600 ps-4 italic my-4 text-gray-600 dark:text-gray-400">
                         <p dangerouslySetInnerHTML={{ __html: content }} />
                    </blockquote>
                );
            }

             if (trimmedLine.length === 0) {
                return null;
            }
            
            const content = processInlineMarkdown(line);
            return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
        }).filter(Boolean);
    }, [response.text, headings]);


    return (
        <>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
                <TableOfContents headings={headings} t={t} />
                {formattedContent}
            </div>

            {response.sources.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">{t('sourcesTitle')}</h3>
                  {response.accessDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('accessedOn')} {response.accessDate}</p>
                  )}
                </div>
                <ul className="space-y-2">
                    {response.sources.map((source, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        <a
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-300 hover:underline transition-colors break-all"
                        >
                        {source.web.title || source.web.uri}
                        </a>
                    </li>
                    ))}
                </ul>
                </div>
            )}
        </>
    );
};

const KeyTermsTab: React.FC<{ terms: KeyTerm[] }> = ({ terms }) => {
    const { t } = useTranslation();
    return (
        <dl className="space-y-4">
            {terms.map((item, index) => (
                <div key={index} className="p-4 bg-amber-50/40 dark:bg-gray-700/30 rounded-lg">
                    <dt className="font-bold text-lg text-amber-700 dark:text-amber-300">{item.term}</dt>
                    <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.definition}</dd>
                    {item.etymology && (
                        <dd className="mt-2 pt-2 border-t border-amber-200/60 dark:border-gray-600/60 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('etymology')}</span> {item.etymology}
                        </dd>
                    )}
                </div>
            ))}
        </dl>
    );
};

const GeneratedImageTab: React.FC<{ image: string; query: string; }> = ({ image, query }) => {
    const { t } = useTranslation();
    const imageUrl = `data:image/jpeg;base64,${image}`;
    
    // Buat alt text deskriptif berdasarkan kueri, dengan fallback umum.
    const altText = query ? t('aiImageAltWithTopic', { topic: query }) : t('aiImageAlt');

    return (
        <div className="text-center">
            <img src={imageUrl} alt={altText} className="rounded-lg shadow-lg mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('aiImageDisclaimer')}
            </p>
        </div>
    );
}

interface ResponseDisplayProps {
  response: GeminiResponse;
  query: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, query }) => {
    const { t } = useTranslation();

    const TABS = useMemo(() => ({
        SUMMARY: t('tabSummary'),
        VISUALIZATION: t('tabViz'),
        TIMELINE: t('tabTimeline'),
        FIGURES: t('tabFigures'),
        KEY_TERMS: t('tabKeyTerms'),
        AI_IMAGE: t('tabAiImage'),
    }), [t]);
    
    const [activeTab, setActiveTab] = useState(TABS.SUMMARY);

    const hasVisualization = !!response.chart;
    const hasTimeline = response.timeline && response.timeline.length > 0;
    const hasFigures = response.figures && response.figures.length > 0;
    const hasKeyTerms = response.keyTerms && response.keyTerms.length > 0;
    const hasGeneratedImage = !!response.generatedImage;
    
    useEffect(() => {
        const availableTabs = [TABS.SUMMARY];
        if (hasVisualization) availableTabs.push(TABS.VISUALIZATION);
        if (hasTimeline) availableTabs.push(TABS.TIMELINE);
        if (hasFigures) availableTabs.push(TABS.FIGURES);
        if (hasKeyTerms) availableTabs.push(TABS.KEY_TERMS);
        if (hasGeneratedImage) availableTabs.push(TABS.AI_IMAGE);

        if (!availableTabs.includes(activeTab)) {
            setActiveTab(TABS.SUMMARY);
        }
    }, [response, TABS, hasVisualization, hasTimeline, hasFigures, hasKeyTerms, hasGeneratedImage, activeTab]);

    return (
        <div className="bg-white/60 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-300 dark:border-gray-700 animate-fade-in">
            <div className="border-b border-gray-300 dark:border-gray-700 px-4" role="tablist">
                <div className="flex -mb-px overflow-x-auto">
                    <TabButton name={TABS.SUMMARY} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>} isActive={activeTab === TABS.SUMMARY} onClick={() => setActiveTab(TABS.SUMMARY)} />
                    {hasVisualization && <TabButton name={TABS.VISUALIZATION} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>} isActive={activeTab === TABS.VISUALIZATION} onClick={() => setActiveTab(TABS.VISUALIZATION)} />}
                    {hasTimeline && <TabButton name={TABS.TIMELINE} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>} isActive={activeTab === TABS.TIMELINE} onClick={() => setActiveTab(TABS.TIMELINE)} />}
                    {hasFigures && <TabButton name={TABS.FIGURES} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 6a4.5 4.5 0 00-3 1.22V18a2 2 0 002 2h2.5a2 2 0 002-2v-1.78A4.5 4.5 0 0010.5 12h-3zm6-3a3 3 0 100-6 3 3 0 000 6zm-1.5 6a4.5 4.5 0 00-3 1.22V18a2 2 0 002 2h2.5a2 2 0 002-2v-1.78A4.5 4.5 0 0016.5 12h-3z" /></svg>} isActive={activeTab === TABS.FIGURES} onClick={() => setActiveTab(TABS.FIGURES)} />}
                    {hasKeyTerms && <TabButton name={TABS.KEY_TERMS} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} isActive={activeTab === TABS.KEY_TERMS} onClick={() => setActiveTab(TABS.KEY_TERMS)} />}
                    {hasGeneratedImage && <TabButton name={TABS.AI_IMAGE} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>} isActive={activeTab === TABS.AI_IMAGE} onClick={() => setActiveTab(TABS.AI_IMAGE)} />}
                </div>
            </div>

            <div className="p-6">
                {activeTab === TABS.SUMMARY && <SummaryTab response={response} />}
                {activeTab === TABS.VISUALIZATION && response.chart && <DataVisualization chartData={response.chart} />}
                {activeTab === TABS.TIMELINE && response.timeline && <Timeline events={response.timeline} />}
                {activeTab === TABS.FIGURES && response.figures && <FiguresPanel figures={response.figures} />}
                {activeTab === TABS.KEY_TERMS && response.keyTerms && <KeyTermsTab terms={response.keyTerms} />}
                {activeTab === TABS.AI_IMAGE && response.generatedImage && <GeneratedImageTab image={response.generatedImage} query={query} />}
            </div>
        </div>
    );
};

export default ResponseDisplay;