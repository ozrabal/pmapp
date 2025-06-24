# API Endpoint Implementation Plan: Tasks Management Endpoints

## 1. Przegląd punktu końcowego

Ten plan obejmuje implementację dwóch endpointów API do zarządzania zadaniami:

1. **Lista zadań dla bloku funkcjonalnego** - zwraca paginowaną listę zadań należących do konkretnego bloku funkcjonalnego w projekcie
2. **Pobieranie szczegółów zadania** - zwraca kompletne informacje o konkretnym zadaniu

Oba endpointy są tylko do odczytu (GET) i obsługują autoryzację na poziomie użytkownika z kontrolą dostępu do projektów.

## 2. Szczegóły żądania

### Endpoint 1: Lista zadań dla bloku funkcjonalnego
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/projects/{id}/functional-blocks/{blockId}/tasks`
- **Parametry**:
  - **Wymagane**:
    - `id` (string, UUID) - identyfikator projektu
    - `blockId` (string) - identyfikator bloku funkcjonalnego
  - **Opcjonalne** (query parameters):
    - `page` (number, default: 1) - numer strony dla paginacji
    - `limit` (number, default: 20, max: 100) - liczba wyników na stronę
    - `priority` (enum: 'low' | 'medium' | 'high') - filtrowanie po priorytecie
    - `sort` (string) - pole i kierunek sortowania (np. 'name:asc', 'createdAt:desc')

### Endpoint 2: Pobieranie szczegółów zadania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/tasks/{id}`
- **Parametry**:
  - **Wymagane**:
    - `id` (string, UUID) - identyfikator zadania
- **Request Body**: Brak

## 3. Wykorzystywane typy

### Nowe DTOs (do dodania w src/types.ts):

```typescript
// Lista zadań - uproszczona wersja
export interface TaskListItemDto {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  estimatedValue: number | null;
  estimatedByAI: boolean;
  aiConfidenceScore: number | null;
  createdAt: string;
  updatedAt: string;
}

// Szczegóły zadania - pełna wersja
export interface TaskDetailDto {
  id: string;
  projectId: string;
  functionalBlockId: string;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  estimatedValue: number | null;
  estimatedByAI: boolean;
  aiConfidenceScore: number | null;
  aiSuggestionContext: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// Response DTOs
export interface ListTasksForBlockResponseDto {
  data: TaskListItemDto[];
  pagination: PaginationDto;
}

export interface GetTaskResponseDto extends TaskDetailDto {}

// Query parameters DTOs
export interface ListTasksQueryDto {
  page?: number;
  limit?: number;
  priority?: TaskPriorityEnum;
  sort?: string;
}
```

### Zod Schemas (do utworzenia w src/lib/schemas/):

```typescript
export const listTasksParamsSchema = z.object({
  id: z.string().uuid('Invalid project ID format'),
  blockId: z.string().min(1, 'Block ID is required')
});

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  sort: z.string().regex(/^[a-zA-Z]+:(asc|desc)$/).optional()
});

export const getTaskParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID format')
});
```

## 4. Szczegóły odpowiedzi

### Lista zadań (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "priority": "low | medium | high",
      "estimatedValue": "number | null",
      "estimatedByAI": "boolean",
      "aiConfidenceScore": "number | null",
      "createdAt": "ISO 8601 string",
      "updatedAt": "ISO 8601 string"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number", 
    "limit": "number",
    "pages": "number"
  }
}
```

### Szczegóły zadania (200 OK):
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "functionalBlockId": "string",
  "name": "string",
  "description": "string | null",
  "priority": "low | medium | high",
  "estimatedValue": "number | null",
  "estimatedByAI": "boolean",
  "aiConfidenceScore": "number | null",
  "aiSuggestionContext": "string | null",
  "metadata": "object | null",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string"
}
```

### Kody błędów:
- **400 Bad Request**: Nieprawidłowe parametry (invalid UUID, priority, pagination)
- **401 Unauthorized**: Brak uwierzytelnienia
- **403 Forbidden**: Brak autoryzacji do projektu
- **404 Not Found**: Projekt, blok funkcjonalny lub zadanie nie znalezione
- **500 Internal Server Error**: Błędy serwera

## 5. Przepływ danych

### Endpoint 1: Lista zadań
1. **Walidacja parametrów URL** - sprawdzenie project ID i block ID
2. **Walidacja query parameters** - paginacja, filtrowanie, sortowanie
3. **Uwierzytelnianie** - pobranie użytkownika z Supabase auth
4. **Autoryzacja projektu** - sprawdzenie czy projekt należy do użytkownika
5. **Walidacja bloku funkcjonalnego** - sprawdzenie czy blok istnieje w projekcie
6. **Zapytanie do bazy** - pobranie zadań z paginacją i filtrami
7. **Transformacja danych** - konwersja do TaskListItemDto
8. **Przygotowanie paginacji** - obliczenie total, pages
9. **Zwrócenie odpowiedzi**

### Endpoint 2: Szczegóły zadania
1. **Walidacja parametrów URL** - sprawdzenie task ID
2. **Uwierzytelnianie** - pobranie użytkownika z Supabase auth
3. **Zapytanie do bazy** - pobranie zadania z JOIN do projektu
4. **Autoryzacja** - sprawdzenie czy zadanie należy do projektu użytkownika
5. **Transformacja danych** - konwersja do TaskDetailDto
6. **Zwrócenie odpowiedzi**

## 6. Względy bezpieczeństwa

### Uwierzytelnianie:
- Wykorzystanie Supabase Auth dla weryfikacji JWT token
- Middleware Astro dla sprawdzenia sesji użytkownika
- Wymaganie aktywnej sesji dla wszystkich operacji

### Autoryzacja:
- **Row Level Security (RLS)** na poziomie bazy danych
- Sprawdzenie właściciela projektu przed dostępem do zadań
- Walidacja istnienia bloku funkcjonalnego w kontekście projektu
- Soft delete - filtrowanie zadań z `deleted_at IS NULL`

### Walidacja danych:
- Zod schemas dla wszystkich parametrów wejściowych
- Sprawdzenie formatów UUID
- Walidacja enum values (priority)
- Ograniczenia paginacji (max limit: 100)
- Sanityzacja query parameters

### Ochrona przed atakami:
- **SQL Injection**: Korzystanie z parameterized queries przez Supabase client
- **Rate limiting**: Implementacja na poziomie middleware
- **CORS**: Odpowiednia konfiguracja dla frontend domains
- **Information disclosure**: Nie ujawnianie internal IDs czy szczegółów błędów

## 7. Obsługa błędów

### Scenariusze błędów:

1. **400 Bad Request**:
   - Invalid UUID format dla project/task ID
   - Invalid priority value
   - Invalid pagination parameters (page < 1, limit > 100)
   - Invalid sort format

2. **401 Unauthorized**:
   - Brak lub invalid JWT token
   - Expired session
   - User nie istnieje w bazie

3. **403 Forbidden**:
   - Projekt nie należy do użytkownika
   - Zadanie należy do projektu innego użytkownika
   - User ma zablokowany dostęp

4. **404 Not Found**:
   - Projekt nie istnieje lub został usunięty (soft delete)
   - Functional block nie istnieje w projekcie
   - Zadanie nie istnieje lub zostało usunięte (soft delete)

5. **500 Internal Server Error**:
   - Database connection errors
   - Supabase service errors
   - Unexpected application errors

### Logowanie błędów:
- Wykorzystanie tabeli `user_activities` dla audit trail
- Logowanie dostępu do zadań i projektów
- Error logging dla błędów 5xx
- Strukturalne logi z context (user_id, project_id, task_id)

## 8. Rozważania dotyczące wydajności

### Optymalizacja zapytań:
- **Indeksy**: Wykorzystanie istniejących indeksów na `project_id`, `functional_block_id`, `priority`
- **Composite index**: `(project_id, functional_block_id)` dla pierwszego endpointu
- **Paginacja**: LIMIT/OFFSET dla kontroli rozmiaru odpowiedzi
- **SELECT specific fields**: Unikanie SELECT * dla TaskListItemDto

### Caching:
- **HTTP Caching**: Cache-Control headers dla stabilnych danych
- **Application caching**: Redis dla często żądanych projektów
- **Query result caching**: Na poziomie Supabase

### Database optimizations:
- **Connection pooling**: Wykorzystanie Supabase connection pool
- **Read replicas**: Dla read-only operations
- **Query optimization**: EXPLAIN ANALYZE dla złożonych zapytań

### Monitoring:
- **Response time tracking**: Dla identyfikacji slow queries
- **Error rate monitoring**: Alert dla wysokich error rates
- **Database performance**: Monitoring query execution time

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie typów i schematów
1. Dodanie nowych DTOs do `src/types.ts`
2. Utworzenie Zod schemas w `src/lib/schemas/tasks.schema.ts`
3. Export schemas w `src/lib/schemas/index.ts`

### Krok 2: Implementacja TaskService
1. Utworzenie `src/lib/services/TaskService.ts`
2. Implementacja metod:
   - `getTasksForFunctionalBlock()`
   - `getTaskById()`
   - `validateProjectAccess()`
   - `validateFunctionalBlockExists()`
3. Testy jednostkowe dla TaskService

### Krok 3: Implementacja API endpoints
1. Utworzenie `src/pages/api/projects/[id]/functional-blocks/[blockId]/tasks.ts`
2. Utworzenie `src/pages/api/tasks/[id].ts`
3. Implementacja GET handlers z:
   - Parameter validation
   - Authentication middleware
   - Error handling
   - Response formatting

### Krok 4: Middleware i utilities
1. Aktualizacja authentication middleware w `src/middleware/index.ts`
2. Implementacja error handling utilities
3. Dodanie rate limiting jeśli potrzebne

### Krok 5: Testy
1. Testy jednostkowe dla service layer
2. Testy integracyjne dla API endpoints
3. Testy E2E z Playwright
4. Performance testing dla paginacji

### Krok 6: Dokumentacja i deployment
1. Aktualizacja API documentation
2. Code review i quality checks
3. Deployment na staging environment
4. Production deployment z monitoring

### Krok 7: Monitoring i optimizacja
1. Implementacja metrics i logging
2. Performance monitoring setup
3. Error tracking configuration
4. Optimizacja na podstawie production data
