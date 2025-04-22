# API Endpoint Implementation Plan: List Projects

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania listy projektów dla aktualnie uwierzytelnionego użytkownika. Umożliwia filtrowanie po statusie oraz paginację wyników.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/projects`
- **Parametry zapytania**:
  - **Opcjonalne**:
    - `status`: filtr projektów wg statusu.
    - `page`: numer strony dla paginacji.
    - `limit`: liczba wyników na stronę.
    - `sort`: pole oraz kierunek sortowania wyników.
- **Request Body**: Brak

## 3. Wykorzystywane typy
- **ProjectSummaryDto** – pojedynczy projekt.
- **PaginationDto** – dane paginacyjne.
- **ListProjectsResponseDto** – struktura odpowiedzi zawierająca listę projektów oraz paginację.

## 4. Przepływ danych
1. **Odbiór żądania**: Endpoint przyjmuje żądanie GET na `/api/projects` zawierające opcjonalne parametry zapytania.
2. **Weryfikacja autentyczności**: Sprawdzenie, czy użytkownik jest uwierzytelniony.
3. **Walidacja parametrów**: Walidacja parametrów query (`status`, `page`, `limit`, `sort`) – użyć schematu zod lub manualnej walidacji.
4. **Logika biznesowa**: Przekazanie parametrów do serwisu (np. `ProjectService`) odpowiedzialnego za pobieranie danych z bazy.
5. **Pobranie danych**: Zapytanie do bazy danych poprzez Supabase, filtrowanie wyników według statusu oraz paginacja.
6. **Mapowanie wyników**: Konwersja danych z bazy do DTO: `ProjectSummaryDto` oraz `PaginationDto`.
7. **Odpowiedź**: Zwrócenie obiektu `ListProjectsResponseDto` z kodem 200 OK.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja**: Endpoint dostępny wyłącznie dla zalogowanych użytkowników. Użycie middleware do sprawdzania tokena lub innego mechanizmu autoryzacji.
- **Walidacja wejścia**: Zapewnienie, że wszystkie parametry są poprawne i oczyszczone przed przetwarzaniem.
- **Ograniczenie dostępu do danych**: Zwracanie jedynie projektów przypisanych do aktualnego użytkownika.

## 6. Obsługa błędów
- **401 Unauthorized**: Gdy użytkownik nie jest uwierzytelniony.
- **400 Bad Request**: Gdy walidacja parametrów zapytania nie powiedzie się.
- **500 Internal Server Error**: W razie błędów wewnętrznych (np. problem z bazą danych).
- **Logowanie błędów**: Wszystkie błędy powinny być odpowiednio logowane z użyciem istniejącego systemu logowania.

## 7. Rozważania dotyczące wydajności
- **Paginacja**: Wykorzystanie paginacji do ograniczenia ilości danych przetwarzanych i przesyłanych w jednym zapytaniu.
- **Indeksowanie**: Upewnić się, że kolumny używane do filtrowania i sortowania są poprawnie zindeksowane w bazie danych.
- **Cache'owanie**: Rozważyć zastosowanie cache'owania, jeżeli zapytania będą bardzo obciążone.

## 8. Etapy wdrożenia
1. **Utworzenie walidacji**: Zaimplementować walidację parametrów zapytania (np. z użyciem zod).
2. **Implementacja middleware**: Zapewnić autoryzację użytkownika.
3. **Stworzenie serwisu**: Utworzyć lub rozbudować serwis `ProjectService` w folderze `src/lib/services` odpowiedzialny za pobieranie danych z bazy.
4. **Implementacja endpointu**: Utworzyć plik API endpointu w `src/pages/api/projects.ts`:
   - Odebranie i walidacja parametrów.
   - Sprawdzenie uprawnień użytkownika.
   - Wywołanie serwisu w celu pobrania listy projektów.
   - Mapowanie i wysłanie odpowiedzi zgodnej z `ListProjectsResponseDto`.
5. **Testy**: Utworzyć unit testy dla endpointu oraz serwisu obejmujące:
   - Scenariusze udanego pobrania danych (200 OK).
   - Błędy walidacji (400 Bad Request).
   - Błędy autoryzacji (401 Unauthorized).
   - Symulację błędów wewnętrznych (500 Internal Server Error).
6. **Code Review i dokumentacja**: Upewnić się, że implementacja jest zgodna z wytycznymi projektowymi oraz udokumentować kod i logikę biznesową.
