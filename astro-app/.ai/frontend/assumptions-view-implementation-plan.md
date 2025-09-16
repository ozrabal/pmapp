# Plan implementacji widoku założeń projektu

## 1. Przegląd
Widok założeń projektu umożliwia użytkownikom wprowadzanie podstawowych założeń projektowych, otrzymywanie walidacji i sugestii od AI dotyczących wprowadzonych założeń. Jest to kluczowy element w procesie planowania projektu, pozwalający na zdefiniowanie jasnych ram projektu z pomocą sztucznej inteligencji.

## 2. Routing widoku
Ścieżka: `/projects/:id/assumptions`

## 3. Struktura komponentów
```
AssumptionsTabView
├── NavigationTabs
├── AssumptionsForm
│   ├── ProjectGoalField
│   ├── TargetAudienceField
│   ├── FunctionalitiesField
│   └── ConstraintsField
├── ValidationButton
├── ValidationResults
│   └── FeedbackItem (multiple)
└── SuggestionsList
    └── SuggestionItem (multiple)
        └── SuggestionFeedback
```

## 4. Szczegóły komponentów

### AssumptionsTabView
- Opis komponentu: Główny kontener dla widoku założeń projektu, zawierający formularz, przyciski akcji oraz sekcje wyników walidacji i sugestii AI.
- Główne elementy: NavigationTabs, AssumptionsForm, ValidationButton, ValidationResults, SuggestionsList, komunikaty o stanie (ładowanie, zapisywanie).
- Obsługiwane interakcje: Przełączanie między zakładkami, inicjowanie walidacji.
- Typy: ProjectDto, AssumptionsViewModel.
- Propsy: projectId: string.

### NavigationTabs
- Opis komponentu: Nawigacja między różnymi zakładkami edycji projektu.
- Główne elementy: Zakładki nawigacyjne (Informacje ogólne, Założenia, Funkcjonalności, Harmonogram).
- Obsługiwane interakcje: Przełączanie między zakładkami.
- Typy: N/A
- Propsy: activeTab: string, onTabChange: (tab: string) => void.

### AssumptionsForm
- Opis komponentu: Formularz do wprowadzania założeń projektu.
- Główne elementy: Pola tekstowe i wieloliniowe dla założeń projektu (cel, grupa docelowa, funkcjonalności, ograniczenia), indykator stanu zapisywania.
- Obsługiwane interakcje: Wprowadzanie tekstu, automatyczne zapisywanie.
- Obsługiwana walidacja: Poprawność formatu wprowadzonych danych, automatyczna walidacja po utracie fokusu.
- Typy: AssumptionsViewModel, AssumptionsFormState.
- Propsy: initialAssumptions: AssumptionsViewModel, onUpdate: (assumptions: AssumptionsViewModel) => void, isSaving: boolean.

### ValidationButton
- Opis komponentu: Przycisk do inicjowania walidacji założeń przez AI.
- Główne elementy: Przycisk z ikoną i etykietą, wskaźnik stanu ładowania.
- Obsługiwane interakcje: Kliknięcie inicjujące walidację.
- Typy: N/A
- Propsy: onClick: () => void, isLoading: boolean, isDisabled: boolean.

### ValidationResults
- Opis komponentu: Sekcja wyświetlająca wyniki walidacji założeń przez AI.
- Główne elementy: Nagłówek z informacją o statusie walidacji, lista elementów FeedbackItem.
- Obsługiwane interakcje: Brak.
- Typy: ValidationResultViewModel.
- Propsy: validation: ValidationResultViewModel.

### FeedbackItem
- Opis komponentu: Element wyświetlający pojedynczy feedback z walidacji.
- Główne elementy: Ikona oznaczająca poziom ważności, tekst wiadomości, podświetlenie pola, którego dotyczy.
- Obsługiwane interakcje: Kliknięcie przenosi fokus na powiązane pole.
- Typy: FeedbackItemViewModel.
- Propsy: feedback: FeedbackItemViewModel, onFieldFocus: (field: string) => void.

### SuggestionsList
- Opis komponentu: Lista sugestii wygenerowanych przez AI.
- Główne elementy: Nagłówek, lista elementów SuggestionItem, ewentualne komunikaty o braku sugestii.
- Obsługiwane interakcje: Filtrowanie sugestii.
- Typy: SuggestionViewModel[].
- Propsy: suggestions: SuggestionViewModel[], onAccept: (suggestion: SuggestionViewModel) => void, onReject: (suggestion: SuggestionViewModel) => void, onFeedback: (suggestion: SuggestionViewModel, isHelpful: boolean) => void.

### SuggestionItem
- Opis komponentu: Element wyświetlający pojedynczą sugestię AI.
- Główne elementy: Treść sugestii, uzasadnienie, przyciski akcji (zaakceptuj, odrzuć), komponent oceny przydatności.
- Obsługiwane interakcje: Akceptacja lub odrzucenie sugestii, ocena przydatności.
- Typy: SuggestionViewModel.
- Propsy: suggestion: SuggestionViewModel, onAccept: () => void, onReject: () => void, onFeedback: (isHelpful: boolean) => void.

### SuggestionFeedback
- Opis komponentu: Komponent umożliwiający ocenę przydatności sugestii.
- Główne elementy: Pytanie o przydatność, przyciski lub gwiazdki do oceny.
- Obsługiwane interakcje: Ocena przydatności (pozytywna lub negatywna).
- Typy: N/A
- Propsy: onFeedback: (isHelpful: boolean) => void, isFeedbackGiven: boolean.

## 5. Typy

### AssumptionsViewModel
```typescript
interface AssumptionsViewModel {
  projectGoal: string; // Cel projektu
  targetAudience: string; // Grupa docelowa
  functionalities: string[]; // Główne funkcjonalności
  constraints: string[]; // Ograniczenia projektu
  
  // Dodatkowe pola ułatwiające zarządzanie stanem
  isDirty: boolean; // Czy wprowadzono zmiany od ostatniego zapisu
  lastSaved: Date | null; // Data ostatniego zapisu
}
```

### AssumptionsFormState
```typescript
interface AssumptionsFormState {
  values: AssumptionsViewModel;
  errors: Record<string, string | null>;
  isSaving: boolean;
  savedSuccessfully: boolean;
  saveError: string | null;
}
```

### ValidationResultViewModel
```typescript
interface ValidationResultViewModel {
  isValid: boolean; // Czy założenia są poprawne
  feedbackItems: FeedbackItemViewModel[]; // Lista elementów feedbacku
  timestamp: Date; // Data wykonania walidacji
}
```

### FeedbackItemViewModel
```typescript
interface FeedbackItemViewModel {
  field: string; // Identyfikator pola, którego dotyczy feedback
  fieldLabel: string; // Nazwa pola czytelna dla człowieka
  message: string; // Treść feedbacku
  severity: 'error' | 'warning' | 'info'; // Poziom ważności
}
```

### SuggestionViewModel
```typescript
interface SuggestionViewModel {
  id: string; // Identyfikator sugestii
  field?: string; // Pole, którego dotyczy sugestia
  fieldLabel?: string; // Nazwa pola czytelna dla człowieka
  type?: string; // Typ sugestii
  content?: string; // Treść sugestii
  reason: string; // Uzasadnienie sugestii
  
  // Pola stanu UI
  isAccepted: boolean; // Czy sugestia została zaakceptowana
  isRejected: boolean; // Czy sugestia została odrzucona
  isFeedbackGiven: boolean; // Czy udzielono feedbacku o przydatności
}
```

### MapperUtils
```typescript
// Funkcje pomocnicze do mapowania między typami
namespace MapperUtils {
  // Konwersja założeń z DB do modelu widoku
  export function dbToViewModel(assumptions: Json | null): AssumptionsViewModel;
  
  // Konwersja modelu widoku do formatu DB
  export function viewModelToDB(viewModel: AssumptionsViewModel): any;
  
  // Mapowanie pól feedback do etykiet czytelnych dla człowieka
  export function getFieldLabel(field: string): string;
}
```

## 6. Zarządzanie stanem

### useAssumptionsForm
Hook zarządzający stanem formularza założeń, obsługujący automatyczne zapisywanie i walidację.

```typescript
function useAssumptionsForm(
  projectId: string,
  initialAssumptions: Json | null
): {
  formState: AssumptionsFormState;
  updateField: (field: keyof AssumptionsViewModel, value: any) => void;
  resetForm: () => void;
  saveNow: () => Promise<void>;
}
```

Główne cechy:
- Debounced auto-save (zapisywanie po 1500ms braku zmian)
- Walidacja podstawowa (długość tekstu, format danych)
- Obsługa stanu zapisywania i błędów

### useAssumptionsValidation
Hook obsługujący walidację założeń przez AI.

```typescript
function useAssumptionsValidation(
  projectId: string
): {
  validationResult: ValidationResultViewModel | null;
  isValidating: boolean;
  validationError: string | null;
  validateAssumptions: () => Promise<void>;
  clearValidation: () => void;
}
```

Główne cechy:
- Wywołanie API walidacji
- Obsługa stanu ładowania i błędów
- Formatowanie wyników walidacji dla UI

### useSuggestions
Hook zarządzający sugestiami AI i interakcjami z nimi.

```typescript
function useSuggestions(
  projectId: string,
  updateAssumption: (field: string, value: any) => void
): {
  suggestions: SuggestionViewModel[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (focus?: string) => Promise<void>;
  acceptSuggestion: (suggestionId: string) => void;
  rejectSuggestion: (suggestionId: string) => void;
  provideFeedback: (suggestionId: string, isHelpful: boolean) => Promise<void>;
}
```

Główne cechy:
- Pobieranie sugestii z API
- Obsługa akceptowania/odrzucania sugestii
- Przesyłanie informacji zwrotnej o przydatności sugestii
- Aktualizacja formularza po zaakceptowaniu sugestii

## 7. Integracja API

### Pobieranie projektu
```typescript
async function fetchProject(id: string): Promise<ProjectDto> {
  try {
    const project = await ProjectClientService.getProject(id);
    return project;
  } catch (error) {
    // Obsługa błędów
    throw new Error(`Nie udało się pobrać projektu: ${error.message}`);
  }
}
```

### Aktualizacja założeń
```typescript
async function updateProjectAssumptions(
  id: string, 
  assumptions: any
): Promise<UpdateProjectResponseDto> {
  try {
    return await ProjectClientService.updateProject(id, { assumptions });
  } catch (error) {
    // Obsługa błędów
    throw new Error(`Nie udało się zaktualizować założeń: ${error.message}`);
  }
}
```

### Walidacja założeń
```typescript
async function validateAssumptions(id: string): Promise<ValidateProjectAssumptionsResponseDto> {
  try {
    return await ProjectClientService.validateProjectAssumptions(id);
  } catch (error) {
    // Obsługa błędów
    throw new Error(`Nie udało się zwalidować założeń: ${error.message}`);
  }
}
```

### Pobieranie sugestii
```typescript
async function getAssumptionsSuggestions(
  id: string
): Promise<GetProjectSuggestionsResponseDto> {
  try {
    return await ProjectClientService.getProjectSuggestions(id, 'assumption');
  } catch (error) {
    // Obsługa błędów
    throw new Error(`Nie udało się pobrać sugestii: ${error.message}`);
  }
}
```

### Wysyłanie feedbacku dla sugestii
```typescript
async function submitSuggestionFeedback(
  suggestionContext: string,
  suggestionHash: string,
  isHelpful: boolean
): Promise<void> {
  try {
    await fetch('/api/ai-feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        suggestionContext,
        suggestionHash,
        isHelpful
      }),
    });
  } catch (error) {
    // Obsługa błędów
    console.error('Nie udało się wysłać feedbacku:', error);
  }
}
```

## 8. Interakcje użytkownika

1. **Ładowanie widoku**:
   - Pobieranie danych projektu
   - Wypełnienie formularza istniejącymi założeniami
   - Wyświetlenie pustych sekcji walidacji i sugestii

2. **Edycja pól formularza**:
   - Aktualizacja stanu formularza
   - Ustawienie flagi `isDirty`
   - Po 1.5 sekundy braku zmian - automatyczne zapisanie
   - Wyświetlenie wskaźnika "Zapisywanie..."
   - Po zapisaniu - wskazanie "Zapisano"

3. **Kliknięcie "Waliduj założenia"**:
   - Zapisanie aktualnych zmian
   - Wyświetlenie wskaźnika ładowania przy przycisku
   - Wywołanie API walidacji
   - Wyświetlenie wyników walidacji po otrzymaniu odpowiedzi

4. **Kliknięcie na element feedbacku**:
   - Przewinięcie do odpowiedniego pola formularza
   - Ustawienie fokusu na tym polu

5. **Akceptacja sugestii**:
   - Aktualizacja odpowiedniego pola formularza wartością z sugestii
   - Oznaczenie sugestii jako zaakceptowanej
   - Inicjowanie zapisywania formularza

6. **Odrzucenie sugestii**:
   - Oznaczenie sugestii jako odrzuconej
   - Ukrycie sugestii po animacji

7. **Ocena przydatności sugestii**:
   - Wysłanie informacji o przydatności do API
   - Oznaczenie sugestii jako ocenionej
   - Ukrycie komponentu oceny

## 9. Warunki i walidacja

1. **Walidacja po stronie klienta**:
   - Limit długości dla pola celu projektu (1000 znaków)
   - Limit długości dla pola grupy docelowej (500 znaków)
   - Maksymalnie 10 funkcjonalności, każda o maksymalnej długości 200 znaków
   - Maksymalnie 5 ograniczeń, każde o maksymalnej długości 200 znaków

2. **Walidacja AI**:
   - Sprawdzanie kompletności założeń (wszystkie kluczowe obszary powinny być pokryte)
   - Sprawdzanie spójności między różnymi założeniami
   - Sprawdzanie realności założeń (np. czy nie są sprzeczne)
   - Analiza biznesowa założeń (czy są zgodne z dobrymi praktykami)

3. **Warunki wyświetlania**:
   - Sekcja walidacji jest widoczna tylko po wykonaniu walidacji
   - Sugestie są widoczne tylko po wykonaniu walidacji lub explicite zażądaniu sugestii
   - Wskaźnik ładowania jest pokazany tylko podczas operacji asynchronicznych
   - Przyciski akcji są wyłączone podczas odpowiednich operacji

## 10. Obsługa błędów

1. **Błędy pobierania projektu**:
   - Komunikat o błędzie z możliwością ponowienia
   - Dla błędu 404 - informacja o nieistnieniu projektu i przycisk powrotu do listy
   - Dla błędu 403 - informacja o braku uprawnień

2. **Błędy zapisywania**:
   - Wizualne wskazanie niepowodzenia zapisu
   - Automatyczne próby ponowienia (maks. 3)
   - Opcja ręcznego ponowienia zapisywania
   - Zachowanie zmian lokalnie na wypadek błędów sieciowych

3. **Błędy walidacji AI**:
   - Komunikat o problemach z usługą AI
   - Możliwość ponowienia operacji
   - Fallback do walidacji podstawowej (jeśli AI niedostępne)

4. **Błędy pobierania sugestii**:
   - Dyskretne powiadomienie o problemie
   - Opcja ponownego załadowania
   - Ukrycie sekcji sugestii w przypadku braku danych

## 11. Kroki implementacji

1. **Utworzenie plików komponentów**:
   ```
   src/components/assumptions/
     └── AssumptionsTabView.tsx
     └── AssumptionsForm.tsx
     └── ValidationButton.tsx
     └── ValidationResults.tsx
     └── FeedbackItem.tsx
     └── SuggestionsList.tsx
     └── SuggestionItem.tsx
     └── SuggestionFeedback.tsx
   ```

2. **Utworzenie plików hooks**:
   ```
   src/components/assumptions/hooks/
     └── useAssumptionsForm.ts
     └── useAssumptionsValidation.ts
     └── useSuggestions.ts
   ```

3. **Implementacja modeli widoku**:
   ```
   src/components/assumptions/types.ts
   ```

4. **Implementacja mapperów**:
   ```
   src/components/assumptions/mappers.ts
   ```

5. **Utworzenie strony Astro**:
   ```
   src/pages/projects/[id]/assumptions.astro
   ```

6. **Implementacja nawigacji między zakładkami**:
   - Aktualizacja komponentu nawigacji
   - Dodanie odpowiednich linków

7. **Implementacja komponentów formularza**:
   - Pola tekstowe z walidacją
   - Auto-save z debounce
   - Obsługa stanu UI

8. **Implementacja walidacji AI**:
   - Integracja z API
   - Wyświetlanie wyników
   - Obsługa błędów

9. **Implementacja sugestii AI**:
   - Mechanizm akceptacji/odrzucenia
   - Mechanizm feedbacku

10. **Testowanie integracji**:
    - Testy poprawności załadowania danych
    - Testy auto-save
    - Testy walidacji
    - Testy sugestii

11. **Optymalizacja dostępności**:
    - Dodanie odpowiednich atrybutów ARIA
    - Upewnienie się, że wszystko działa z klawiaturą
    - Sprawdzenie kontrastu kolorów

12. **Testy użyteczności**:
    - Upewnienie się, że UI jest intuicyjne
    - Sprawdzenie czytelności komunikatów
    - Sprawdzenie logicznego flow interakcji