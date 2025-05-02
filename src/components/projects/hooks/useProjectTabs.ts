import { useState, useCallback, useEffect } from "react";
import type { TabType, ProjectTabProps } from "../types";

/**
 * Hook to manage tab state and navigation for project details
 * @param initialTab - The initial tab to display
 */
export function useProjectTabs(initialTab: TabType = "descriptions") {
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);

  // Synchronize with URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabType;
    if (hash && ["descriptions", "assumptions", "functionalBlocks", "schedule"].includes(hash)) {
      setSelectedTab(hash);
    } else if (initialTab) {
      // If no valid hash but initialTab provided, update URL
      window.history.replaceState(null, "", `#${initialTab}`);
    }
  }, [initialTab]);

  // Handle tab change with URL update
  const handleTabChange = useCallback((tab: TabType) => {
    setSelectedTab(tab);
    window.history.pushState(null, "", `#${tab}`);
  }, []);

  // Generate tab configuration
  const tabs: ProjectTabProps[] = [
    {
      id: "descriptions",
      label: "Description",
      isActive: selectedTab === "descriptions",
      onClick: () => handleTabChange("descriptions"),
    },
    {
      id: "assumptions",
      label: "Assumptions",
      isActive: selectedTab === "assumptions",
      onClick: () => handleTabChange("assumptions"),
    },
    {
      id: "functional-blocks",
      label: "Functional Blocks",
      isActive: selectedTab === "functional-blocks",
      onClick: () => handleTabChange("functional-blocks"),
    },
    {
      id: "schedule",
      label: "Schedule",
      isActive: selectedTab === "schedule",
      onClick: () => handleTabChange("schedule"),
    },
  ];

  return {
    selectedTab,
    setSelectedTab: handleTabChange,
    tabs,
  };
}
