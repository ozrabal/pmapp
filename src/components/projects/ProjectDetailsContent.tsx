import React from "react";
import { useProjectDetails, useProjectTabs } from "./hooks";
import ProjectTabsNavigation from "./ProjectTabsNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { LoadingSkeleton } from "./LoadingSkeleton";
import {
  ProjectDescriptionsPanel,
  ProjectAssumptionsPanel,
  ProjectFunctionalBlocksPanel,
  ProjectSchedulePanel,
} from "./panels";
import { isSessionExpiredError, isPermissionError, isNotFoundError } from "../../lib/services/error.service";
import type { FunctionalBlocksViewModel, ProjectDetailsContentProps, ScheduleViewModel } from "./types";
import { Pen } from "lucide-react";

export const ProjectDetailsContent: React.FC<ProjectDetailsContentProps> = ({
  projectId,
  initialTab = "descriptions",
}) => {
  // Use project hooks with enhanced error handling
  const { project, isLoading, error, errorMessage, fetchProject } = useProjectDetails(projectId);
  const { selectedTab, tabs } = useProjectTabs(initialTab);

  // Handle different error scenarios
  if (error) {
    // Different error UIs based on error type
    if (isSessionExpiredError(error)) {
      // Session expired - handled by the hook through redirection
      return null;
    }

    if (isPermissionError(error)) {
      return (
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>You don&apos;t have permission to view this project.</p>
            <Button onClick={() => (window.location.href = "/dashboard")} className="mt-2" variant="outline">
              Back to Projects
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (isNotFoundError(error)) {
      return (
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertTitle>Project Not Found</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>The requested project doesn&apos;t exist or has been deleted.</p>
            <Button onClick={() => (window.location.href = "/dashboard")} className="mt-2" variant="outline">
              Back to Projects
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    // Generic error with retry option
    return (
      <Alert variant="destructive" className="mb-6" role="alert">
        <AlertTitle>Error loading project</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{errorMessage || "An error occurred while loading the project."}</p>
          <Button onClick={() => fetchProject()} className="mt-2" variant="destructive">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Extract data for each panel from the project
  const descriptionData = project ? { description: project.description || "" } : null;
  const assumptionsData = (project?.assumptions as Record<string, string>) || null;
  const functionalBlocksData = (project?.functionalBlocks as unknown as FunctionalBlocksViewModel) || null;
  const scheduleData = project?.schedule ? (project.schedule as unknown as ScheduleViewModel) : null;

  // Get tab title based on selected tab
  const getTabTitle = () => {
    switch (selectedTab) {
      case "descriptions":
        return "Project Description";
      case "assumptions":
        return "Project Assumptions";
      case "functional-blocks":
        return "Functional Blocks";
      case "schedule":
        return "Project Schedule";
      default:
        return "Project Details";
    }
  };

  // Render appropriate panel based on selected tab
  const renderPanel = () => {
    switch (selectedTab) {
      case "descriptions":
        return isLoading ? (
          <LoadingSkeleton type="descriptions" />
        ) : (
          <div id="descriptions-panel" role="tabpanel" aria-labelledby="tab-descriptions">
            <ProjectDescriptionsPanel description={descriptionData} isLoading={isLoading} />
          </div>
        );

      case "assumptions":
        return isLoading ? (
          <LoadingSkeleton type="assumptions" />
        ) : (
          <div id="assumptions-panel" role="tabpanel" aria-labelledby="tab-assumptions">
            <ProjectAssumptionsPanel assumptions={assumptionsData} isLoading={isLoading} />
          </div>
        );

      case "functional-blocks":
        return isLoading ? (
          <LoadingSkeleton type="functional-blocks" />
        ) : (
          <div id="functionalBlocks-panel" role="tabpanel" aria-labelledby="tab-functionalBlocks">
            <ProjectFunctionalBlocksPanel functionalBlocks={functionalBlocksData} isLoading={isLoading} />
          </div>
        );

      case "schedule":
        return isLoading ? (
          <LoadingSkeleton type="schedule" />
        ) : (
          <div id="schedule-panel" role="tabpanel" aria-labelledby="tab-schedule">
            <ProjectSchedulePanel schedule={scheduleData} isLoading={isLoading} />
          </div>
        );

      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div aria-busy={isLoading} className="project-details-content">
      {/* Tab navigation */}
      <ProjectTabsNavigation tabs={tabs} activeTab={selectedTab} isLoading={isLoading} className="mb-6" />

      {/* Content panel */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <div className="justify-between flex items-center w-full">
            <CardTitle>{getTabTitle()}</CardTitle>
            <Button
              onClick={() => (window.location.href = `/projects/${projectId}/${selectedTab}`)}
              aria-label="Back to Projects"
            >
              <Pen className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">{renderPanel()}</CardContent>
      </Card>

      {/* Screen reader only status update */}
      {isLoading && (
        <div className="sr-only" aria-live="polite">
          Loading project details...
        </div>
      )}
    </div>
  );
};
