# Plan implementacji widoku edycji projektu

## 1. Przegląd
Widok edycji projektu umożliwia zalogowanym użytkownikom aktualizację szczegółów istniejących projektów. Pozwala na modyfikację nazwy oraz opisu projektu, zapewniając przy tym walidację danych w czasie rzeczywistym oraz odpowiednią informację zwrotną.

## 2. Routing widoku
- Ścieżka: `/projects/:id/edit`
- Parametry: `id` - identyfikator edytowanego projektu (UUID)
- Przekierowania:
  - Po pomyślnym zapisaniu: przekierowanie do widoku szczegółów projektu `/projects/:id`
  - Po anulowaniu: przekierowanie do poprzedniego widoku (historia przeglądarki)

## 3. Struktura komponentów
```
EditProjectPage (Astro)
└── ErrorBoundary (React)
    └── EditProjectForm (React)
        ├── ProjectNameInput (React) - istniejący komponent
        └── ProjectDescriptionTextarea (React) - istniejący komponent
```

## 4. Szczegóły komponentów

### EditProjectPage (Astro)
- Opis komponentu: Główna strona widoku edycji projektu, zawierająca strukturę i komponenty formularza
- Główne elementy: 
  - Layout.astro jako komponent nadrzędny
  - Nagłówek strony
  - Komponent EditProjectForm
- Obsługiwane interakcje: Brak (statyczny kontener)
- Obsługiwana walidacja: Brak (delegowana do komponentów React)
- Typy: Wykorzystuje props Astro dla ID projektu
- Propsy: Brak (komponent pobiera ID projektu z parametrów URL)

### ErrorBoundary (React)
- Opis komponentu: Komponent obsługujący błędy w aplikacji i wyświetlający przyjazny komunikat błędu
- Główne elementy: 
  - Informacja o błędzie
  - Przycisk powrotu do listy projektów
- Obsługiwane interakcje: Przechwytywanie błędów JavaScript w drzewie komponentów
- Obsługiwana walidacja: Brak
- Typy: Standardowe propsy React ErrorBoundary
- Propsy: 
  - `children`: React.ReactNode

### EditProjectForm (React)
- Opis komponentu: Interaktywny formularz do edycji danych projektu
- Główne elementy:
  - Pola formularza (nazwa, opis)
  - Wskaźnik stanu (ładowanie, zapisywanie)
  - Przyciski akcji (Anuluj, Zapisz zmiany)
  - Komunikaty błędów walidacji
- Obsługiwane interakcje:
  - Zmiana wartości pól formularza
  - Przesłanie formularza
  - Anulowanie edycji
- Obsługiwana walidacja:
  - Nazwa projektu: wymagana, maks. 200 znaków
  - Opis projektu: opcjonalny, maks. 2000 znaków
- Typy: 
  - ProjectDto
  - UpdateProjectRequestDto
  - ErrorResponseDto
  - ProjectEditViewModel (nowy typ)
- Propsy:
  - `projectId`: string - identyfikator projektu do edycji

### ProjectNameInput (React) - istniejący komponent
- Opis komponentu: Pole wprowadzania nazwy projektu
- Główne elementy: Input tekstowy z etykietą i komunikatem błędu
- Obsługiwane interakcje: Wprowadzanie tekstu, zmiana focusa
- Obsługiwana walidacja: Required, maxLength=200
- Typy: string
- Propsy:
  - `value`: string
  - `onChange`: (value: string) => void
  - `error`: string | undefined
  - `disabled`: boolean (opcjonalny)

### ProjectDescriptionTextarea (React) - istniejący komponent
- Opis komponentu: Pole tekstowe dla opisu projektu z licznikiem znaków
- Główne elementy: Textarea z etykietą, licznikiem znaków i komunikatem błędu
- Obsługiwane interakcje: Wprowadzanie tekstu, zmiana focusa
- Obsługiwana walidacja: maxLength=2000
- Typy: string | null
- Propsy:
  - `value`: string | null
  - `onChange`: (value: string | null) => void
  - `error`: string | undefined
  - `disabled`: boolean (opcjonalny)
  - `maxLength`: number (opcjonalny, domyślnie 2000)

## 5. Typy

### ProjectEditViewModel
```typescript
interface ProjectEditViewModel {
  id: string;
  name: string;
  description: string | null;
  isLoading: boolean;
  isSaving: boolean;
  hasErrors: boolean;
  formErrors: {
    name?: string;
    description?: string;
    general?: string;
  };
}
```

- `id`: Identyfikator projektu (UUID)
- `name`: Aktualna nazwa projektu
- `description`: Aktualny opis projektu (może być null)
- `isLoading`: Stan ładowania danych projektu
- `isSaving`: Stan zapisywania zmian projektu
- `hasErrors`: Flaga wskazująca na obecność błędów walidacji
- `formErrors`: Obiekt zawierający komunikaty błędów dla poszczególnych pól

## 6. Zarządzanie stanem

### Hook useEditProject
Hook ten zarządza stanem formularza edycji projektu, obsługą API i walidacją.

```typescript
function useEditProject(projectId: string) {
  const [project, setProject] = useState<Partial<ProjectDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ProjectEditViewModel['formErrors']>({});
  
  // Metody zarządzające stanem i komunikacją z API
  const fetchProject = async () => {...}
  const validateForm = () => {...}
  const handleNameChange = (name: string) => {...}
  const handleDescriptionChange = (description: string | null) => {...}
  const handleSubmit = async () => {...}
  const handleCancel = () => {...}
  
  // Efekt pobierający dane projektu przy inicjalizacji
  useEffect(() => {
    fetchProject();
  }, [projectId]);
  
  return {
    project,
    isLoading,
    isSaving,
    errors,
    handleNameChange,
    handleDescriptionChange,
    handleSubmit,
    handleCancel
  };
}
```

Główne funkcje:
1. `fetchProject`: Pobiera dane projektu z API
2. `validateForm`: Sprawdza poprawność danych formularza
3. `handleNameChange`: Aktualizuje stan nazwy projektu
4. `handleDescriptionChange`: Aktualizuje stan opisu projektu
5. `handleSubmit`: Wysyła dane do API i obsługuje odpowiedź
6. `handleCancel`: Anuluje edycję i wraca do poprzedniego widoku

## 7. Integracja API

### Pobieranie danych projektu
- Endpoint: GET `/api/projects/{id}`
- Typ odpowiedzi: `ProjectDto`
- Obsługa błędów: 401, 403, 404, 500
- Implementacja:
  ```typescript
  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        // Obsługa różnych kodów błędów
        handleApiError(response);
        return;
      }
      const data: ProjectDto = await response.json();
      setProject(data);
    } catch (error) {
      setErrors({ general: "Wystąpił błąd podczas pobierania danych projektu." });
    } finally {
      setIsLoading(false);
    }
  };
  ```

### Aktualizacja projektu
- Endpoint: PATCH `/api/projects/{id}`
- Typ żądania: `UpdateProjectRequestDto`
- Typ odpowiedzi: `UpdateProjectResponseDto`
- Obsługa błędów: 400, 401, 403, 404, 500
- Implementacja:
  ```typescript
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
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
        // Obsługa różnych kodów błędów
        handleApiError(response);
        return;
      }
      
      // Przekierowanie do strony szczegółów projektu po pomyślnej aktualizacji
      window.location.href = `/projects/${projectId}`;
    } catch (error) {
      setErrors({ general: "Wystąpił błąd podczas zapisywania zmian." });
    } finally {
      setIsSaving(false);
    }
  };
  ```

## 8. Interakcje użytkownika

### Edycja nazwy projektu
1. Użytkownik wprowadza tekst w polu nazwy projektu
2. Komponent ProjectNameInput wywołuje handleNameChange z nową wartością
3. Hook useEditProject aktualizuje stan i przeprowadza walidację w czasie rzeczywistym
4. Komunikat błędu jest wyświetlany, jeśli wprowadzona wartość jest nieprawidłowa

### Edycja opisu projektu
1. Użytkownik wprowadza tekst w polu opisu projektu
2. Komponent ProjectDescriptionTextarea wywołuje handleDescriptionChange z nową wartością
3. Licznik znaków aktualizuje się w czasie rzeczywistym
4. Komunikat błędu jest wyświetlany, jeśli przekroczono maksymalną liczbę znaków

### Zapisywanie zmian
1. Użytkownik klika przycisk "Zapisz zmiany"
2. Hook useEditProject waliduje wszystkie pola formularza
3. Jeśli walidacja jest pomyślna, wysyłane jest żądanie PATCH do API
4. Podczas zapisywania wyświetlany jest wskaźnik ładowania
5. Po pomyślnym zapisaniu użytkownik jest przekierowywany do widoku szczegółów projektu
6. W przypadku błędu wyświetlany jest odpowiedni komunikat

### Anulowanie edycji
1. Użytkownik klika przycisk "Anuluj"
2. Hook useEditProject wywołuje handleCancel
3. Użytkownik jest przekierowywany do poprzedniego widoku bez zapisywania zmian

## 9. Warunki i walidacja

### Walidacja nazwy projektu
- Warunek: Pole jest wymagane
  - Sprawdzenie: `!project.name || project.name.trim() === ''`
  - Komunikat: "Nazwa projektu jest wymagana."
- Warunek: Maksymalna długość 200 znaków
  - Sprawdzenie: `project.name && project.name.length > 200`
  - Komunikat: "Nazwa projektu nie może przekraczać 200 znaków."

### Walidacja opisu projektu
- Warunek: Maksymalna długość 2000 znaków
  - Sprawdzenie: `project.description && project.description.length > 2000`
  - Komunikat: "Opis projektu nie może przekraczać 2000 znaków."

### Walidacja w czasie rzeczywistym
- Walidacja przeprowadzana przy każdej zmianie wartości pola
- Natychmiastowa aktualizacja komunikatów błędów
- Dezaktywacja przycisku "Zapisz zmiany", gdy formularz zawiera błędy

### Walidacja przed wysłaniem
- Pełna walidacja wszystkich pól przed wysłaniem danych do API
- Zabezpieczenie przed wysłaniem nieprawidłowych danych

## 10. Obsługa błędów

### Błędy API
1. Projekt nie znaleziony (404)
   - Komunikat: "Projekt o podanym identyfikatorze nie istnieje."
   - Akcja: Link do listy projektów

2. Brak uprawnień (403)
   - Komunikat: "Nie masz uprawnień do edycji tego projektu."
   - Akcja: Link do listy projektów

3. Niezalogowany użytkownik (401)
   - Komunikat: "Sesja wygasła. Zaloguj się ponownie."
   - Akcja: Przekierowanie do strony logowania z zapamiętaniem stanu formularza

4. Błędy walidacji z API (400)
   - Komunikat: Wyświetlenie szczegółowych błędów z odpowiedzi API
   - Akcja: Zaznaczenie nieprawidłowych pól

5. Błąd serwera (500)
   - Komunikat: "Wystąpił błąd serwera. Spróbuj ponownie później."
   - Akcja: Przycisk ponowienia akcji

### Błędy sieci
1. Brak połączenia z internetem
   - Komunikat: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
   - Akcja: Przycisk ponowienia akcji

2. Timeout żądania
   - Komunikat: "Upłynął limit czasu żądania. Spróbuj ponownie."
   - Akcja: Przycisk ponowienia akcji

### Obsługa błędów JavaScript
1. Nieoczekiwany błąd JavaScript
   - Komunikat: "Wystąpił nieoczekiwany błąd."
   - Akcja: ErrorBoundary wyświetla przyjazny komunikat i opcję powrotu do listy projektów

## 11. Kroki implementacji

1. Przygotowanie struktury katalogów i plików:
   - Utworzenie pliku `/src/pages/projects/[id]/edit.astro`
   - Utworzenie pliku `/src/components/dashboard/EditProjectForm.tsx`
   - Weryfikacja istniejących komponentów `ProjectNameInput` i `ProjectDescriptionTextarea`

2. Implementacja głównego komponentu strony (edit.astro):
   - Import i wykorzystanie Layout.astro
   - Dodanie tytułu strony i nagłówka
   - Dodanie komponentu ErrorBoundary
   - Dodanie komponentu EditProjectForm z przekazaniem ID projektu

3. Implementacja hooka useEditProject:
   - Zdefiniowanie typów i interfejsów
   - Implementacja logiki pobierania danych projektu
   - Implementacja logiki walidacji
   - Implementacja logiki zapisywania zmian
   - Implementacja obsługi błędów

4. Implementacja komponentu EditProjectForm:
   - Wykorzystanie hooka useEditProject
   - Dodanie ProjectNameInput i ProjectDescriptionTextarea
   - Dodanie przycisków akcji (Anuluj, Zapisz zmiany)
   - Dodanie wskaźników stanu (ładowanie, zapisywanie)
   - Dodanie obsługi błędów i komunikatów

5. Testowanie funkcjonalności:
   - Testowanie pobierania danych projektu
   - Testowanie walidacji pól
   - Testowanie zapisywania zmian
   - Testowanie obsługi błędów
   - Testowanie dostępności (nawigacja klawiaturą, ARIA)

6. Refaktoryzacja i optymalizacja:
   - Wydzielenie powtarzających się fragmentów kodu do oddzielnych funkcji
   - Optymalizacja renderowania komponentów (memoizacja)
   - Czyszczenie kodu i dodanie komentarzy dokumentacyjnych