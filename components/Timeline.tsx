import React, { useState, useRef, useEffect } from 'react';
import type { TimelineEvent } from '../types';
import { useTranslation } from '../lib/translations';

// 1. Unified UI Element: The Event Card
// This card now has a single, consistent style for both layouts.
const TimelineEventCard: React.FC<{
  event: TimelineEvent;
  isActive: boolean;
  onClick: () => void;
}> = ({ event, isActive, onClick }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer text-start ${
        isActive
          ? 'border-amber-500 shadow-xl bg-white dark:bg-gray-800 scale-105'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/80'
      }`}
    >
      <p className="font-bold text-lg text-amber-600 dark:text-amber-400 mb-1">{event.year}</p>
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-1 mb-2">{event.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{event.description}</p>
      {event.significance && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('significance')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic mt-1">{event.significance}</p>
        </div>
      )}
    </div>
  );
};

// Reusable Navigation Controls component
const NavControls: React.FC<{
  handlePrev: () => void;
  handleNext: () => void;
  handleSelectEvent: (index: number) => void;
  currentIndex: number;
  eventsLength: number;
  t: (key: string) => string;
}> = ({ handlePrev, handleNext, handleSelectEvent, currentIndex, eventsLength, t }) => (
    <div className="w-full flex justify-center items-center gap-4 my-4 px-4">
        <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white/60 dark:bg-gray-800/60 hover:bg-amber-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
            aria-label={t('timelinePrev')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200 transform rtl:scale-x-[-1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <input
            type="range"
            min="0"
            max={eventsLength > 0 ? eventsLength - 1 : 0}
            value={currentIndex}
            onChange={(e) => handleSelectEvent(parseInt(e.target.value, 10))}
            className="w-full max-w-sm h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('timelineScrub')}
            disabled={eventsLength <= 1}
        />
        <button 
            onClick={handleNext} 
            disabled={currentIndex === eventsLength - 1}
            className="p-2 rounded-full bg-white/60 dark:bg-gray-800/60 hover:bg-amber-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
            aria-label={t('timelineNext')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200 transform rtl:scale-x-[-1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
    </div>
);

// Main Component
const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  // All hooks must be called at the top level of the component, before any conditional returns.
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  
  // Refs for scrolling elements
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const verticalEventRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Adjust refs array size when events change
  useEffect(() => {
    // This is safe to run even if events is empty/null
    verticalEventRefs.current = verticalEventRefs.current.slice(0, events?.length || 0);
  }, [events]);

  // Unified scroll logic triggered by currentIndex change
  useEffect(() => {
    // Guard against running scroll logic if there are no events
    if (!events || events.length === 0) return;

    // Horizontal scrolling for desktop view
    const horizontalContainer = horizontalScrollRef.current?.children[0];
    // The event elements start at index 1 because the timeline bar is the first child (index 0).
    if (horizontalContainer && horizontalContainer.children[currentIndex + 1]) {
        const horizontalTarget = horizontalContainer.children[currentIndex + 1] as HTMLElement;
        horizontalTarget.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        });
    }

    // Vertical scrolling for mobile view
    const verticalTarget = verticalEventRefs.current[currentIndex];
    if (verticalTarget) {
        verticalTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  }, [currentIndex, events]);
  
  // Now, with all hooks called, we can safely return early if there are no events.
  if (!events || events.length === 0) {
    return null;
  }
  
  const handleSelectEvent = (index: number) => {
    setCurrentIndex(index);
  };
  
  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(events.length - 1, prev + 1));
  };

  return (
    <div className="w-full">
        <NavControls 
            handlePrev={handlePrev}
            handleNext={handleNext}
            handleSelectEvent={handleSelectEvent}
            currentIndex={currentIndex}
            eventsLength={events.length}
            t={t}
        />

        {/* Vertical Timeline (Mobile) */}
        <div className="lg:hidden relative border-s-2 border-amber-500/50 dark:border-amber-400/50 ms-6 pe-4 py-4">
            {events.map((event, index) => {
                return (
                    <div key={index} ref={el => { verticalEventRefs.current[index] = el; }} className="mb-8 flex items-center w-full relative scroll-mt-24">
                        <div className={`absolute -start-[13px] h-6 w-6 rounded-full border-4 transition-all duration-300 ${
                            currentIndex === index 
                            ? 'bg-amber-500 border-gray-100 dark:border-gray-900 ring-2 ring-amber-500/50 scale-110'
                            : 'bg-gray-400 dark:bg-gray-500 border-gray-100 dark:border-gray-900'
                        }`}></div>
                        <div className="ms-10 w-full">
                            <TimelineEventCard
                                event={event}
                                isActive={currentIndex === index}
                                onClick={() => handleSelectEvent(index)}
                            />
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Horizontal Timeline (Desktop) */}
        <div className="hidden lg:block">
            <div ref={horizontalScrollRef} className="overflow-x-auto timeline-scrollbar-hidden snap-x snap-mandatory scroll-smooth">
                <div className="relative flex items-center h-96 px-16">
                    <div className="absolute top-1/2 left-0 h-0.5 w-full bg-amber-300 dark:bg-gray-600 -z-10" />
                    {events.map((event, index) => {
                        const isOdd = index % 2 !== 0;
                        return (
                            <div key={index} className={`relative flex ${isOdd ? 'flex-col-reverse' : 'flex-col'} items-center w-80 shrink-0 h-full justify-center snap-center`}>
                                <div className={`w-full ${isOdd ? 'mt-8' : 'mb-8'}`}>
                                  <TimelineEventCard
                                    event={event}
                                    isActive={currentIndex === index}
                                    onClick={() => handleSelectEvent(index)}
                                  />
                                </div>
                                <div className={`w-1 transition-colors duration-300 ${currentIndex === index ? 'bg-amber-500' : 'bg-amber-300 dark:bg-gray-600'}`} style={{ height: '2rem' }} />
                                <div className={`h-5 w-5 rounded-full border-4 transition-all duration-300 ${currentIndex === index ? 'bg-amber-500 border-white dark:border-gray-800 ring-2 ring-amber-500 scale-110' : 'bg-gray-400 dark:bg-gray-500 border-white dark:border-gray-800'}`} />
                                <div className={`w-1 transition-colors duration-300 ${currentIndex === index ? 'bg-amber-500' : 'bg-amber-300 dark:bg-gray-600'}`} style={{ height: '2rem' }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Timeline;
