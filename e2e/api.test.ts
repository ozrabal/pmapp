import { expect } from "@playwright/test";
import { test } from "./fixtures/api.fixture";

test.describe("API Endpoints", () => {
  test("GET /api/projects should return projects list", async ({ request, baseApiUrl, getTestToken }) => {
    // Get auth token
    const token = await getTestToken();

    // Make the API request
    const response = await request.get(`${baseApiUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Assert response status
    expect(response.status()).toBe(200);

    // Parse response body
    const body = await response.json();

    // Assert response structure
    expect(body).toHaveProperty("projects");
    expect(Array.isArray(body.projects)).toBe(true);
  });

  test("POST /api/projects should create a new project", async ({ request, baseApiUrl, getTestToken }) => {
    // Get auth token
    const token = await getTestToken();

    // Project data
    const projectData = {
      name: `API Test Project ${Date.now()}`,
      description: "Project created via API test",
      status: "planning",
    };

    // Make the API request
    const response = await request.post(`${baseApiUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: projectData,
    });

    // Assert response status
    expect(response.status()).toBe(201);

    // Parse response body
    const body = await response.json();

    // Assert response structure and data
    expect(body).toHaveProperty("project");
    expect(body.project).toHaveProperty("id");
    expect(body.project.name).toBe(projectData.name);
    expect(body.project.description).toBe(projectData.description);
  });

  test("GET /api/projects/:id should return a specific project", async ({ request, baseApiUrl, getTestToken }) => {
    // Get auth token
    const token = await getTestToken();

    // First create a project
    const createResponse = await request.post(`${baseApiUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        name: `Project to Fetch ${Date.now()}`,
        description: "Project to fetch via API test",
      },
    });

    const createBody = await createResponse.json();
    const projectId = createBody.project.id;

    // Now fetch the specific project
    const fetchResponse = await request.get(`${baseApiUrl}/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Assert response status
    expect(fetchResponse.status()).toBe(200);

    // Parse response body
    const fetchBody = await fetchResponse.json();

    // Assert response structure and data
    expect(fetchBody).toHaveProperty("project");
    expect(fetchBody.project.id).toBe(projectId);
  });

  test("PUT /api/projects/:id should update a project", async ({ request, baseApiUrl, getTestToken }) => {
    // Get auth token
    const token = await getTestToken();

    // First create a project
    const createResponse = await request.post(`${baseApiUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        name: `Project to Update ${Date.now()}`,
        description: "Initial description",
      },
    });

    const createBody = await createResponse.json();
    const projectId = createBody.project.id;

    // Now update the project
    const updatedData = {
      name: `Updated Project ${Date.now()}`,
      description: "Updated description",
    };

    const updateResponse = await request.put(`${baseApiUrl}/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: updatedData,
    });

    // Assert response status
    expect(updateResponse.status()).toBe(200);

    // Parse response body
    const updateBody = await updateResponse.json();

    // Assert response structure and data
    expect(updateBody).toHaveProperty("project");
    expect(updateBody.project.name).toBe(updatedData.name);
    expect(updateBody.project.description).toBe(updatedData.description);
  });
});
