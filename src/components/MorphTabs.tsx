import React, { useState, useRef, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MorphTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MorphTabs: React.FC<MorphTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const containerElement = containerRef.current;
    
    if (activeTabElement && containerElement) {
      const containerRect = containerElement.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;
      
      setIndicatorStyle({
        left: `${left}px`,
        width: `${width}px`,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div 
      ref={containerRef}
      className={`relative grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border shadow-sm rounded-md p-1 ${className}`}
    >
      {/* Animated indicator */}
      <div
        className="absolute top-1 bottom-1 bg-primary/10 rounded-sm transition-all duration-300 ease-out z-10"
        style={indicatorStyle}
      />
      
      {/* Tab buttons */}
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[tab.id] = el)}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative z-20 flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-primary/10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
            ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}
          `}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};