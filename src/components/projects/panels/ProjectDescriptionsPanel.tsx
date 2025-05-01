import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Alert, AlertDescription } from "../../ui/alert";
import { LoadingSkeleton } from "../LoadingSkeleton";
import type { ProjectDescriptionsPanelProps } from "../types";

export const ProjectDescriptionsPanel: React.FC<ProjectDescriptionsPanelProps> = ({
  description,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <LoadingSkeleton type="descriptions" className={className} />;
  }

  if (!description) {
    return (
      <Alert variant="warning" className={className}>
        <AlertDescription>Unable to display project description due to missing data.</AlertDescription>
      </Alert>
    );
  }

  if (!description.description) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No description has been added to this project yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Format description text with proper line breaks
  const formattedDescription = description.description.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className={className}>
      <div className="prose prose-sm max-w-none dark:prose-invert">{formattedDescription}</div>
    </div>
  );
};
