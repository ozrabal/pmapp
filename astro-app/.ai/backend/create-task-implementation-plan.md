# Plan Implementacji Punktu Końcowego API: Tworzenie Zadania

## 1. Przegląd Punktu Końcowego

Celem tego punktu końcowego jest umożliwienie tworzenia nowych zadań w kontekście określonego bloku funkcjonalnego danego projektu. Operacja ta jest kluczowa dla zarządzania zadaniami w systemie i pozwala użytkownikom na dekompozycję pracy w ramach projektu na mniejsze, zarządzalne jednostki.

## 2. Szczegóły Żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/projects/{id}/functional-blocks/{blockId}/tasks`
- **Parametry Ścieżki**:
  - `{id}` (string, UUID): Identyfikator projektu, do którego należy zadanie. Wymagany.
  - `{blockId}` (string): Identyfikator bloku funkcjonalnego (z pola `functionalBlocks` w tabeli `projects`), w ramach którego tworzone jest zadanie. Wymagany.
- **Ciało Żądania** (format JSON):
  - `name` (string): Nazwa zadania. Wymagane. Max 200 znaków.
  - `description` (string, nullable): Opis zadania. Opcjonalne.
  - `priority` (string, enum: "low", "medium", "high", nullable): Priorytet zadania. Opcjonalne, jeśli nie podane, baza danych ustawi domyślnie 'medium'.
  - `estimatedValue` (number, nullable): Estymowana wartość/wysiłek dla zadania (np. godziny, story points). Opcjonalne.
  - `metadata` (object, nullable): Dodatkowe metadane zadania w formacie JSON. Opcjonalne.

## 3. Wykorzystywane Typy

Do implementacji tego punktu końcowego zostaną zdefiniowane następujące typy DTO w `src/types.ts` (lub użyte istniejące, jeśli pasują):

- **`ApiCreateTaskRequestDto`** (dla ciała żądania API):

  ```typescript
  // Plik: src/types.ts
  export interface ApiCreateTaskRequestDto {
    name: string;
    description?: string | null;
    priority?: TaskPriorityEnum; // Istniejący typ: "low" | "medium" | "high"
    estimatedValue?: number | null;
    metadata?: Record<string, unknown> | null;
  }
  ```

- **`ApiCreateTaskResponseDto`** (dla odpowiedzi API):

  ```typescript
  // Plik: src/types.ts
  export interface ApiCreateTaskResponseDto {
    id: string; // UUID
    name: string;
    description: string | null;
    priority: TaskPriorityEnum;
    estimatedValue: number | null;
    estimatedByAI: boolean;
    createdAt: string; // ISO date string
  }
  ```

- Istniejący typ `TaskPriorityEnum` z `src/types.ts` (`"low" | "medium" | "high"`) będzie używany.

## 4. Szczegóły Odpowiedzi

- **Sukces (201 Created)**:
  Zwraca obiekt `ApiCreateTaskResponseDto` z danymi nowo utworzonego zadania.

  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "name": "Implementacja logowania użytkownika",
    "description": "Stworzenie formularza logowania i obsługa autentykacji.",
    "priority": "high",
    "estimatedValue": 8.0,
    "estimatedByAI": false,
    "createdAt": "2025-06-05T12:30:00.000Z"
  }
  ```

- **Błędy** (zgodnie z `ErrorResponseDto` z `src/types.ts`):
  - `400 Bad Request`: Nieprawidłowe dane wejściowe. Ciało odpowiedzi będzie zawierać szczegóły błędu walidacji.

      ```json
      {
        "error": {
          "code": "VALIDATION_ERROR",
          "message": "Invalid input data.",
          "details": { "name": "Name is required and must be a string.", "priority": "Invalid priority value." }
        }
      }
      ```

  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `403 Forbidden`: Użytkownik jest uwierzytelniony, ale nie ma uprawnień do tworzenia zadań w tym projekcie.
  - `404 Not Found`: Projekt o podanym `id` lub blok funkcjonalny o podanym `blockId` nie został znaleziony.
  - `500 Internal Server Error`: Wystąpił nieoczekiwany błąd po stronie serwera.

## 5. Przepływ Danych

1. Klient wysyła żądanie `POST` na adres `/api/projects/{id}/functional-blocks/{blockId}/tasks` z `ApiCreateTaskRequestDto` w ciele żądania.
2. Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT i uwierzytelnia użytkownika. Jeśli użytkownik nie jest uwierzytelniony, zwraca `401 Unauthorized`. Dane użytkownika i klient Supabase są dostępne w `context.locals`.
3. Handler API w `src/pages/api/projects/[id]/functional-blocks/[blockId]/tasks.ts`:
    a.  Pobiera `id` projektu i `blockId` z `context.params`.
    b.  Pobiera `user` i `supabase` (typu `SupabaseClient` z `src/db/supabase.client.ts`) z `context.locals`.
    c.  Waliduje parametry ścieżki (np. czy `id` jest poprawnym UUID).
    d.  Pobiera ciało żądania (`await context.request.json()`).
    e.  Waliduje ciało żądania przy użyciu schemy Zod zdefiniowanej dla `ApiCreateTaskRequestDto`. W przypadku błędu zwraca `400 Bad Request` z odpowiednim `ErrorResponseDto`.
    f.  Wywołuje metodę `createTaskInFunctionalBlock` w serwisie `TaskService` (`src/lib/services/task.service.ts`), przekazując `projectId`, `functionalBlockId`, zwalidowane dane zadania, `userId` (z `context.locals.user.id`) oraz klienta `supabase`.
4. Serwis `TaskService` (`src/lib/services/task.service.ts`):
    a.  Sprawdza, czy projekt o `projectId` istnieje i czy użytkownik `userId` ma do niego uprawnienia (np. jest właścicielem lub członkiem). Jeśli nie, zgłasza błąd (mapowany na `404 Not Found` lub `403 Forbidden`).
    b.  Pobiera dane projektu, w szczególności pole `functionalBlocks` (JSONB).
    c.  Weryfikuje, czy blok funkcjonalny o identyfikatorze `functionalBlockId` istnieje w obrębie `project.functionalBlocks`. Jeśli nie, zgłasza błąd (mapowany na `404 Not Found`).
    d.  Przygotowuje obiekt danych do wstawienia do tabeli `tasks`, mapując pola z `ApiCreateTaskRequestDto` na odpowiednie kolumny tabeli (`project_id`, `functional_block_id`, `name`, `description`, `priority`, `estimated_value`, `metadata`). Pole `estimated_by_ai` jest ustawiane na `false`.
    e.  Używa klienta `supabase` do wstawienia nowego rekordu do tabeli `tasks`.
    f.  Jeśli operacja w bazie danych zakończy się błędem, zgłasza odpowiedni wyjątek.
    g.  Jeśli operacja powiedzie się, mapuje zwrócone z bazy dane zadania (w tym wygenerowane `id` i `created_at`) na `ApiCreateTaskResponseDto`.
    h.  Zwraca `ApiCreateTaskResponseDto`.
5. Handler API otrzymuje wynik z serwisu:
    a.  Jeśli operacja zakończyła się sukcesem, zwraca odpowiedź `201 Created` z `ApiCreateTaskResponseDto` w ciele.
    b.  Jeśli serwis zgłosił błąd, mapuje go na odpowiedni kod statusu HTTP (`400`, `403`, `404`, `500`) i zwraca `ErrorResponseDto`.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnianie**: Zapewnione przez middleware Astro, które weryfikuje token JWT. Każde żądanie do tego endpointu musi być uwierzytelnione.
- **Autoryzacja**: Kluczowy element. Serwis `TaskService` musi rygorystycznie weryfikować, czy uwierzytelniony użytkownik (`context.locals.user.id`) ma uprawnienia do tworzenia zadań w ramach danego `projectId`. Może to być realizowane przez sprawdzenie relacji użytkownik-projekt (np. tabela `project_members` lub pole `owner_id` w `projects`).
- **Walidacja Danych Wejściowych**: Użycie Zod w handlerze API do walidacji parametrów ścieżki i ciała żądania jest obowiązkowe. Należy zdefiniować precyzyjne schemy walidacji (typy danych, wymagane pola, formaty, długości ciągów znaków, wartości enum) zgodnie ze specyfikacją API i schematem bazy danych (`tasks.name` VARCHAR(200)).
- **Ochrona przed IDOR (Insecure Direct Object References)**: Mechanizmy autoryzacji w serwisie muszą zapobiegać tworzeniu zadań w projektach lub blokach funkcjonalnych, do których użytkownik nie ma dostępu.
- **Zasada Najmniejszych Uprawnień**: Odpowiedź API (`ApiCreateTaskResponseDto`) powinna zawierać tylko niezbędne dane. Unikać ujawniania wrażliwych lub nadmiarowych informacji.
- **Bezpieczeństwo Supabase**: Stosować się do zaleceń Supabase, w tym odpowiedniego użycia RLS (Row Level Security) na tabeli `tasks`, jeśli jest to część strategii bezpieczeństwa projektu. Zapytania powinny być parametryzowane, co zapewnia Supabase client.
- **Obsługa Błędów**: Zwracać generyczne komunikaty błędów dla błędów serwera (`500`), aby nie ujawniać szczegółów implementacyjnych. Szczegółowe błędy walidacji (`400`) są akceptowalne.

## 7. Rozważania dotyczące Wydajności

- **Zapytania do Bazy Danych**:
  - Weryfikacja istnienia projektu i uprawnień użytkownika: Powinny być oparte na indeksowanych kolumnach (`projects.id`, kolumny w tabeli łączącej użytkowników z projektami).
  - Weryfikacja `functionalBlockId`: Odczyt pola JSONB `projects.functionalBlocks` i przeszukiwanie go. Dla bardzo dużych struktur JSON lub częstych zapytań, może to wymagać optymalizacji (np. odpowiednia struktura JSON, potencjalnie indeksy GIN na polach JSONB, jeśli Supabase/PostgreSQL to wspiera efektywnie dla danego przypadku użycia).
  - Wstawienie zadania: Operacja `INSERT` do tabeli `tasks` jest zazwyczaj szybka, zwłaszcza jeśli indeksy są poprawnie skonfigurowane.
- **Walidacja Zod**: Jest wydajna i nie powinna stanowić wąskiego gardła.
- **Rozmiar Payloadu**: Zarówno żądanie, jak i odpowiedź mają stosunkowo mały rozmiar, co jest korzystne dla wydajności sieciowej.
- **Połączenia z Bazą Danych**: Supabase client zarządza pulą połączeń, co jest efektywne.

## 8. Etapy Wdrożenia

1. **Definicja/Aktualizacja Typów DTO**:
    - W pliku `src/types.ts` zdefiniować `ApiCreateTaskRequestDto` i `ApiCreateTaskResponseDto` zgodnie z sekcją 3. Upewnić się, że `TaskPriorityEnum` jest poprawnie zdefiniowany i dostępny.
2. **Stworzenie Schemy Walidacji Zod**:
    - Utworzyć plik `src/lib/schemas/task.schemas.ts` (jeśli nie istnieje) lub dodać do istniejącego pliku schem.
    - Zdefiniować schemę Zod dla `ApiCreateTaskRequestDto`, uwzględniając typy, wymagane pola, maksymalne długości (np. dla `name` zgodnie z `tasks.name VARCHAR(200)`), oraz wartości enum dla `priority`.
3. **Implementacja Serwisu `TaskService`**:
    - Utworzyć lub zaktualizować plik `src/lib/services/task.service.ts`.
    - Zaimplementować metodę `async createTaskInFunctionalBlock(supabase: SupabaseClient, userId: string, projectId: string, functionalBlockId: string, taskData: ApiCreateTaskRequestDto): Promise<ApiCreateTaskResponseDto>`.
        - Logika weryfikacji istnienia projektu (`projectId`) i uprawnień użytkownika (`userId`) do niego.
        - Logika pobrania projektu i weryfikacji istnienia `functionalBlockId` w polu `project.functionalBlocks`.
        - Przygotowanie danych do zapisu w tabeli `tasks` (mapowanie `taskData`, ustawienie `project_id`, `functional_block_id`, `estimated_by_ai = false`).
        - Wykonanie operacji `insert` do tabeli `tasks` za pomocą `supabase.from('tasks').insert(...).select().single()`.
        - Obsługa błędów z bazy danych i zgłaszanie odpowiednich wyjątków (np. własne typy błędów, które handler API może zmapować na kody HTTP).
        - Mapowanie wyniku z bazy na `ApiCreateTaskResponseDto`.
4. **Implementacja Handlera API Astro**:
    - Utworzyć plik `src/pages/api/projects/[id]/functional-blocks/[blockId]/tasks.ts`.
    - Dodać `export const prerender = false;` zgodnie z wytycznymi projektu.
    - Zaimplementować funkcję `export async function POST({ params, request, locals }: APIContext)`:
        - Pobranie `supabaseClient` i `user` z `locals` (np. `const { supabaseClient, user } = locals;`). Sprawdzenie, czy `user` istnieje (uwierzytelnienie).
        - Walidacja `params.id` (jako UUID) i `params.blockId` (jako string niepusty).
        - Pobranie i walidacja ciała żądania (`await request.json()`) przy użyciu schemy Zod dla `ApiCreateTaskRequestDto`.
        - Wywołanie `taskService.createTaskInFunctionalBlock(...)` z odpowiednimi argumentami.
        - Obsługa sukcesu: zwrócenie `new Response(JSON.stringify(createdTask), { status: 201, headers: { 'Content-Type': 'application/json' } })`.
        - Obsługa błędów: przechwycenie wyjątków z serwisu i mapowanie ich na odpowiednie `ErrorResponseDto` i kody statusu HTTP (400, 403, 404, 500).
5. **Testy Jednostkowe (Vitest)**:
    - Napisać testy jednostkowe dla serwisu `TaskService`, metody `createTaskInFunctionalBlock`.
    - Mockować klienta Supabase (`supabase.from(...).select()`, `supabase.from(...).insert()`).
    - Testować logikę weryfikacji uprawnień, istnienia projektu/bloku, poprawne mapowanie danych, obsługę błędów.
6. **Testy End-to-End (Playwright)**:
    - Napisać testy E2E dla punktu końcowego `POST /api/projects/{id}/functional-blocks/{blockId}/tasks`.
    - Scenariusze:
        - Pomyślne utworzenie zadania (status 201, poprawna struktura odpowiedzi).
        - Błędy walidacji danych wejściowych (status 400).
        - Brak uwierzytelnienia (status 401).
        - Brak autoryzacji do projektu (status 403).
        - Nieistniejący projekt lub blok funkcjonalny (status 404).
7. **Dokumentacja**: (Jeśli projekt używa narzędzi do generowania dokumentacji API, np. Swagger/OpenAPI)
    - Zaktualizować specyfikację API o nowy punkt końcowy, jego parametry, ciało żądania i możliwe odpowiedzi.
8. **Przegląd Kodu (Code Review)**:
    - Przeprowadzenie przeglądu kodu przez innego członka zespołu w celu zapewnienia jakości, zgodności z wytycznymi i standardami projektu.
9. **Wdrożenie**: Po pomyślnym przejściu testów i code review, wdrożenie zmian na odpowiednie środowiska.
