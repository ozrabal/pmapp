# Plan implementacji widoku założeń projektu

## 1. Przegląd
Widok założeń projektu to kluczowy element aplikacji Plan My App, umożliwiający użytkownikom definiowanie podstawowych założeń projektu z pomocą sztucznej inteligencji. Pozwala na wprowadzenie celu projektu, głównych funkcjonalności oraz technologii, a także na otrzymywanie, przeglądanie i zarządzanie sugestiami AI dotyczącymi ulepszenia założeń.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/projects/:id/assumptions`, gdzie `:id` to unikalny identyfikator projektu. Nowa strona musi być zintegrowana z istniejącą nawigacją między różnymi aspektami projektu (zakładkami).

## 3. Struktura komponentów
```
ProjectAssumptionsPage (.astro)
├── ProjectTabsNavigation (istniejący komponent)
├── ProjectHeader (istniejący komponent)
├── AssumptionsForm
│   ├── AssumptionField (cel projektu)
│   │   └── SuggestionItems (powiązane z tym polem)
│   ├── AssumptionField (główne funkcjonalności)
│   │   └── SuggestionItems (powiązane z tym polem)
│   └── AssumptionField (technologia)
│       └── SuggestionItems (powiązane z tym polem)
├── ValidateAssumptionsButton
└── SuggestionsList (wszystkie sugestie)
    ├── SuggestionItem
    │   └── FeedbackButton
    └── ...
```

## 4. Szczegóły komponentów

### ProjectAssumptionsPage
- **Opis komponentu**: Główna strona widoku założeń projektu zaimplementowana jako komponent Astro, który ładuje dane projektu i zawiera wszystkie podkomponenty.
- **Główne elementy**: Layout, ProjectHeader, ProjectTabsNavigation, AssumptionsForm, ValidateAssumptionsButton, SuggestionsList.
- **Obsługiwane interakcje**: Kontrolowanie głównego layoutu i przepływ danych między komponentami.
- **Typy**: ProjectDto, ProjectViewModel.
- **Propsy**: Brak (komponent strony).

### AssumptionsForm
- **Opis komponentu**: Formularz React zawierający pola do wprowadzania podstawowych założeń projektu: cel projektu, główne funkcjonalności i technologie.
- **Główne elementy**: Kontener formularza, komponenty AssumptionField.
- **Obsługiwane interakcje**: 
  - Wprowadzanie i edycja założeń projektu
  - Auto-save zmian z debounce (300ms)
- **Obsługiwana walidacja**: 
  - Sprawdzanie limitu znaków w polach
  - Zapobieganie wysyłaniu pustych wartości
- **Typy**: ProjectAssumptionsViewModel, funkcje aktualizacji.
- **Propsy**:
  ```typescript
  interface AssumptionsFormProps {
    assumptions: ProjectAssumptionsViewModel | null;
    suggestions: SuggestionViewModel[];
    onFieldChange: (field: keyof ProjectAssumptionsViewModel, value: string) => void;
    isLoading: boolean;
    fieldRefs: Record<string, React.RefObject<HTMLTextAreaElement>>;
  }
  ```

### AssumptionField
- **Opis komponentu**: Pojedyncze pole formularza z etykietą, obszarem tekstowym i przypisanymi sugestiami.
- **Główne elementy**: Etykieta, textarea (lub rich text editor), lista powiązanych sugestii.
- **Obsługiwane interakcje**: 
  - Edycja tekstu
  - Wyświetlanie sugestii dla danego pola
  - Przyjmowanie focusa po akceptacji sugestii
- **Obsługiwana walidacja**: 
  - Licznik znaków
  - Wewnętrzna walidacja pola
- **Typy**: SuggestionViewModel.
- **Propsy**:
  ```typescript
  interface AssumptionFieldProps {
    id: keyof ProjectAssumptionsViewModel;
    label: string;
    value: string;
    onChange: (value: string) => void;
    suggestions: SuggestionViewModel[];
    fieldRef: React.RefObject<HTMLTextAreaElement>;
    maxLength?: number;
    isLoading?: boolean;
  }
  ```

### ValidateAssumptionsButton
- **Opis komponentu**: Przycisk inicjujący walidację założeń przez AI.
- **Główne elementy**: Przycisk z ikoną AI i tekstem, wskaźnik ładowania.
- **Obsługiwane interakcje**: Kliknięcie inicjujące walidację.
- **Obsługiwana walidacja**: Dezaktywacja przycisku gdy nie ma założeń do walidacji lub gdy walidacja jest w trakcie.
- **Typy**: Brak specyficznych typów.
- **Propsy**:
  ```typescript
  interface ValidateAssumptionsButtonProps {
    onValidate: () => Promise<void>;
    isLoading: boolean;
    disabled: boolean;
  }
  ```

### SuggestionsList
- **Opis komponentu**: Lista sugestii AI dotyczących założeń projektu.
- **Główne elementy**: Nagłówek sekcji, lista elementów SuggestionItem, ewentualna paginacja.
- **Obsługiwane interakcje**: Grupowanie i filtrowanie sugestii.
- **Obsługiwana walidacja**: Brak.
- **Typy**: SuggestionViewModel, FeedbackItemDto.
- **Propsy**:
  ```typescript
  interface SuggestionsListProps {
    suggestions: SuggestionViewModel[];
    feedback: FeedbackItemDto[];
    onAccept: (suggestionId: string) => void;
    onReject: (suggestionId: string) => void;
    onFeedbackSubmit: (suggestionId: string, isHelpful: boolean) => void;
    isLoading: boolean;
  }
  ```

### SuggestionItem
- **Opis komponentu**: Pojedynczy element sugestii z treścią, uzasadnieniem i akcjami.
- **Główne elementy**: Treść sugestii, uzasadnienie, przyciski akcji (akceptuj, odrzuć), komponent oceny.
- **Obsługiwane interakcje**: 
  - Akceptacja sugestii
  - Odrzucenie sugestii
  - Ocena przydatności
- **Obsługiwana walidacja**: Blokowanie akcji dla już zaakceptowanych/odrzuconych sugestii.
- **Typy**: SuggestionViewModel.
- **Propsy**:
  ```typescript
  interface SuggestionItemProps {
    suggestion: SuggestionViewModel;
    onAccept: () => void;
    onReject: () => void;
    onFeedbackSubmit: (isHelpful: boolean) => void;
    disabled?: boolean;
  }
  ```

### FeedbackButton
- **Opis komponentu**: Przyciski do oceny przydatności sugestii.
- **Główne elementy**: Przyciski "Przydatne" i "Nieprzydatne" z ikonami.
- **Obsługiwane interakcje**: Kliknięcie przycisku oceny.
- **Obsługiwana walidacja**: Blokowanie ponownego głosowania po ocenie.
- **Typy**: Brak specyficznych typów.
- **Propsy**:
  ```typescript
  interface FeedbackButtonProps {
    onFeedbackSubmit: (isHelpful: boolean) => void;
    isSubmitted: boolean;
    selectedFeedback?: boolean;
  }
  ```

## 5. Typy

### ProjectViewModel
```typescript
interface ProjectViewModel {
  id: string;
  name: string;
  description: string | null;
  assumptions: ProjectAssumptionsViewModel | null;
  loading: boolean;
  error: string | null;
}
```

### ProjectAssumptionsViewModel
```typescript
interface ProjectAssumptionsViewModel {
  projectGoal: string;
  mainFeatures: string;
  technology: string;
}
```

### SuggestionViewModel
```typescript
interface SuggestionViewModel extends SuggestionDto {
  accepted: boolean;
  rejected: boolean;
  feedbackSubmitted: boolean;
  isHelpful?: boolean;
}
```

### ValidationResultViewModel
```typescript
interface ValidationResultViewModel {
  isValid: boolean;
  feedback: FeedbackItemDto[];
  suggestions: SuggestionViewModel[];
  loadingValidation: boolean;
  validationError: string | null;
}
```

### Mapowanie typów API na typy modelu widoku
```typescript
// Konwersja ProjectDto na ProjectViewModel
function mapProjectDtoToViewModel(projectDto: ProjectDto): ProjectViewModel {
  return {
    id: projectDto.id,
    name: projectDto.name,
    description: projectDto.description,
    assumptions: projectDto.assumptions 
      ? mapAssumptionsJsonToViewModel(projectDto.assumptions as any) 
      : null,
    loading: false,
    error: null
  };
}

// Konwersja JSON z API na ProjectAssumptionsViewModel
function mapAssumptionsJsonToViewModel(json: any): ProjectAssumptionsViewModel {
  return {
    projectGoal: json.projectGoal || '',
    mainFeatures: json.mainFeatures || '',
    technology: json.technology || ''
  };
}

// Konwersja ProjectAssumptionsViewModel na format JSON dla API
function mapViewModelToAssumptionsJson(viewModel: ProjectAssumptionsViewModel): any {
  return {
    projectGoal: viewModel.projectGoal,
    mainFeatures: viewModel.mainFeatures,
    technology: viewModel.technology
  };
}

// Konwersja SuggestionDto na SuggestionViewModel
function mapSuggestionDtoToViewModel(dto: SuggestionDto): SuggestionViewModel {
  return {
    ...dto,
    accepted: false,
    rejected: false,
    feedbackSubmitted: false
  };
}
```

## 6. Zarządzanie stanem

Widok będzie używał customowego hooka `useProjectAssumptions` do zarządzania stanem:

```typescript
function useProjectAssumptions(projectId: string) {
  // Stan projektu
  const [project, setProject] = useState<ProjectViewModel | null>(null);
  
  // Stan wyników walidacji
  const [validationResult, setValidationResult] = useState<ValidationResultViewModel>({
    isValid: false,
    feedback: [],
    suggestions: [],
    loadingValidation: false,
    validationError: null
  });
  
  // Referencje do pól formularza (do zarządzania focusem)
  const fieldRefs = {
    projectGoal: useRef<HTMLTextAreaElement>(null),
    mainFeatures: useRef<HTMLTextAreaElement>(null),
    technology: useRef<HTMLTextAreaElement>(null)
  };

  // Funkcja do ładowania danych projektu
  const loadProject = useCallback(async () => {
    try {
      setProject(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error(`Błąd pobierania danych projektu: ${response.status}`);
      }
      
      const data: ProjectDto = await response.json();
      setProject(mapProjectDtoToViewModel(data));
    } catch (error) {
      setProject(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Nieznany błąd' 
      }));
    }
  }, [projectId]);
  
  // Funkcja do aktualizacji założeń projektu (debounced)
  const debouncedUpdate = useCallback(
    debounce(async (field: keyof ProjectAssumptionsViewModel, value: string) => {
      if (!project?.id || !project.assumptions) return;
      
      try {
        const updatedAssumptions = { 
          ...project.assumptions, 
          [field]: value 
        };
        
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            assumptions: mapViewModelToAssumptionsJson(updatedAssumptions) 
          })
        });
        
        if (!response.ok) {
          throw new Error(`Błąd zapisywania założeń: ${response.status}`);
        }
      } catch (error) {
        console.error('Błąd zapisywania założeń:', error);
        // Opcjonalnie: pokazanie użytkownikowi informacji o błędzie
      }
    }, 300),
    [project]
  );
  
  // Funkcja do aktualizacji założeń (do użycia w formularzu)
  const updateAssumption = useCallback((
    field: keyof ProjectAssumptionsViewModel, 
    value: string
  ) => {
    // Natychmiastowa aktualizacja UI
    setProject(prev => {
      if (!prev || !prev.assumptions) return prev;
      
      return {
        ...prev,
        assumptions: {
          ...prev.assumptions,
          [field]: value
        }
      };
    });
    
    // Wywołanie debounced update
    debouncedUpdate(field, value);
    
    // Oznaczenie powiązanych sugestii jako nieaktualne
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.field === field ? { ...s, outdated: true } : s
      )
    }));
  }, [debouncedUpdate]);
  
  // Funkcja do walidacji założeń przez AI
  const validateAssumptions = useCallback(async () => {
    if (!project?.id || !project.assumptions) return;
    
    try {
      setValidationResult(prev => ({ ...prev, loadingValidation: true, validationError: null }));
      
      const response = await fetch(`/api/projects/${project.id}/assumptions/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Błąd walidacji: ${response.status}`);
      }
      
      const data: ValidateProjectAssumptionsResponseDto = await response.json();
      
      setValidationResult({
        isValid: data.isValid,
        feedback: data.feedback,
        suggestions: data.suggestions.map(mapSuggestionDtoToViewModel),
        loadingValidation: false,
        validationError: null
      });
    } catch (error) {
      setValidationResult(prev => ({
        ...prev,
        loadingValidation: false,
        validationError: error instanceof Error ? error.message : 'Nieznany błąd'
      }));
    }
  }, [project]);
  
  // Funkcja do akceptacji sugestii
  const acceptSuggestion = useCallback((suggestionId: string) => {
    if (!project?.assumptions) return;
    
    // Znajdź sugestię
    const suggestion = validationResult.suggestions.find(s => s.id === suggestionId);
    if (!suggestion || !suggestion.field || !suggestion.suggestion) return;
    
    // Aktualizuj stan sugestii
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === suggestionId ? { ...s, accepted: true } : s
      )
    }));
    
    // Zastosuj sugestię do pola formularza
    updateAssumption(suggestion.field as keyof ProjectAssumptionsViewModel, suggestion.suggestion);
    
    // Przesuń focus do pola
    const fieldRef = fieldRefs[suggestion.field as keyof typeof fieldRefs];
    if (fieldRef?.current) {
      fieldRef.current.focus();
    }
  }, [validationResult, project, updateAssumption, fieldRefs]);
  
  // Funkcja do odrzucenia sugestii
  const rejectSuggestion = useCallback((suggestionId: string) => {
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === suggestionId ? { ...s, rejected: true } : s
      )
    }));
  }, []);
  
  // Funkcja do oceny przydatności sugestii
  const submitFeedback = useCallback((suggestionId: string, isHelpful: boolean) => {
    // Aktualizacja lokalnego stanu
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === suggestionId ? { ...s, feedbackSubmitted: true, isHelpful } : s
      )
    }));
    
    // Tutaj może być wywołanie API do zapisania feedbacku
    // Nie mamy jeszcze endpointu, ale można go zaimplementować później
  }, []);
  
  // Inicjalne ładowanie danych
  useEffect(() => {
    loadProject();
  }, [loadProject]);
  
  return {
    project,
    validationResult,
    updateAssumption,
    validateAssumptions,
    acceptSuggestion,
    rejectSuggestion,
    submitFeedback,
    fieldRefs,
    refreshProject: loadProject
  };
}

// Helper function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

## 7. Integracja API

### Pobieranie danych projektu
- **Endpoint**: GET `/api/projects/{id}`
- **Typy**: 
  - Request: Brak body
  - Response: ProjectDto
- **Implementacja**: Funkcja `loadProject()` w hooku `useProjectAssumptions`

### Aktualizacja założeń projektu
- **Endpoint**: PATCH `/api/projects/{id}`
- **Typy**:
  - Request: UpdateProjectRequestDto (z polem assumptions)
  - Response: UpdateProjectResponseDto
- **Implementacja**: Funkcja `debouncedUpdate()` w hooku `useProjectAssumptions`

### Walidacja założeń przez AI
- **Endpoint**: POST `/api/projects/{id}/assumptions/validate`
- **Typy**:
  - Request: Brak body
  - Response: ValidateProjectAssumptionsResponseDto
- **Implementacja**: Funkcja `validateAssumptions()` w hooku `useProjectAssumptions`

## 8. Interakcje użytkownika

### Wprowadzanie/edycja założeń
- **Zdarzenie**: Zmiana treści w polu formularza (onChange)
- **Obsługa**: Funkcja `updateAssumption(field, value)`
- **Efekt**: 
  1. Natychmiastowa aktualizacja interfejsu
  2. Debounced wywołanie API w celu zapisania zmian
  3. Oznaczenie powiązanych sugestii jako nieaktualne

### Walidacja założeń przez AI
- **Zdarzenie**: Kliknięcie przycisku "Waliduj założenia"
- **Obsługa**: Funkcja `validateAssumptions()`
- **Efekt**:
  1. Aktualizacja stanu ładowania
  2. Wywołanie API walidacji
  3. Wyświetlenie otrzymanych sugestii i feedbacku

### Akceptacja sugestii
- **Zdarzenie**: Kliknięcie przycisku "Akceptuj" dla sugestii
- **Obsługa**: Funkcja `acceptSuggestion(suggestionId)`
- **Efekt**:
  1. Oznaczenie sugestii jako zaakceptowanej
  2. Aktualizacja odpowiedniego pola formularza
  3. Zapisanie zmian przez auto-save
  4. Przeniesienie focusa do edytowanego pola

### Odrzucenie sugestii
- **Zdarzenie**: Kliknięcie przycisku "Odrzuć" dla sugestii
- **Obsługa**: Funkcja `rejectSuggestion(suggestionId)`
- **Efekt**: Oznaczenie sugestii jako odrzuconej i ukrycie jej z głównej listy

### Ocena przydatności sugestii
- **Zdarzenie**: Kliknięcie przycisku "Przydatne" lub "Nieprzydatne"
- **Obsługa**: Funkcja `submitFeedback(suggestionId, isHelpful)`
- **Efekt**:
  1. Oznaczenie sugestii jako ocenionej
  2. Wizualne potwierdzenie wyboru
  3. (Opcjonalnie) Zapisanie oceny w systemie

## 9. Warunki i walidacja

### Walidacja pól formularza
- **Warunek**: Pola nie mogą być puste przed walidacją AI
- **Komponenty**: AssumptionField, ValidateAssumptionsButton
- **Efekt**: Przycisk walidacji jest wyłączony, jeśli wszystkie pola są puste

### Walidacja założeń przez AI
- **Warunek**: Projekt musi mieć zdefiniowane założenia
- **Komponenty**: ValidateAssumptionsButton
- **Efekt**: Przycisk walidacji jest wyłączony, jeśli nie ma założeń do walidacji

### Warunki akceptacji sugestii
- **Warunek**: Sugestia musi być aktualna i zawierać konkretną propozycję
- **Komponenty**: SuggestionItem
- **Efekt**: Przycisk akceptacji jest wyłączony dla nieaktualnych lub niepoprawnych sugestii

### Warunki oceny sugestii
- **Warunek**: Użytkownik może ocenić sugestię tylko raz
- **Komponenty**: FeedbackButton
- **Efekt**: Przyciski oceny są wyłączone po oddaniu głosu

## 10. Obsługa błędów

### Błąd pobierania danych projektu
- **Problem**: Nie można pobrać danych projektu
- **Obsługa**: Wyświetlenie komunikatu błędu i przycisku ponownej próby
- **Implementacja**: Przechwycenie błędu w `loadProject()` i aktualizacja stanu `project.error`

### Błąd zapisywania zmian
- **Problem**: Nie można zapisać zmian w projekcie
- **Obsługa**: Wyświetlenie małego powiadomienia o błędzie zapisu
- **Implementacja**: Przechwycenie błędu w `debouncedUpdate()` i wyświetlenie notyfikacji

### Błąd walidacji AI
- **Problem**: Nie można wykonać walidacji przez AI
- **Obsługa**: Wyświetlenie komunikatu błędu i przycisku ponownej próby
- **Implementacja**: Przechwycenie błędu w `validateAssumptions()` i aktualizacja stanu `validationResult.validationError`

### Obsługa przypadków brzegowych
- **Nieaktualne sugestie**: Oznaczanie sugestii jako nieaktualne, gdy pola formularza zostały zmienione
- **Równoczesna edycja**: Implementacja mechanizmu wykrywania konfliktów edycji
- **Długi czas odpowiedzi AI**: Timeout po określonym czasie i możliwość ponownej próby

## 11. Kroki implementacji

1. **Utworzenie nowej strony**:
   - Stwórz plik `src/pages/projects/[id]/assumptions.astro`
   - Zaimplementuj podstawową strukturę strony z wykorzystaniem istniejących komponentów

2. **Implementacja typów**:
   - Stwórz plik `src/components/projects/assumptions/types.ts`
   - Zdefiniuj potrzebne interfejsy (ProjectAssumptionsViewModel, SuggestionViewModel, itp.)

3. **Implementacja hooka useProjectAssumptions**:
   - Stwórz plik `src/components/projects/assumptions/hooks/useProjectAssumptions.ts`
   - Zaimplementuj logikę zarządzania stanem i integrację z API

4. **Implementacja komponentów formularza**:
   - Stwórz komponenty AssumptionsForm i AssumptionField
   - Zaimplementuj logikę auto-save i zarządzania referencjami

5. **Implementacja komponentów sugestii**:
   - Stwórz komponenty SuggestionsList i SuggestionItem
   - Zaimplementuj logikę wyświetlania i zarządzania sugestiami

6. **Implementacja przycisków akcji**:
   - Stwórz komponenty ValidateAssumptionsButton i FeedbackButton
   - Zaimplementuj logikę inicjowania walidacji i zbierania ocen

7. **Integracja komponentów**:
   - Połącz wszystkie komponenty w `assumptions.astro`
   - Zaimplementuj przepływ danych między komponentami

8. **Implementacja stylów**:
   - Zastosuj Tailwind do stylowania komponentów
   - Zaimplementuj wyróżnienie wizualne dla treści AI

9. **Testowanie i debugowanie**:
   - Przetestuj wszystkie interakcje użytkownika
   - Zweryfikuj obsługę błędów i przypadków brzegowych

10. **Optymalizacja wydajności**:
    - Zoptymalizuj renderowanie przy dużej liczbie sugestii
    - Zweryfikuj działanie mechanizmu debounce dla auto-save

11. **Dodanie widoku do nawigacji**:
    - Dodaj nowy widok do istniejącej nawigacji w projekcie
    - Zweryfikuj działanie komponentu ProjectTabsNavigation

12. **Dokumentacja**:
    - Przygotuj dokumentację techniczną komponentów
    - Dodaj komentarze JSDoc do kluczowych funkcji