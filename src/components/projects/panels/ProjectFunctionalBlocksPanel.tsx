import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { LoadingSkeleton } from '../LoadingSkeleton';
import type { ProjectFunctionalBlocksPanelProps } from '../types';

export const ProjectFunctionalBlocksPanel: React.FC<ProjectFunctionalBlocksPanelProps> = ({
  functionalBlocks,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <LoadingSkeleton type="functionalBlocks" className={className} />;
  }

  if (!functionalBlocks) {
    return (
      <Alert variant="warning" className={className}>
        <AlertDescription>Unable to display functional blocks due to missing data.</AlertDescription>
      </Alert>
    );
  }

  if (!functionalBlocks.blocks || functionalBlocks.blocks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No functional blocks have been defined for this project yet.</p>
        </CardContent>
      </Card>
    );
  }

  try {
    // Group blocks by category
    const blocksByCategory = functionalBlocks.blocks.reduce((acc, block) => {
      if (typeof block !== 'object' || !block.category || typeof block.category !== 'string') {
        throw new Error('Invalid block structure');
      }
      
      const category = block.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(block);
      return acc;
    }, {} as Record<string, typeof functionalBlocks.blocks>);

    // Sort blocks by order within each category
    Object.keys(blocksByCategory).forEach(category => {
      blocksByCategory[category].sort((a, b) => 
        (typeof a.order === 'number' && typeof b.order === 'number') 
          ? a.order - b.order 
          : 0
      );
    });

    return (
      <div className={className}>
        {Object.entries(blocksByCategory).map(([category, blocks]) => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-medium mb-4">{category}</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {blocks.map(block => (
                <Card key={block.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-md mb-1">{block.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{block.description}</p>
                    
                    {block.dependencies && Array.isArray(block.dependencies) && block.dependencies.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">Dependencies: </span>
                        <span className="text-muted-foreground">
                          {block.dependencies.join(', ')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error rendering functional blocks:', error);
    return (
      <Alert variant="warning" className={className}>
        <AlertDescription>Unable to display functional blocks due to invalid data format.</AlertDescription>
      </Alert>
    );
  }
};