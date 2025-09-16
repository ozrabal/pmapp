# Plan implementacji widoku zadań w blokach funkcjonalnych

## 1. Przegląd

Rozszerzenie istniejącego widoku bloków funkcjonalnych (`/projects/:id/functional-blocks`) o możliwość zarządzania zadaniami w kontekście każdego bloku funkcjonalnego. Widok umożliwia użytkownikom przeglądanie, filtrowanie i sortowanie zadań, dodawanie nowych zadań manualnie lub generowanie ich przy pomocy AI, a także edycję i usuwanie istniejących zadań.

## 2. Routing widoku

Rozszerzenie jest implementowane w ramach istniejącej ścieżki: `/projects/:id/functional-blocks`

## 3. Struktura komponentów

```
FunctionalBlockTasksContainer
├── TaskListHeader
│   ├── TaskCounter
│   ├── TaskFilters
│   ├── TaskSorter
│   ├── AddTaskButton
│   └── GenerateTasksWithAIButton
├── TaskList
│   ├── TaskListItem (multiple)
│   │   ├── TaskPriorityBadge
│   │   ├── TaskEstimationDisplay
│   │   └── TaskActions
│   └── Pagination
└── EmptyTasksState
```

## 4. Szczegóły komponentów

### FunctionalBlockTasksContainer

- **Opis komponentu**: Główny kontener zarządzający listą zadań dla bloku funkcjonalnego. Odpowiada za pobieranie, filtrowanie i sortowanie zadań oraz zarządzanie stanem rozwinięcia/zwinięcia.
- **Główne elementy**:
  - Nagłówek sekcji zadań z kontrolkami
  - Lista zadań lub stan pusty
  - Komponenty potomne odpowiedzialne za różne aspekty zarządzania zadaniami
- **Obsługiwane interakcje**:
  - Rozwijanie/zwijanie listy zadań
  - Przełączanie między filtrami priorytetów
  - Zmiana sortowania zadań
- **Obsługiwana walidacja**:
  - Sprawdzenie czy blok funkcjonalny istnieje
  - Sprawdzenie czy użytkownik ma dostęp do projektu
- **Typy**:
  - `FunctionalBlock` (istniejący typ)
  - `TaskListViewModel`
- **Propsy**:
  - `projectId: string`
  - `functionalBlock: FunctionalBlock`
  - `isExpanded: boolean`
  - `onToggleExpanded: (blockId: string) => void`

### TaskListHeader

- **Opis komponentu**: Nagłówek listy zadań zawierający licznik zadań, sumę estymacji, filtry, opcje sortowania oraz przyciski akcji.
- **Główne elementy**:
  - Licznik zadań z sumą estymacji
  - Komponenty do filtrowania i sortowania
  - Przyciski do dodawania zadań ręcznie i generowania zadań z AI
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku "Dodaj zadanie"
  - Kliknięcie przycisku "Generuj zadania z AI"
  - Zmiana filtrów
  - Zmiana sortowania
- **Obsługiwana walidacja**: Brak
- **Typy**:
  - `TaskFilterViewModel`
  - `TaskSortViewModel`
- **Propsy**:
  - `taskCount: number`
  - `totalEstimation: number | null`
  - `filter: TaskFilterViewModel`
  - `onFilterChange: (filter: TaskFilterViewModel) => void`
  - `sort: TaskSortViewModel`
  - `onSortChange: (sort: TaskSortViewModel) => void`
  - `onAddTask: () => void`
  - `onGenerateTasksWithAI: () => void`
  - `estimationUnit?: string`

### TaskFilters

- **Opis komponentu**: Komponent umożliwiający filtrowanie zadań według priorytetu.
- **Główne elementy**:
  - Dropdown z opcjami filtrowania (wszystkie, niski, średni, wysoki)
- **Obsługiwane interakcje**:
  - Wybór opcji filtrowania
- **Obsługiwana walidacja**:
  - Sprawdzenie czy wybrana wartość priorytetu jest poprawna
- **Typy**:
  - `TaskFilterViewModel`
  - `TaskPriorityEnum`
- **Propsy**:
  - `filter: TaskFilterViewModel`
  - `onFilterChange: (filter: TaskFilterViewModel) => void`

### TaskSorter

- **Opis komponentu**: Komponent umożliwiający sortowanie zadań według różnych kryteriów.
- **Główne elementy**:
  - Dropdown z polami do sortowania (nazwa, priorytet, estymacja, data utworzenia)
  - Przycisk do zmiany kierunku sortowania (rosnąco/malejąco)
- **Obsługiwane interakcje**:
  - Wybór pola sortowania
  - Zmiana kierunku sortowania
- **Obsługiwana walidacja**:
  - Sprawdzenie czy wybrane pole i kierunek sortowania są poprawne
- **Typy**:
  - `TaskSortViewModel`
- **Propsy**:
  - `sort: TaskSortViewModel`
  - `onSortChange: (sort: TaskSortViewModel) => void`

### TaskList

- **Opis komponentu**: Lista zadań z paginacją dla danego bloku funkcjonalnego.
- **Główne elementy**:
  - Elementy listy zadań
  - Kontrolki paginacji
- **Obsługiwane interakcje**:
  - Kliknięcie w zadanie
  - Zmiana strony
- **Obsługiwana walidacja**: Brak
- **Typy**:
  - `TaskListItemDto[]`
  - `PaginationDto`
- **Propsy**:
  - `tasks: TaskListItemDto[]`
  - `pagination: PaginationDto`
  - `isLoading: boolean`
  - `onPageChange: (page: number) => void`
  - `onTaskClick: (taskId: string) => void`
  - `estimationUnit?: string`

### TaskListItem

- **Opis komponentu**: Pojedynczy element na liście zadań pokazujący kluczowe informacje o zadaniu.
- **Główne elementy**:
  - Nazwa zadania
  - Etykieta priorytetu
  - Wartość estymacji
  - Wskaźnik źródła estymacji (ręcznie/AI)
  - Przyciski akcji (edycja, usunięcie)
- **Obsługiwane interakcje**:
  - Kliknięcie w zadanie
  - Kliknięcie przycisku edycji
  - Kliknięcie przycisku usunięcia
- **Obsługiwana walidacja**: Brak
- **Typy**:
  - `TaskListItemDto`
- **Propsy**:
  - `task: TaskListItemDto`
  - `onClick: (taskId: string) => void`
  - `onEdit: (taskId: string) => void`
  - `onDelete: (taskId: string) => void`
  - `estimationUnit?: string`

### TaskPriorityBadge

- **Opis komponentu**: Etykieta wizualizująca priorytet zadania z odpowiednim kolorem.
- **Główne elementy**:
  - Badge z tekstem i kolorem odpowiadającym priorytetowi
- **Obsługiwane interakcje**: Brak
- **Obsługiwana walidacja**: Brak
- **Typy**:
  - `TaskPriorityEnum`
- **Propsy**:
  - `priority: TaskPriorityEnum`

### TaskEstimationDisplay

- **Opis komponentu**: Komponent wyświetlający wartość estymacji zadania oraz informację o jej źródle (ręcznie/AI).
- **Główne elementy**:
  - Wartość estymacji
  - Ikona oznaczająca źródło estymacji
  - Tooltip z poziomem pewności AI (jeśli dotyczy)
- **Obsługiwane interakcje**:
  - Hover nad ikoną AI pokazuje tooltip z poziomem pewności
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak specyficznych
- **Propsy**:
  - `estimatedValue: number | null`
  - `estimatedByAI: boolean`
  - `aiConfidenceScore: number | null`
  - `unit?: string`

### EmptyTasksState

- **Opis komponentu**: Stan wyświetlany, gdy blok funkcjonalny nie zawiera żadnych zadań.
- **Główne elementy**:
  - Ikona lub ilustracja pustego stanu
  - Tekst informacyjny
  - Przyciski akcji (dodaj zadanie, generuj zadania z AI)
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku "Dodaj zadanie"
  - Kliknięcie przycisku "Generuj zadania z AI"
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak specyficznych
- **Propsy**:
  - `onAddTask: () => void`
  - `onGenerateTasksWithAI: () => void`

## 5. Typy

### Typy z API (już zdefiniowane w src/types.ts)

```typescript
export enum TaskPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

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

export interface PaginationDto {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ListTasksForBlockResponseDto {
  data: TaskListItemDto[];
  pagination: PaginationDto;
}

export interface GetTaskResponseDto extends TaskDetailDto {}
```

### Nowe typy dla interfejsu użytkownika

```typescript
export interface TaskFilterViewModel {
  priority: TaskPriorityEnum | 'all';
}

export interface TaskSortViewModel {
  field: 'name' | 'priority' | 'estimatedValue' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface TaskListViewModel {
  tasks: TaskListItemDto[];
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  filter: TaskFilterViewModel;
  sort: TaskSortViewModel;
}
```

## 6. Zarządzanie stanem

Dla skutecznego zarządzania stanem widoku zadań w blokach funkcjonalnych, implementujemy kilka dedykowanych hooków:

### useTasksForFunctionalBlock

```typescript
const useTasksForFunctionalBlock = (
  projectId: string,
  blockId: string,
  filter: TaskFilterViewModel,
  sort: TaskSortViewModel,
  page: number,
  limit: number
) => {
  const [tasks, setTasks] = useState<TaskListItemDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Budowanie parametrów zapytania na podstawie stanu filtrów, sortowania i paginacji
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        if (filter.priority !== 'all') {
          queryParams.append('priority', filter.priority);
        }
        
        queryParams.append('sort', `${sort.field}:${sort.direction}`);
        
        // Wywołanie API
        const response = await fetch(
          `/api/projects/${projectId}/functional-blocks/${blockId}/tasks?${queryParams.toString()}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data: ListTasksForBlockResponseDto = await response.json();
        setTasks(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania zadań');
        console.error('Error fetching tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId, blockId, filter, sort, page, limit]);
  
  return { tasks, pagination, isLoading, error };
};
```

### useExpandedBlocks

```typescript
const useExpandedBlocks = (initialState: Record<string, boolean> = {}) => {
  const [expandedBlockIds, setExpandedBlockIds] = useState<Record<string, boolean>>(initialState);
  
  const toggleBlockExpanded = useCallback((blockId: string) => {
    setExpandedBlockIds(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  }, []);
  
  return { expandedBlockIds, toggleBlockExpanded };
};
```

### useTaskFilters

```typescript
const useTaskFilters = (initialFilter: TaskFilterViewModel = { priority: 'all' }) => {
  const [filter, setFilter] = useState<TaskFilterViewModel>(initialFilter);
  
  const updateFilter = useCallback((newFilter: Partial<TaskFilterViewModel>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter
    }));
  }, []);
  
  return { filter, updateFilter };
};
```

### useTaskSort

```typescript
const useTaskSort = (initialSort: TaskSortViewModel = { field: 'priority', direction: 'desc' }) => {
  const [sort, setSort] = useState<TaskSortViewModel>(initialSort);
  
  const updateSort = useCallback((newSort: Partial<TaskSortViewModel>) => {
    setSort(prev => ({
      ...prev,
      ...newSort
    }));
  }, []);
  
  const toggleSortDirection = useCallback(() => {
    setSort(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  return { sort, updateSort, toggleSortDirection };
};
```

## 7. Integracja API

Widok korzysta z dwóch endpointów API:

### 1. Lista zadań dla bloku funkcjonalnego

```
GET /api/projects/{id}/functional-blocks/{blockId}/tasks
```

**Parametry URL:**

- `id` (string, UUID) - identyfikator projektu
- `blockId` (string) - identyfikator bloku funkcjonalnego

**Parametry zapytania:**

- `page` (number, default: 1) - numer strony dla paginacji
- `limit` (number, default: 20, max: 100) - liczba wyników na stronę
- `priority` (enum: 'low' | 'medium' | 'high') - filtrowanie po priorytecie
- `sort` (string) - pole i kierunek sortowania (np. 'name:asc', 'createdAt:desc')

**Odpowiedź:**

```typescript
{
  data: TaskListItemDto[];
  pagination: PaginationDto;
}
```

### 2. Pobieranie szczegółów zadania

```
GET /api/tasks/{id}
```

**Parametry URL:**

- `id` (string, UUID) - identyfikator zadania

**Odpowiedź:**

```typescript
TaskDetailDto
```

Integracja z tymi endpointami jest realizowana w customowych hookach, które zapewniają odpowiednie zarządzanie stanem, obsługę błędów i transformację danych.

## 8. Interakcje użytkownika

### Rozwijanie/zwijanie listy zadań

1. Użytkownik klika przycisk rozwijania/zwijania przy bloku funkcjonalnym
2. System zmienia stan `expandedBlockIds[blockId]`
3. Jeśli blok jest rozwijany i zadania nie były jeszcze pobrane, system inicjuje pobieranie zadań
4. Komponent renderuje lub ukrywa listę zadań w zależności od stanu

### Filtrowanie zadań

1. Użytkownik wybiera priorytet z dropdown w komponencie `TaskFilters`
2. System aktualizuje stan `filter.priority`
3. Hook `useTasksForFunctionalBlock` wykrywa zmianę i pobiera odfiltrowane zadania
4. Lista zadań jest aktualizowana zgodnie z wybranym filtrem

### Sortowanie zadań

1. Użytkownik wybiera pole sortowania lub kierunek sortowania
2. System aktualizuje stan `sort.field` lub `sort.direction`
3. Hook `useTasksForFunctionalBlock` wykrywa zmianę i pobiera posortowane zadania
4. Lista zadań jest aktualizowana zgodnie z wybranym sortowaniem

### Paginacja zadań

1. Użytkownik klika przycisk następnej/poprzedniej strony lub wybiera konkretną stronę
2. System aktualizuje stan `page`
3. Hook `useTasksForFunctionalBlock` wykrywa zmianę i pobiera odpowiednią stronę zadań
4. Lista zadań jest aktualizowana, wyświetlając wybraną stronę

### Dodawanie zadania

1. Użytkownik klika przycisk "Dodaj zadanie"
2. System otwiera modal lub przekierowuje do formularza dodawania zadania
3. Po dodaniu zadania, lista zadań jest odświeżana, aby pokazać nowe zadanie

### Generowanie zadań przez AI

1. Użytkownik klika przycisk "Generuj zadania z AI"
2. System inicjuje proces generowania zadań przez AI
3. Po wygenerowaniu zadań, lista zadań jest odświeżana, aby pokazać nowe zadania

### Edycja zadania

1. Użytkownik klika przycisk edycji przy zadaniu
2. System otwiera modal lub przekierowuje do formularza edycji zadania
3. Po zapisaniu zmian, zadanie w liście jest aktualizowane

### Usuwanie zadania

1. Użytkownik klika przycisk usunięcia przy zadaniu
2. System wyświetla potwierdzenie
3. Po potwierdzeniu, zadanie jest usuwane z bazy danych i z listy

## 9. Warunki i walidacja

### Walidacja URI

- Sprawdzenie poprawności formatu UUID dla `projectId`
- Sprawdzenie czy `blockId` nie jest pusty

### Walidacja filtru priorytetu

- Wartość priorytetu musi być jedną z dopuszczalnych wartości: 'all', 'low', 'medium', 'high'

### Walidacja sortowania

- Pole sortowania musi być jednym z dopuszczalnych: 'name', 'priority', 'estimatedValue', 'createdAt'
- Kierunek sortowania musi być jednym z dopuszczalnych: 'asc', 'desc'

### Walidacja paginacji

- Numer strony musi być liczbą całkowitą większą lub równą 1
- Limit musi być liczbą całkowitą w zakresie od 1 do 100

### Warunki warunkowego renderowania

- Pusty stan jest wyświetlany, gdy `tasks.length === 0 && !isLoading`
- Spinner ładowania jest wyświetlany, gdy `isLoading === true`
- Komunikat błędu jest wyświetlany, gdy `error !== null`
- Kontrolki paginacji są wyświetlane, gdy `pagination.pages > 1`

## 10. Obsługa błędów

### Błędy autoryzacji (401)

1. System wykrywa błąd 401 z API
2. Użytkownik jest przekierowywany na stronę logowania z parametrem returnUrl
3. Po zalogowaniu, użytkownik jest przekierowywany z powrotem do widoku zadań

### Błędy dostępu (403)

1. System wykrywa błąd 403 z API
2. Wyświetlany jest komunikat "Brak uprawnień do wyświetlenia zadań tego projektu"
3. Przyciski akcji są dezaktywowane

### Błędy nie znaleziono (404)

1. System wykrywa błąd 404 z API
2. Wyświetlany jest komunikat "Nie znaleziono projektu lub bloku funkcjonalnego"
3. Dostarczany jest link do powrotu do listy projektów

### Błędy połączenia z API

1. System wykrywa błąd połączenia z API
2. Wyświetlany jest komunikat "Nie udało się pobrać zadań. Sprawdź połączenie internetowe."
3. Dostarczany jest przycisk do ponowienia próby

### Obsługa nieoczekiwanych błędów

1. System przechwytuje nieoczekiwane błędy
2. Błędy są logowane do systemu monitorowania
3. Użytkownikowi wyświetlany jest przyjazny komunikat błędu
4. Dostarczany jest przycisk do ponowienia próby

## 11. Kroki implementacji

1. **Przygotowanie typów i struktur danych**
   - Dodanie nowych typów ViewModels w odpowiednim pliku typów
   - Upewnienie się, że wszystkie niezbędne typy są zaimportowane lub zdefiniowane

2. **Implementacja customowych hooków**
   - `useExpandedBlocks` - do zarządzania stanem rozwinięcia/zwinięcia bloków funkcjonalnych
   - `useTasksForFunctionalBlock` - do pobierania i zarządzania zadaniami
   - `useTaskFilters` - do zarządzania stanem filtrowania
   - `useTaskSort` - do zarządzania stanem sortowania

3. **Implementacja komponentów pomocniczych**
   - `TaskPriorityBadge` - etykieta wizualizująca priorytet zadania
   - `TaskEstimationDisplay` - wyświetlanie wartości estymacji z informacją o źródle
   - `EmptyTasksState` - stan gdy brak zadań

4. **Implementacja komponentów interfejsu**
   - `TaskFilters` - dropdown do filtrowania zadań po priorytecie
   - `TaskSorter` - kontrolki do sortowania zadań
   - `TaskListItem` - element pojedynczego zadania na liście

5. **Implementacja głównych komponentów**
   - `TaskListHeader` - nagłówek listy zadań z kontrolkami
   - `TaskList` - lista zadań z paginacją
   - `FunctionalBlockTasksContainer` - główny kontener łączący wszystkie komponenty

6. **Integracja z istniejącym widokiem bloków funkcjonalnych**
   - Dodanie nowego komponentu `FunctionalBlockTasksContainer` do istniejącego widoku
   - Przekazanie odpowiednich propsów i kontekstu

7. **Implementacja obsługi błędów**
   - Obsługa różnych kodów błędów z API
   - Implementacja komponentów wyświetlających komunikaty błędów
   - Dodanie mechanizmów ponownego próbowania

8. **Optymalizacja wydajności**
   - Implementacja memoizacji dla komponentów używając React.memo
   - Optymalizacja wywołań API przy użyciu useCallback i useMemo
   - Implementacja wirtualizacji dla długich list zadań, jeśli potrzebne

9. **Dostępność i UX**
   - Dodanie odpowiednich atrybutów ARIA dla elementów interaktywnych
   - Implementacja nawigacji klawiaturą
   - Dodanie tooltipów do przycisków i ikon

10. **Testy**

- Testy jednostkowe dla customowych hooków
- Testy komponentów z użyciem React Testing Library
- Testy integracyjne dla całego widoku
- Testy E2E z użyciem Playwright

11. **Dokumentacja**

- Dokumentacja komponentów i hooków
- Aktualizacja dokumentacji API (jeśli potrzebne)
- Instrukcje dla innych programistów dotyczące dalszego rozwoju widoku
