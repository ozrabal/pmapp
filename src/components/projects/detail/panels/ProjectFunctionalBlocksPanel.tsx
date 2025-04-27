import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Json } from '../../../../types';
import type { FunctionalBlocksViewModel, FunctionalBlockDto } from '../types';
import { parseJsonData } from '../utils/jsonParser';

interface ProjectFunctionalBlocksPanelProps {
  functionalBlocks: Json;
  isLoading: boolean;
}

const ProjectFunctionalBlocksPanel = ({ 
  functionalBlocks,
  isLoading
}: ProjectFunctionalBlocksPanelProps) => {
  // Parse the functional blocks data using our utility
  const parsedBlocks = useMemo(() => {
    return parseJsonData<FunctionalBlocksViewModel>(functionalBlocks);
  }, [functionalBlocks]);
  
  // Early return if no data is available
  if (!parsedBlocks || !parsedBlocks.blocks || parsedBlocks.blocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No functional blocks available</p>
      </div>
    );
  }
  
  // Sort blocks by order
  const sortedBlocks = [...parsedBlocks.blocks].sort((a, b) => a.order - b.order);
  
  // Group blocks by category
  const blocksByCategory = sortedBlocks.reduce<Record<string, FunctionalBlockDto[]>>(
    (acc, block) => {
      const category = block.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(block);
      return acc;
    },
    {}
  );

  const categories = Object.keys(blocksByCategory);

  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-bold">{category}</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blocksByCategory[category].map((block) => (
              <Card key={block.id} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{block.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{block.description}</p>
                  
                  {block.dependencies && block.dependencies.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {block.dependencies.map((dep) => (
                          <Badge key={`${block.id}-${dep}`} variant="outline">
                            {dep}
                          </Badge>
                        ))}
                      </div>
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
};

export default ProjectFunctionalBlocksPanel;