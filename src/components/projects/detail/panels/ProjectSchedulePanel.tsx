import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Json } from '../../../../types';
import type { ScheduleViewModel, ScheduleStageDto } from '../types';
import { parseJsonData } from '../utils/jsonParser';

interface ProjectSchedulePanelProps {
  schedule: Json;
  isLoading: boolean;
}

const ProjectSchedulePanel = ({ 
  schedule,
  isLoading
}: ProjectSchedulePanelProps) => {
  // Parse the schedule data using our utility
  const parsedSchedule = useMemo(() => {
    return parseJsonData<ScheduleViewModel>(schedule);
  }, [schedule]);
  
  // Early return if no data is available
  if (!parsedSchedule || !parsedSchedule.stages || parsedSchedule.stages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No schedule information available</p>
      </div>
    );
  }
  
  // Sort stages by order
  const sortedStages = [...parsedSchedule.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[24px] top-6 bottom-6 w-[2px] bg-border"></div>
        
        {/* Stages */}
        <div className="space-y-12">
          {sortedStages.map((stage, index) => (
            <div key={stage.id} className="flex">
              {/* Timeline marker */}
              <div className="relative z-10 mr-6 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary">
                <span className="font-semibold">{index + 1}</span>
              </div>
              
              {/* Stage content */}
              <div className="flex-1">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>{stage.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{stage.description}</p>
                    
                    {/* Dependencies */}
                    {stage.dependencies && stage.dependencies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                        <div className="flex flex-wrap gap-2">
                          {stage.dependencies.map((dep) => (
                            <Badge key={`${stage.id}-dep-${dep}`} variant="outline">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Related blocks */}
                    {stage.relatedBlocks && stage.relatedBlocks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Related Functional Blocks</h4>
                        <div className="flex flex-wrap gap-2">
                          {stage.relatedBlocks.map((block) => (
                            <Badge key={`${stage.id}-block-${block}`}>
                              {block}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSchedulePanel;