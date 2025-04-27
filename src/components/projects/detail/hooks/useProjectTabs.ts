import { useState, useEffect, useCallback } from 'react';
import type { TabType, ProjectTabProps } from '../types';

/**
 * Hook for managing project tab navigation
 * @param initialTab The initial tab to display
 * @returns Object containing tab state and methods to control it
 */
export function useProjectTabs(initialTab: TabType = 'assumptions') {
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);
  
  // Synchronize with URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabType;
    if (hash && ['assumptions', 'functionalBlocks', 'schedule'].includes(hash)) {
      setSelectedTab(hash);
    }
  }, []);
  
  // Update URL hash when tab changes
  const handleTabChange = useCallback((tab: TabType) => {
    setSelectedTab(tab);
    window.history.pushState(null, '', `#${tab}`);
  }, []);
  
  // Generate tab configuration
  const tabs: ProjectTabProps[] = [
    {
      id: 'assumptions',
      label: 'Assumptions',
      isActive: selectedTab === 'assumptions',
      onClick: () => handleTabChange('assumptions')
    },
    {
      id: 'functionalBlocks',
      label: 'Functional Blocks',
      isActive: selectedTab === 'functionalBlocks',
      onClick: () => handleTabChange('functionalBlocks')
    },
    {
      id: 'schedule',
      label: 'Schedule',
      isActive: selectedTab === 'schedule',
      onClick: () => handleTabChange('schedule')
    }
  ];
  
  return {
    selectedTab,
    setSelectedTab: handleTabChange,
    tabs
  };
}