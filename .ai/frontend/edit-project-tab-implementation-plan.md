# Plan implementacji widoku edycji projektu

## 1. Przegląd
Widok edycji projektu umożliwia zalogowanym użytkownikom aktualizację szczegółów istniejących projektów. Pozwala na modyfikację nazwy oraz opisu projektu, zapewniając przy tym walidację danych w czasie rzeczywistym oraz odpowiednią informację zwrotną. Widok ten jest jednym z kluczowych elementów aplikacji Plan My App.

## 2. Routing widoku
- Ścieżka: `/projects/:id/descriptions`
- Parametry: `id` - identyfikator edytowanego projektu (UUID)
- Przekierowania:
  - Po pomyślnym zapisaniu: przekierowanie do widoku szczegółów projektu `/projects/:id`
  - Po anulowaniu: przekierowanie do poprzedniego widoku (historia przeglądarki)

## 3. Struktura komponentów
```
EditProjectPage (.astro)
├── ProjectTabsNavigation (istniejący komponent)
├── ProjectHeader (istniejący komponent)
├── ErrorBoundary (React)
└── EditProjectForm (React)
    ├── ProjectNameInput (istniejący komponent)
    └── ProjectDescriptionTextarea (istniejący komponent)
```

## 4. Szczegóły komponentów

### EditProjectPage (Astro)
- **Opis komponentu**: Główna strona widoku edycji projektu zaimplementowana jako komponent Astro, który ładuje dane projektu i zawiera wszystkie podkomponenty.
- **Główne elementy**: Layout, ProjectHeader, ProjectTabsNavigation, ErrorBoundary, EditProjectForm.
- **Obsługiwane interakcje**: Kontrolowanie głównego layoutu i przepływ danych między komponentami.
- **Typy**: ProjectDto, ProjectViewModel.
- **Propsy**: Brak (komponent strony).

### ErrorBoundary (React)
- **Opis komponentu**: Komponent obsługujący błędy w aplikacji i wyświetlający przyjazny komunikat błędu.
- **Główne elementy**: 
  - Informacja o błędzie
  - Przycisk powrotu do listy projektów
  - Opcjonalny szczegółowy opis błędu
- **Obsługiwane interakcje**: Przechwytywanie błędów JavaScript w drzewie komponentów.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Standardowe propsy React ErrorBoundary.
- **Propsy**:
  ```typescript
  interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }
  ```

### EditProjectForm (React)
- **Opis komponentu**: Interaktywny formularz do edycji danych projektu.
- **Główne elementy**:
  - Pola formularza (nazwa, opis)
  - Wskaźnik stanu (ładowanie, zapisywanie)
  - Przyciski akcji (Anuluj, Zapisz zmiany)
  - Komunikaty błędów walidacji
- **Obsługiwane interakcje**:
  - Zmiana wartości pól formularza
  - Przesłanie formularza
  - Anulowanie edycji
- **Obsługiwana walidacja**:
  - Nazwa projektu: wymagana, maks. 200 znaków
  - Opis projektu: opcjonalny, maks. 2000 znaków
- **Typy**: ProjectEditViewModel.
- **Propsy**:
  ```typescript
  interface EditProjectFormProps {
    projectId: string;
  }
  ```

### ProjectNameInput (istniejący komponent)
- **Opis komponentu**: Pole wprowadzania nazwy projektu z etykietą i walidacją.
- **Główne elementy**: Input tekstowy z etykietą i komunikatem błędu.
- **Obsługiwane interakcje**: 
  - Wprowadzanie tekstu
  - Zmiana focusa
  - Walidacja w czasie rzeczywistym
- **Obsługiwana walidacja**: 
  - Pole wymagane
  - Maksymalna długość 200 znaków
- **Typy**: string.
- **Propsy**:
  ```typescript
  interface ProjectNameInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
  }
  ```

### ProjectDescriptionTextarea (istniejący komponent)
- **Opis komponentu**: Pole tekstowe dla opisu projektu z licznikiem znaków.
- **Główne elementy**: Textarea z etykietą, licznikiem znaków i komunikatem błędu.
- **Obsługiwane interakcje**: 
  - Wprowadzanie tekstu
  - Zmiana focusa
  - Licznik znaków aktualizowany w czasie rzeczywistym
- **Obsługiwana walidacja**: 
  - Maksymalna długość 2000 znaków
- **Typy**: string | null.
- **Propsy**:
  ```typescript
  interface ProjectDescriptionTextareaProps {
    value: string | null;
    onChange: (value: string | null) => void;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
  }
  ```

## 5. Typy

### ProjectViewModel
```typescript
interface ProjectViewModel {
  id: string;
  name: string;
  description: string | null;
  loading: boolean;
  error: string | null;
}
```

### ProjectEditViewModel
```typescript
interface ProjectEditViewModel {
  project: ProjectViewModel | null;
  isLoading: boolean;
  isSaving: boolean;
  formErrors: {
    name?: string;
    description?: string;
    general?: string;
  };
}
```

### UpdateProjectRequestDto
```typescript
interface UpdateProjectRequestDto {
  name: string;
  description: string | null;
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
    loading: false,
    error: null
  };
}
```

## 6. Zarządzanie stanem

Widok będzie używał customowego hooka `useEditProject` do zarządzania stanem:

```typescript
function useEditProject(projectId: string) {
  // Stan projektu
  const [project, setProject] = useState<ProjectViewModel | null>(null);
  
  // Stan formularza
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ProjectEditViewModel['formErrors']>({});
  
  // Funkcja do ładowania danych projektu
  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setFormErrors({});
      
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error(`Błąd pobierania danych projektu: ${response.status}`);
      }
      
      const data: ProjectDto = await response.json();
      setProject(mapProjectDtoToViewModel(data));
    } catch (error) {
      setFormErrors({ 
        general: error instanceof Error ? error.message : 'Nieznany błąd' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  // Funkcja do walidacji formularza
  const validateForm = (): boolean => {
    const errors: ProjectEditViewModel['formErrors'] = {};
    
    // Walidacja nazwy
    if (!project?.name || project.name.trim() === '') {
      errors.name = 'Nazwa projektu jest wymagana.';
    } else if (project.name.length > 200) {
      errors.name = 'Nazwa projektu nie może przekraczać 200 znaków.';
    }
    
    // Walidacja opisu
    if (project?.description && project.description.length > 2000) {
      errors.description = 'Opis projektu nie może przekraczać 2000 znaków.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Funkcje aktualizacji pól formularza
  const handleNameChange = (name: string) => {
    setProject(prev => prev ? { ...prev, name } : null);
    
    // Opcjonalna walidacja w czasie rzeczywistym
    if (!name || name.trim() === '') {
      setFormErrors(prev => ({ ...prev, name: 'Nazwa projektu jest wymagana.' }));
    } else if (name.length > 200) {
      setFormErrors(prev => ({ ...prev, name: 'Nazwa projektu nie może przekraczać 200 znaków.' }));
    } else {
      setFormErrors(prev => ({ ...prev, name: undefined }));
    }
  };
  
  const handleDescriptionChange = (description: string | null) => {
    setProject(prev => prev ? { ...prev, description } : null);
    
    // Opcjonalna walidacja w czasie rzeczywistym
    if (description && description.length > 2000) {
      setFormErrors(prev => ({ ...prev, description: 'Opis projektu nie może przekraczać 2000 znaków.' }));
    } else {
      setFormErrors(prev => ({ ...prev, description: undefined }));
    }
  };
  
  // Funkcja do zapisywania zmian
  const handleSubmit = async () => {
    if (!project) return;
    
    // Walidacja formularza przed wysłaniem
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      
      const updateData: UpdateProjectRequestDto = {
        name: project.name,
        description: project.description
      };
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          // Obsługa błędów walidacji z API
          const errorData = await response.json();
          setFormErrors(errorData.errors || { general: errorData.message });
          return;
        }
        throw new Error(`Błąd zapisywania projektu: ${response.status}`);
      }
      
      // Przekierowanie do strony szczegółów projektu po pomyślnej aktualizacji
      window.location.href = `/projects/${projectId}`;
    } catch (error) {
      setFormErrors({ 
        general: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania zmian.' 
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Funkcja do anulowania edycji
  const handleCancel = () => {
    // Powrót do poprzedniej strony
    window.history.back();
  };
  
  // Inicjalne ładowanie danych
  useEffect(() => {
    loadProject();
  }, [loadProject]);
  
  return {
    project,
    isLoading,
    isSaving,
    formErrors,
    handleNameChange,
    handleDescriptionChange,
    handleSubmit,
    handleCancel,
    refreshProject: loadProject
  };
}
```

## 7. Integracja API

### Pobieranie danych projektu
- **Endpoint**: GET `/api/projects/{id}`
- **Typy**: 
  - Request: Brak body
  - Response: ProjectDto
- **Implementacja**: Funkcja `loadProject()` w hooku `useEditProject`

### Aktualizacja projektu
- **Endpoint**: PATCH `/api/projects/{id}`
- **Typy**:
  - Request: UpdateProjectRequestDto
  - Response: ProjectDto
- **Implementacja**: Funkcja `handleSubmit()` w hooku `useEditProject`

## 8. Interakcje użytkownika

### Edycja nazwy projektu
- **Zdarzenie**: Zmiana treści w polu nazwy (onChange)
- **Obsługa**: Funkcja `handleNameChange(name)`
- **Efekt**: 
  1. Aktualizacja stanu formularza
  2. Walidacja w czasie rzeczywistym
  3. Wyświetlenie komunikatu błędu (jeśli dotyczy)

### Edycja opisu projektu
- **Zdarzenie**: Zmiana treści w polu opisu (onChange)
- **Obsługa**: Funkcja `handleDescriptionChange(description)`
- **Efekt**:
  1. Aktualizacja stanu formularza
  2. Walidacja w czasie rzeczywistym
  3. Aktualizacja licznika znaków
  4. Wyświetlenie komunikatu błędu (jeśli dotyczy)

### Zapisywanie zmian
- **Zdarzenie**: Kliknięcie przycisku "Zapisz zmiany"
- **Obsługa**: Funkcja `handleSubmit()`
- **Efekt**:
  1. Walidacja wszystkich pól formularza
  2. Pokazanie wskaźnika ładowania
  3. Wysłanie żądania PATCH do API
  4. Przekierowanie do strony szczegółów projektu lub wyświetlenie błędów

### Anulowanie edycji
- **Zdarzenie**: Kliknięcie przycisku "Anuluj"
- **Obsługa**: Funkcja `handleCancel()`
- **Efekt**: Powrót do poprzedniej strony bez zapisywania zmian

## 9. Warunki i walidacja

### Walidacja nazwy projektu
- **Warunek**: Pole jest wymagane
  - **Sprawdzenie**: `!project?.name || project.name.trim() === ''`
  - **Komunikat**: "Nazwa projektu jest wymagana."
- **Warunek**: Maksymalna długość 200 znaków
  - **Sprawdzenie**: `project?.name && project.name.length > 200`
  - **Komunikat**: "Nazwa projektu nie może przekraczać 200 znaków."

### Walidacja opisu projektu
- **Warunek**: Maksymalna długość 2000 znaków
  - **Sprawdzenie**: `project?.description && project.description.length > 2000`
  - **Komunikat**: "Opis projektu nie może przekraczać 2000 znaków."

### Walidacja w czasie rzeczywistym
- **Implementacja**: Bezpośrednio w funkcjach `handleNameChange` i `handleDescriptionChange`
- **Efekt**: Natychmiastowa informacja zwrotna dla użytkownika

### Walidacja przed wysłaniem
- **Implementacja**: Funkcja `validateForm()`
- **Efekt**: Pełna walidacja formularza przed wysłaniem do API

## 10. Obsługa błędów

### Błędy API

#### Błąd pobierania danych projektu
- **Problem**: Nie można pobrać danych projektu
- **Obsługa**: Wyświetlenie komunikatu błędu i przycisku ponownej próby
- **Implementacja**: Przechwycenie błędu w `loadProject()` i aktualizacja stanu `formErrors.general`

#### Błąd zapisywania zmian
- **Problem**: Nie można zapisać zmian w projekcie
- **Obsługa**: Wyświetlenie komunikatu błędu w formularzu
- **Implementacja**: Przechwycenie błędu w `handleSubmit()` i aktualizacja stanu `formErrors`

#### Błędy walidacji z API
- **Problem**: API zwraca błędy walidacji
- **Obsługa**: Mapowanie błędów na pola formularza
- **Implementacja**: Przetwarzanie odpowiedzi 400 w `handleSubmit()`

#### Błędy uprawnień
- **Problem**: Brak uprawnień do edycji projektu (403)
- **Obsługa**: Wyświetlenie komunikatu błędu i przekierowanie do listy projektów
- **Implementacja**: Obsługa w funkcji `loadProject()` lub `handleSubmit()`

#### Projekt nie istnieje
- **Problem**: Projekt o podanym ID nie istnieje (404)
- **Obsługa**: Wyświetlenie komunikatu błędu i przekierowanie do listy projektów
- **Implementacja**: Obsługa w funkcji `loadProject()`

### Obsługa przypadków brzegowych
- **Problem**: Nieoczekiwane błędy JavaScript
- **Obsługa**: Komponent ErrorBoundary przechwytuje błędy i wyświetla przyjazny komunikat
- **Implementacja**: Opakowanie głównego komponentu w ErrorBoundary

## 11. Kroki implementacji

1. **Utworzenie nowej strony**:
   - Stwórz plik `src/pages/projects/[id]/descriptions.astro`
   - Zaimplementuj podstawową strukturę strony z wykorzystaniem istniejących komponentów

2. **Implementacja typów**:
   - Zaktualizuj plik typów o nowe interfejsy (ProjectEditViewModel, UpdateProjectRequestDto, itp.)

3. **Implementacja hooka useEditProject**:
   - Stwórz plik `src/components/projects/hooks/useEditProject.ts`
   - Zaimplementuj logikę zarządzania stanem i integrację z API

4. **Implementacja komponentu EditProjectForm**:
   - Stwórz plik `src/components/dashboard/EditProjectForm.tsx`
   - Zaimplementuj formularz z wykorzystaniem istniejących komponentów
   - Zintegruj logikę z hookiem useEditProject

5. **Implementacja obsługi błędów**:
   - Zaktualizuj istniejący ErrorBoundary lub stwórz nowy
   - Zaimplementuj obsługę różnych rodzajów błędów API

6. **Integracja komponentów**:
   - Połącz wszystkie komponenty w `edit.astro`
   - Zaimplementuj przepływ danych między komponentami

7. **Implementacja stylów**:
   - Zastosuj Tailwind do stylowania komponentów
   - Zachowaj spójność wizualną z resztą aplikacji

8. **Testowanie i debugowanie**:
   - Przetestuj wszystkie interakcje użytkownika
   - Zweryfikuj obsługę błędów i przypadków brzegowych

9. **Optymalizacja wydajności**:
   - Zoptymalizuj renderowanie komponentów
   - Dodaj mechanizmy memoizacji dla kosztownych obliczeń

10. **Dokumentacja**:
    - Dodaj komentarze JSDoc do kluczowych funkcji
    - Aktualizuj dokumentację projektu