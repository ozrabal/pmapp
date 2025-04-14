# Architektura UI dla Plan My App

## 1. Przegląd struktury UI

Plan My App to aplikacja wspomagana przez AI do planowania projektów aplikacji. Struktura UI aplikacji jest podzielona na dwa główne obszary:

1. **Obszar publiczny (Astro - statyczny)** - dostępny dla niezalogowanych użytkowników, zawierający stronę główną, logowanie, rejestrację i strony informacyjne.
2. **Obszar chroniony (React - interaktywny)** - dostępny po zalogowaniu, zawierający dashboard projektów, kreator projektów i widoki edycji.

Kluczowe założenia architektury UI:
- Hybrydowe podejście Astro/React - strony statyczne zaimplementowane w Astro, a interaktywne komponenty w React
- Wizualne rozróżnienie treści użytkownika i sugestii AI
- Uproszczone wizualizacje w MVP z priorytetyzacją funkcjonalności
- Responsywny design z Tailwind
- Wieloetapowy proces tworzenia projektu
- Zintegrowane powiadomienia o błędach
- Proste zarządzanie stanem z wykorzystaniem kontekstu React i hooków

## 2. Lista widoków

### Obszar publiczny

#### Strona główna (marketing)
- **Ścieżka:** `/`
- **Główny cel:** Przyciągnięcie nowych użytkowników, wyjaśnienie wartości aplikacji
- **Kluczowe informacje:** Opis produktu, główne korzyści, wezwanie do działania
- **Kluczowe komponenty:**
  - Hero section z tytułem, opisem i przyciskiem CTA
  - Sekcja głównych korzyści z ikonami
  - Sekcja "Jak to działa" z krokami
  - Sekcja z przykładowymi zrzutami ekranu
  - Sekcja FAQ
  - Stopka z linkami do stron informacyjnych
- **UX i dostępność:**
  - Czytelna hierarchia treści
  - Dostępne przyciski CTA
  - Responsywny układ dla różnych urządzeń

#### Strona logowania
- **Ścieżka:** `/login`
- **Główny cel:** Umożliwienie użytkownikom zalogowania się do aplikacji
- **Kluczowe informacje:** Formularz logowania
- **Kluczowe komponenty:**
  - Formularz logowania (email, hasło)
  - Przycisk "Zaloguj się"
  - Link "Zapomniałem hasła"
  - Link "Nie masz konta? Zarejestruj się"
- **UX i dostępność:**
  - Walidacja pól w czasie rzeczywistym
  - Czytelne komunikaty błędów
  - Dostępna nawigacja klawiaturą
  - Zabezpieczenie przed atakami brute force (ograniczenie prób logowania)

#### Strona rejestracji
- **Ścieżka:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom utworzenia konta
- **Kluczowe informacje:** Formularz rejestracyjny
- **Kluczowe komponenty:**
  - Formularz rejestracyjny (email, hasło, imię)
  - Checkbox zgody na politykę prywatności
  - Przycisk "Zarejestruj się"
  - Link "Masz już konto? Zaloguj się"
- **UX i dostępność:**
  - Walidacja pól w czasie rzeczywistym
  - Wskaźnik siły hasła
  - Czytelne komunikaty błędów
  - Dostępna nawigacja klawiaturą

#### Strona resetowania hasła
- **Ścieżka:** `/reset-password` i `/reset-password/:token`
- **Główny cel:** Umożliwienie użytkownikom zresetowania zapomnianego hasła
- **Kluczowe informacje:** Formularz podania adresu email lub ustawienia nowego hasła
- **Kluczowe komponenty:**
  - Formularz podania adresu email
  - Komunikat o wysłaniu linku resetującego
  - Formularz ustawienia nowego hasła (po kliknięciu w link)
  - Przycisk "Wyślij link resetujący" lub "Ustaw nowe hasło"
- **UX i dostępność:**
  - Jasne instrukcje dla użytkownika
  - Potwierdzenie wysłania emaila
  - Walidacja nowego hasła w czasie rzeczywistym

#### Strony informacyjne
- **Ścieżka:** `/about`, `/privacy-policy`, `/terms`
- **Główny cel:** Dostarczenie dodatkowych informacji o aplikacji i politykach
- **Kluczowe informacje:** Szczegółowy opis produktu, polityka prywatności, warunki korzystania
- **Kluczowe komponenty:**
  - Nagłówek strony
  - Treść strony (tekst, obrazy)
  - Nawigacja do innych stron informacyjnych
  - Przycisk CTA (dla niezalogowanych)
- **UX i dostępność:**
  - Czytelna typografia
  - Dostępne łącza i przyciski
  - Responsywny układ treści

### Obszar chroniony

#### Dashboard projektów
- **Ścieżka:** `/dashboard`
- **Główny cel:** Prezentacja listy projektów użytkownika i umożliwienie zarządzania nimi
- **Kluczowe informacje:** Lista projektów, opcje filtrowania, przycisk tworzenia nowego projektu
- **Kluczowe komponenty:**
  - Nagłówek z tytułem i przyciskiem "Nowy projekt"
  - Filtry i sortowanie projektów
  - Lista projektów w formie kart lub tabeli
  - Paginacja dla większej liczby projektów
  - Stan pustej listy (dla nowych użytkowników)
- **UX i dostępność:**
  - Skeletonowe karty podczas ładowania
  - Responsywny układ kart/tabeli
  - Filtrowanie i sortowanie dostępne z klawiatury
  - Wyraźne przyciski akcji dla każdego projektu

#### Formularz tworzenia nowego projektu
- **Ścieżka:** `/projects/new`
- **Główny cel:** Umożliwienie użytkownikowi utworzenia nowego projektu
- **Kluczowe informacje:** Formularz z polami: nazwa projektu, opis
- **Kluczowe komponenty:**
  - Nagłówek "Nowy projekt"
  - Pole nazwy projektu
  - Pole opisu projektu
  - Przyciski "Anuluj" i "Utwórz projekt"
- **UX i dostępność:**
  - Walidacja pól w czasie rzeczywistym
  - Wskaźnik liczby znaków dla opisu
  - Dostępne przyciski akcji
  - Obsługa klawiatury (Tab, Enter)

#### Widok edycji projektu - zakładka założeń projektu
- **Ścieżka:** `/projects/:id/assumptions`
- **Główny cel:** Definicja podstawowych założeń projektu z pomocą AI
- **Kluczowe informacje:** Formularz założeń, sugestie AI, walidacja założeń
- **Kluczowe komponenty:**
  - Zakładki nawigacyjne
  - Formularz z polami (cel projektu, grupa docelowa, funkcjonalności, ograniczenia)
  - Przycisk "Waliduj założenia" (AI)
  - Sekcja sugestii AI z wyróżnieniem wizualnym
  - Przyciski akceptacji/odrzucenia sugestii
  - Komponenty oceny przydatności sugestii
- **UX i dostępność:**
  - Auto-save formularza
  - Wyraźne rozróżnienie treści użytkownika i AI
  - Wskaźniki ładowania podczas operacji AI
  - Dostępne formularze i przyciski akcji

#### Widok edycji projektu - zakładka bloków funkcjonalnych
- **Ścieżka:** `/projects/:id/functional-blocks`
- **Główny cel:** Podział projektu na bloki funkcjonalne z pomocą AI
- **Kluczowe informacje:** Lista bloków funkcjonalnych, opcje edycji, generowanie przez AI
- **Kluczowe komponenty:**
  - Zakładki nawigacyjne
  - Przycisk "Generuj bloki funkcjonalne" (AI)
  - Lista bloków funkcjonalnych z możliwością rozwijania
  - Formularz edycji bloku funkcjonalnego
  - Przyciski dodawania/usuwania bloków
  - Możliwość zmiany kolejności bloków (drag & drop)
  - Przycisk "Eksportuj bloki"
- **UX i dostępność:**
  - Stan pusty z instrukcją generowania
  - Wskaźniki ładowania podczas operacji AI
  - Wyraźne rozróżnienie treści użytkownika i AI
  - Dostępne komponenty interaktywne

#### Widok edycji projektu - zakładka harmonogramu
- **Ścieżka:** `/projects/:id/schedule`
- **Główny cel:** Tworzenie harmonogramu projektu z pomocą AI
- **Kluczowe informacje:** Lista etapów projektu, opcje edycji, generowanie przez AI
- **Kluczowe komponenty:**
  - Zakładki nawigacyjne
  - Przycisk "Generuj harmonogram" (AI)
  - Lista etapów projektu z możliwością rozwijania
  - Formularz edycji etapu
  - Przyciski dodawania/usuwania etapów
  - Możliwość zmiany kolejności etapów (drag & drop)
  - Przycisk "Eksportuj harmonogram"
- **UX i dostępność:**
  - Stan pusty z instrukcją generowania
  - Wskaźniki ładowania podczas operacji AI
  - Wyraźne rozróżnienie treści użytkownika i AI
  - Dostępne komponenty interaktywne

#### Widok profilu użytkownika
- **Ścieżka:** `/profile`
- **Główny cel:** Umożliwienie użytkownikowi zarządzania swoim profilem
- **Kluczowe informacje:** Formularz edycji profilu, zmiana hasła, usunięcie konta
- **Kluczowe komponenty:**
  - Formularz edycji profilu (imię, nazwisko, strefa czasowa)
  - Sekcja zmiany hasła
  - Sekcja usunięcia konta z ostrzeżeniem
- **UX i dostępność:**
  - Walidacja pól w czasie rzeczywistym
  - Potwierdzenia dla krytycznych operacji
  - Czytelne komunikaty o błędach i sukcesie
  - Dostępne formularze i przyciski

## 3. Mapa podróży użytkownika

### Proces rejestracji i logowania
1. **Pierwszy kontakt** - Użytkownik wchodzi na stronę główną i zapoznaje się z opisem aplikacji
2. **Rejestracja** - Klika przycisk "Zarejestruj się" i przechodzi do formularza rejestracji
3. **Wypełnienie danych** - Podaje email, hasło, imię i akceptuje politykę prywatności
4. **Potwierdzenie** - Otrzymuje email z linkiem aktywacyjnym i klika go
5. **Logowanie** - Wraca do aplikacji, wprowadza dane logowania i uzyskuje dostęp do dashboardu

### Proces tworzenia i edycji projektu
1. **Inicjacja** - Z dashboardu użytkownik klika "Nowy projekt"
2. **Utworzenie podstawy** - Wypełnia nazwę i opis projektu, klika "Utwórz projekt"
3. **Definiowanie założeń** - W zakładce założeń wprowadza podstawowe informacje o projekcie
4. **Wsparcie AI** - Klika "Waliduj założenia", otrzymuje sugestie AI, akceptuje lub modyfikuje
5. **Tworzenie bloków funkcjonalnych** - Przechodzi do zakładki bloków, generuje je z pomocą AI
6. **Dostosowanie bloków** - Modyfikuje, dodaje, usuwa lub zmienia kolejność bloków według potrzeb
7. **Tworzenie harmonogramu** - Przechodzi do zakładki harmonogramu, generuje go z pomocą AI
8. **Dostosowanie harmonogramu** - Modyfikuje, dodaje, usuwa lub zmienia kolejność etapów
9. **Eksport** - Eksportuje dane projektu w wybranym formacie (opcjonalnie)
10. **Iteracja** - Wraca do poszczególnych zakładek, aby udoskonalić projekt

### Interakcja z AI
1. **Wprowadzenie danych** - Użytkownik wypełnia formularze swoimi danymi
2. **Inicjacja AI** - Klika przycisk uruchamiający funkcję AI (walidacja, sugestie, generowanie)
3. **Oczekiwanie** - Obserwuje wskaźnik ładowania podczas przetwarzania przez AI
4. **Otrzymanie wyników** - Otrzymuje wyniki w formie sugestii, bloków lub etapów
5. **Ewaluacja** - Przegląda sugestie AI, które są wizualnie odróżnione od wprowadzonych danych
6. **Interakcja z sugestiami** - Akceptuje, odrzuca lub modyfikuje sugestie
7. **Feedback** - Ocenia przydatność sugestii (thumbs up/down) dla doskonalenia AI

### Zarządzanie profilem
1. **Dostęp** - Użytkownik klika swoje imię/avatar w górnym menu i wybiera "Profil"
2. **Edycja danych** - Aktualizuje swoje dane osobowe (imię, nazwisko, strefa czasowa)
3. **Zmiana hasła** - Wprowadza aktualne hasło i nowe hasło z potwierdzeniem
4. **Usunięcie konta** - W razie potrzeby, potwierdza chęć usunięcia konta (wprowadza hasło)

## 4. Układ i struktura nawigacji

### Główna nawigacja

**Dla niezalogowanych użytkowników:**
- Logo (link do strony głównej)
- Strona główna
- O nas
- Zaloguj się
- Zarejestruj się

**Dla zalogowanych użytkowników:**
- Logo (link do dashboardu)
- Dashboard
- Menu użytkownika (avatar/imię):
  - Profil
  - Wyloguj się

### Boczne menu (widoczne po zalogowaniu)
- Dashboard projektów
- Nowy projekt
- Lista ostatnio edytowanych projektów (max 5)

### Nawigacja w widoku edycji projektu
- Nazwa projektu (z możliwością edycji inline)
- Zakładki:
  - Założenia projektu
  - Bloki funkcjonalne
  - Harmonogram
- Przyciski akcji:
  - Powrót do dashboardu
  - Eksportuj (z rozwijaną listą formatów)

### Ścieżka nawigacji (Breadcrumbs)
Wyświetlana na każdej podstronie obszaru chronionego:
- Dashboard > [Nazwa projektu] > [Aktualna zakładka]

### Nawigacja mobilna
- Menu hamburger na urządzeniach mobilnych
- Zwijane boczne menu
- Uproszczona struktura zakładek (dostępna z rozwijanego menu)

## 5. Kluczowe komponenty

### Komponenty layoutu
- **PublicLayout** - Layout dla obszaru publicznego z prostym nagłówkiem i stopką
- **ProtectedLayout** - Layout dla obszaru chronionego z bocznym menu i górnym paskiem
- **ProjectLayout** - Layout dla widoków edycji projektu z zakładkami

### Komponenty nawigacji
- **MainNavigation** - Główna nawigacja z logo i linkami
- **SideMenu** - Boczne menu dla zalogowanych użytkowników
- **UserMenu** - Menu użytkownika z avatarem i opcjami
- **ProjectTabs** - Zakładki do nawigacji w edycji projektu
- **Breadcrumbs** - Ścieżka nawigacji

### Komponenty formularzy
- **AuthForm** - Bazowy komponent dla formularzy logowania i rejestracji
- **ProjectForm** - Formularz tworzenia i edycji projektu
- **AssumptionsForm** - Formularz do wprowadzania założeń projektu
- **BlockForm** - Formularz edycji bloku funkcjonalnego
- **ScheduleForm** - Formularz edycji etapu harmonogramu
- **ProfileForm** - Formularz edycji profilu użytkownika

### Komponenty AI
- **AISuggestion** - Komponent wyświetlający sugestię AI z wyróżnieniem
- **AIValidationResult** - Komponent wyświetlający wyniki walidacji AI
- **AISuggestionActions** - Przyciski akceptacji/odrzucenia sugestii
- **AIFeedback** - Komponenty oceny przydatności sugestii (thumbs up/down)

### Komponenty projektów
- **ProjectCard** - Karta projektu na dashboardzie
- **ProjectList** - Lista projektów z filtrowaniem i sortowaniem
- **FunctionalBlockList** - Lista bloków funkcjonalnych z możliwością rozwijania
- **ScheduleList** - Lista etapów harmonogramu

### Komponenty eksportu
- **ExportButton** - Przycisk eksportu z rozwijaną listą formatów
- **ExportModal** - Modal z opcjami eksportu i potwierdzeniem

### Komponenty stanu
- **LoadingIndicator** - Wskaźnik ładowania (spinner, pasek postępu)
- **SkeletonLoader** - Skeletonowe elementy podczas ładowania
- **EmptyState** - Stan pusty z instrukcją dla użytkownika
- **ErrorDisplay** - Wyświetlanie błędów z opcją ponowienia operacji
- **Toast** - Powiadomienia o sukcesie lub błędzie

### Komponenty wspólne
- **Button** - Przyciski różnych typów i rozmiarów
- **Input** - Pola wprowadzania danych
- **Textarea** - Pola wprowadzania dłuższego tekstu
- **Select** - Pola wyboru z listy
- **Card** - Komponenty karty do wyświetlania danych
- **Modal** - Okna modalne do potwierdzeń i formularzy
- **Tabs** - Komponenty zakładek
- **Badge** - Etykiety statusu i kategorii
- **Tooltip** - Podpowiedzi dla elementów interfejsu
- **Avatar** - Awatar użytkownika