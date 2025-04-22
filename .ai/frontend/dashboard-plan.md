# Plan implementacji widoku Dashboard projektów

## 1. Przegląd
Dashboard projektów to główny widok aplikacji Plan My App, którego celem jest prezentacja listy projektów użytkownika oraz umożliwienie szybkiego zarządzania nimi. Widok zawiera listę projektów z możliwością filtrowania według statusu, sortowania oraz nawigacji między stronami. Użytkownik może tworzyć nowe projekty, edytować i usuwać istniejące bezpośrednio z tego widoku.

## 2. Routing widoku
Widok dashboard projektów będzie dostępny pod ścieżką `/dashboard`, stanowiąc główny panel zarządzania projektami po zalogowaniu użytkownika.

## 3. Struktura komponentów
```
DashboardPage (Astro)
│
├── DashboardHeader (Astro)
│
├── ProjectsListContainer (React)
    │
    ├── ProjectsFilters (React)
    │
    ├── ProjectsList (React)
    │   ├── ProjectCard (React) [wiele instancji]
    │   └── ProjectsEmptyState (React) [warunkowy]
    │
    ├── ProjectsLoadingSkeleton (React) [warunkowy]
    │
    ├── ProjectsPagination (React)
    │
    └── DeleteProjectModal (React) [warunkowy]
```

## 4. Szczegóły komponentów

### DashboardPage (Astro)
- **Opis komponentu:** Główny komponent strony dashboard, integrujący wszystkie komponenty w jedną całość i zapewniający podstawową strukturę strony.
- **Główne elementy:** Layout z nagłówkiem, główną treścią i stopką, w tym osadzony komponent `ProjectsListContainer`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji (komponent statyczny).
- **Obsługiwana walidacja:** Sprawdzenie czy użytkownik jest zalogowany, w przeciwnym razie przekierowanie do strony logowania.
- **Typy:** Nie wymaga specjalnych typów.
- **Propsy:** Nie przyjmuje propsów.

### DashboardHeader (Astro)
- **Opis komponentu:** Nagłówek widoku dashboard zawierający tytuł strony oraz przycisk tworzenia nowego projektu.
- **Główne elementy:** Tytuł strony "Moje projekty", przycisk "Nowy projekt" z wykorzystaniem komponentu Button z Shadcn/ui.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Nowy projekt" powoduje nawigację do strony tworzenia nowego projektu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Nie wymaga specjalnych typów.
- **Propsy:** Nie przyjmuje propsów.

### ProjectsListContainer (React)
- **Opis komponentu:** Główny kontener zarządzający stanem listy projektów, zawierający logikę pobierania danych i obsługi filtrów.
- **Główne elementy:** Komponenty `ProjectsFilters`, warunkowy `ProjectsLoadingSkeleton` lub `ProjectsList`, `ProjectsPagination` i warunkowy `DeleteProjectModal`.
- **Obsługiwane interakcje:** Obsługa filtrowania, paginacji, nawigacji do szczegółów projektu i usuwania projektów.
- **Obsługiwana walidacja:** Sprawdzanie poprawności parametrów filtrów i strony przed wysłaniem zapytania do API.
- **Typy:** `ProjectStatusType`, `ProjectSortOption`, `ProjectFiltersState`, `ProjectViewModel`, `PaginationDto`.
- **Propsy:** Nie przyjmuje propsów.

### ProjectsFilters (React)
- **Opis komponentu:** Komponent zawierający elementy do filtrowania i sortowania listy projektów.
- **Główne elementy:** Selector statusu projektu (wszystkie, aktywne, zarchiwizowane, ukończone), selector sortowania (najnowsze, najstarsze, nazwa A-Z, nazwa Z-A, ostatnio aktualizowane), przycisk resetowania filtrów.
- **Obsługiwane interakcje:** Zmiana filtra statusu, zmiana opcji sortowania, resetowanie filtrów.
- **Obsługiwana walidacja:** Sprawdzanie czy wartości filtrów są prawidłowe i zgodne z enum `ProjectStatusType` i `ProjectSortOption`.
- **Typy:** `ProjectStatusType`, `ProjectSortOption`, `ProjectFiltersState`.
- **Propsy:**
  ```typescript
  interface ProjectsFiltersProps {
    filters: ProjectFiltersState;
    onUpdateFilters: (filters: Partial<ProjectFiltersState>) => void;
    onResetFilters: () => void;
  }
  ```

### ProjectsList (React)
- **Opis komponentu:** Komponent wyświetlający listę projektów w formie kart lub tabeli.
- **Główne elementy:** Lista komponentów `ProjectCard` lub warunkowy `ProjectsEmptyState` gdy lista jest pusta.
- **Obsługiwane interakcje:** Nawigacja do szczegółów projektu, edycja projektu, usunięcie projektu.
- **Obsługiwana walidacja:** Sprawdzanie czy lista projektów nie jest pusta.
- **Typy:** `ProjectViewModel[]`.
- **Propsy:**
  ```typescript
  interface ProjectsListProps {
    projects: ProjectViewModel[];
    onDelete: (project: ProjectViewModel) => void;
  }
  ```

### ProjectCard (React)
- **Opis komponentu:** Komponent karty pojedynczego projektu prezentujący podstawowe informacje i akcje.
- **Główne elementy:** Tytuł projektu, opcjonalny opis, data utworzenia, status projektu, przyciski akcji (edycja, usunięcie).
- **Obsługiwane interakcje:** Kliknięcie w kartę (nawigacja do szczegółów), kliknięcie przycisku edycji, kliknięcie przycisku usunięcia.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ProjectViewModel`.
- **Propsy:**
  ```typescript
  interface ProjectCardProps {
    project: ProjectViewModel;
    onDelete: (project: ProjectViewModel) => void;
  }
  ```

### ProjectsEmptyState (React)
- **Opis komponentu:** Komponent wyświetlany gdy lista projektów jest pusta.
- **Główne elementy:** Ilustracja, komunikat "Nie masz jeszcze żadnych projektów", przycisk "Utwórz pierwszy projekt".
- **Obsługiwane interakcje:** Kliknięcie przycisku tworzenia nowego projektu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specjalnych typów.
- **Propsy:**
  ```typescript
  interface ProjectsEmptyStateProps {
    onCreateNew: () => void;
  }
  ```

### ProjectsLoadingSkeleton (React)
- **Opis komponentu:** Komponent pokazywany podczas ładowania listy projektów.
- **Główne elementy:** Zestaw skeletonowych kart symulujących wygląd rzeczywistych kart projektów.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specjalnych typów.
- **Propsy:**
  ```typescript
  interface ProjectsLoadingSkeletonProps {
    count?: number; // liczba skeletonowych kart, domyślnie 3
  }
  ```

### ProjectsPagination (React)
- **Opis komponentu:** Komponent paginacji dla listy projektów.
- **Główne elementy:** Przyciski nawigacji (poprzednia strona, następna strona), lista przycisków z numerami stron, informacja o bieżącej stronie.
- **Obsługiwane interakcje:** Zmiana strony.
- **Obsługiwana walidacja:** Sprawdzanie czy numer strony jest w zakresie dostępnych stron.
- **Typy:** `PaginationDto`.
- **Propsy:**
  ```typescript
  interface ProjectsPaginationProps {
    pagination: PaginationDto;
    onPageChange: (page: number) => void;
  }
  ```

### DeleteProjectModal (React)
- **Opis komponentu:** Modal potwierdzenia usunięcia projektu.
- **Główne elementy:** Tytuł "Usuń projekt", pytanie potwierdzające z nazwą projektu, przyciski "Anuluj" i "Usuń".
- **Obsługiwane interakcje:** Potwierdzenie usunięcia, anulowanie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ProjectViewModel`.
- **Propsy:**
  ```typescript
  interface DeleteProjectModalProps {
    isOpen: boolean;
    project: ProjectViewModel | null;
    isDeleting: boolean;
    error: Error | null;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

## 5. Typy
W implementacji widoku Dashboard projektów potrzebujemy następujących typów:

### Istniejące typy z dokumentacji
```typescript
// ProjectSummaryDto - pochodzący z API
interface ProjectSummaryDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// ListProjectsResponseDto - struktura odpowiedzi z API
interface ListProjectsResponseDto {
  data: ProjectSummaryDto[];
  pagination: PaginationDto;
}

// PaginationDto - informacje o paginacji
interface PaginationDto {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

### Nowe typy wprowadzone na potrzeby widoku
```typescript
// Enum statusów projektu
enum ProjectStatusType {
  ALL = "all",
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed"
}

// Enum opcji sortowania
enum ProjectSortOption {
  NEWEST = "createdAt:desc",
  OLDEST = "createdAt:asc",
  NAME_ASC = "name:asc",
  NAME_DESC = "name:desc",
  UPDATED = "updatedAt:desc"
}

// Rozszerzony model projektu na potrzeby UI
interface ProjectViewModel {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatusType;
  createdAt: string;
  formattedCreatedAt: string; // np. "12 kwi 2025"
  updatedAt: string;
  formattedUpdatedAt: string; // np. "12 kwi 2025"
}

// Stan filtrów i paginacji
interface ProjectFiltersState {
  status: ProjectStatusType;
  sort: ProjectSortOption;
  page: number;
  limit: number;
}

// Parametry zapytania API
interface ProjectApiQueryParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
```

## 6. Zarządzanie stanem
W widoku dashboard projektów zastosujemy niestandardowe hooki do zarządzania stanem:

### Hook `useProjectsList`
Główny hook zarządzający stanem listy projektów, pobieraniem danych i filtracją.

```typescript
function useProjectsList() {
  // Stan projektów po przetworzeniu
  const [projects, setProjects] = useState<ProjectViewModel[]>([]);
  // Flaga ładowania
  const [isLoading, setIsLoading] = useState(true);
  // Potencjalny błąd
  const [error, setError] = useState<Error | null>(null);
  // Stan filtrów i paginacji
  const [filters, setFilters] = useState<ProjectFiltersState>({
    status: ProjectStatusType.ALL,
    sort: ProjectSortOption.NEWEST,
    page: 1,
    limit: 10
  });
  // Informacje o paginacji
  const [pagination, setPagination] = useState<PaginationDto>({
    total: 0, page: 1, limit: 10, pages: 0
  });

  // Metody i efekty:
  // 1. Efekt synchronizujący filtry z URL
  // 2. Efekt pobierający projekty przy zmianie filtrów
  // 3. Metoda fetchProjects - pobieranie projektów z API
  // 4. Metoda updateFilters - aktualizacja filtrów (resetuje stronę do 1)
  // 5. Metoda resetFilters - reset do wartości domyślnych
  // 6. Metoda goToPage - zmiana strony
  // 7. Metoda deleteProject - usunięcie projektu

  return {
    projects, isLoading, error, filters, pagination,
    fetchProjects, updateFilters, resetFilters, goToPage, deleteProject
  };
}
```

### Hook `useDeleteProject`
Hook zarządzający stanem modalu potwierdzenia usunięcia projektu.

```typescript
function useDeleteProject(onDelete: (id: string) => Promise<void>) {
  // Czy modal jest otwarty
  const [isOpen, setIsOpen] = useState(false);
  // Projekt do usunięcia
  const [projectToDelete, setProjectToDelete] = useState<ProjectViewModel | null>(null);
  // Flaga trwającego usuwania
  const [isDeleting, setIsDeleting] = useState(false);
  // Potencjalny błąd
  const [error, setError] = useState<Error | null>(null);

  // Metody:
  // 1. openModal - otwiera modal z wybranym projektem
  // 2. closeModal - zamyka modal
  // 3. confirmDelete - potwierdza usunięcie i wywołuje callback
  // 4. cancelDelete - anuluje usunięcie

  return {
    isOpen, projectToDelete, isDeleting, error,
    openModal, closeModal, confirmDelete, cancelDelete
  };
}
```

## 7. Integracja API
Integracja z API dla widoku dashboard projektów będzie obejmować:

### Pobieranie listy projektów
```typescript
// Typ parametrów zapytania
interface ProjectApiQueryParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// Pobieranie projektów
async function fetchProjects(params: ProjectApiQueryParams): Promise<ListProjectsResponseDto> {
  const queryParams = new URLSearchParams();
  
  if (params.status && params.status !== ProjectStatusType.ALL) {
    queryParams.append('status', params.status);
  }
  
  if (params.page && params.page > 1) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params.sort) {
    queryParams.append('sort', params.sort);
  }
  
  const queryString = queryParams.toString();
  const url = `/api/projects${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Przekierowanie do logowania
      window.location.href = '/login';
      throw new Error('Sesja wygasła. Zaloguj się ponownie.');
    }
    throw new Error(`Błąd pobierania projektów: ${response.statusText}`);
  }
  
  return await response.json();
}
```

### Usuwanie projektu
```typescript
async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Przekierowanie do logowania
      window.location.href = '/login';
      throw new Error('Sesja wygasła. Zaloguj się ponownie.');
    }
    throw new Error(`Błąd usuwania projektu: ${response.statusText}`);
  }
}
```

### Przetwarzanie danych z API dla UI
```typescript
// Konwersja ProjectSummaryDto na ProjectViewModel
function mapProjectToViewModel(project: ProjectSummaryDto): ProjectViewModel {
  // W rzeczywistym projekcie status może być pobierany z API
  // Tutaj przykładowo przypisujemy ACTIVE dla wszystkich projektów
  const status = ProjectStatusType.ACTIVE;
  
  // Formatowanie dat
  const createdDate = new Date(project.createdAt);
  const updatedDate = new Date(project.updatedAt);
  
  const formatter = new Intl.DateTimeFormat('pl', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  return {
    ...project,
    status,
    formattedCreatedAt: formatter.format(createdDate),
    formattedUpdatedAt: formatter.format(updatedDate)
  };
}
```

## 8. Interakcje użytkownika
Widok dashboard projektów obsługuje następujące interakcje użytkownika:

### Przeglądanie listy projektów
- **Interakcja:** Użytkownik wchodzi na stronę `/dashboard`
- **Akcja:** System pobiera listę projektów z domyślnymi filtrami
- **Wynik:** Wyświetlana jest lista projektów lub informacja o braku projektów

### Filtrowanie projektów
- **Interakcja:** Użytkownik wybiera filtr statusu z dropdownu
- **Akcja:** System aktualizuje parametr `status` i resetuje numer strony do 1
- **Wynik:** Lista projektów jest aktualizowana zgodnie z wybranym filtrem

### Sortowanie projektów
- **Interakcja:** Użytkownik wybiera opcję sortowania z dropdownu
- **Akcja:** System aktualizuje parametr `sort` i resetuje numer strony do 1
- **Wynik:** Lista projektów jest sortowana zgodnie z wybraną opcją

### Nawigacja między stronami
- **Interakcja:** Użytkownik klika na numer strony lub przyciski nawigacji
- **Akcja:** System aktualizuje parametr `page`
- **Wynik:** Wyświetlana jest wybrana strona projektów

### Tworzenie nowego projektu
- **Interakcja:** Użytkownik klika przycisk "Nowy projekt"
- **Akcja:** System przekierowuje do strony tworzenia projektu
- **Wynik:** Użytkownik zostaje przeniesiony na stronę `/projects/new`

### Edycja projektu
- **Interakcja:** Użytkownik klika przycisk edycji na karcie projektu
- **Akcja:** System przekierowuje do strony edycji projektu
- **Wynik:** Użytkownik zostaje przeniesiony na stronę `/projects/{id}/edit`

### Usuwanie projektu
- **Interakcja:** Użytkownik klika przycisk usunięcia na karcie projektu
- **Akcja 1:** System wyświetla modal potwierdzenia
- **Interakcja 2:** Użytkownik potwierdza usunięcie
- **Akcja 2:** System wysyła żądanie DELETE, usuwa projekt i zamyka modal
- **Wynik:** Projekt zostaje usunięty z listy

## 9. Warunki i walidacja
W implementacji widoku dashboard projektów weryfikowane są następujące warunki:

### Uwierzytelnienie użytkownika
- **Komponent:** `DashboardPage`
- **Warunek:** Użytkownik musi być zalogowany
- **Walidacja:** Sprawdzenie stanu uwierzytelnienia przy ładowaniu strony
- **Wpływ na stan:** Niezalogowani użytkownicy są przekierowywani do strony logowania

### Parametr `status`
- **Komponent:** `ProjectsFilters`
- **Warunek:** Status musi być jedną z wartości enum `ProjectStatusType`
- **Walidacja:** Komponent oferuje tylko predefiniowane opcje do wyboru
- **Wpływ na stan:** Nieprawidłowe wartości są ignorowane lub resetowane do domyślnych

### Parametr `sort`
- **Komponent:** `ProjectsFilters`
- **Warunek:** Sortowanie musi być jedną z wartości enum `ProjectSortOption`
- **Walidacja:** Komponent oferuje tylko predefiniowane opcje do wyboru
- **Wpływ na stan:** Nieprawidłowe wartości są ignorowane lub resetowane do domyślnych

### Parametr `page`
- **Komponent:** `ProjectsPagination`
- **Warunek:** Numer strony musi być dodatni i nie większy niż liczba stron
- **Walidacja:** Komponent blokuje nieaktywne przyciski dla niedostępnych stron
- **Wpływ na stan:** Nieprawidłowe wartości są korygowane do najbliższej poprawnej strony

### Pusty stan listy
- **Komponent:** `ProjectsList`
- **Warunek:** Sprawdzenie czy lista projektów jest pusta
- **Walidacja:** `projects.length === 0 && !isLoading`
- **Wpływ na stan:** Wyświetlany jest komponent `ProjectsEmptyState` zamiast listy

## 10. Obsługa błędów
W implementacji widoku dashboard projektów obsługiwane są następujące scenariusze błędów:

### Błąd uwierzytelnienia (401)
- **Obsługa:** Automatyczne przekierowanie do strony logowania
- **Komunikat:** Toast z informacją "Sesja wygasła. Zaloguj się ponownie."
- **Implementacja:**
  ```typescript
  if (response.status === 401) {
    // Wyświetl komunikat
    toast.error("Sesja wygasła. Zaloguj się ponownie.");
    // Przekierowanie do strony logowania
    window.location.href = '/login?redirect=/dashboard';
  }
  ```

### Błąd pobierania projektów
- **Obsługa:** Wyświetlenie komunikatu błędu i opcji ponownej próby
- **Komunikat:** "Wystąpił błąd podczas pobierania projektów: [treść błędu]"
- **Implementacja:**
  ```typescript
  const [error, setError] = useState<Error | null>(null);
  
  // W komponencie:
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button onClick={fetchProjects}>Spróbuj ponownie</Button>
      </div>
    );
  }
  ```

### Błąd usuwania projektu
- **Obsługa:** Wyświetlenie błędu w modalu potwierdzenia
- **Komunikat:** "Nie udało się usunąć projektu: [treść błędu]"
- **Implementacja:**
  ```typescript
  // W komponencie DeleteProjectModal:
  {error && (
    <div className="text-red-500 mb-4">
      {error.message}
    </div>
  )}
  ```

### Pusta lista projektów
- **Obsługa:** Wyświetlenie komponentu `ProjectsEmptyState`
- **Komunikat:** "Nie masz jeszcze żadnych projektów. Utwórz swój pierwszy projekt."
- **Implementacja:**
  ```typescript
  // W komponencie ProjectsList:
  if (projects.length === 0) {
    return <ProjectsEmptyState onCreateNew={() => navigate('/projects/new')} />;
  }
  ```

### Timeout pobierania danych
- **Obsługa:** Automatyczna ponowna próba z limitem powtórzeń
- **Komunikat:** "Pobieranie danych trwa dłużej niż zwykle. Próbujemy ponownie."
- **Implementacja:**
  ```typescript
  const fetchWithRetry = async (retries = 3) => {
    try {
      return await fetchProjects(queryParams);
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('timeout')) {
        toast.info("Pobieranie danych trwa dłużej niż zwykle. Próbujemy ponownie.");
        return await fetchWithRetry(retries - 1);
      }
      throw error;
    }
  };
  ```

## 11. Kroki implementacji
Poniżej znajduje się przewodnik krok po kroku dla implementacji widoku dashboard projektów:

1. **Utworzenie struktury folderów i plików**
   - Stworzenie pliku strony `src/pages/dashboard.astro`
   - Utworzenie folderów dla komponentów:
     - `src/components/dashboard/`
     - `src/components/dashboard/hooks/`

2. **Implementacja typów i enums**
   - Utworzenie pliku `src/components/dashboard/types.ts` z definicjami typów i enums

3. **Implementacja niestandardowych hooków**
   - Implementacja `useProjectsList` w `src/components/dashboard/hooks/useProjectsList.ts`
   - Implementacja `useDeleteProject` w `src/components/dashboard/hooks/useDeleteProject.ts`

4. **Implementacja komponentów React**
   - Rozpoczęcie od najmniejszych komponentów i stopniowe budowanie w górę hierarchii:
     1. `ProjectCard.tsx`
     2. `ProjectsEmptyState.tsx`
     3. `ProjectsLoadingSkeleton.tsx`
     4. `ProjectsPagination.tsx`
     5. `ProjectsFilters.tsx`
     6. `ProjectsList.tsx`
     7. `DeleteProjectModal.tsx`
     8. `ProjectsListContainer.tsx`

5. **Implementacja komponentów Astro**
   - Stworzenie `DashboardHeader.astro`
   - Stworzenie głównej strony `dashboard.astro`

6. **Integracja z API**
   - Implementacja funkcji integrujących z API w `src/lib/services/project.service.ts`
   - Połączenie hooków z funkcjami API

7. **Testowanie i debugowanie**
   - Sprawdzenie odpowiedniego renderowania komponentów
   - Weryfikacja poprawności filtrowania i sortowania
   - Testowanie paginacji i nawigacji
   - Sprawdzenie obsługi błędów i pustych stanów

8. **Optymalizacja dostępności i UX**
   - Dodanie odpowiednich atrybutów ARIA
   - Implementacja nawigacji klawiaturowej
   - Zapewnienie responsywności na różnych urządzeniach

9. **Finalizacja i dokumentacja**
   - Czyszczenie zbędnego kodu
   - Dodanie komentarzy do złożonych fragmentów
   - Stworzenie dokumentacji komponentów

10. **Weryfikacja zgodności z wymaganiami**
    - Sprawdzenie czy implementacja spełnia wszystkie kryteria z historyjki użytkownika US-005
    - Upewnienie się, że wszystkie funkcjonalności opisane w PRD są zaimplementowane