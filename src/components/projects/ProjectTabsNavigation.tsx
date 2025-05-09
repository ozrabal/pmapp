import React from "react";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import type { ProjectTabsNavigationProps, TabType } from "./types";

const ProjectTabsNavigation: React.FC<ProjectTabsNavigationProps> = ({
  tabs,
  activeTab,
  isLoading = false,
  onSelectTab,
  projectId,
  className,
}) => {
  const handleTabChange = (value: string) => {
    const tabValue = value as TabType;

    if (onSelectTab) {
      onSelectTab?.(tabValue);
    }
    if (projectId && !onSelectTab) {
      window.location.href = `/projects/${projectId}/${value}`;
    }
    // If no onSelectTab prop is provided, we can assume the tab change is handled internally
    // Find the clicked tab and invoke its onClick handler if available
    const selectedTab = tabs.find((tab) => tab.id === tabValue);
    if (selectedTab && typeof selectedTab.onClick === "function") {
      selectedTab.onClick();
    }
  };

  if (isLoading) {
    return (
      <div className={cn("w-full", className)} aria-busy="true" aria-live="polite">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
      defaultValue={activeTab}
      aria-label="Project content sections"
    >
      <TabsList className="w-full grid grid-cols-4 gap-0.5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className="flex-1"
            aria-selected={tab.id === activeTab}
            aria-controls={`${tab.id}-panel`}
            data-state={tab.id === activeTab ? "active" : "inactive"}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ProjectTabsNavigation;
