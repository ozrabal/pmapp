# API Endpoint Implementation Plan: Delete Project

## 1. Przegląd punktu końcowego

Punkt końcowy służy do wykonania miękkiego usunięcia (soft delete) projektu poprzez zaktualizowanie pola `deleted_at` w tabeli `projects` zamiast fizycznego usuwania rekordu z bazy danych. Umożliwia to potencjalne przywrócenie projektu w przyszłości oraz zachowanie integralności danych.

## 2. Szczegóły żądania

- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/projects/{id}`
- **Parametry**:
  - Wymagane: `id` (UUID projektu w ścieżce URL)
  - Opcjonalne: brak
- **Request Body**: brak (DELETE zazwyczaj nie zawiera ciała żądania)

## 3. Wykorzystywane typy

- **DeleteProjectResponseDto**:
  ```typescript
  {
    message: string;
  }
  ```

- **ErrorResponseDto**:
  ```typescript
  {
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    }
  }
  ```

## 4. Szczegóły odpowiedzi

- **Sukces (200 OK)**:
  ```json
  {
    "message": "Project deleted successfully"
  }
  ```
  
- **Błędy**:
  - **401 Unauthorized**: Użytkownik nie jest uwierzytelniony
  - **403 Forbidden**: Użytkownik nie ma uprawnień do usunięcia tego projektu
  - **404 Not Found**: Projekt nie został znaleziony

## 5. Przepływ danych

1. Klient wysyła żądanie DELETE do `/api/projects/{id}`
2. Astro middleware weryfikuje autentykację użytkownika
3. Endpoint wyodrębnia `id` z parametrów ścieżki
4. Endpoint weryfikuje poprawność `id` za pomocą schematu Zod
5. Endpoint pobiera obiekt SupabaseClient z `context.locals`
6. Endpoint wywołuje metodę `deleteProject` z ProjectService
7. ProjectService:
   - Sprawdza, czy projekt istnieje
   - Weryfikuje, czy zalogowany użytkownik jest właścicielem projektu
   - Aktualizuje pole `deleted_at` w tabeli `projects` zamiast fizycznego usuwania rekordu
8. Endpoint zwraca odpowiedź z komunikatem sukcesu lub odpowiednim kodem błędu

## 6. Względy bezpieczeństwa

1. **Uwierzytelnianie**:
   - Middleware Astro powinno weryfikować, czy użytkownik jest zalogowany
   - Jeśli nie, zwracać błąd 401 Unauthorized

2. **Autoryzacja**:
   - Sprawdzanie, czy zalogowany użytkownik jest właścicielem projektu
   - Jeśli nie, zwracać błąd 403 Forbidden

3. **Walidacja danych**:
   - Używanie schematu Zod do walidacji UUID projektu
   - Zabezpieczenie przed atakami SQL injection poprzez korzystanie z parametryzowanych zapytań Supabase

## 7. Obsługa błędów

1. **Brak uwierzytelnienia (401 Unauthorized)**:
   - Gdy użytkownik nie jest zalogowany
   - Odpowiedź: `{ "error": { "code": "auth/unauthorized", "message": "Authentication required" } }`

2. **Brak autoryzacji (403 Forbidden)**:
   - Gdy użytkownik próbuje usunąć projekt, którego nie jest właścicielem
   - Odpowiedź: `{ "error": { "code": "auth/forbidden", "message": "You don't have permission to delete this project" } }`

3. **Projekt nie znaleziony (404 Not Found)**:
   - Gdy projekt o podanym ID nie istnieje lub został już usunięty
   - Odpowiedź: `{ "error": { "code": "project/not-found", "message": "Project not found" } }`

4. **Błąd bazy danych (500 Internal Server Error)**:
   - W przypadku problemów z bazą danych
   - Odpowiedź: `{ "error": { "code": "database/error", "message": "Database operation failed" } }`

5. **Nieprawidłowy format ID (400 Bad Request)**:
   - Gdy podany ID projektu nie jest prawidłowym UUID
   - Odpowiedź: `{ "error": { "code": "validation/invalid-id", "message": "Invalid project ID format" } }`

## 8. Rozważania dotyczące wydajności

1. **Indeksowanie**:
   - Upewnić się, że kolumna `id` w tabeli `projects` jest indeksowana dla szybkiego wyszukiwania
   - Rozważyć indeksowanie kolumny `deleted_at` jeśli będzie używana do filtrowania w zapytaniach

2. **Optymalizacja zapytań**:
   - Używać tylko niezbędnych kolumn w zapytaniach
   - Unikać nadmiernych zapytań do bazy danych

## 9. Etapy wdrożenia

### 1. Modyfikacja ProjectService

Zaktualizować metodę `deleteProject` w `ProjectService`, aby wykonywała miękkie usunięcie:

```typescript
async deleteProject(userId: string, projectId: string): Promise<DeleteProjectResponseDto> {
  // Sprawdzenie czy projekt istnieje i czy użytkownik jest właścicielem
  const { data: existingProject, error: fetchError } = await this.supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (fetchError || !existingProject) {
    throw new Error(`Project not found or you don't have permission to delete it`);
  }

  // Aktualizacja pola deleted_at zamiast usuwania rekordu
  const { error: updateError } = await this.supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`Failed to delete project: ${updateError.message}`);
  }

  return {
    message: "Project deleted successfully",
  };
}
```

### 2. Implementacja endpointu API

Utworzyć/zaktualizować plik `/src/pages/api/projects/[id].ts`:

```typescript
import type { APIContext } from "astro";
import { projectIdSchema } from "../../../lib/schemas/project.schema";
import { ProjectService } from "../../../lib/services/project.service";

// Wyłączenie prerenderowania, ponieważ jest to dynamiczny endpoint
export const prerender = false;

/**
 * Handler DELETE dla soft-delete projektu
 */
export async function DELETE({ params, locals, redirect }: APIContext) {
  // 1. Sprawdzenie uwierzytelnienia
  const { supabase, user } = locals;
  
  if (!user) {
    return new Response(
      JSON.stringify({
        error: {
          code: "auth/unauthorized",
          message: "Authentication required",
        },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 2. Walidacja ID projektu
  const result = projectIdSchema.safeParse(params.id);
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: "validation/invalid-id",
          message: "Invalid project ID format",
          details: result.error.format(),
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 3. Usunięcie projektu
  try {
    const projectService = new ProjectService(supabase);
    const response = await projectService.deleteProject(user.id, params.id);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // 4. Obsługa różnych typów błędów
    if (errorMessage.includes("not found") || errorMessage.includes("permission")) {
      return new Response(
        JSON.stringify({
          error: {
            code: errorMessage.includes("not found") ? "project/not-found" : "auth/forbidden",
            message: errorMessage,
          },
        }),
        {
          status: errorMessage.includes("not found") ? 404 : 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // 5. Ogólny błąd serwera
    return new Response(
      JSON.stringify({
        error: {
          code: "server/error",
          message: "Failed to delete project",
          details: { originalError: errorMessage },
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
```

### 3. Aktualizacja istniejących zapytań i usług

Upewnić się, że pozostałe metody w `ProjectService` (np. `listProjects`, `getProject`) uwzględniają warunek `deleted_at` IS NULL, aby nie zwracać usuniętych projektów:

```typescript
// Przykład dla listProjects
let query = this.supabase
  .from("projects")
  .select("id, name, description, created_at, updated_at", { count: "exact" })
  .eq("user_id", userId)
  .is("deleted_at", null); // Dodać ten warunek
```

### 4. Testy

1. Utworzyć testy jednostkowe dla `ProjectService.deleteProject`
2. Utworzyć testy dla endpointu DELETE `/api/projects/{id}`
3. Przetestować scenariusze błędów i obsługę wyjątków
4. Sprawdzić, czy usunięte projekty nie pojawiają się w wynikach `listProjects`