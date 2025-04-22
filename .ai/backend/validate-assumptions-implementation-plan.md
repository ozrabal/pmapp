# API Endpoint Implementation Plan: Validate Project Assumptions

## 1. Przegląd punktu końcowego
Endpoint `/api/projects/{id}/assumptions/validate` służy do walidacji założeń projektu przy użyciu sztucznej inteligencji. Analizuje on założenia projektu zapisane w formacie JSON i zwraca informacje o ich poprawności, wraz z sugestiami ulepszeń i szczegółowym feedbackiem.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/projects/{id}/assumptions/validate`
- **Parametry**:
  - **Wymagane**: `id` - UUID projektu (parametr ścieżki)
  - **Opcjonalne**: Brak
- **Request Body**: Brak (walidacja opiera się na istniejących założeniach projektu zapisanych w bazie danych)
- **Nagłówki**:
  - Autoryzacyjne nagłówki Supabase (automatycznie zarządzane przez klienta Supabase)

## 3. Wykorzystywane typy
- **Modele odpowiedzi**:
  ```typescript
  // Istniejące typy z src/types.ts
  ValidateProjectAssumptionsResponseDto {
    isValid: boolean;
    feedback: FeedbackItemDto[];
    suggestions: SuggestionDto[];
  }
  
  FeedbackItemDto {
    field: string;
    message: string;
    severity: string;
  }
  
  SuggestionDto {
    id: string;
    field?: string;
    suggestion?: string;
    reason: string;
  }
  ```

- **Wewnętrzne typy**:
  ```typescript
  // Do utworzenia w nowym pliku src/lib/schemas/assumptions.schema.ts
  import { z } from 'zod';
  
  export const ProjectAssumptionsSchema = z.object({
    // Definicja schematu założeń projektu zgodna z oczekiwanym formatem JSON
    // To jest przykładowa definicja, która powinna być dopasowana do rzeczywistej struktury
    marketAssumptions: z.object({
      targetAudience: z.string().optional(),
      marketSize: z.string().optional(),
      competitors: z.array(z.string()).optional()
    }).optional(),
    technicalAssumptions: z.object({
      platforms: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
      architecture: z.string().optional()
    }).optional(),
    businessAssumptions: z.object({
      revenue: z.string().optional(),
      costs: z.string().optional(),
      timeline: z.string().optional()
    }).optional()
  });
  
  export type ProjectAssumptions = z.infer<typeof ProjectAssumptionsSchema>;
  ```

- **Typy Supabase**:
  ```typescript
  // Do wykorzystania z istniejących plików
  import type { SupabaseClient } from '../db/supabase.client';
  ```

## 4. Szczegóły odpowiedzi
- **Format odpowiedzi**:
  ```typescript
  {
    isValid: boolean,    // Czy założenia projektu są poprawne
    feedback: [          // Szczegółowe informacje zwrotne dotyczące poszczególnych pól
      {
        field: string,   // Nazwa pola, którego dotyczy uwaga
        message: string, // Treść uwagi
        severity: string // Poziom ważności: "error", "warning", "info"
      }
    ],
    suggestions: [       // Sugestie ulepszeń
      {
        id: string,      // Unikalny identyfikator sugestii
        field: string,   // Pole, którego dotyczy sugestia
        suggestion: string, // Treść sugestii
        reason: string   // Uzasadnienie sugestii
      }
    ]
  }
  ```

- **Kody odpowiedzi**:
  - **200 OK**: Poprawne przetworzenie żądania, niezależnie od wyniku walidacji
  - **401 Unauthorized**: Brak autentykacji użytkownika
  - **403 Forbidden**: Brak uprawnień do projektu
  - **404 Not Found**: Projekt nie został znaleziony
  - **500 Internal Server Error**: Błąd serwera, np. problem z usługą AI

## 5. Przepływ danych
1. Otrzymanie żądania POST z parametrem `id`
2. Walidacja ID projektu
3. Pobranie projektu z bazy danych
4. Sprawdzenie uprawnień użytkownika do projektu
5. Sprawdzenie czy projekt ma zdefiniowane założenia
6. Przygotowanie danych założeń do analizy przez AI
7. Wywołanie usługi AI do walidacji założeń
8. Przetworzenie odpowiedzi z AI do odpowiedniego formatu DTO
9. Zwrócenie odpowiedzi do klienta

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**:
  - Wykorzystanie mechanizmów uwierzytelniania Supabase
  - Sprawdzenie autentykacji użytkownika przed dostępem do zasobu
  
- **Autoryzacja**:
  - Weryfikacja czy użytkownik jest właścicielem projektu
  - Weryfikacja uprawnień użytkownika do projektu (wykorzystanie Supabase RLS)
  
- **Walidacja danych**:
  - Walidacja ID projektu jako prawidłowego UUID
  - Walidacja struktury założeń projektu przed wysłaniem do AI
  
- **Bezpieczeństwo AI**:
  - Sanityzacja danych przekazywanych do AI
  - Ograniczenie rozmiaru danych wysyłanych do AI
  - Filtrowanie wrażliwych informacji przed przesłaniem do AI

## 7. Obsługa błędów
- **401 Unauthorized**:
  - Przyczyna: Brak autentykacji użytkownika
  - Rozwiązanie: Przekierowanie do logowania lub informacja o konieczności zalogowania
  
- **403 Forbidden**:
  - Przyczyna: Użytkownik nie jest właścicielem projektu
  - Rozwiązanie: Informacja o braku uprawnień
  
- **404 Not Found**:
  - Przyczyna: Projekt o podanym ID nie istnieje
  - Rozwiązanie: Informacja o nieistniejącym projekcie
  
- **400 Bad Request**:
  - Przyczyna: Nieprawidłowy format ID projektu
  - Rozwiązanie: Informacja o nieprawidłowym formacie ID
  
- **422 Unprocessable Content**:
  - Przyczyna: Projekt nie ma zdefiniowanych założeń do walidacji
  - Rozwiązanie: Informacja o konieczności zdefiniowania założeń
  
- **500 Internal Server Error**:
  - Przyczyna: Problem z usługą AI lub inny błąd serwera
  - Rozwiązanie: Log błędu, informacja dla użytkownika o tymczasowym problemie

## 8. Rozważania dotyczące wydajności
- **Pamięć podręczna (cache)**:
  - Przechowywanie wyników walidacji przez określony czas
  - Ponowne użycie wyników, jeśli założenia nie zmieniły się
  
- **Optymalizacja żądań AI**:
  - Ograniczenie liczby wywołań API AI
  - Optymalizacja danych wejściowych do niezbędnego minimum
  
- **Asynchroniczność**:
  - Rozważenie asynchronicznego przetwarzania dla długotrwałych operacji AI
  - Implementacja mechanizmu powiadomień o zakończeniu analizy

## 9. Kroki implementacji

### 1. Utworzenie schematu walidacji założeń
```typescript
// src/lib/schemas/assumptions.schema.ts
import { z } from 'zod';

export const ProjectAssumptionsSchema = z.object({
  // Definicja struktury założeń projektu
});

export type ProjectAssumptions = z.infer<typeof ProjectAssumptionsSchema>;
```

### 2. Implementacja serwisu AI
```typescript
// src/lib/services/ai.service.ts
import type { ProjectAssumptions } from '../schemas/assumptions.schema';
import type { FeedbackItemDto, SuggestionDto } from '../../types';
import { Ai } from '@vercel/ai';

export interface ValidateAssumptionsResult {
  isValid: boolean;
  feedback: FeedbackItemDto[];
  suggestions: SuggestionDto[];
}

export class AiService {
  private ai: Ai;
  
  constructor() {
    this.ai = new Ai({
      apiKey: import.meta.env.AI_API_KEY,
    });
  }

  async validateProjectAssumptions(assumptions: ProjectAssumptions): Promise<ValidateAssumptionsResult> {
    // Implementacja walidacji założeń przy użyciu AI
    // ...

    return {
      isValid: true, // Przykładowa wartość
      feedback: [],  // Przykładowa wartość
      suggestions: [] // Przykładowa wartość
    };
  }
}

export const aiService = new AiService();
```

### 3. Rozszerzenie Project Service o metodę walidacji
```typescript
// src/lib/services/project.service.ts
import type { SupabaseClient } from '../../db/supabase.client';
import type { ProjectAssumptions } from '../schemas/assumptions.schema';
import { aiService, type ValidateAssumptionsResult } from './ai.service';
import { ProjectAssumptionsSchema } from '../schemas/assumptions.schema';

export class ProjectService {
  constructor(private supabase: SupabaseClient) {}

  async getProjectById(id: string, userId: string) {
    // Implementacja pobierania projektu
  }

  async validateProjectAssumptions(projectId: string, userId: string): Promise<ValidateAssumptionsResult> {
    // Pobierz projekt
    const { data: project, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw new Error('Project not found or access denied');
    }
    
    if (!project.assumptions) {
      throw new Error('Project assumptions not defined');
    }
    
    // Walidacja schematu założeń
    const parsedAssumptions = ProjectAssumptionsSchema.safeParse(project.assumptions);
    
    if (!parsedAssumptions.success) {
      throw new Error('Invalid assumptions format');
    }
    
    // Wywołanie serwisu AI
    return await aiService.validateProjectAssumptions(parsedAssumptions.data);
  }
}
```

### 4. Implementacja endpointu API
```typescript
// src/pages/api/projects/[id]/assumptions/validate.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { ProjectService } from '../../../../../lib/services/project.service';

export const prerender = false;

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Sprawdź czy użytkownik jest zalogowany
    const supabase = locals.supabase;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'unauthorized',
            message: 'Not authenticated'
          }
        }),
        { status: 401 }
      );
    }
    
    // Walidacja parametrów
    const result = paramsSchema.safeParse(params);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'invalid_parameter',
            message: 'Invalid project ID',
            details: result.error.format()
          }
        }),
        { status: 400 }
      );
    }
    
    // Przetworzenie żądania
    const projectService = new ProjectService(supabase);
    
    try {
      const validationResult = await projectService.validateProjectAssumptions(
        result.data.id,
        session.user.id
      );
      
      return new Response(
        JSON.stringify(validationResult),
        { status: 200 }
      );
    } catch (error) {
      // Obsługa różnych błędów
      if (error.message === 'Project not found or access denied') {
        return new Response(
          JSON.stringify({
            error: {
              code: 'not_found',
              message: 'Project not found'
            }
          }),
          { status: 404 }
        );
      }
      
      if (error.message === 'Project assumptions not defined') {
        return new Response(
          JSON.stringify({
            error: {
              code: 'unprocessable_content',
              message: 'No assumptions to validate'
            }
          }),
          { status: 422 }
        );
      }
      
      // Ogólny błąd
      console.error('Error validating project assumptions:', error);
      
      return new Response(
        JSON.stringify({
          error: {
            code: 'internal_server_error',
            message: 'An unexpected error occurred'
          }
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in assumptions validation endpoint:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'internal_server_error',
          message: 'An unexpected error occurred'
        }
      }),
      { status: 500 }
    );
  }
};
```

### 5. Dodanie testów

```typescript
// tests/api/assumptions-validate.test.ts
// Implementacja testów dla endpointu
```

### 6. Aktualizacja dokumentacji API

```markdown
// docs/api.md
// Aktualizacja dokumentacji API o nowy endpoint
```

### 7. Rozszerzenie loggerów

```typescript
// src/lib/logger.ts
// Rozszerzenie systemu logowania o nowe zdarzenia związane z walidacją założeń
```