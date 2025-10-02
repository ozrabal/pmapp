"use client";
import { useProjects } from "@/lib/queries/project";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

export function ProjectsList() {
  const page = 1;
  const limit = 10;
  const { data, error, isLoading } = useProjects({ page, limit });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const projects = data?.data;

  return (
    <ul>
      {projects?.map((project) => (
        <li key={project.id}>
          <Card>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>{project.description}</CardContent>
            <CardFooter>{project.updatedAt}</CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
