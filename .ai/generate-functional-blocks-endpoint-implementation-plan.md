# API Endpoint Implementation Plan: Generate Functional Blocks

## 1. Przegląd punktu końcowego

Ten endpoint umożliwia generowanie bloków funkcjonalnych dla projektu przy użyciu sztucznej inteligencji. Punkt końcowy przyjmuje identyfikator projektu, pobiera dane projektu, wykorzystuje serwis AI do wygenerowania bloków funkcjonalnych i aktualizuje projekt w bazie danych.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/projects/{id}/functional-blocks/generate`
- Parametry:
  - Wymagane: `id` (w ścieżce URL) - identyfikator projektu
- Request Body: Brak (wszystkie niezbędne dane są pobierane na podstawie ID projektu)

## 3. Wykorzystywane typy

```typescript
// Już zdefiniowane w projekcie
import type { 
  ProjectDto,
  FunctionalBlockDto, 
  GenerateFunctionalBlocksResponseDto,
  UpdateProjectRequestDto, 
  UpdateProjectResponseDto,
  ErrorResponseDto
} from "../../types";
```

## 4. Szczegóły odpowiedzi

### Sukces (200 OK)
```json
{
  "functionalBlocks": {
    "blocks": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "dependencies": ["string"],
        "order": 1
      }
    ]
  }
}
```

### Błędy
- 401 Unauthorized - Użytkownik nie jest zalogowany
- 403 Forbidden - Użytkownik nie ma uprawnień do tego projektu
- 404 Not Found - Projekt nie został znaleziony
- 500 Internal Server Error - Nieoczekiwany błąd serwera

## 5. Przepływ danych

1. Endpoint odbiera żądanie POST z ID projektu w ścieżce URL.
2. Walidacja ID projektu za pomocą biblioteki Zod.
3. Pobranie danych użytkownika z kontekstu żądania (context.locals).
4. Walidacja autentykacji - sprawdzenie czy użytkownik jest zalogowany.
5. Użycie ProjectService do pobrania danych projektu z bazy danych.
6. Walidacja dostępu - sprawdzenie czy użytkownik jest właścicielem projektu.
7. Przygotowanie danych kontekstowych projektu (nazwa, opis, założenia) dla serwisu AI.
8. Wywołanie metody serwisu AI do generowania bloków funkcjonalnych.
9. Aktualizacja projektu w bazie danych o wygenerowane bloki funkcjonalne.
10. Zwrócenie wygenerowanych bloków funkcjonalnych jako odpowiedzi.

## 6. Względy bezpieczeństwa

1. **Autentykacja i autoryzacja**:
   - Sprawdzenie czy użytkownik jest zalogowany (użycie context.locals.supabase.auth.session)
   - Sprawdzenie czy użytkownik jest właścicielem projektu (porównanie user_id w rekordzie projektu)

2. **Walidacja danych**:
   - Walidacja parametrów ścieżki URL za pomocą Zod
   - Walidacja wygenerowanych danych przed zapisem do bazy

3. **Obsługa błędów**:
   - Logowanie błędów dla celów diagnostycznych
   - Nie ujawnianie szczegółów błędów wewnętrznych użytkownikowi końcowemu

## 7. Obsługa błędów

1. **Błędy autentykacji**:
   - Brak sesji użytkownika -> 401 Unauthorized

2. **Błędy autoryzacji**:
   - Użytkownik nie jest właścicielem projektu -> 403 Forbidden

3. **Błędy zasobów**:
   - Projekt nie istnieje -> 404 Not Found

4. **Błędy serwisu AI**:
   - Problemy z łącznością z API AI -> 500 Internal Server Error
   - Przekroczenie limitów API -> 429 Too Many Requests

5. **Błędy bazy danych**:
   - Problemy z aktualizacją projektu -> 500 Internal Server Error
   - Konflikt danych -> 409 Conflict

## 8. Rozważania dotyczące wydajności

1. **Operacje asynchroniczne**:
   - Generowanie bloków funkcjonalnych może być czasochłonne - rozważyć implementację mechanizmu długotrwałych zadań
   - Implementacja limitów czasowych dla operacji AI, aby zapobiec zbyt długiemu przetwarzaniu

2. **Buforowanie**:
   - Implementacja mechanizmu buforowania dla podobnych zapytań
   - Unikanie wielokrotnych zapytań do bazy danych dla tych samych danych

## 9. Etapy wdrożenia

1. **Utworzenie pliku endpointu**:
   - Utworzyć plik `src/pages/api/projects/[id]/functional-blocks/generate.ts`

2. **Implementacja metody POST**:
   - Definicja schematu walidacji parametrów (id projektu)
   - Implementacja logiki obsługi żądania zgodnie z opisanym przepływem danych
   - Dodanie zmiennej `export const prerender = false` zgodnie z wymogami Astro

3. **Rozszerzenie AiService**:
   - W przypadku braku, dodanie metody `generateFunctionalBlocks` do serwisu AI w `src/lib/services/ai.service.ts`
   - Implementacja logiki generowania bloków funkcjonalnych za pomocą AI
   - Zapewnienie obsługi błędów i mechanizmów fallbackowych

4. **Rozszerzenie ProjectService**:
   - Dodanie metody do obsługi generowania bloków funkcjonalnych i aktualizacji projektu

5. **Testy**:
   - Testy jednostkowe dla nowych metod serwisów
   - Testy integracyjne dla nowego endpointu API
   - Testy ręczne end-to-end

6. **Dokumentacja**:
   - Aktualizacja dokumentacji API o nowy endpoint
   - Aktualizacja dokumentacji dla developerów o nowej funkcjonalności

7. **Wdrożenie**:
   - Code review
   - Merge do głównej gałęzi
   - Deployment zmian