import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  type: 'assumptions' | 'functionalBlocks' | 'schedule';
}

const LoadingSkeleton = ({ type }: LoadingSkeletonProps) => {
  // Default is 3 sections with 2 items each
  const sections = 3;
  const itemsPerSection = 3;
  
  // Assumptions has more sections
  if (type === 'assumptions') {
    return (
      <div className="space-y-8">
        {/* Project Goals Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={`goal-${i}`} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
        
        {/* Target Audience Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={`audience-${i}`} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
        
        {/* Technical Requirements Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-52" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <div className="pl-4 space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={`tech-frontend-${i}`} className="h-4 w-[90%]" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <div className="pl-4 space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={`tech-backend-${i}`} className="h-4 w-[85%]" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Functional Blocks view with cards
  if (type === 'functionalBlocks') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(6).fill(0).map((_, i) => (
          <Card key={`block-${i}`}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <div className="pt-2">
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Schedule view with timeline-like display
  if (type === 'schedule') {
    return (
      <div className="space-y-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={`stage-${i}`} className="flex">
            <div className="mr-4 flex flex-col items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              {i < 3 && <Skeleton className="h-16 w-1" />}
            </div>
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <div className="pt-2 flex space-x-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Generic fallback skeleton
  return (
    <div className="space-y-6">
      {Array(sections).fill(0).map((_, sectionIdx) => (
        <div key={`section-${sectionIdx}`} className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array(itemsPerSection).fill(0).map((_, itemIdx) => (
            <Skeleton 
              key={`item-${sectionIdx}-${itemIdx}`} 
              className="h-5 w-full" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;