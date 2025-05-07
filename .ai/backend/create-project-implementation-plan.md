# API Endpoint Implementation Plan: Create Project

## 1. Przegląd punktu końcowego
Endpoint umożliwia utworzenie nowego projektu dla zalogowanego użytkownika. Sprawdza limit projektów użytkownika przed utworzeniem nowego i zapisuje go w bazie danych. Zwraca dane nowo utworzonego projektu w przypadku powodzenia.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/projects`
- **Parametry**:
  - **Wymagane**: Brak parametrów URL
  - **Opcjonalne**: Brak parametrów URL
- **Request Body**:
  ```typescript
  {
    "name": string,         // Wymagane - nazwa projektu
    "description": string   // Opcjonalne - opis projektu
  }
  ```

## 3. Wykorzystywane typy
- **DTOs**:
  - `CreateProjectRequestDto` - Struktura danych żądania
  - `CreateProjectResponseDto` - Struktura danych odpowiedzi 
  - `ErrorResponseDto` - Format komunikatów błędów
- **Schematy walidacyjne Zod**:
  - `createProjectSchema` - Schemat walidacji danych wejściowych

## 4. Szczegóły odpowiedzi
- **Status 201 Created**:
  ```typescript
  {
    "id": string,          // UUID projektu
    "name": string,        // Nazwa projektu
    "description": string, // Opis projektu (null jeśli nie podano)
    "createdAt": string    // Data utworzenia w formacie ISO
  }
  ```
- **Status 400 Bad Request**:
  ```typescript
  {
    "error": {
      "code": "invalid_input",
      "message": "Nieprawidłowe dane wejściowe",
      "details": { ... } // Szczegóły błędów walidacji
    }
  }
  ```
- **Status 401 Unauthorized**:
  ```typescript
  {
    "error": {
      "code": "unauthorized",
      "message": "Wymagane uwierzytelnienie"
    }
  }
  ```
- **Status 403 Forbidden**:
  ```typescript
  {
    "error": {
      "code": "limit_exceeded",
      "message": "Osiągnięto limit projektów dla tego konta"
    }
  }
  ```

## 5. Przepływ danych
1. Żądanie trafia do endpointu POST `/api/projects`
2. Middleware uwierzytelniania sprawdza token użytkownika
3. Dane z body żądania są walidowane za pomocą schematu Zod
4. Service pobiera profil użytkownika i sprawdza limit projektów
5. W przypadku braku osiągnięcia limitu, service tworzy nowy projekt w bazie danych
6. Endpoint zwraca odpowiedź z danymi utworzonego projektu
7. W przypadku błędu, odpowiedni komunikat i kod statusu są zwracane

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymaga poprawnego uwierzytelnienia za pomocą middleware Supabase
- **Autoryzacja**: Sprawdzanie uprawnień użytkownika poprzez middleware
- **Walidacja danych**:
  - Sprawdzanie poprawności formatu i obecności wymaganych pól
  - Sanityzacja danych wejściowych przed użyciem w zapytaniach SQL
  - Limitowanie długości pól name (max 200 znaków) i description
- **Bezpieczna komunikacja z bazą danych**:
  - Użycie parametryzowanych zapytań poprzez Supabase
  - Unikanie SQL Injection przez korzystanie z API Supabase
- **Row-Level Security (RLS)**:
  - Poprawne ustawienie kontekstu użytkownika w zapytaniach Supabase
  - Weryfikacja zgodności identyfikatora zalogowanego użytkownika z identyfikatorem w zapytaniu
  - Obsługa przypadków, gdy zapytanie jest wykonywane bez aktywnej sesji użytkownika

## 7. Obsługa błędów
- **Błędy walidacji** (400 Bad Request):
  - Nieprawidłowy format danych
  - Brak wymaganych pól
  - Przekroczenie maksymalnej długości pól
- **Błędy uwierzytelniania** (401 Unauthorized):
  - Brak tokenu uwierzytelniającego
  - Nieprawidłowy token
  - Token wygasł
- **Błędy autoryzacji** (403 Forbidden):
  - Osiągnięcie limitu projektów dla użytkownika
  - Próba tworzenia projektu dla innego użytkownika
- **Błędy Row-Level Security (RLS)** (403 Forbidden):
  - Naruszenie polityki RLS przy tworzeniu projektu
  - Brak explicity podanego user_id gdy nie istnieje aktywna sesja
- **Błędy serwera** (500 Internal Server Error):
  - Problemy z połączeniem z bazą danych
  - Nieoczekiwane wyjątki podczas przetwarzania żądania

## 8. Rozważania dotyczące wydajności
- Indeksowanie kolumny `user_id` w tabeli `projects` dla szybszego wyszukiwania projektów użytkownika
- Cachowanie wartości limitu projektów dla częstych użytkowników
- Monitorowanie liczby zapytań do bazy danych w celu identyfikacji potencjalnych wąskich gardeł

## 9. Etapy wdrożenia
1. **Rozszerzenie schematu walidacji projektu**:
   - Dodanie `createProjectSchema` do istniejącego pliku `src/lib/schemas/project.schema.ts`

2. **Rozszerzenie serwisu projektu**:
   - Dodanie metody `createProject` w `src/lib/services/project.service.ts`
   - Implementacja logiki sprawdzania limitu projektów
   - Implementacja tworzenia projektu w bazie danych
   - Rozszerzenie metody o weryfikację kontekstu uwierzytelniania
   - Poprawna obsługa Row-Level Security

3. **Utworzenie endpointu**:
   - Implementacja funkcji obsługi POST w `src/pages/api/projects.ts`
   - Dodanie walidacji danych wejściowych
   - Integracja z serwisem projektu
   - Implementacja odpowiednich odpowiedzi

4. **Testowanie**:
   - Testy jednostkowe dla funkcji walidacyjnych i serwisowych
   - Manualne testowanie endpointu pod kątem poprawnego działania
   - Testowanie scenariuszy błędów
   - Weryfikacja zgodności z politykami RLS

5. **Dokumentacja**:
   - Aktualizacja dokumentacji API
   - Dodanie komentarzy JSDoc do kodu

6. **Wdrożenie**:
   - Wdrożenie zmian w środowisku produkcyjnym
   - Monitorowanie działania endpointu

## 10. Integracja z Row-Level Security

### Sposoby obsługi RLS w Supabase

1. **Sprawdzanie kontekstu uwierzytelniania**:
   - Przed wykonaniem operacji INSERT sprawdzanie, czy klient Supabase ma aktywną sesję użytkownika
   - Jeśli sesja istnieje, używamy standardowego podejścia i pozwalamy RLS działać automatycznie
   - Jeśli sesja nie istnieje, musimy jawnie ustawić `user_id` na identyfikator użytkownika

2. **Implementacja warunków**:
   - Weryfikacja czy sesja.user.id zgadza się z userId przekazywanym jako parametr
   - W przypadku niezgodności, zgłaszanie błędu próby tworzenia projektu dla innego użytkownika

3. **Obsługa błędów RLS**:
   - Odpowiednie logowanie błędów naruszenia polityki RLS
   - Przekształcanie tych błędów na zrozumiałe komunikaty dla użytkownika końcowego