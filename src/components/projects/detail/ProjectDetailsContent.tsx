import { useEffect, useMemo, useId } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useProjectDetails } from '../hooks/useProjectDetails';
import { useProjectTabs } from '../hooks/useProjectTabs';
import ProjectAssumptionsPanel from './panels/ProjectAssumptionsPanel';
import ProjectFunctionalBlocksPanel from './panels/ProjectFunctionalBlocksPanel';
import ProjectSchedulePanel from './panels/ProjectSchedulePanel';
import LoadingSkeleton from './LoadingSkeleton';
import ExportButton from './ExportButton';
import type { TabType } from './types';

interface ProjectDetailsContentProps {
  projectId: string;
}

const ProjectDetailsContent = ({ projectId }: ProjectDetailsContentProps) => {
  const { project, isLoading, error, fetchProject } = useProjectDetails(projectId);
  const { selectedTab, tabs, setSelectedTab } = useProjectTabs();

  // Generate unique IDs for accessibility
  const tabsId = useId();

  // Update document title when project loads
  useEffect(() => {
    if (project) {
      document.title = `${project.name} | Project Details`;
    }
  }, [project]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value as TabType);
  };

  // Determine if we should show error state
  const showError = useMemo(() => Boolean(error && !isLoading), [error, isLoading]);

  // Determine if we have data to display
  const hasData = useMemo(() => Boolean(project && !isLoading), [project, isLoading]);

  return (
    <div className="space-y-6">
      {/* Error display */}
      {showError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading project</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <div>{error?.message || 'An unknown error occurred'}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchProject()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <Tabs 
        defaultValue="assumptions" 
        value={selectedTab}
        onValueChange={handleTabChange} 
        className="w-full space-y-6"
        id={`project-tabs-${tabsId}`}
      >
        <div className="flex items-center justify-between">
          <TabsList aria-label="Project sections">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                disabled={tab.disabled || isLoading}
                aria-controls={`${tab.id}-content`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {project && (
            <ExportButton 
              projectId={projectId} 
              formats={['json']}
              disabled={isLoading || showError}
            />
          )}
        </div>

        {/* Tab contents */}
        <TabsContent 
          value="assumptions" 
          className="space-y-4"
          id="assumptions-content"
          aria-labelledby="assumptions-tab"
        >
          {isLoading ? (
            <LoadingSkeleton type="assumptions" />
          ) : hasData && project?.assumptions ? (
            <ProjectAssumptionsPanel 
              assumptions={project.assumptions} 
              isLoading={isLoading} 
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No assumptions data available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent 
          value="functionalBlocks" 
          className="space-y-4"
          id="functionalBlocks-content"
          aria-labelledby="functionalBlocks-tab"
        >
          {isLoading ? (
            <LoadingSkeleton type="functionalBlocks" />
          ) : hasData && project?.functionalBlocks ? (
            <ProjectFunctionalBlocksPanel 
              functionalBlocks={project.functionalBlocks} 
              isLoading={isLoading} 
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No functional blocks data available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent 
          value="schedule" 
          className="space-y-4"
          id="schedule-content"
          aria-labelledby="schedule-tab"
        >
          {isLoading ? (
            <LoadingSkeleton type="schedule" />
          ) : hasData && project?.schedule ? (
            <ProjectSchedulePanel 
              schedule={project.schedule} 
              isLoading={isLoading} 
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No schedule data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsContent;