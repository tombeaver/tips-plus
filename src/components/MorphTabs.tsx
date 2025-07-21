import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, TrendingUp, Target, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
}

const tabs: Tab[] = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, shortLabel: 'Calendar' },
  { id: 'tips', label: 'Tips', icon: Star, shortLabel: 'Tips' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, shortLabel: 'Analytics' },
  { id: 'goals', label: 'Goals', icon: Target, shortLabel: 'Goals' },
];

interface MorphTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const MorphTabs: React.FC<MorphTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  className 
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const container = containerRef.current;
    
    if (activeTabElement && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative grid grid-cols-4 bg-card/50 backdrop-blur-sm border shadow-sm rounded-lg p-1",
        className
      )}
    >
      {/* Morphing indicator */}
      <div
        className="absolute top-1 bottom-1 bg-primary rounded-md transition-all duration-300 ease-out shadow-sm"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          transform: 'translateX(0)',
        }}
      />
      
      {/* Tab buttons */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el; }}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              isActive 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};