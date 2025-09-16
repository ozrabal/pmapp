# API Endpoint Implementation Plan: Get Project

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania szczegółowych informacji o pojedynczym projekcie na podstawie jego identyfikatora. Umożliwia użytkownikowi uzyskanie pełnych danych projektu, w tym założeń, bloków funkcjonalnych oraz harmonogramu.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/projects/{id}`
- **Parametry ścieżki**:
  - **Wymagane**:
    - `id`: Unikalny identyfikator projektu (UUID)
- **Request Body**: Brak

## 3. Wykorzystywane typy
```typescript
// Typy odpowiedzi
import type { 
  ProjectDto,
  ErrorResponseDto 
} from "../../types";

// UUID schema do walidacji parametru id
import { z } from 'zod';

export const projectIdSchema = z.string().uuid({
  message: "Invalid project ID format. Must be a valid UUID"
});

export type ProjectIdParam = z.infer<typeof projectIdSchema>;
```

## 4. Szczegóły odpowiedzi
- **Status**: 200 OK
- **Content-Type**: application/json
- **Struktura odpowiedzi**: `ProjectDto`

```typescript
{
  id: string,          // UUID projektu
  name: string,        // Nazwa projektu
  description: string | null, // Opis projektu
  assumptions: Json | null,   // Założenia projektu jako struktura JSON
  functionalBlocks: Json | null, // Bloki funkcjonalne jako struktura JSON
  schedule: Json | null,      // Harmonogram projektu jako struktura JSON
  createdAt: string,   // Data utworzenia w formacie ISO
  updatedAt: string    // Data ostatniej aktualizacji w formacie ISO
}
```

- **Kody błędów**:
  - 400 Bad Request - Nieprawidłowy format identyfikatora projektu
  - 401 Unauthorized - Użytkownik nie jest zalogowany
  - 403 Forbidden - Użytkownik nie ma uprawnień do projektu
  - 404 Not Found - Projekt o podanym ID nie istnieje
  - 500 Internal Server Error - Błąd serwera

## 5. Przepływ danych
1. **Odbiór żądania**: Endpoint otrzymuje żądanie GET na `/api/projects/{id}` z identyfikatorem projektu w ścieżce URL.
2. **Walidacja parametru**: Sprawdzenie, czy parametr `id` jest poprawnym UUID przy użyciu schematu Zod.
3. **Weryfikacja autentyczności**: Sprawdzenie, czy użytkownik jest uwierzytelniony.
4. **Pobranie projektu**: Wykorzystanie `ProjectService.getProject()` do pobrania projektu z bazy danych.
5. **Weryfikacja uprawnień**: Sprawdzenie, czy projekt należy do bieżącego użytkownika (wykonane automatycznie przez ProjectService).
6. **Odpowiedź**: Zwrócenie odpowiedzi z danymi projektu lub odpowiednim komunikatem błędu.

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**: Konieczne sprawdzenie, czy użytkownik jest zalogowany przed udostępnieniem danych projektu.
2. **Autoryzacja**: Weryfikacja, czy użytkownik jest właścicielem projektu (to zapewnia warunek `eq("user_id", userId)` w zapytaniu).
3. **Walidacja danych wejściowych**: Sprawdzenie poprawności formatu UUID dla parametru `id`, aby zapobiec atakom typu injection.
4. **RLS (Row Level Security)**: Funkcja `getProject` zawiera warunek sprawdzający czy `user_id` zgadza się z ID aktualnie zalogowanego użytkownika.

## 7. Obsługa błędów
1. **Format ID**: Nieprawidłowy format UUID zwraca błąd 400 Bad Request.
2. **Brak uwierzytelnienia**: Brak zalogowanego użytkownika zwraca błąd 401 Unauthorized.
3. **Brak uprawnień**: Projekt należący do innego użytkownika zwraca błąd 403 Forbidden.
4. **Nieistniejący projekt**: Próba dostępu do nieistniejącego projektu zwraca błąd 404 Not Found.
5. **Błędy serwera**: Wszelkie nieoczekiwane błędy zwracają 500 Internal Server Error z odpowiednią wiadomością.

## 8. Rozważania dotyczące wydajności
1. **Indeksy bazy danych**: Upewnij się, że kolumny `id` i `user_id` w tabeli `projects` są zindeksowane.
2. **Soft Delete**: Zapytanie powinno wykluczać projekty oznaczone jako usunięte (gdzie `deleted_at IS NOT NULL`).
3. **Selektywne pobieranie kolumn**: Rozważ ograniczenie pobieranych kolumn, jeśli nie wszystkie są potrzebne.

## 9. Etapy wdrożenia
1. **Utworzenie pliku API endpointu**: Utwórz plik `/src/pages/api/projects/[id].ts`:
   - Implementacja funkcji GET z obsługą parametru ścieżki
   - Walidacja id przy użyciu zod
   - Integracja z ProjectService
   - Obsługa odpowiedzi i błędów

2. **Rozszerzenie schemy walidacyjnej**: Dodaj schemat walidacji dla parametru id w pliku `/src/lib/schemas/project.schema.ts`.

3. **Weryfikacja getProject w ProjectService**: Upewnij się, że funkcja getProject w ProjectService właściwie sprawdza zarówno istnienie projektu, jak i zgodność user_id.

4. **Testowanie**:
   - Test poprawnego pobierania projektu
   - Testy wszystkich scenariuszy błędów
   - Weryfikacja zgodności z dokumentacją API

5. **Aktualizacja klienta**: Upewnij się, że `ProjectClientService.getProject()` jest poprawnie zaimplementowane.

## 10. Przykładowa implementacja

```typescript
// src/pages/api/projects/[id].ts
import type { APIContext } from "astro";
import { ProjectService } from "../../../lib/services/project.service";
import { projectIdSchema } from "../../../lib/schemas/project.schema";
import type { ErrorResponseDto } from "../../../types";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Mark this endpoint as non-prerendered (dynamic)
export const prerender = false;

/**
 * GET handler for retrieving a single project by ID
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with project data or error
 */
export async function GET(context: APIContext): Promise<Response> {
  // Get Supabase client from locals
  const { locals } = context;
  const { supabase } = locals;

  try {
    // Get project ID from path parameters
    const { id } = context.params;
    
    // Validate project ID format
    const validationResult = projectIdSchema.safeParse(id);
    if (!validationResult.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_parameter",
          message: "Invalid project ID format",
          details: validationResult.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create the project service
    const projectService = new ProjectService(supabase);
    
    try {
      // Get the project
      const project = await projectService.getProject(DEFAULT_USER_ID, validationResult.data);
      
      // Return project data
      return new Response(JSON.stringify(project), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Check error type and return appropriate response
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          const errorResponse: ErrorResponseDto = {
            error: {
              code: "not_found",
              message: "Project not found",
            },
          };
          
          return new Response(JSON.stringify(errorResponse), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
        
        if (error.message.includes("unauthorized") || error.message.includes("permission")) {
          const errorResponse: ErrorResponseDto = {
            error: {
              code: "forbidden",
              message: "You don't have permission to access this project",
            },
          };
          
          return new Response(JSON.stringify(errorResponse), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      }
      
      // Re-throw other errors to be caught by the outer catch block
      throw error;
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching project:", error);

    // Return 500 Internal Server Error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while fetching the project",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
```

Po zaimplementowaniu tego endpointu, klienci będą mogli pobierać szczegółowe informacje o projekcie za pomocą jego identyfikatora, co umożliwi im wyświetlanie i edycję danych projektu.