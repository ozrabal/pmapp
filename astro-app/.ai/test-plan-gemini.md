# Plan Testów dla Projektu pmapp

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej `pmapp`. Projekt wykorzystuje nowoczesny stos technologiczny oparty na Astro, React, TypeScript, Tailwind CSS oraz Supabase jako backend. Aplikacja służy do zarządzania projektami, potencjalnie z wykorzystaniem funkcji opartych o sztuczną inteligencję. Celem planu jest zapewnienie systematycznego podejścia do weryfikacji jakości, funkcjonalności, wydajności i bezpieczeństwa aplikacji przed jej wdrożeniem.

### 1.2. Cele Testowania

Główne cele procesu testowania to:
*   Weryfikacja zgodności aplikacji z wymaganiami funkcjonalnymi i niefunkcjonalnymi.
*   Identyfikacja i raportowanie defektów w oprogramowaniu.
*   Zapewnienie wysokiej jakości i niezawodności aplikacji.
*   Ocena użyteczności i doświadczenia użytkownika (UX).
*   Weryfikacja bezpieczeństwa aplikacji, w szczególności mechanizmów autentykacji i autoryzacji.
*   Potwierdzenie stabilności i wydajności aplikacji pod obciążeniem.
*   Zapewnienie poprawnego działania integracji z usługami zewnętrznymi (Supabase, AI API).
*   Minimalizacja ryzyka związanego z wdrożeniem aplikacji na środowisko produkcyjne.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami:

*   **Autentykacja użytkowników:** Rejestracja, logowanie, wylogowanie, resetowanie hasła.
*   **Zarządzanie projektami (Dashboard):** Tworzenie, odczyt, aktualizacja, usuwanie (CRUD) projektów, filtrowanie, paginacja, wyszukiwanie.
*   **Szczegóły projektu:** Wyświetlanie informacji o projekcie, nawigacja po zakładkach (np. Opis, Założenia, Harmonogram), edycja poszczególnych sekcji.
*   **Funkcjonalności Harmonogramu:** Dodawanie, edycja, usuwanie etapów, zarządzanie zależnościami, walidacja danych.
*   **Integracja z AI:** Funkcje wykorzystujące AI (np. generowanie opisów, analiza danych - jeśli dotyczy), obsługa błędów API AI.
*   **API Endpoints:** Bezpośrednie testy punktów końcowych API (walidacja wejścia/wyjścia, obsługa błędów, autoryzacja).
*   **Middleware:** Weryfikacja logiki middleware (np. sprawdzanie sesji użytkownika).
*   **Routing i Nawigacja:** Poprawność działania routingu, płynność przejść między stronami (Astro View Transitions).
*   **Interfejs Użytkownika (UI):** Poprawność wyświetlania komponentów, responsywność, spójność wizualna, działanie komponentów interaktywnych (React).
*   **Obsługa Błędów:** Wyświetlanie komunikatów o błędach, odporność na niepoprawne dane wejściowe.

### 2.2. Funkcjonalności wyłączone z testów:

*   Testowanie wewnętrznej implementacji bibliotek zewnętrznych (np. Shadcn/ui, React, Astro), chyba że ich użycie prowadzi do błędów w aplikacji.
*   Testowanie infrastruktury Supabase/DigitalOcean (zakładamy ich stabilność).
*   Kompleksowe testy penetracyjne (mogą być przedmiotem osobnego zlecenia).

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   Cel: Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, hooki, serwisy, utility).
    *   Narzędzia: Vitest (lub Jest), React Testing Library.
    *   Zakres: Funkcje pomocnicze (`src/lib/utils.ts`), logika serwisów (`src/lib/services`), niestandardowe hooki React (`src/components/hooks`), walidacja Zod (`src/lib/schemas`), komponenty React (logika stanu, renderowanie warunkowe).
*   **Testy Integracyjne (Integration Tests):**
    *   Cel: Weryfikacja współpracy pomiędzy różnymi modułami/komponentami systemu.
    *   Narzędzia: Vitest/Jest, React Testing Library, Supertest (dla API), Mock Service Worker (MSW) lub mockowanie klienta Supabase/AI API.
    *   Zakres: Interakcja komponentów React, przepływ danych między frontendem a API, działanie API routes z mockowaną bazą danych/AI, działanie middleware.
*   **Testy End-to-End (E2E Tests):**
    *   Cel: Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce, weryfikacja kompletnych przepływów funkcjonalnych.
    *   Narzędzia: Playwright lub Cypress.
    *   Zakres: Kluczowe ścieżki użytkownika (rejestracja -> logowanie -> stworzenie projektu -> edycja -> wylogowanie), złożone interakcje w harmonogramie, działanie View Transitions.
*   **Testy Wizualnej Regresji (Visual Regression Tests):**
    *   Cel: Wykrywanie niezamierzonych zmian w wyglądzie interfejsu użytkownika.
    *   Narzędzia: Playwright/Cypress z integracją np. Percy.io lub Chromatic.
    *   Zakres: Kluczowe strony i komponenty, responsywność, dark mode (jeśli dotyczy).
*   **Testy Wydajnościowe (Performance Tests):**
    *   Cel: Ocena szybkości ładowania stron, czasu odpowiedzi API, zużycia zasobów.
    *   Narzędzia: Lighthouse, WebPageTest, K6 (dla API).
    *   Zakres: Czas ładowania kluczowych stron (Dashboard, Szczegóły Projektu), czas odpowiedzi API pod obciążeniem (np. pobieranie listy projektów).
*   **Testy Dostępności (Accessibility Tests):**
    *   Cel: Weryfikacja zgodności aplikacji ze standardami dostępności (WCAG).
    *   Narzędzia: Axe DevTools (integracja z Playwright/Cypress), manualne testy z czytnikami ekranu.
    *   Zakres: Nawigacja klawiaturą, kontrast kolorów, atrybuty ARIA, semantyka HTML.
*   **Testy Bezpieczeństwa (Security Tests - podstawowe):**
    *   Cel: Identyfikacja podstawowych luk bezpieczeństwa.
    *   Narzędzia: OWASP ZAP (podstawowy skan), manualna weryfikacja (np. sprawdzanie nagłówków HTTP, obsługa sesji, walidacja danych wejściowych).
    *   Zakres: Podatności OWASP Top 10 (na podstawowym poziomie), kontrola dostępu do API, bezpieczeństwo JWT.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

*(Przykładowe scenariusze - pełna lista zostanie opracowana w osobnym dokumencie)*

**4.1. Autentykacja:**
*   **TC-AUTH-001:** Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
*   **TC-AUTH-002:** Próba rejestracji z istniejącym adresem email.
*   **TC-AUTH-003:** Próba rejestracji z niepoprawnym formatem email/hasła.
*   **TC-AUTH-004:** Pomyślne logowanie z poprawnymi danymi.
*   **TC-AUTH-005:** Próba logowania z niepoprawnym hasłem/email.
*   **TC-AUTH-006:** Pomyślne wylogowanie użytkownika.
*   **TC-AUTH-007:** Pomyślny proces resetowania hasła.
*   **TC-AUTH-008:** Weryfikacja ochrony tras wymagających zalogowania (próba dostępu bez sesji).

**4.2. Zarządzanie Projektami (Dashboard):**
*   **TC-DASH-001:** Pomyślne utworzenie nowego projektu z minimalnymi wymaganymi danymi.
*   **TC-DASH-002:** Wyświetlenie listy projektów użytkownika.
*   **TC-DASH-003:** Poprawne działanie paginacji listy projektów.
*   **TC-DASH-004:** Poprawne działanie filtrowania projektów (np. po statusie).
*   **TC-DASH-005:** Pomyślna edycja istniejącego projektu.
*   **TC-DASH-006:** Pomyślne usunięcie projektu (z potwierdzeniem).
*   **TC-DASH-007:** Wyświetlenie stanu pustego, gdy użytkownik nie ma projektów.

**4.3. Harmonogram Projektu:**
*   **TC-SCHED-001:** Pomyślne dodanie nowego etapu do harmonogramu.
*   **TC-SCHED-002:** Próba dodania etapu z niepoprawnymi danymi (np. daty, brak nazwy).
*   **TC-SCHED-003:** Pomyślna edycja istniejącego etapu.
*   **TC-SCHED-004:** Pomyślne usunięcie etapu.
*   **TC-SCHED-005:** Dodanie zależności między etapami.
*   **TC-SCHED-006:** Walidacja zależności (np. zapobieganie cyklom).
*   **TC-SCHED-007:** Poprawne wyświetlanie wizualizacji harmonogramu (jeśli dotyczy).

**4.4. Integracja z AI:**
*   **TC-AI-001:** Pomyślne wygenerowanie opisu projektu przez AI.
*   **TC-AI-002:** Obsługa błędu, gdy API AI jest niedostępne lub zwraca błąd.
*   **TC-AI-003:** Walidacja danych wejściowych przekazywanych do serwisu AI.
*   **TC-AI-004:** Walidacja odpowiedzi otrzymanej z serwisu AI (zgodność ze schematem Zod).

## 5. Środowisko Testowe

*   **Środowisko Lokalne Deweloperskie:** Do uruchamiania testów jednostkowych i integracyjnych podczas rozwoju. Wykorzystanie lokalnej instancji Supabase (`supabase start`).
*   **Środowisko Staging/Testowe:** Odseparowana instancja aplikacji wdrożona (np. na DigitalOcean lub innym dostawcy) z własną bazą danych Supabase (może być kopią produkcji lub dedykowaną instancją testową). Środowisko jak najbardziej zbliżone do produkcyjnego. Tutaj będą uruchamiane testy E2E, wydajnościowe, wizualnej regresji i UAT.
*   **Przeglądarki:** Testy E2E i manualne będą przeprowadzane na najnowszych wersjach przeglądarek: Chrome, Firefox, Safari, Edge.
*   **Urządzenia:** Testy responsywności na różnych rozdzielczościach ekranu (desktop, tablet, mobile) - symulacja w narzędziach deweloperskich przeglądarki oraz na rzeczywistych urządzeniach (jeśli dostępne).

## 6. Narzędzia do Testowania

*   **Frameworki Testowe:** Vitest (preferowany ze względu na Vite w Astro) lub Jest.
*   **Biblioteki do Testowania Komponentów:** React Testing Library.
*   **Testy E2E:** Playwright lub Cypress.
*   **Mockowanie API:** Mock Service Worker (MSW), `vi.mock` (Vitest), `jest.mock`.
*   **Testy API:** Supertest (dla testów integracyjnych API routes), K6 (dla testów wydajnościowych API).
*   **Testy Wizualnej Regresji:** Percy.io, Chromatic, lub wbudowane funkcje Playwright/Cypress.
*   **Testy Wydajności:** Lighthouse, WebPageTest, K6.
*   **Testy Dostępności:** Axe DevTools, czytniki ekranu (VoiceOver, NVDA).
*   **Zarządzanie Testami i Błędami:** Jira, TestRail, lub inne narzędzie (nawet proste Issues w GitHub).
*   **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów przy push/pull request).

## 7. Harmonogram Testów

*Harmonogram jest przykładowy i powinien być dostosowany do cyklu rozwoju projektu.*

*   **Sprint 1-N (Faza Rozwoju):**
    *   Ciągłe pisanie i uruchamianie testów jednostkowych i integracyjnych przez deweloperów.
    *   Konfiguracja i uruchamianie podstawowych testów E2E w CI.
    *   Stopniowe tworzenie scenariuszy testowych dla nowych funkcjonalności.
*   **Faza Stabilizacji (przed wydaniem):**
    *   Pełne wykonanie wszystkich zdefiniowanych scenariuszy testowych (manualnych i automatycznych E2E).
    *   Przeprowadzenie testów eksploracyjnych.
    *   Wykonanie testów wizualnej regresji.
    *   Przeprowadzenie testów wydajnościowych i dostępności.
    *   Testy UAT (User Acceptance Testing) przez interesariuszy/klienta.
*   **Po Wdrożeniu (Faza Utrzymania):**
    *   Testy regresji przed każdym mniejszym wdrożeniem/hotfixem.
    *   Okresowe przeglądy i aktualizacje istniejących testów.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów Fazy Stabilizacji):

*   Zakończenie implementacji funkcjonalności przewidzianych w danym wydaniu.
*   Pomyślne przejście wszystkich testów jednostkowych i integracyjnych w CI.
*   Dostępność stabilnego środowiska testowego (Staging).
*   Dostępność dokumentacji/specyfikacji testowanych funkcjonalności.
*   Gotowość zespołu QA.

### 8.2. Kryteria Wyjścia (Zakończenia Testów i Rekomendacji Wdrożenia):

*   Pomyślne wykonanie co najmniej 95% zdefiniowanych scenariuszy testowych E2E i manualnych.
*   Brak otwartych błędów krytycznych (blokujących) i wysokiego priorytetu.
*   Rozwiązanie lub świadoma akceptacja (z planem naprawy) błędów średniego i niskiego priorytetu.
*   Osiągnięcie zdefiniowanych celów wydajnościowych (np. wyniki Lighthouse > 80).
*   Potwierdzenie zgodności z podstawowymi wymaganiami dostępności.
*   Pomyślne przejście testów UAT (jeśli dotyczy).
*   Akceptacja wyników testów przez Product Ownera/Managera Projektu.

## 9. Role i Odpowiedzialności w Procesie Testowania

*   **Deweloperzy:**
    *   Pisanie i utrzymanie testów jednostkowych i integracyjnych dla swojego kodu.
    *   Naprawianie błędów zgłoszonych przez QA/UAT.
    *   Uczestnictwo w przeglądach kodu pod kątem testowalności.
    *   Wsparcie w konfiguracji środowisk testowych.
*   **Inżynier QA (Tester):**
    *   Tworzenie i utrzymanie planu testów oraz scenariuszy testowych.
    *   Projektowanie, implementacja i utrzymanie automatycznych testów E2E i wizualnej regresji.
    *   Wykonywanie testów manualnych i eksploracyjnych.
    *   Raportowanie i śledzenie błędów.
    *   Przeprowadzanie testów wydajnościowych i dostępności.
    *   Komunikacja wyników testów do zespołu i interesariuszy.
    *   Weryfikacja poprawek błędów.
*   **Product Owner / Manager Projektu:**
    *   Definiowanie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja błędów.
    *   Uczestnictwo w UAT.
    *   Podejmowanie decyzji o wdrożeniu na podstawie wyników testów.
*   **Interesariusze / Klient:**
    *   Uczestnictwo w UAT.
    *   Dostarczanie informacji zwrotnej na temat funkcjonalności i użyteczności.

## 10. Procedury Raportowania Błędów

*   **Narzędzie:** Dedykowane narzędzie do śledzenia błędów (np. Jira, GitHub Issues).
*   **Proces Zgłaszania:**
    1.  Tester identyfikuje błąd.
    2.  Tester sprawdza, czy błąd nie został już zgłoszony.
    3.  Tester tworzy nowy raport błędu zawierający:
        *   **Tytuł:** Krótki, zwięzły opis problemu.
        *   **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, środowisko (np. Staging).
        *   **Kroki do Reprodukcji:** Szczegółowa lista kroków pozwalająca na odtworzenie błędu.
        *   **Obserwowany Rezultat:** Co się stało po wykonaniu kroków.
        *   **Oczekiwany Rezultat:** Co powinno się stać.
        *   **Priorytet/Waga:** (np. Krytyczny, Wysoki, Średni, Niski) - wstępnie określony przez testera, może być zweryfikowany przez PO/PM.
        *   **Załączniki:** Zrzuty ekranu, nagrania wideo, logi konsoli/sieci.
*   **Cykl Życia Błędu:**
    1.  **Nowy (New/Open):** Zgłoszony przez testera.
    2.  **W Analizie (In Analysis/Triage):** Przeglądany przez PO/PM/Lead Dev w celu potwierdzenia i priorytetyzacji.
    3.  **Do Zrobienia (To Do/Assigned):** Przypisany do dewelopera.
    4.  **W Trakcie (In Progress):** Deweloper pracuje nad poprawką.
    5.  **Do Weryfikacji (Ready for QA/Resolved):** Poprawka zaimplementowana i wdrożona na środowisko testowe.
    6.  **Weryfikacja (In QA/Testing):** Tester weryfikuje poprawkę.
    7.  **Zamknięty (Closed):** Poprawka zweryfikowana pomyślnie.
    8.  **Odrzucony (Rejected/Invalid):** Błąd nie jest błędem, duplikat, nie da się odtworzyć.
    9.  **Ponownie Otwarty (Reopened):** Weryfikacja nie powiodła się, błąd nadal występuje.
*   **Komunikacja:** Regularne spotkania (np. daily stand-up, sesje triage błędów) w celu omówienia statusu błędów i priorytetów.
