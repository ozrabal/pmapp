import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { LoadingSkeleton } from '../LoadingSkeleton';
import type { ProjectAssumptionsPanelProps } from '../types';

export const ProjectAssumptionsPanel: React.FC<ProjectAssumptionsPanelProps> = ({
  assumptions,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <LoadingSkeleton type="assumptions" className={className} />;
  }

  if (!assumptions) {
    return (
      <Alert variant="warning" className={className}>
        <AlertDescription>Unable to display project assumptions due to missing data.</AlertDescription>
      </Alert>
    );
  }

  if (Object.keys(assumptions).length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No assumptions have been defined for this project yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Create renderable sections from assumptions
  const sections = Object.entries(assumptions)
    .filter(([_, value]) => value) // Filter out empty values
    .map(([key, value]) => {
      // Convert camelCase to Title Case for display
      const title = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());

      // Format value text with proper line breaks
      const formattedValue = String(value)
        .split('\n')
        .map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));

      return (
        <div key={key} className="mb-6">
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <div className="text-sm text-muted-foreground">{formattedValue}</div>
        </div>
      );
    });

  if (sections.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No assumptions have been defined for this project yet.</p>
        </CardContent>
      </Card>
    );
  }

  return <div className={className}>{sections}</div>;
};