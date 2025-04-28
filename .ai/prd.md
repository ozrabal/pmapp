# Dokument wymagań produktu (PRD) - Plan My App

## 1. Przegląd produktu

Plan My App to aplikacja wspomagana przez sztuczną inteligencję, która ma na celu usprawnienie procesu planowania projektów aplikacji poprzez zapewnienie struktury, doradztwa i automatyzacji elementów planowania. System skierowany jest głównie do menedżerów projektów oraz programistów tworzących samodzielnie aplikacje, którzy potrzebują kompleksowego narzędzia do planowania projektów.

Aplikacja w wersji MVP umożliwia definiowanie podstawowych założeń projektu, podział na bloki funkcjonalne oraz tworzenie prostego harmonogramu. Kluczowym elementem jest wspomaganie decyzji przez AI, które analizuje założenia projektowe i sugeruje optymalne rozwiązania.

Główne korzyści dla użytkowników:
- Uproszczenie procesu planowania projektów
- Redukcja czasu potrzebnego na przygotowanie planu
- Minimalizacja ryzyka pominięcia kluczowych elementów projektu
- Dostęp do wsparcia AI w podejmowaniu decyzji projektowych
- Uporządkowana struktura planowania projektu

## 2. Problem użytkownika

Planowanie procesu tworzenia aplikacji jest złożonym zadaniem, które często sprawia trudności osobom bez doświadczenia w zarządzaniu projektami. Główne problemy, które rozwiązuje Plan My App:

- Brak struktury w planowaniu projektów - użytkownicy często nie wiedzą od czego zacząć i jak zorganizować prace
- Trudności z podziałem funkcjonalności na logiczne bloki implementacyjne
- Problem z oszacowaniem czasu potrzebnego na realizację poszczególnych elementów
- Niepewność co do kolejności realizacji zadań i zależności między nimi
- Brak dostępu do eksperckiej wiedzy na temat zarządzania projektami

W wyniku tych problemów, wiele projektów nie jest realizowanych w terminie i budżecie, a niektóre nigdy nie dochodzą do skutku ze względu na zbyt chaotyczne podejście do planowania.

Plan My App adresuje te wyzwania poprzez dostarczenie struktury, wsparcia AI i automatyzacji procesu planowania, co pozwala użytkownikom na bardziej efektywne zarządzanie czasem i zasobami.

## 3. Wymagania funkcjonalne

### 3.1 System kont użytkowników
- Rejestracja i logowanie użytkowników
- Zarządzanie profilem użytkownika
- Przechowywanie danych osobowych i informacji o projektach zgodnie z RODO

### 3.2 Zarządzanie projektami
- Tworzenie nowych projektów
- Zapisywanie, odczytywanie i edytowanie podstawowych założeń projektu
- Przeglądanie listy projektów użytkownika
- Usuwanie projektów

### 3.3 Definiowanie założeń projektu
- Ustrukturyzowany formularz do wprowadzania podstawowych założeń
- Walidacja wprowadzonych danych przez AI
- Sugestie AI dotyczące definicji projektu

### 3.4 Podział na bloki funkcjonalne
- Sugerowanie przez AI podziału na bloki funkcjonalne na podstawie założeń
- Wstępne predefiniowane kategorie (logowanie, rejestracja, edycja projektu, eksport wyników, itp.)
- Możliwość dostosowania i modyfikacji bloków funkcjonalnych przez użytkownika

### 3.5 Tworzenie harmonogramu
- Generowanie prostego harmonogramu projektu przez AI
- Definiowanie kluczowych etapów projektu
- Określanie zależności między etapami

### 3.6 Ocena sugestii AI
- System oceny "przydatne/nieprzydatne" dla sugestii AI
- Zbieranie feedbacku od użytkowników w celu doskonalenia algorytmów

## 4. Granice produktu

### 4.1 Co nie wchodzi w zakres MVP:
- Określanie zasobów potrzebnych do realizacji projektu
- Szacowanie budżetu projektu
- Tworzenie szczegółowego harmonogramu projektu z dokładnymi datami
- Szczegółowe estymowanie czasu realizacji poszczególnych bloków funkcjonalnych
- Współdzielenie projektu z innymi użytkownikami
- Tworzenie organizacji i przypisywanie projektów do organizacji
- Wspomaganie decyzji dotyczących wyboru technologii
- Integracja z narzędziami do zarządzania projektami i kalendarzami (planowane w przyszłości)

### 4.2 Ograniczenia technologiczne:
- Dostępność zasobów AI wpływająca na szybkość i jakość generowanych sugestii
- Określony czas na rozwój wpływający na harmonogram wydania MVP
- Wymagania dotyczące zgodności z RODO przy przechowywaniu danych osobowych

## 5. Historyjki użytkowników

### Rejestracja i logowanie

#### US-001: Rejestracja nowego użytkownika
- Jako potencjalny użytkownik, chcę utworzyć nowe konto, aby móc korzystać z funkcji aplikacji
- Kryteria akceptacji:
  1. Użytkownik może utworzyć konto podając email, hasło oraz imię
  2. System weryfikuje poprawność i unikalność adresu email
  3. System wymaga hasła o odpowiedniej sile (min. 8 znaków, zawierające cyfry i litery)
  4. Po rejestracji użytkownik otrzymuje email z linkiem aktywacyjnym
  5. Konto zostaje aktywowane po kliknięciu w link aktywacyjny

#### US-002: Logowanie do systemu
- Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji, aby uzyskać dostęp do moich projektów
- Kryteria akceptacji:
  1. Użytkownik może zalogować się podając email i hasło
  2. System weryfikuje poprawność danych logowania
  3. W przypadku błędnych danych, system wyświetla odpowiedni komunikat
  4. Po poprawnym zalogowaniu, użytkownik jest przekierowywany do widoku listy projektów

#### US-003: Odzyskiwanie hasła
- Jako zarejestrowany użytkownik, chcę zresetować zapomniane hasło, aby odzyskać dostęp do mojego konta
- Kryteria akceptacji:
  1. Użytkownik może zainicjować proces odzyskiwania hasła podając adres email
  2. System wysyła email z linkiem do resetowania hasła
  3. Po kliknięciu w link, użytkownik może ustawić nowe hasło
  4. System wymaga, aby nowe hasło spełniało kryteria bezpieczeństwa
  5. Po zmianie hasła, użytkownik jest informowany o pomyślnym zresetowaniu

### Zarządzanie projektami

#### US-004: Tworzenie nowego projektu
- Jako zalogowany użytkownik, chcę utworzyć nowy projekt, aby rozpocząć planowanie mojej aplikacji
- Kryteria akceptacji:
  1. Z widoku listy projektów, użytkownik może wybrać opcję utworzenia nowego projektu
  2. System prezentuje formularz z podstawowymi polami (nazwa, opis)
  3. Po wypełnieniu wymaganych pól, projekt jest zapisywany w systemie
  4. Nowy projekt pojawia się na liście projektów użytkownika

#### US-005: Przeglądanie listy projektów
- Jako zalogowany użytkownik, chcę zobaczyć listę moich projektów, aby zarządzać nimi
- Kryteria akceptacji:
  1. Po zalogowaniu, użytkownik widzi listę swoich projektów
  2. Lista zawiera podstawowe informacje o projektach (nazwa, data utworzenia, status)
  3. Projekty są sortowane od najnowszych do najstarszych
  4. Użytkownik może filtrować projekty według statusu

#### US-006: Edycja projektu
- Jako zalogowany użytkownik, chcę edytować istniejący projekt, aby zaktualizować jego szczegóły
- Kryteria akceptacji:
  1. Z listy projektów, użytkownik może wybrać projekt do edycji
  2. System wyświetla formularz z aktualnymi danymi projektu
  3. Użytkownik może modyfikować wszystkie pola projektu
  4. Po zapisaniu zmian, system aktualizuje dane projektu

#### US-007: Usuwanie projektu
- Jako zalogowany użytkownik, chcę usunąć projekt, którego już nie potrzebuję
- Kryteria akceptacji:
  1. Z listy projektów, użytkownik może wybrać opcję usunięcia projektu
  2. System prosi o potwierdzenie usunięcia
  3. Po potwierdzeniu, projekt jest trwale usuwany z systemu
  4. Użytkownik otrzymuje potwierdzenie usunięcia projektu

#### US-008: Przeglądanie szczegółów projektu
- Jako zalogowany użytkownik, chcę przeglądać szczegóły mojego projektu, aby zobaczyć wszystkie jego elementy
- Kryteria akceptacji:
  1. Z listy projektów, użytkownik może wybrać projekt do przeglądania
  2. System wyświetla szczegółowe informacje o projekcie (nazwę projektu, opis, założenia, bloki funkcjonalne, harmonogram)
  3. Użytkownik może przełączać się między różnymi sekcjami projektu
  4. Użytkownik może wrócić do listy projektów w dowolnym momencie

#### US-009: Eksportowanie projektu
- Jako zalogowany użytkownik, chcę wyeksportować projekt do pliku, aby móc go wykorzystać poza aplikacją
- Kryteria akceptacji:
  1. Z widoku szczegółów projektu, użytkownik może wybrać opcję eksportu
  2. System umożliwia wybór formatu eksportu (JSON)
  3. Po wybraniu formatu, system generuje plik z danymi projektu
  4. Użytkownik może pobrać wygenerowany plik
  5. Wyeksportowany plik zawiera wszystkie informacje dostępne w aplikacji

### Definiowanie założeń projektu

#### US-008: Wprowadzanie podstawowych założeń projektu
- Jako zalogowany użytkownik, chcę wprowadzić podstawowe założenia mojego projektu, aby określić jego zakres
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do ustrukturyzowanego formularza z polami definiującymi założenia projektu
  2. Formularz zawiera pola: cel projektu, główne funkcjonalności, technologię
  3. System zapisuje wprowadzone dane w czasie rzeczywistym
  4. Użytkownik może edytować założenia w dowolnym momencie

#### US-009: Otrzymywanie walidacji założeń od AI
- Jako zalogowany użytkownik, chcę otrzymać informację od AI o poprawności moich założeń, aby upewnić się, że są kompletne i spójne
- Kryteria akceptacji:
  1. System analizuje wprowadzone założenia przy pomocy AI
  2. AI sprawdza kompletność, spójność i realność założeń
  3. Użytkownik otrzymuje informację o znalezionych problemach lub brakujących elementach
  4. System sugeruje potencjalne poprawki lub uzupełnienia
  5. Każda sugestia odnosi się do konkretnego pola formularza
  5. Użytkownik może zaakceptować lub odrzucić sugestie AI
  6. Po zaakceptowaniu, system automatycznie przenosi focus użytkownika do odpowiedniego pola formularza
  7. Użytkownik widzi sugestie obok odpowiednich pól formularza
  7. Użytkownik może wprowadzić poprawki do założeń na podstawie sugestii AI
  8. System zapisuje zmiany w czasie rzeczywistym
  9. Użytkownik może w dowolnym momencie ponownie poprosić AI o ponowną walidację założeń

#### US-010: Uzyskiwanie sugestii dotyczących definicji projektu
- Jako zalogowany użytkownik, chcę otrzymać sugestie od AI dotyczące mojego projektu, aby ulepszyć jego definicję
- Kryteria akceptacji:
  1. AI analizuje wprowadzone dane i kontekst projektu
  2. System prezentuje sugestie dotyczące udoskonalenia definicji projektu
  3. Użytkownik może zaakceptować lub odrzucić poszczególne sugestie
  4. Po akceptacji, sugestie są automatycznie implementowane w definicji projektu

### Podział na bloki funkcjonalne

#### US-011: Generowanie bloków funkcjonalnych przez AI
- Jako zalogowany użytkownik, chcę aby AI zaproponowało podział mojego projektu na bloki funkcjonalne, aby ustrukturyzować proces rozwoju
- Kryteria akceptacji:
  1. AI analizuje założenia projektu i generuje propozycję podziału na bloki funkcjonalne
  2. Wygenerowane bloki są kategoryzowane według typu funkcjonalności
  3. Każdy blok zawiera krótki opis zakresu prac
  4. System prezentuje wygenerowane bloki w przejrzystej formie graficznej

#### US-012: Modyfikacja bloków funkcjonalnych
- Jako zalogowany użytkownik, chcę modyfikować zaproponowane bloki funkcjonalne, aby dostosować je do moich potrzeb
- Kryteria akceptacji:
  1. Użytkownik może edytować nazwę, opis i zakres każdego bloku
  2. Użytkownik może dodawać nowe bloki funkcjonalne
  3. Użytkownik może usuwać niepotrzebne bloki
  4. Użytkownik może zmieniać kolejność bloków
  5. System zapisuje wszystkie zmiany w czasie rzeczywistym

#### US-013: Eksportowanie podziału na bloki funkcjonalne
- Jako zalogowany użytkownik, chcę wyeksportować podział na bloki funkcjonalne, aby móc go wykorzystać poza aplikacją
- Kryteria akceptacji:
  1. Użytkownik może wybrać format eksportu (PDF, CSV, JSON)
  2. System generuje plik w wybranym formacie zawierający wszystkie bloki funkcjonalne i ich opisy
  3. Użytkownik może pobrać wygenerowany plik
  4. Wyeksportowany plik zawiera wszystkie informacje dostępne w aplikacji

### Tworzenie harmonogramu

#### US-014: Generowanie prostego harmonogramu przez AI
- Jako zalogowany użytkownik, chcę aby AI wygenerowało prosty harmonogram projektu, aby lepiej zaplanować prace
- Kryteria akceptacji:
  1. AI analizuje zdefiniowane bloki funkcjonalne i generuje harmonogram projektu
  2. Harmonogram zawiera kluczowe etapy realizacji projektu
  3. System określa zależności między poszczególnymi etapami
  4. Harmonogram jest prezentowany w formie wykresu Gantta lub podobnej

#### US-015: Modyfikacja harmonogramu projektu
- Jako zalogowany użytkownik, chcę modyfikować wygenerowany harmonogram, aby dostosować go do rzeczywistych możliwości
- Kryteria akceptacji:
  1. Użytkownik może edytować nazwy etapów i ich opisy
  2. Użytkownik może modyfikować kolejność i zależności między etapami
  3. Użytkownik może dodawać nowe etapy lub usuwać istniejące
  4. System zapisuje wszystkie zmiany w czasie rzeczywistym

#### US-016: Eksportowanie harmonogramu projektu
- Jako zalogowany użytkownik, chcę wyeksportować harmonogram projektu, aby móc go wykorzystać poza aplikacją
- Kryteria akceptacji:
  1. Użytkownik może wybrać format eksportu (PDF, CSV, iCal)
  2. System generuje plik w wybranym formacie zawierający wszystkie informacje o harmonogramie
  3. Użytkownik może pobrać wygenerowany plik
  4. Wyeksportowany plik zachowuje strukturę i zależności między etapami

### Ocena sugestii AI

#### US-017: Ocenianie przydatności sugestii AI
- Jako zalogowany użytkownik, chcę oceniać przydatność sugestii AI, aby pomóc w doskonaleniu algorytmów
- Kryteria akceptacji:
  1. Przy każdej sugestii AI dostępne są przyciski "przydatne" i "nieprzydatne"
  2. Po ocenieniu, system zapisuje feedback użytkownika
  3. Użytkownik otrzymuje podziękowanie za przekazanie feedbacku
  4. System wykorzystuje zebrane dane do doskonalenia algorytmów AI

#### US-018: Zgłaszanie nieadekwatnych sugestii AI
- Jako zalogowany użytkownik, chcę zgłaszać nieadekwatne lub niepoprawne sugestie AI, aby poprawić jakość systemu
- Kryteria akceptacji:
  1. Użytkownik może zgłosić niepoprawną sugestię AI
  2. System umożliwia dodanie komentarza wyjaśniającego problem
  3. Zgłoszenia są przechowywane w systemie w celu analizy
  4. Użytkownik otrzymuje potwierdzenie przyjęcia zgłoszenia

### Zarządzanie kontem

#### US-019: Edycja profilu użytkownika
- Jako zalogowany użytkownik, chcę edytować swój profil, aby zaktualizować moje dane osobowe
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do strony edycji profilu
  2. Użytkownik może zmieniać imię, nazwisko, avatar i inne dane osobowe
  3. Użytkownik może zmienić hasło (z potwierdzeniem starego hasła)
  4. System zapisuje zmiany i aktualizuje dane profilu

#### US-020: Usuwanie konta
- Jako zalogowany użytkownik, chcę usunąć moje konto, jeśli nie chcę już korzystać z aplikacji
- Kryteria akceptacji:
  1. Użytkownik może zainicjować proces usuwania konta z poziomu ustawień profilu
  2. System wymaga potwierdzenia hasła i intencji usunięcia konta
  3. System informuje o konsekwencjach usunięcia konta (utrata wszystkich projektów)
  4. Po potwierdzeniu, konto jest trwale usuwane wraz z wszystkimi danymi użytkownika
  5. Dane są usuwane zgodnie z wymogami RODO

## 6. Metryki sukcesu

### 6.1 Metryki adopcji i zaangażowania
- Liczba nowych rejestracji (cel: wzrost o 10% miesięcznie)
- Odsetek użytkowników aktywnie korzystających z aplikacji (cel: 40% w pierwszym miesiącu)
- Średni czas spędzony w aplikacji (cel: minimum 15 minut na sesję)
- Liczba utworzonych projektów na użytkownika (cel: minimum 2 projekty)

### 6.2 Metryki jakości AI
- Odsetek sugestii AI ocenionych jako "przydatne" (cel: powyżej 70%)
- Liczba modyfikacji wprowadzonych przez użytkowników do sugestii AI (cel: poniżej 30%)
- Odsetek użytkowników korzystających z sugestii AI (cel: powyżej 80%)

### 6.3 Metryki efektywności
- Średni czas potrzebny na zdefiniowanie założeń projektu (cel: poniżej 30 minut)
- Średni czas potrzebny na podział projektu na bloki funkcjonalne (cel: poniżej 20 minut)
- Średni czas potrzebny na stworzenie harmonogramu (cel: poniżej 15 minut)

### 6.4 Metryki satysfakcji
- Ogólna ocena aplikacji przez użytkowników (cel: minimum 4.5/5)
- Odsetek użytkowników polecających aplikację (NPS) (cel: powyżej 40)
- Odsetek użytkowników zgłaszających problemy lub błędy (cel: poniżej 5%)

### 6.5 Kluczowe wskaźniki efektywności MVP
- Liczba użytkowników, którzy pomyślnie utworzyli kompletny projekt z wszystkimi elementami: założenia, bloki funkcjonalne, harmonogram (cel: minimum 60% użytkowników)
- Odsetek użytkowników powracających do aplikacji po tygodniu od rejestracji (cel: minimum 30%)
- Liczba projektów eksportowanych do formatów zewnętrznych (cel: minimum 20% wszystkich projektów)