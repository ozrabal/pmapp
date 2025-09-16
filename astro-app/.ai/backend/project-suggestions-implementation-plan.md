# API Endpoint Implementation Plan: Get Project Suggestions

## 1. Przegląd punktu końcowego
Endpoint POST `/api/projects/{id}/suggestions` służy do generowania sugestii AI dotyczących definicji projektu. Umożliwia użytkownikom otrzymywanie inteligentnych rekomendacji dotyczących ich projektu na podstawie istniejących danych, takich jak nazwa, opis, założenia i bloki funkcjonalne. Endpoint pozwala również na opcjonalne sprecyzowanie obszaru, na którym sugestie powinny się koncentrować.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/projects/{id}/suggestions`
- Parametry:
  - Wymagane: 
    - `id`: UUID projektu w ścieżce URL
  - Opcjonalne:
    - Brak parametrów opcjonalnych w URL
- Request Body (opcjonalnie):
  ```json
  {
    "focus": "string"  // Opcjonalny parametr określający obszar na którym mają się skupić sugestie
  }
  ```

## 3. Wykorzystywane typy
Na podstawie przeglądu istniejących typów potrzebujemy:

**Istniejące typy**:
- `SuggestionDto` - struktura reprezentująca pojedynczą sugestię
- `GetProjectSuggestionsRequestDto` - struktura reprezentująca opcjonalne parametry żądania
- `GetProjectSuggestionsResponseDto` - struktura reprezentująca odpowiedź zawierającą sugestie

**Typy w warstwie serwisu**:
```typescript
// Parametry dla metody serwisowej
interface GetSuggestionsParams {
  projectId: string; 
  userId: string;
  focus?: string;
}

// Dane projektu używane do generowania sugestii
interface ProjectSuggestionContext {
  id: string;
  name: string;
  description: string | null;
  assumptions: any | null;
  functionalBlocks: any | null;
  schedule: any | null;
}
```

## 4. Szczegóły odpowiedzi
- Status sukcesu: 200 OK
- Body odpowiedzi:
  ```json
  {
    "suggestions": [
      {
        "id": "string",
        "type": "string",
        "content": "string",
        "reason": "string"
      }
    ]
  }
  ```

- Potencjalne kody błędów:
  - 401 Unauthorized - użytkownik nie jest zalogowany
  - 403 Forbidden - użytkownik nie ma dostępu do danego projektu
  - 404 Not Found - projekt nie został znaleziony
  - 500 Internal Server Error - wewnętrzny błąd serwera

## 5. Przepływ danych
1. Użytkownik wysyła żądanie POST na `/api/projects/{id}/suggestions` z opcjonalnym parametrem `focus` w ciele żądania
2. Middleware uwierzytelniające sprawdza, czy użytkownik jest zalogowany; jeśli nie - odpowiedź 401
3. Endpoint pobiera ID projektu z URL i opcjonalny parametr `focus` z ciała żądania
4. Endpoint weryfikuje format danych wejściowych za pomocą walidacji Zod
5. Endpoint wywołuje metodę `getProjectSuggestions` z `ProjectService`
6. `ProjectService` sprawdza, czy projekt istnieje i czy bieżący użytkownik ma do niego dostęp:
   - Jeśli projekt nie istnieje - odpowiedź 404
   - Jeśli użytkownik nie ma dostępu - odpowiedź 403
7. `ProjectService` pobiera dane projektu z bazy danych
8. `ProjectService` wywołuje metodę `generateProjectSuggestions` z `AiService`, przekazując kontekst projektu i opcjonalny parametr `focus`
9. `AiService` analizuje dane projektu i generuje sugestie (w pierwszej implementacji jako mock)
10. Sugestie są zwracane do `ProjectService`, który przekazuje je z powrotem do endpoint
11. Endpoint formatuje odpowiedź zgodnie z DTO i zwraca ją z kodem 200 OK

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie:** Endpoint wymaga, aby użytkownik był uwierzytelniony, wykorzystując mechanizm middleware Astro.
2. **Autoryzacja:** Endpoint musi sprawdzić, czy zalogowany użytkownik ma dostęp do projektu o podanym ID, poprzez weryfikację pola `user_id` w rekordzie projektu.
3. **Walidacja danych wejściowych:** Wszystkie dane wejściowe powinny być walidowane za pomocą Zod:
   - ID projektu: Poprawny format UUID
   - Parameter `focus`: opcjonalny string o maksymalnej długości 100 znaków
4. **Rate limiting:** Warto rozważyć implementację limitów żądań dla tego endpointu, aby zapobiec przeciążeniu API lub nadużyciom (np. 5 żądań na minutę na użytkownika).
5. **Izolacja danych:** Zapewnić, że generowane sugestie nie zawierają wrażliwych danych między projektami różnych użytkowników.

## 7. Obsługa błędów
1. **Przypadki błędów:**
   - Projekt nie istnieje: 404 Not Found
   - Użytkownik nie ma dostępu do projektu: 403 Forbidden
   - Użytkownik nie jest uwierzytelniony: 401 Unauthorized
   - Nieprawidłowy format danych wejściowych: 400 Bad Request
   - Błąd usługi AI: 500 Internal Server Error
   - Przekroczenie limitów żądań: 429 Too Many Requests

2. **Obsługa błędów:**
   - Wszystkie błędy powinny być logowane do systemu logowania.
   - Błędy powinny być formatowane zgodnie z istniejącym wzorcem ErrorResponseDto.
   - Odpowiedź powinna zawierać czytelny komunikat błędu, kod błędu i ewentualne szczegóły.
   - Wyjątki powinny być przechwytywane i nie powinny powodować awarii serwera.

## 8. Rozważania dotyczące wydajności
1. **Caching:** Warto rozważyć caching sugestii dla tego samego projektu (z tym samym parametrem `focus`) na krótki czas (np. 1 godz.), aby zmniejszyć obciążenie usługi AI.
2. **Asynchroniczne przetwarzanie:** Jeśli generowanie sugestii zajmuje dużo czasu, warto rozważyć zaimplementowanie asynchronicznego przetwarzania z mechanizmem powiadamiania.
3. **Limitowanie rozmiaru odpowiedzi:** Ograniczenie liczby sugestii zwracanych w odpowiedzi (np. maksymalnie 10).
4. **Optymalizacja zapytań bazy danych:** Pobieranie tylko niezbędnych danych projektu potrzebnych do generowania sugestii.

## 9. Etapy wdrożenia
1. **Aktualizacja interfejsu usługi AI**
   - Dodać nową metodę `generateProjectSuggestions` do klasy `AiService` w pliku `src/lib/services/ai.service.ts`.
   - Zaimplementować mock zwracający przykładowe sugestie.

2. **Aktualizacja usługi Project**
   - Dodać nową metodę `getProjectSuggestions` do klasy `ProjectService` w pliku `src/lib/services/project.service.ts`.
   - Metoda powinna pobierać projekt, sprawdzać dostęp użytkownika i wywoływać usługę AI.

3. **Dodać schemat walidacji Zod**
   - Utworzyć schemat walidacji dla `GetProjectSuggestionsRequestDto` w pliku `src/lib/schemas/project.schema.ts`.

4. **Implementacja endpointu API**
   - Utworzyć nowy plik `src/pages/api/projects/[id]/suggestions.ts`.
   - Zaimplementować obsługę metody POST zgodnie z przepływem danych.
   - Dodać walidację danych wejściowych za pomocą Zod.
   - Obsłużyć wszystkie przypadki błędów.

5. **Aktualizacja klienta usługi Project**
   - Dodać nową metodę `getProjectSuggestions` do klasy `ProjectClientService` w pliku `src/lib/services/project.service.ts`.

6. **Testowanie**
   - Utworzyć testy jednostkowe dla nowych metod.
   - Przetestować endpoint za pomocą narzędzi takich jak Postman lub curl.
   - Sprawdzić obsługę przypadków błędów.

7. **Dokumentacja**
   - Zaktualizować dokumentację API (jeśli istnieje).
   - Dodać komentarze JSDoc do nowych metod.

8. **Wdrożenie**
   - Przeprowadzić przegląd kodu przed wdrożeniem (code review).
   - Wdrożyć zmiany w środowisku produkcyjnym.