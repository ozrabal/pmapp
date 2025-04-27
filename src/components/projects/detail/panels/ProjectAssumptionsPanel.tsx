import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Json } from '../../../../types';
import type { AssumptionsViewModel } from '../types';
import { parseJsonData } from '../utils/jsonParser';

interface ProjectAssumptionsPanelProps {
  assumptions: Json;
  isLoading: boolean;
}

const ProjectAssumptionsPanel = ({ 
  assumptions,
  isLoading
}: ProjectAssumptionsPanelProps) => {
  // Parse and transform the assumptions data using our utility
  const parsedAssumptions = useMemo(() => {
    return parseJsonData<AssumptionsViewModel>(assumptions);
  }, [assumptions]);
  
  if (!parsedAssumptions) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No assumptions data available</p>
      </div>
    );
  }
  
  const { 
    projectGoals = [], 
    targetAudience = [], 
    keyFeatures = [],
    technicalRequirements = {}, 
    constraints = [] 
  } = parsedAssumptions;

  return (
    <div className="space-y-8">
      {/* Project Goals Section */}
      {projectGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {projectGoals.map((goal, index) => (
                <li key={`goal-${index}`}>{goal}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Target Audience Section */}
      {targetAudience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {targetAudience.map((audience, index) => (
                <li key={`audience-${index}`}>{audience}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Key Features Section */}
      {keyFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {keyFeatures.map((feature, index) => (
                <li key={`feature-${index}`}>{feature}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Technical Requirements Section */}
      {technicalRequirements && Object.keys(technicalRequirements).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {technicalRequirements.frontend && technicalRequirements.frontend.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {technicalRequirements.frontend.map((req, index) => (
                    <li key={`frontend-${index}`}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {technicalRequirements.backend && technicalRequirements.backend.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {technicalRequirements.backend.map((req, index) => (
                    <li key={`backend-${index}`}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {technicalRequirements.infrastructure && technicalRequirements.infrastructure.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Infrastructure</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {technicalRequirements.infrastructure.map((req, index) => (
                    <li key={`infrastructure-${index}`}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Constraints Section */}
      {constraints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {constraints.map((constraint, index) => (
                <li key={`constraint-${index}`}>{constraint}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectAssumptionsPanel;