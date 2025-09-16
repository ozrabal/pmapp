Główne wymagania architektury UI
Plan My App to aplikacja wspomagana przez AI do planowania projektów aplikacji. Na podstawie przeprowadzonej analizy zdecydowano, że architektura UI będzie oparta na następujących zasadach:

Hybrydowe podejście Astro/React - strony statyczne zaimplementowane w Astro, a interaktywne komponenty w React 19
Wizualne rozróżnienie treści użytkownika i sugestii AI - wyraźne oznaczenie treści generowanych przez AI
Uproszczone wizualizacje w MVP - priorytetyzacja prostoty i funkcjonalności nad zaawansowaną wizualizacją
Responsywny design - interfejs dostosowany do różnych rozmiarów ekranów poprzez Tailwind
Wieloetapowy proces tworzenia projektu - kierowanie użytkownika przez logiczny ciąg kroków
Zintegrowane powiadomienia o błędach - widoczne komunikaty z możliwością ponowienia operacji
Proste zarządzanie stanem - wykorzystanie kontekstu React i hooków bez złożonych bibliotek
Struktura stron i komponentów
Hierarchia stron
Obszar publiczny (Astro - statyczny)

Strona główna (marketing)
Strony logowania i rejestracji
Strona resetowania hasła
Strony informacyjne (O nas, Polityka prywatności)
Obszar chroniony (React - interaktywny)

Dashboard projektów (lista projektów z filtrowaniem)
Kreator nowego projektu
Edycja projektu podzielona na zakładki:
Założenia projektu
Bloki funkcjonalne
Harmonogram
Profil użytkownika
Główne komponenty
Komponenty layoutu

Layout dla obszaru publicznego
Layout dla obszaru chronionego (z bocznym menu)
Komponenty nawigacji

Główna nawigacja (różna dla zalogowanych i niezalogowanych)
Boczne menu dla zalogowanych użytkowników
Menu użytkownika (z opcjami edycji profilu i wylogowania)
Komponenty projektów

Karty projektów na dashboardzie
Formularze edycji projektu (z walidacją)
Listy bloków funkcjonalnych (z możliwością rozwijania)
Lista elementów harmonogramu
Komponenty AI

Wyróżnione wizualnie sugestie AI
Przyciski akceptacji/odrzucenia sugestii
Komponenty oceny przydatności sugestii (thumbs up/down)
Komponenty wspólne

Wskaźniki ładowania (skeletony, spinnery)
Powiadomienia (inline dla ważnych, toasty dla mniej istotnych)
Komponenty eksportu danych
Kluczowe przepływy użytkownika
Proces rejestracji i logowania
Użytkownik rejestruje się podając podstawowe dane
Potwierdza rejestrację przez email
Loguje się do aplikacji
Jest przekierowywany do dashboardu projektów
Tworzenie i edycja projektu
Użytkownik tworzy nowy projekt z poziomu dashboardu
Przechodzi przez etapy definiowania projektu:
Wprowadza podstawowe informacje (nazwa, opis)
Definiuje założenia projektu (cel, grupa docelowa, funkcjonalności)
Otrzymuje i ocenia sugestie AI dotyczące założeń
Generuje bloki funkcjonalne przy pomocy AI
Modyfikuje i akceptuje bloki funkcjonalne
Generuje harmonogram przy pomocy AI
Modyfikuje i akceptuje harmonogram
Może eksportować dane projektu w prostym formacie
Interakcja z AI
Użytkownik wprowadza dane
System wyświetla wskaźnik ładowania podczas przetwarzania przez AI
Sugestie AI pojawiają się z wyróżnieniem wizualnym
Użytkownik może akceptować/odrzucać sugestie
Użytkownik może oceniać przydatność sugestii
System zapisuje feedback dla doskonalenia AI
Strategia integracji z API
Autentykacja i autoryzacja

Wykorzystanie Supabase do zarządzania JWT
Integracja tokenów we wszystkich żądaniach
Implementacja przekierowań dla chronionych tras
Zarządzanie stanem aplikacji

Użycie kontekstu React dla globalnego stanu (status autentykacji, aktywny projekt)
Implementacja custom hooków dla operacji na projektach
Lokalne zarządzanie stanem komponentów poprzez useState/useReducer
Obsługa długotrwałych operacji

Wizualne wskaźniki postępu dla generacji przez AI
Spinner dla krótkich operacji, paski postępu dla dłuższych
Auto-save podczas edycji projektu
Obsługa błędów

Standardowe komunikaty błędów dla problemów z API
Możliwość ponowienia operacji po błędzie
Powiadomienia inline dla krytycznych błędów, toasty dla mniej istotnych
Responsywność i dostępność
Strategie responsywności

Wykorzystanie breakpointów Tailwind (sm, md, lg, xl)
Priorytet dla widoku desktop z pełną obsługą mobile
Elastyczne siatki i komponenty dostosowujące się do rozmiaru ekranu
Zwijane boczne menu na urządzeniach mobilnych
Dostępność

Właściwe etykiety dla pól formularzy
Obsługa klawiatury dla wszystkich interaktywnych elementów
Komunikaty dla czytników ekranowych
Wystarczający kontrast kolorów
Integracja z technologiami
Shadcn/ui

Wykorzystanie gotowych komponentów (Button, Card, Dialog, Tabs, Form)
Spójna stylizacja przez Tailwind
Customizacja komponentów zgodnie z potrzebami aplikacji
Supabase

Integracja autentykacji
Operacje CRUD na projektach
Przechowywanie danych użytkownika
Vercel AI SDK

Komunikacja z modelami AI dla generowania sugestii
Obsługa kontekstu konwersacji z AI
Zarządzanie strumieniowaniem odpowiedzi</ui_architecture_planning_summary>
<unresolved_issues> 1. Szczegółowa strategia testowania komponentów UI nie została jeszcze określona. 2. Dokładny mechanizm auto-save danych projektu wymaga doprecyzowania. 3. Strategia optymalizacji wydajności dla dużych projektów z wieloma blokami funkcjonalnymi nie została szczegółowo zdefiniowana. 4. Potrzebne jest określenie dokładnego wyglądu i zachowania zwijanych elementów na urządzeniach mobilnych. 5. Wymagane jest doprecyzowanie strategii monitorowania i analizy aktywności użytkownika w interfejsie. 6. Konieczne jest ustalenie szczegółowych kryteriów dostępności i zgodności ze standardami WCAG. </unresolved_issues> </conversation_summary>