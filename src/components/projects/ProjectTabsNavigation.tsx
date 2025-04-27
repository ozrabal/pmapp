import React from 'react';
import { cn } from '../../lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import type { ProjectTabsNavigationProps, TabType } from './types';

const ProjectTabsNavigation: React.FC<ProjectTabsNavigationProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  isLoading = false,
  className,
}) => {
  // Handle tab change
  const handleTabChange = (value: string) => {
    onSelectTab(value as TabType);
  };

  if (isLoading) {
    return (
      <div className={cn('w-full', className)} aria-busy="true" aria-live="polite">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn('w-full', className)}
      defaultValue={activeTab}
      aria-label="Project content sections"
    >
      <TabsList className="w-full grid grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className="flex-1"
            aria-selected={tab.isActive}
            aria-controls={`${tab.id}-panel`}
            data-state={tab.isActive ? "active" : "inactive"}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ProjectTabsNavigation;