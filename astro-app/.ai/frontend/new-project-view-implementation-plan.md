# Plan implementacji widoku tworzenia nowego projektu

## 1. Przegląd
Widok tworzenia nowego projektu umożliwia zalogowanym użytkownikom dodawanie nowych projektów do systemu poprzez wypełnienie formularza z podstawowymi informacjami o projekcie. Formularz zawiera pola dla nazwy projektu (obowiązkowe) oraz opisu (opcjonalne). Po poprawnym wypełnieniu i przesłaniu formularza, projekt jest zapisywany w bazie danych, a użytkownik przenoszony jest z powrotem do listy projektów.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/projects/new`

## 3. Struktura komponentów
```
NewProjectPage (Astro)
└── Layout (Astro)
    └── CreateProjectForm (React)
        ├── ProjectNameInput (React)
        ├── ProjectDescriptionTextarea (React)
        └── FormActions (React)
            ├── CancelButton (Shadcn/ui)
            └── SubmitButton (Shadcn/ui)
```

## 4. Szczegóły komponentów

### NewProjectPage (Astro)
- **Opis komponentu**: Główny komponent strony zawierający strukturę widoku tworzenia projektu
- **Główne elementy**: Layout, nagłówek strony "Nowy projekt", kontener formularza
- **Obsługiwane interakcje**: Brak (statyczny kontener)
- **Obsługiwana walidacja**: Brak (delegowana do formularza)
- **Typy**: Brak specyficznych typów
- **Propsy**: Brak

### CreateProjectForm (React)
- **Opis komponentu**: Interaktywny formularz do tworzenia projektu, zawierający pola formularza i przyciski akcji
- **Główne elementy**: Formularz HTML, komponenty pól formularza, przyciski akcji
- **Obsługiwane interakcje**: 
  - Przesyłanie formularza
  - Anulowanie tworzenia projektu
  - Nawigacja klawiaturą między polami
- **Obsługiwana walidacja**: 
  - Sprawdzanie czy nazwa projektu jest wypełniona
  - Sprawdzanie długości nazwy projektu (max 200 znaków)
  - Sprawdzanie długości opisu projektu (max 1000 znaków)
- **Typy**: 
  - CreateProjectFormModel (ViewModel)
  - CreateProjectRequestDto
  - CreateProjectResponseDto
  - ErrorResponseDto
- **Propsy**: Brak (komponent najwyższego poziomu)

### ProjectNameInput (React)
- **Opis komponentu**: Pole do wprowadzania nazwy projektu z walidacją i komunikatami o błędach
- **Główne elementy**: Label, Input (Shadcn/ui), komunikat błędu
- **Obsługiwane interakcje**: 
  - Zmiana wartości pola
  - Utrata fokusa (blur)
- **Obsługiwana walidacja**: 
  - Pole wymagane
  - Maksymalna długość 200 znaków
- **Typy**: 
  - { value: string, error: string | null }
- **Propsy**: 
  - value: string
  - error: string | null
  - onChange: (value: string) => void
  - onBlur: () => void
  - id: string
  - disabled?: boolean

### ProjectDescriptionTextarea (React)
- **Opis komponentu**: Pole tekstowe do wprowadzania opisu projektu z licznikiem znaków
- **Główne elementy**: Label, Textarea (Shadcn/ui), licznik znaków, komunikat błędu
- **Obsługiwane interakcje**: 
  - Zmiana wartości pola
  - Utrata fokusa (blur)
- **Obsługiwana walidacja**: 
  - Maksymalna długość 1000 znaków
- **Typy**: 
  - { value: string, error: string | null }
- **Propsy**: 
  - value: string
  - error: string | null
  - onChange: (value: string) => void
  - onBlur: () => void
  - id: string
  - maxLength: number
  - disabled?: boolean

### FormActions (React)
- **Opis komponentu**: Container z przyciskami akcji formularza
- **Główne elementy**: 
  - Przycisk "Anuluj"
  - Przycisk "Utwórz projekt"
- **Obsługiwane interakcje**: 
  - Kliknięcie przycisku Anuluj
  - Kliknięcie przycisku Utwórz projekt
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak specyficznych typów
- **Propsy**: 
  - onCancel: () => void
  - onSubmit: () => void
  - isSubmitting: boolean
  - isValid: boolean

## 5. Typy

### CreateProjectFormModel (ViewModel)
```typescript
interface CreateProjectFormModel {
  // Dane formularza
  name: string;
  description: string;
  
  // Stan walidacji
  nameError: string | null;
  descriptionError: string | null;
  
  // Stan formularza
  isSubmitting: boolean;
  serverError: string | null;
  isDirty: boolean;
}
```

### CreateProjectFormActions
```typescript
interface CreateProjectFormActions {
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  validateName: () => void;
  validateDescription: () => void;
  submit: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}
```

### CreateProjectRequestDto (z istniejących typów)
```typescript
interface CreateProjectRequestDto {
  name: string;
  description?: string | null;
}
```

### CreateProjectResponseDto (z istniejących typów)
```typescript
interface CreateProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}
```

### ErrorResponseDto (z istniejących typów)
```typescript
interface ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

## 6. Zarządzanie stanem

### Hook: useCreateProjectForm

Ten customowy hook będzie odpowiedzialny za obsługę formularza, walidację oraz komunikację z API.

```typescript
function useCreateProjectForm() {
  // Stan formularza
  const [formState, setFormState] = useState<CreateProjectFormModel>({
    name: '',
    description: '',
    nameError: null,
    descriptionError: null,
    isSubmitting: false,
    serverError: null,
    isDirty: false
  });
  
  const navigate = useNavigate();
  
  // Walidacja nazwy projektu
  const validateName = useCallback(() => {
    let error: string | null = null;
    
    if (!formState.name.trim()) {
      error = 'Nazwa projektu jest wymagana';
    } else if (formState.name.length > 200) {
      error = 'Nazwa projektu nie może przekraczać 200 znaków';
    }
    
    setFormState(prev => ({...prev, nameError: error}));
    return !error;
  }, [formState.name]);
  
  // Walidacja opisu projektu
  const validateDescription = useCallback(() => {
    let error: string | null = null;
    
    if (formState.description && formState.description.length > 1000) {
      error = 'Opis projektu nie może przekraczać 1000 znaków';
    }
    
    setFormState(prev => ({...prev, descriptionError: error}));
    return !error;
  }, [formState.description]);
  
  // Walidacja całego formularza
  const validateForm = useCallback(() => {
    return validateName() && validateDescription();
  }, [validateName, validateDescription]);
  
  // Obsługa przesyłania formularza
  const submit = useCallback(async () => {
    if (!validateForm()) return;
    
    setFormState(prev => ({...prev, isSubmitting: true, serverError: null}));
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          description: formState.description.trim() || null
        } as CreateProjectRequestDto)
      });
      
      if (!response.ok) {
        const errorData: ErrorResponseDto = await response.json();
        
        if (response.status === 401) {
          // Użytkownik niezalogowany - przekierowanie do logowania
          navigate('/login');
          return;
        }
        
        if (response.status === 403) {
          // Przekroczono limit projektów
          setFormState(prev => ({
            ...prev, 
            serverError: 'Osiągnięto limit projektów. Usuń niewykorzystane projekty, aby móc dodać nowy.',
            isSubmitting: false
          }));
          return;
        }
        
        // Inne błędy
        setFormState(prev => ({
          ...prev,
          serverError: errorData.error.message || 'Wystąpił błąd podczas tworzenia projektu',
          isSubmitting: false
        }));
        return;
      }
      
      // Sukces
      const data: CreateProjectResponseDto = await response.json();
      
      // Przekierowanie do listy projektów
      navigate('/dashboard');
      
    } catch (error) {
      // Błąd sieciowy lub nieoczekiwany
      setFormState(prev => ({
        ...prev,
        serverError: 'Nie udało się połączyć z serwerem. Sprawdź połączenie internetowe.',
        isSubmitting: false
      }));
    }
  }, [formState, validateForm, navigate]);
  
  // Obsługa anulowania
  const cancel = useCallback(() => {
    // Jeśli formularz ma zmiany, pytamy o potwierdzenie
    if (formState.isDirty && 
        (formState.name.trim() !== '' || formState.description.trim() !== '')) {
      if (confirm('Czy na pewno chcesz anulować? Wprowadzone dane zostaną utracone.')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [formState.isDirty, formState.name, formState.description, navigate]);
  
  // Resetowanie formularza
  const reset = useCallback(() => {
    setFormState({
      name: '',
      description: '',
      nameError: null,
      descriptionError: null,
      isSubmitting: false,
      serverError: null,
      isDirty: false
    });
  }, []);
  
  // Settery
  const setName = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev, 
      name: value, 
      isDirty: true,
      nameError: prev.nameError ? (value.trim() ? null : prev.nameError) : null
    }));
  }, []);
  
  const setDescription = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev, 
      description: value, 
      isDirty: true,
      descriptionError: prev.descriptionError ? (value.length <= 1000 ? null : prev.descriptionError) : null
    }));
  }, []);
  
  return {
    formState,
    actions: {
      setName,
      setDescription,
      validateName,
      validateDescription,
      submit,
      cancel,
      reset
    },
    isValid: !formState.nameError && !formState.descriptionError && formState.name.trim() !== ''
  };
}
```

## 7. Integracja API

Integracja z API będzie realizowana wewnątrz hooka `useCreateProjectForm`. Szczegóły komunikacji:

### Endpoint
- **URL**: `/api/projects`
- **Metoda**: POST
- **Nagłówki**: 
  - Content-Type: application/json
  - (Uwierzytelnianie jest obsługiwane przez middleware Astro)

### Dane wejściowe
- **Struktura**: `CreateProjectRequestDto`
```typescript
{
  name: string,      // Obowiązkowe, przycięty tekst
  description: string | null  // Opcjonalne, przycięty tekst lub null
}
```

### Oczekiwana odpowiedź
- **Sukces**: Status 201 Created
- **Struktura odpowiedzi**: `CreateProjectResponseDto`
```typescript
{
  id: string,          // UUID projektu
  name: string,        // Nazwa projektu
  description: string | null, // Opis projektu
  createdAt: string    // Data utworzenia w formacie ISO
}
```

### Obsługa błędów
- **400 Bad Request**: Błędne dane wejściowe (obsługiwane przez walidację formularza)
- **401 Unauthorized**: Brak uwierzytelnienia (przekierowanie do logowania)
- **403 Forbidden**: Przekroczony limit projektów użytkownika (wyświetlenie komunikatu)
- **Inne kody błędów**: Wyświetlenie komunikatu z serwera lub generycznego komunikatu

## 8. Interakcje użytkownika

### Wypełnianie formularza
1. Użytkownik klika w pole nazwy projektu
2. Wprowadza tekst
3. Po opuszczeniu pola (blur) następuje walidacja
4. W przypadku błędu, wyświetlany jest stosowny komunikat pod polem
5. Podobnie dla pola opisu, z tym że dodatkowo widoczny jest licznik znaków aktualizowany na żywo

### Przesyłanie formularza
1. Użytkownik wypełnia wymagane pola
2. Klika przycisk "Utwórz projekt" lub naciska Enter
3. Następuje walidacja wszystkich pól
4. Jeśli walidacja pozytywna:
   - Przycisk zmienia stan na "Tworzenie..."
   - Formularz jest blokowany
   - Wysyłane jest żądanie API
5. Po otrzymaniu odpowiedzi:
   - Jeśli sukces: przekierowanie do listy projektów
   - Jeśli błąd: wyświetlenie komunikatu błędu, odblokowanie formularza

### Anulowanie
1. Użytkownik klika przycisk "Anuluj"
2. Jeśli formularz był modyfikowany, pojawia się prośba o potwierdzenie
3. Po potwierdzeniu lub jeśli formularz nie był modyfikowany, następuje przekierowanie do listy projektów

### Nawigacja klawiaturą
1. Użytkownik może przechodzić między polami za pomocą klawisza Tab
2. Naciśnięcie Enter w polach tekstowych powoduje przejście do następnego pola
3. Naciśnięcie Enter, gdy fokus jest na przycisku "Utwórz projekt" powoduje przesłanie formularza

## 9. Warunki i walidacja

### Nazwa projektu
- **Warunek**: Pole jest wymagane i nie może przekraczać 200 znaków
- **Moment walidacji**: Po utracie fokusa (blur) oraz przy próbie przesłania formularza
- **Wpływ na UI**: 
  - Błąd wyświetlany pod polem
  - Przycisk "Utwórz projekt" jest wyłączony, gdy pole jest puste lub ma błąd

### Opis projektu
- **Warunek**: Pole jest opcjonalne, ale nie może przekraczać 1000 znaków
- **Moment walidacji**: Po utracie fokusa (blur) oraz przy próbie przesłania formularza
- **Wpływ na UI**: 
  - Błąd wyświetlany pod polem
  - Licznik znaków zmienia kolor na czerwony, gdy przekroczono limit
  - Przycisk "Utwórz projekt" jest wyłączony, gdy pole ma błąd

## 10. Obsługa błędów

### Błędy walidacji formularza
- **Sposób obsługi**: Wyświetlenie komunikatów błędów pod odpowiednimi polami
- **UI**: Tekst w kolorze czerwonym, ikona ostrzeżenia

### Błąd uwierzytelnienia
- **Sposób obsługi**: Przekierowanie do strony logowania
- **UI**: Komunikat toast informujący o wygaśnięciu sesji

### Błąd limitu projektów
- **Sposób obsługi**: Wyświetlenie komunikatu błędu nad formularzem
- **UI**: Alert z informacją o przekroczeniu limitu i sugestią usunięcia nieużywanych projektów

### Błąd sieciowy
- **Sposób obsługi**: Wyświetlenie komunikatu błędu nad formularzem z opcją ponowienia
- **UI**: Alert z przyciskiem "Spróbuj ponownie"

### Nieoczekiwany błąd serwera
- **Sposób obsługi**: Wyświetlenie generycznego komunikatu błędu
- **UI**: Alert z informacją o problemach technicznych i sugestią kontaktu z pomocą techniczną

## 11. Kroki implementacji

1. **Utworzenie struktury plików**
   - Utworzenie pliku strony Astro: `src/pages/projects/new.astro`
   - Utworzenie komponentu React: `src/components/dashboard/CreateProjectForm.tsx`
   - Utworzenie komponentów: `ProjectNameInput.tsx`, `ProjectDescriptionTextarea.tsx`

2. **Implementacja customowego hooka**
   - Utworzenie hooka `useCreateProjectForm` w `src/components/dashboard/hooks/useCreateProjectForm.ts`

3. **Implementacja komponentów React**
   - Implementacja komponentów pomocniczych: `ProjectNameInput`, `ProjectDescriptionTextarea`
   - Implementacja komponentu formularza: `CreateProjectForm`

4. **Implementacja strony Astro**
   - Utworzenie strony `new.astro` z wykorzystaniem istniejącego layoutu
   - Dodanie komponentu `CreateProjectForm` do strony

5. **Testowanie walidacji**
   - Testowanie walidacji pól formularza
   - Testowanie obsługi błędów walidacji

6. **Testowanie integracji z API**
   - Testowanie wysyłania danych do API
   - Testowanie obsługi różnych odpowiedzi z API

7. **Testowanie nawigacji**
   - Testowanie przekierowania po utworzeniu projektu
   - Testowanie akcji anulowania i potwierdzenia

8. **Testowanie dostępności**
   - Testowanie nawigacji klawiaturą
   - Testowanie zgodności z ARIA

9. **Testowanie responsywności**
   - Sprawdzenie wyglądu i działania na różnych rozmiarach ekranu

10. **Testowanie obsługi błędów**
    - Testowanie różnych scenariuszy błędów API
    - Testowanie błędów sieciowych