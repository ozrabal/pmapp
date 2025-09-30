"use client";

import { useProjects } from "@/lib/queries/project";

export default function ProjectsPage() {
  const page = 1;
  const limit = 10;
  const { data, error, isLoading } = useProjects({ page, limit });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const projects = data?.data;

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
