# Plan implementacji widoku harmonogramu projektu

## 1. Przegląd
Widok harmonogramu projektu to interaktywny interfejs umożliwiający użytkownikom tworzenie, przeglądanie i edycję harmonogramu projektu przy wsparciu sztucznej inteligencji. Głównym celem widoku jest zapewnienie użytkownikom intuicyjnego narzędzia do generowania harmonogramu projektu na podstawie zdefiniowanych bloków funkcjonalnych oraz modyfikacji tego harmonogramu według własnych potrzeb.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/projects/:id/schedule`, gdzie `:id` to unikalny identyfikator projektu.

## 3. Struktura komponentów
```
ProjectSchedulePage (Astro)
├── ProjectHeader (istniejący komponent)
├── ProjectTabsNavigation (istniejący komponent)
├── ErrorBoundary (React)
│   └── ScheduleContainer (React)
│       ├── ScheduleActionsPanel (React)
│       │   └── ExportProjectDialog (React, warunkowy)
│       ├── ConditionalRender:
│       │   ├── LoadingSpinner (podczas ładowania)
│       │   ├── EmptyScheduleState (gdy brak harmonogramu)
│       │   └── ScheduleContent (gdy jest harmonogram)
│       │       ├── ScheduleStagesList (React)
│       │       │   └── ScheduleStageItem (React, wiele instancji)
│       │       └── AddScheduleStageButton (React)
│       └── ScheduleStageFormModal (React, warunkowy)
```

## 4. Szczegóły komponentów

### ProjectSchedulePage
- Opis komponentu: Główna strona widoku harmonogramu projektu, napisana w Astro, odpowiedzialna za ładowanie danych projektu i wyświetlanie wszystkich komponentów.
- Główne elementy: ProjectHeader, ProjectTabsNavigation, ErrorBoundary zawierający ScheduleContainer.
- Obsługiwane interakcje: Pobieranie danych projektu, obsługa błędów ładowania projektu.
- Obsługiwana walidacja: Weryfikacja istnienia projektu i uprawnień użytkownika.
- Typy: `ProjectDto` z backendu.
- Propsy: `id` - identyfikator projektu z parametrów URL.

### ScheduleContainer
- Opis komponentu: React'owy kontener zarządzający stanem harmonogramu i renderujący odpowiednie komponenty w zależności od stanu.
- Główne elementy: ScheduleActionsPanel oraz warunkowe renderowanie LoadingSpinner, EmptyScheduleState lub ScheduleContent.
- Obsługiwane interakcje: Zarządzanie stanem harmonogramu, obsługa generowania harmonogramu.
- Obsługiwana walidacja: Brak bezpośredniej walidacji.
- Typy: Wykorzystuje hook `useScheduleState`.
- Propsy: `projectId`, `project`.

### ScheduleActionsPanel
- Opis komponentu: Panel z przyciskami akcji dla harmonogramu (Generuj, Eksportuj).
- Główne elementy: Przyciski akcji, opcjonalnie dialog eksportu.
- Obsługiwane interakcje: Kliknięcie przycisku "Generuj harmonogram", kliknięcie przycisku "Eksportuj harmonogram".
- Obsługiwana walidacja: Blokowanie przycisku "Generuj" podczas trwającego generowania.
- Typy: `{ isScheduleEmpty: boolean, isGenerating: boolean, onGenerateSchedule: Function, onExportSchedule: Function }`.
- Propsy: `isScheduleEmpty`, `isGenerating`, `onGenerateSchedule`, `onExportSchedule`.

### EmptyScheduleState
- Opis komponentu: Komunikat wyświetlany, gdy harmonogram jest pusty, z możliwością jego wygenerowania.
- Główne elementy: Tekst informacyjny, przycisk "Generuj harmonogram".
- Obsługiwane interakcje: Kliknięcie przycisku "Generuj harmonogram".
- Obsługiwana walidacja: Brak.
- Typy: `{ onGenerateSchedule: Function }`.
- Propsy: `onGenerateSchedule`.

### ScheduleContent
- Opis komponentu: Kontener dla zawartości harmonogramu, gdy istnieją etapy harmonogramu.
- Główne elementy: ScheduleStagesList, AddScheduleStageButton.
- Obsługiwane interakcje: Brak bezpośrednich.
- Obsługiwana walidacja: Brak bezpośredniej.
- Typy: `{ schedule: ProjectScheduleViewModel, onAddStage: Function, onReorderStages: Function }`.
- Propsy: `schedule`, `onAddStage`, `onReorderStages`.

### ScheduleStagesList
- Opis komponentu: Lista etapów harmonogramu z możliwością ich rozwijania i przeciągania dla zmiany kolejności.
- Główne elementy: Komponenty ScheduleStageItem, system drag & drop.
- Obsługiwane interakcje: Rozwijanie/zwijanie etapów, przeciąganie etapów (drag & drop).
- Obsługiwana walidacja: Brak bezpośredniej.
- Typy: `{ stages: ScheduleStageViewModel[], dependencies: Record<string, ScheduleStageViewModel[]>, onEditStage: Function, onDeleteStage: Function, onReorderStages: Function }`.
- Propsy: `stages`, `dependencies`, `onEditStage`, `onDeleteStage`, `onReorderStages`.

### ScheduleStageItem
- Opis komponentu: Komponent pojedynczego etapu harmonogramu.
- Główne elementy: Nagłówek z nazwą etapu, opis, lista zależności, przyciski akcji (edytuj, usuń).
- Obsługiwane interakcje: Rozwijanie/zwijanie etapu, kliknięcie przycisku edycji, kliknięcie przycisku usunięcia.
- Obsługiwana walidacja: Brak bezpośredniej.
- Typy: `{ stage: ScheduleStageViewModel, dependencies: ScheduleStageViewModel[], onEdit: Function, onDelete: Function }`.
- Propsy: `stage`, `dependencies`, `onEdit`, `onDelete`.

### AddScheduleStageButton
- Opis komponentu: Przycisk dodawania nowego etapu harmonogramu.
- Główne elementy: Przycisk "Dodaj etap".
- Obsługiwane interakcje: Kliknięcie przycisku.
- Obsługiwana walidacja: Brak.
- Typy: `{ onClick: Function }`.
- Propsy: `onClick`.

### ScheduleStageFormModal
- Opis komponentu: Modal z formularzem dodawania/edycji etapu harmonogramu.
- Główne elementy: Formularz EditScheduleStageForm, przyciski zatwierdzenia i anulowania.
- Obsługiwane interakcje: Wypełnienie formularza, zatwierdzenie, anulowanie.
- Obsługiwana walidacja: Walidacja nazwy etapu, walidacja cykli w zależnościach.
- Typy: `{ isOpen: boolean, onClose: Function, stage?: ScheduleStageViewModel, availableDependencies: ScheduleStageViewModel[], onSubmit: Function }`.
- Propsy: `isOpen`, `onClose`, `stage`, `availableDependencies`, `onSubmit`.

### EditScheduleStageForm
- Opis komponentu: Formularz edycji etapu harmonogramu.
- Główne elementy: Pola formularza (nazwa, opis, zależności), przyciski akcji.
- Obsługiwane interakcje: Zmiana wartości pól, zatwierdzenie formularza, anulowanie.
- Obsługiwana walidacja: 
  - Nazwa etapu (wymagana)
  - Zależności (brak cykli)
- Typy: `{ stage: ScheduleStageViewModel, availableDependencies: ScheduleStageViewModel[], onSubmit: Function, onCancel: Function }`.
- Propsy: `stage`, `availableDependencies`, `onSubmit`, `onCancel`.

### LoadingSpinner
- Opis komponentu: Komponent wyświetlający animację ładowania.
- Główne elementy: Animacja ładowania.
- Obsługiwane interakcje: Brak.
- Obsługiwana walidacja: Brak.
- Typy: `{ size?: 'sm' | 'md' | 'lg' }`.
- Propsy: `size`.

## 5. Typy

### ScheduleStageViewModel
```typescript
interface ScheduleStageViewModel {
  id: string;                   // Unikalny identyfikator etapu
  name: string;                 // Nazwa etapu
  description: string;          // Opis etapu
  dependencies: string[];       // ID zależnych etapów
  relatedBlocks: string[];      // ID powiązanych bloków funkcjonalnych
  order: number;                // Kolejność etapu
  
  // Pola tylko dla UI
  isExpanded?: boolean;         // Czy etap jest rozwinięty
  isEditing?: boolean;          // Czy etap jest w trybie edycji
  validationErrors?: Record<string, string>; // Błędy walidacji
}
```

### ProjectScheduleViewModel
```typescript
interface ProjectScheduleViewModel {
  stages: ScheduleStageViewModel[];  // Lista etapów harmonogramu
  
  // Pola metadanych
  lastUpdated?: string;          // Data ostatniej aktualizacji
  isGeneratedByAI?: boolean;     // Czy został wygenerowany przez AI
}
```

### ScheduleDependencyViewModel
```typescript
interface ScheduleDependencyViewModel {
  id: string;                    // ID etapu
  name: string;                  // Nazwa etapu dla wyświetlenia
  isSelected: boolean;           // Czy zależność jest wybrana
}
```

### StageFormValues
```typescript
interface StageFormValues {
  name: string;                 // Nazwa etapu
  description: string;          // Opis etapu
  dependencies: string[];       // ID zależnych etapów
}
```

### ScheduleContextValue
```typescript
interface ScheduleContextValue {
  schedule: ProjectScheduleViewModel | null;  // Dane harmonogramu
  isLoading: boolean;                         // Stan ładowania
  isGenerating: boolean;                      // Stan generowania przez AI
  error: string | null;                       // Komunikat błędu
  
  // Funkcje
  generateSchedule: () => Promise<void>;
  updateSchedule: (updatedSchedule: ProjectScheduleViewModel) => Promise<void>;
  addStage: (stage: Omit<ScheduleStageViewModel, 'id'>) => Promise<void>;
  updateStage: (stageId: string, updates: Partial<ScheduleStageViewModel>) => Promise<void>;
  deleteStage: (stageId: string) => Promise<void>;
  reorderStages: (sourceId: string, destinationId: string) => Promise<void>;
}
```

## 6. Zarządzanie stanem

Zarządzanie stanem w widoku harmonogramu będzie realizowane za pomocą customowego hooka `useScheduleState`.

```typescript
const useScheduleState = (projectId: string, initialProject?: ProjectDto) => {
  // Stan harmonogramu
  const [schedule, setSchedule] = useState<ProjectScheduleViewModel | null>(
    initialProject?.schedule ? mapToViewModel(initialProject.schedule) : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialProject);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<ScheduleStageViewModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Funkcja pobierania harmonogramu
  const fetchProjectSchedule = async () => {
    if (initialProject) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error(`Błąd podczas pobierania projektu: ${response.status}`);
      }
      
      const projectData: ProjectDto = await response.json();
      
      if (projectData.schedule) {
        setSchedule(mapToViewModel(projectData.schedule));
      } else {
        setSchedule(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd podczas pobierania harmonogramu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funkcja generowania harmonogramu
  const generateSchedule = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}/schedule/generate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Błąd podczas generowania harmonogramu: ${response.status}`);
      }
      
      const result: GenerateScheduleResponseDto = await response.json();
      
      // Konwersja odpowiedzi na model widoku
      const newSchedule: ProjectScheduleViewModel = {
        stages: result.schedule.stages.map((stage) => ({
          ...stage,
          isExpanded: false,
        })),
        isGeneratedByAI: true,
        lastUpdated: new Date().toISOString(),
      };
      
      setSchedule(newSchedule);
      
      // Aktualizacja projektu na serwerze
      await updateScheduleOnServer(newSchedule);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd podczas generowania harmonogramu');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Funkcja aktualizacji harmonogramu na serwerze
  const updateScheduleOnServer = async (updatedSchedule: ProjectScheduleViewModel) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule: mapToDto(updatedSchedule),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Błąd podczas aktualizacji harmonogramu: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd podczas aktualizacji harmonogramu');
      throw err;
    }
  };
  
  // Pozostałe funkcje zarządzania etapami...
  
  // Inicjalizacja
  useEffect(() => {
    if (!initialProject) {
      fetchProjectSchedule();
    }
  }, [projectId]);
  
  return {
    schedule,
    isLoading,
    isGenerating,
    error,
    editingStage,
    isModalOpen,
    fetchProjectSchedule,
    generateSchedule,
    updateSchedule,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    setEditingStage,
    setIsModalOpen,
  };
};
```

## 7. Integracja API

### 1. Pobieranie projektu
```typescript
// GET /api/projects/{id}
const fetchProject = async (projectId: string): Promise<ProjectDto> => {
  const response = await fetch(`/api/projects/${projectId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Błąd ${response.status}`);
  }
  
  return await response.json();
};
```

### 2. Generowanie harmonogramu
```typescript
// POST /api/projects/{id}/schedule/generate
const generateProjectSchedule = async (projectId: string): Promise<GenerateScheduleResponseDto> => {
  const response = await fetch(`/api/projects/${projectId}/schedule/generate`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Błąd ${response.status}`);
  }
  
  return await response.json();
};
```

### 3. Aktualizacja projektu
```typescript
// PATCH /api/projects/{id}
const updateProject = async (
  projectId: string, 
  updates: UpdateProjectRequestDto
): Promise<UpdateProjectResponseDto> => {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Błąd ${response.status}`);
  }
  
  return await response.json();
};
```

## 8. Interakcje użytkownika

### Generowanie harmonogramu
1. Użytkownik klika przycisk "Generuj harmonogram" w panelu akcji lub w stanie pustym
2. System wyświetla wskaźnik ładowania
3. System wywołuje endpoint `/api/projects/{id}/schedule/generate`
4. Po otrzymaniu odpowiedzi, system wyświetla wygenerowane etapy harmonogramu
5. W przypadku błędu, system wyświetla komunikat błędu

### Edycja etapu harmonogramu
1. Użytkownik klika przycisk edycji przy wybranym etapie
2. System otwiera modal z formularzem zawierającym dane etapu
3. Użytkownik modyfikuje dane etapu (nazwa, opis, zależności)
4. Użytkownik zatwierdza zmiany
5. System waliduje wprowadzone dane
6. System aktualizuje etap harmonogramu i zamyka modal
7. System zapisuje zmiany w harmonogramie na serwerze

### Dodawanie nowego etapu
1. Użytkownik klika przycisk "Dodaj etap"
2. System otwiera modal z pustym formularzem
3. Użytkownik wprowadza dane nowego etapu
4. Użytkownik zatwierdza formularz
5. System waliduje wprowadzone dane
6. System dodaje nowy etap do harmonogramu i zamyka modal
7. System zapisuje zmiany w harmonogramie na serwerze

### Usuwanie etapu
1. Użytkownik klika przycisk usunięcia przy wybranym etapie
2. System wyświetla potwierdzenie usunięcia
3. Użytkownik potwierdza usunięcie
4. System usuwa etap z harmonogramu
5. System zapisuje zmiany w harmonogramie na serwerze

### Zmiana kolejności etapów
1. Użytkownik przeciąga etap na nową pozycję
2. System zmienia kolejność etapów
3. System zapisuje zmiany w harmonogramie na serwerze

### Eksport harmonogramu - nie implementujemy w tej wersji
1. Użytkownik klika przycisk "Eksportuj harmonogram"
2. System otwiera dialog z opcjami eksportu
3. Użytkownik wybiera format eksportu
4. System generuje plik w wybranym formacie i inicjuje jego pobranie

## 9. Warunki i walidacja

### Walidacja etapu harmonogramu
1. **Nazwa etapu**:
   - Warunek: Nazwa jest wymagana i nie może być pusta
   - Komponent: EditScheduleStageForm
   - Wpływ na UI: Wyświetlenie komunikatu błędu przy polu, blokada zatwierdzenia formularza

2. **Zależności etapu**:
   - Warunek: Zależności nie mogą tworzyć cykli
   - Komponent: EditScheduleStageForm
   - Wpływ na UI: Wyświetlenie komunikatu błędu przy polu, blokada zatwierdzenia formularza

3. **Kolejność etapów**:
   - Warunek: Etapy muszą mieć unikalną kolejność
   - Komponenty: ScheduleStagesList, useScheduleState
   - Wpływ na UI: Automatyczne przeliczenie kolejności przy zmianie

## 10. Obsługa błędów

### Błędy pobierania danych projektu
1. **Scenariusz**: Błąd podczas pobierania danych projektu
2. **Komponenty**: ProjectSchedulePage, ErrorBoundary
3. **Obsługa**: Wyświetlenie komunikatu błędu, przycisk ponownego załadowania

### Błędy generowania harmonogramu
1. **Scenariusz**: Błąd podczas generowania harmonogramu przez AI
2. **Komponenty**: ScheduleActionsPanel
3. **Obsługa**: Wyświetlenie komunikatu błędu, możliwość ponowienia próby

### Błędy aktualizacji harmonogramu
1. **Scenariusz**: Błąd podczas zapisywania zmian w harmonogramie
2. **Komponenty**: useScheduleState
3. **Obsługa**: Wyświetlenie komunikatu błędu, zachowanie lokalnych zmian z możliwością ponowienia próby

### Błędy walidacji formularza
1. **Scenariusz**: Nieprawidłowe dane w formularzu etapu
2. **Komponenty**: EditScheduleStageForm
3. **Obsługa**: Wyświetlenie komunikatów błędów przy odpowiednich polach

### Błędy autoryzacji
1. **Scenariusz**: Użytkownik nie ma dostępu do projektu
2. **Komponenty**: ProjectSchedulePage
3. **Obsługa**: Przekierowanie do strony logowania lub wyświetlenie komunikatu o braku uprawnień

## 11. Kroki implementacji

1. **Utworzenie struktury plików**:
   - Utworzenie pliku `/src/pages/projects/[id]/schedule.astro`
   - Utworzenie katalogu `/src/components/projects/schedule/` na komponenty React

2. **Implementacja widoku Astro**:
   - Utworzenie głównej strony widoku harmonogramu
   - Dodanie nagłówka projektu i nawigacji
   - Integracja z istniejącymi komponentami

3. **Implementacja hooków**:
   - Utworzenie hooka `useScheduleState` do zarządzania stanem harmonogramu
   - Utworzenie hooka `useStageValidation` do walidacji formularza etapu
   - Utworzenie hooka `useDrag` do obsługi drag & drop, nie uywaj zewnetrznych bibliotek

4. **Implementacja komponentów pomocniczych**:
   - LoadingSpinner
   - EmptyScheduleState
   - ErrorDisplay

5. **Implementacja panelu akcji**:
   - Utworzenie komponentu ScheduleActionsPanel
   - Implementacja funkcji generowania harmonogramu
   - Implementacja funkcji eksportu harmonogramu - nie implementujemy jej w tej wersji

6. **Implementacja listy etapów**:
   - Utworzenie komponentu ScheduleStagesList
   - Implementacja komponentu ScheduleStageItem
   - Implementacja funkcji drag & drop

7. **Implementacja formularzy**:
   - Utworzenie komponentu ScheduleStageFormModal
   - Implementacja komponentu EditScheduleStageForm
   - Implementacja walidacji formularza

8. **Integracja z API**:
   - Implementacja funkcji pobierania projektu
   - Implementacja funkcji generowania harmonogramu
   - Implementacja funkcji aktualizacji harmonogramu

9. **Implementacja obsługi błędów**:
   - Dodanie komponentu ErrorBoundary
   - Implementacja obsługi błędów API
   - Implementacja obsługi błędów walidacji

10. **Testowanie**:
    - Testowanie interakcji użytkownika
    - Testowanie walidacji formularzy
    - Testowanie integracji z API

11. **Finalizacja**:
    - Poprawki wizualne
    - Optymalizacja wydajności
    - Weryfikacja dostępności

12. **Dokumentacja**:
    - Aktualizacja dokumentacji komponentów
    - Dodanie komentarzy do kodu