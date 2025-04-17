import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectsLoadingSkeletonProps {
  count?: number;
}

export function ProjectsLoadingSkeleton({ count = 3 }: ProjectsLoadingSkeletonProps) {
  return (
    <div 
      role="status" 
      aria-label="Wczytywanie projektów" 
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="mb-4 overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          
          <CardContent className="pb-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          
          <CardFooter className="flex justify-between items-center pt-0">
            <div className="flex flex-col sm:flex-row sm:gap-3 w-2/3">
              <Skeleton className="h-3 w-24 my-1" />
              <Skeleton className="h-3 w-28 my-1" />
            </div>
            
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardFooter>
        </Card>
      ))}
      <span className="sr-only">Wczytywanie projektów...</span>
    </div>
  );
}