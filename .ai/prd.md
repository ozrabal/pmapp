# Dokument wymagań produktu (PRD) - Plan My App

## 1. Przegląd produktu

Plan My App to aplikacja wspomagana przez sztuczną inteligencję, która ma na celu usprawnienie procesu planowania projektów aplikacji poprzez zapewnienie struktury, doradztwa i automatyzacji elementów planowania. System skierowany jest głównie do menedżerów projektów oraz programistów tworzących samodzielnie aplikacje, którzy potrzebują kompleksowego narzędzia do planowania projektów.

Aplikacja w wersji MVP umożliwia definiowanie podstawowych założeń projektu, podział na bloki funkcjonalne, tworzenie prostego harmonogramu oraz szczegółowe zarządzanie zadaniami w ramach każdego bloku funkcjonalnego. Kluczowym elementem jest wspomaganie decyzji przez AI, które analizuje założenia projektowe, sugeruje optymalne rozwiązania, pomaga w estymacji zadań oraz automatycznie generuje szczegółowe zadania na podstawie opisów bloków funkcjonalnych.

Główne korzyści dla użytkowników:

- Uproszczenie procesu planowania projektów
- Redukcja czasu potrzebnego na przygotowanie planu
- Minimalizacja ryzyka pominięcia kluczowych elementów projektu
- Dostęp do wsparcia AI w podejmowaniu decyzji projektowych
- Uporządkowana struktura planowania projektu
- Szczegółowe zarządzanie zadaniami w ramach bloków funkcjonalnych
- Automatyczna estymacja czasu i nakładu pracy na zadania
- Zwiększenie przejrzystości i organizacji pracy zespołu

## 2. Problem użytkownika

Planowanie procesu tworzenia aplikacji jest złożonym zadaniem, które często sprawia trudności osobom bez doświadczenia w zarządzaniu projektami. Główne problemy, które rozwiązuje Plan My App:

- Brak struktury w planowaniu projektów - użytkownicy często nie wiedzą od czego zacząć i jak zorganizować prace
- Trudności z podziałem funkcjonalności na logiczne bloki implementacyjne
- Problem z oszacowaniem czasu potrzebnego na realizację poszczególnych elementów
- Niepewność co do kolejności realizacji zadań i zależności między nimi
- Brak dostępu do eksperckiej wiedzy na temat zarządzania projektami
- Brak centralnego miejsca do tworzenia i organizowania szczegółowych zadań składających się na bloki funkcjonalne
- Trudności z estymacją czasu i nakładu pracy na poszczególne zadania
- Problem z zachowaniem przejrzystości i kontroli nad postępem prac w ramach projektu

W wyniku tych problemów, wiele projektów nie jest realizowanych w terminie i budżecie, a niektóre nigdy nie dochodzą do skutku ze względu na zbyt chaotyczne podejście do planowania. Dodatkowo, brak szczegółowego zarządzania zadaniami prowadzi do błędów, nieporozumień i niskiej efektywności zespołu.

Plan My App adresuje te wyzwania poprzez dostarczenie struktury, wsparcia AI i automatyzacji procesu planowania oraz szczegółowego zarządzania zadaniami, co pozwala użytkownikom na bardziej efektywne zarządzanie czasem i zasobami.

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

### 3.7 Zarządzanie zadaniami w ramach bloków funkcjonalnych

- Tworzenie, edytowanie i usuwanie zadań w ramach wybranych bloków funkcjonalnych
- Ręczna estymacja czasu lub nakładu pracy na zadania
- Estymacja czasu lub nakładu pracy na zadania wspomagana przez AI
- Przeglądanie zadań w ramach bloków funkcjonalnych
- Definiowanie prostych zależności między zadaniami (relacje następnik/poprzednik)
- Automatyczne generowanie zadań przez AI na podstawie opisów bloków funkcjonalnych
- Walidacja przez AI realności estymacji, kompletności opisów i spójności z blokami funkcjonalnymi
- Eksport zadań wraz z projektem w formacie JSON
- Integracja zadań z harmonogramem projektu

## 4. Granice produktu

### 4.1 Co nie wchodzi w zakres MVP

- Określanie zasobów potrzebnych do realizacji projektu
- Szacowanie budżetu projektu
- Tworzenie szczegółowego harmonogramu projektu z dokładnymi datami
- Szczegółowe estymowanie czasu realizacji poszczególnych bloków funkcjonalnych
- Współdzielenie projektu z innymi użytkownikami
- Tworzenie organizacji i przypisywanie projektów do organizacji
- Wspomaganie decyzji dotyczących wyboru technologii
- Integracja z narzędziami do zarządzania projektami i kalendarzami (planowane w przyszłości)
- Zaawansowane funkcje zarządzania zadaniami, takie jak różne statusy zadań (poza "do zrobienia")
- Przypisywanie zadań do członków zespołu
- Śledzenie postępów realizacji zadań
- Raportowanie i analityka dotycząca zadań
- Kopiowanie zadań między blokami funkcjonalnymi
- Import zadań z zewnętrznych źródeł
- Zaawansowane zależności między zadaniami poza prostymi relacjami następnik/poprzednik
- Integracja z zewnętrznymi systemami zarządzania projektami

### 4.2 Ograniczenia technologiczne

- Dostępność zasobów AI wpływająca na szybkość i jakość generowanych sugestii
- Określony czas na rozwój wpływający na harmonogram wydania MVP
- Wymagania dotyczące zgodności z RODO przy przechowywaniu danych osobowych
- Ograniczenia w jednostkach estymacji zadań (ustawiane globalnie przez konfigurację)
- Potrzeba optymalizacji wydajności przy braku limitów na liczbę zadań w projekcie

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
  6. Profil użytkownika jest automatycznie tworzony po rejestracji z domyślnymi wartościami (imię: 'User', strefa czasowa: 'UTC', limit projektów: 5)

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
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-005: Przeglądanie listy projektów

- Jako zalogowany użytkownik, chcę zobaczyć listę moich projektów, aby zarządzać nimi
- Kryteria akceptacji:
  1. Po zalogowaniu, użytkownik widzi listę swoich projektów
  2. Lista zawiera podstawowe informacje o projektach (nazwa, data utworzenia, status)
  3. Projekty są sortowane od najnowszych do najstarszych
  4. Użytkownik może filtrować projekty według statusu
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-006: Edycja projektu

- Jako zalogowany użytkownik, chcę edytować istniejący projekt, aby zaktualizować jego szczegóły
- Kryteria akceptacji:
  1. Z listy projektów, użytkownik może wybrać projekt do edycji
  2. System wyświetla formularz z aktualnymi danymi projektu
  3. Użytkownik może modyfikować wszystkie pola projektu
  4. Po zapisaniu zmian, system aktualizuje dane projektu
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-007: Usuwanie projektu

- Jako zalogowany użytkownik, chcę usunąć projekt, którego już nie potrzebuję
- Kryteria akceptacji:
  1. Z listy projektów, użytkownik może wybrać opcję usunięcia projektu
  2. System prosi o potwierdzenie usunięcia
  3. Po potwierdzeniu, projekt jest trwale usuwany z systemu
  4. Użytkownik otrzymuje potwierdzenie usunięcia projektu
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-008: Przeglądanie szczegółów projektu

- Jako zalogowany użytkownik, chcę przeglądać szczegóły mojego projektu, aby zobaczyć wszystkie jego elementy
- Kryteria akceptacji:
  1. Z listy projektów, użytkownik może wybrać projekt do przeglądania
  2. System wyświetla szczegółowe informacje o projekcie (nazwę projektu, opis, założenia, bloki funkcjonalne, harmonogram)
  3. Użytkownik może przełączać się między różnymi sekcjami projektu
  4. Użytkownik może wrócić do listy projektów w dowolnym momencie
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-009: Eksportowanie projektu

- Jako zalogowany użytkownik, chcę wyeksportować projekt do pliku, aby móc go wykorzystać poza aplikacją
- Kryteria akceptacji:
  1. Z widoku szczegółów projektu, użytkownik może wybrać opcję eksportu
  2. System umożliwia wybór formatu eksportu (JSON)
  3. Po wybraniu formatu, system generuje plik z danymi projektu
  4. Użytkownik może pobrać wygenerowany plik
  5. Wyeksportowany plik zawiera wszystkie informacje dostępne w aplikacji
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

### Definiowanie założeń projektu

#### US-010: Wprowadzanie podstawowych założeń projektu

- Jako zalogowany użytkownik, chcę wprowadzić podstawowe założenia mojego projektu, aby określić jego zakres
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do ustrukturyzowanego formularza z polami definiującymi założenia projektu
  2. Formularz zawiera pola: cel projektu, główne funkcjonalności, technologię
  3. System zapisuje wprowadzone dane w czasie rzeczywistym
  4. Użytkownik może edytować założenia w dowolnym momencie
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-011: Otrzymywanie walidacji założeń od AI

- Jako zalogowany użytkownik, chcę otrzymać informację od AI o poprawności moich założeń, aby upewnić się, że są kompletne i spójne
- Kryteria akceptacji:
  1. System analizuje wprowadzone założenia przy pomocy AI
  2. AI sprawdza kompletność, spójność i realność założeń
  3. Użytkownik otrzymuje informację o znalezionych problemach lub brakujących elementach
  4. System sugeruje potencjalne poprawki lub uzupełnienia
  5. Każda sugestia odnosi się do konkretnego pola formularza
  6. Użytkownik może zaakceptować lub odrzucić sugestie AI
  7. Po zaakceptowaniu, system automatycznie przenosi focus użytkownika do odpowiedniego pola formularza
  8. Użytkownik widzi sugestie obok odpowiednich pól formularza
  9. Użytkownik może wprowadzić poprawki do założeń na podstawie sugestii AI
  10. System zapisuje zmiany w czasie rzeczywistym
  11. Użytkownik może w dowolnym momencie ponownie poprosić AI o ponowną walidację założeń
  12. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-012: Uzyskiwanie sugestii dotyczących definicji projektu

- Jako zalogowany użytkownik, chcę otrzymać sugestie od AI dotyczące mojego projektu, aby ulepszyć jego definicję
- Kryteria akceptacji:
  1. AI analizuje wprowadzone dane i kontekst projektu
  2. System prezentuje sugestie dotyczące udoskonalenia definicji projektu
  3. Użytkownik może zaakceptować lub odrzucić poszczególne sugestie
  4. Po akceptacji, sugestie są automatycznie implementowane w definicji projektu
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

### Podział na bloki funkcjonalne

#### US-013: Generowanie bloków funkcjonalnych przez AI

- Jako zalogowany użytkownik, chcę aby AI zaproponowało podział mojego projektu na bloki funkcjonalne, aby ustrukturyzować proces rozwoju
- Kryteria akceptacji:
  1. AI analizuje założenia projektu i generuje propozycję podziału na bloki funkcjonalne
  2. Wygenerowane bloki są kategoryzowane według typu funkcjonalności
  3. Każdy blok zawiera krótki opis zakresu prac
  4. System prezentuje wygenerowane bloki w przejrzystej formie graficznej
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-014: Modyfikacja bloków funkcjonalnych

- Jako zalogowany użytkownik, chcę modyfikować zaproponowane bloki funkcjonalne, aby dostosować je do moich potrzeb
- Kryteria akceptacji:
  1. Użytkownik może edytować nazwę, opis i zakres każdego bloku
  2. Użytkownik może dodawać nowe bloki funkcjonalne
  3. Użytkownik może usuwać niepotrzebne bloki
  4. Użytkownik może zmieniać kolejność bloków
  5. System zapisuje wszystkie zmiany w czasie rzeczywistym
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-015: Eksportowanie podziału na bloki funkcjonalne

- Jako zalogowany użytkownik, chcę wyeksportować podział na bloki funkcjonalne, aby móc go wykorzystać poza aplikacją
- Kryteria akceptacji:
  1. Użytkownik może wybrać format eksportu (PDF, CSV, JSON)
  2. System generuje plik w wybranym formacie zawierający wszystkie bloki funkcjonalne i ich opisy
  3. Użytkownik może pobrać wygenerowany plik
  4. Wyeksportowany plik zawiera wszystkie informacje dostępne w aplikacji
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

### Tworzenie harmonogramu

#### US-016: Generowanie prostego harmonogramu przez AI

- Jako zalogowany użytkownik, chcę aby AI wygenerowało prosty harmonogram projektu, aby lepiej zaplanować prace
- Kryteria akceptacji:
  1. AI analizuje zdefiniowane bloki funkcjonalne i generuje harmonogram projektu
  2. Harmonogram zawiera kluczowe etapy realizacji projektu
  3. System określa zależności między poszczególnymi etapami
  4. Harmonogram jest prezentowany w formie wykresu Gantta lub podobnej
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-017: Modyfikacja harmonogramu projektu

- Jako zalogowany użytkownik, chcę modyfikować wygenerowany harmonogram, aby dostosować go do rzeczywistych możliwości
- Kryteria akceptacji:
  1. Użytkownik może edytować nazwy etapów i ich opisy
  2. Użytkownik może modyfikować kolejność i zależności między etapami
  3. Użytkownik może dodawać nowe etapy lub usuwać istniejące
  4. System zapisuje wszystkie zmiany w czasie rzeczywistym
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-018: Eksportowanie harmonogramu projektu

- Jako zalogowany użytkownik, chcę wyeksportować harmonogram projektu, aby móc go wykorzystać poza aplikacją
- Kryteria akceptacji:
  1. Użytkownik może wybrać format eksportu (PDF, CSV, iCal)
  2. System generuje plik w wybranym formacie zawierający wszystkie informacje o harmonogramie
  3. Użytkownik może pobrać wygenerowany plik
  4. Wyeksportowany plik zachowuje strukturę i zależności między etapami
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

### Zarządzanie zadaniami

#### US-019: Tworzenie zadań w ramach bloku funkcjonalnego

- Jako zalogowany użytkownik, chcę tworzyć zadania w ramach wybranego bloku funkcjonalnego, aby szczegółowo zaplanować prace
- Kryteria akceptacji:
  1. Z widoku bloku funkcjonalnego, użytkownik może wybrać opcję utworzenia nowego zadania
  2. System prezentuje formularz z polami: nazwa, opis, priorytet (Niski/Średni/Wysoki)
  3. Po wypełnieniu wymaganych pól, zadanie jest zapisywane w systemie
  4. Nowe zadanie pojawia się na liście zadań w ramach danego bloku funkcjonalnego
  5. System automatycznie przypisuje zadanie do odpowiedniego bloku funkcjonalnego
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-020: Ręczna estymacja zadań

- Jako zalogowany użytkownik, chcę ręcznie estymować czas lub nakład pracy na zadanie, aby lepiej planować harmonogram
- Kryteria akceptacji:
  1. Przy tworzeniu lub edycji zadania, użytkownik może wprowadzić estymację
  2. System umożliwia wybór jednostek estymacji (godziny lub story points)
  3. Jednostki estymacji są ustawiane globalnie w konfiguracji aplikacji
  4. Estymacja jest zapisywana wraz z zadaniem
  5. System waliduje wprowadzone wartości estymacji (tylko liczby dodatnie)
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-021: Estymacja zadań wspomagana przez AI

- Jako zalogowany użytkownik, chcę otrzymać estymację czasu lub nakładu pracy na zadanie od AI, aby uzyskać obiektywną ocenę
- Kryteria akceptacji:
  1. Przy tworzeniu lub edycji zadania, użytkownik może poprosić AI o estymację
  2. AI analizuje opis zadania, kontekst bloku funkcjonalnego i całego projektu
  3. System prezentuje sugerowaną estymację wraz z uzasadnieniem
  4. Użytkownik może zaakceptować, odrzucić lub zmodyfikować sugestię AI
  5. AI sprawdza realność estymacji i ostrzega przed nierealnymi wartościami
  6. System zapisuje informację o pochodzeniu estymacji (ręczna/AI)
  7. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-022: Przeglądanie zadań w ramach bloku funkcjonalnego

- Jako zalogowany użytkownik, chcę przeglądać wszystkie zadania w ramach bloku funkcjonalnego, aby kontrolować postęp prac
- Kryteria akceptacji:
  1. Z widoku bloku funkcjonalnego, użytkownik widzi listę wszystkich zadań
  2. Lista zawiera podstawowe informacje o zadaniach (nazwa, priorytet, estymacja)
  3. Zadania są sortowane według priorytetu i kolejności utworzenia
  4. Użytkownik może filtrować zadania według priorytetu
  5. System wyświetla łączną estymację wszystkich zadań w bloku
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-023: Edycja i usuwanie zadań

- Jako zalogowany użytkownik, chcę edytować i usuwać zadania, aby utrzymać aktualność planów
- Kryteria akceptacji:
  1. Z listy zadań, użytkownik może wybrać zadanie do edycji
  2. System wyświetla formularz z aktualnymi danymi zadania
  3. Użytkownik może modyfikować wszystkie pola zadania
  4. Użytkownik może usunąć zadanie z odpowiednim potwierdzeniem
  5. System ostrzega przed usunięciem zadań z zależnościami i sugeruje rozwiązania
  6. Po zapisaniu zmian, system aktualizuje dane zadania
  7. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-024: Definiowanie zależności między zadaniami

- Jako zalogowany użytkownik, chcę definiować proste zależności między zadaniami, aby zachować logiczną kolejność wykonywania
- Kryteria akceptacji:
  1. Przy edycji zadania, użytkownik może wybrać zadania poprzedzające
  2. System umożliwia definiowanie relacji następnik/poprzednik
  3. System sprawdza i ostrzega przed tworzeniem cyklicznych zależności
  4. Zależności są wizualizowane w interfejsie użytkownika
  5. System automatycznie uwzględnia zależności przy generowaniu harmonogramu
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-025: Automatyczne generowanie zadań przez AI

- Jako zalogowany użytkownik, chcę automatycznie generować zadania na podstawie opisu bloku funkcjonalnego, aby przyspieszyć proces planowania
- Kryteria akceptacji:
  1. Z widoku bloku funkcjonalnego, użytkownik może wybrać opcję automatycznego generowania zadań
  2. AI analizuje opis bloku funkcjonalnego i kontekst całego projektu
  3. System prezentuje listę proponowanych zadań z opisami i estymacjami
  4. Użytkownik może wybrać, które zadania chce utworzyć
  5. Użytkownik może modyfikować proponowane zadania przed utworzeniem
  6. System tworzy wybrane zadania w ramach danego bloku funkcjonalnego
  7. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-026: Walidacja zadań przez AI

- Jako zalogowany użytkownik, chcę otrzymać walidację zadań od AI, aby upewnić się o ich kompletności i spójności
- Kryteria akceptacji:
  1. Użytkownik może poprosić AI o walidację zadań w ramach bloku funkcjonalnego
  2. AI sprawdza kompletność opisów, realność estymacji i spójność z blokiem funkcjonalnym
  3. System prezentuje raport z znalezionymi problemami i sugestiami poprawek
  4. Użytkownik otrzymuje konkretne wskazówki dotyczące każdego problemu
  5. Użytkownik może zaakceptować sugestie i automatycznie wprowadzić poprawki
  6. System może ocenić czy zadania w bloku pokrywają całość zaplanowanych funkcjonalności
  7. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-027: Eksportowanie projektu z zadaniami

- Jako zalogowany użytkownik, chcę wyeksportować projekt wraz z zadaniami, aby wykorzystać dane poza aplikacją
- Kryteria akceptacji:
  1. Z widoku szczegółów projektu, użytkownik może wybrać opcję eksportu z zadaniami
  2. System umożliwia wybór formatu eksportu (JSON)
  3. Wyeksportowany plik zawiera wszystkie informacje o projekcie, blokach funkcjonalnych i zadaniach
  4. Plik zawiera zależności między zadaniami i informacje o estymacjach
  5. Użytkownik może pobrać wygenerowany plik
  6. System zachowuje strukturę hierarchiczną projekt → bloki → zadania
  7. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

### Ocena sugestii AI

#### US-028: Ocenianie przydatności sugestii AI

- Jako zalogowany użytkownik, chcę oceniać przydatność sugestii AI, aby pomóc w doskonaleniu algorytmów
- Kryteria akceptacji:
  1. Przy każdej sugestii AI dostępne są przyciski "przydatne" i "nieprzydatne"
  2. Po ocenieniu, system zapisuje feedback użytkownika
  3. Użytkownik otrzymuje podziękowanie za przekazanie feedbacku
  4. System wykorzystuje zebrane dane do doskonalenia algorytmów AI
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-029: Zgłaszanie nieadekwatnych sugestii AI

- Jako zalogowany użytkownik, chcę zgłaszać nieadekwatne lub niepoprawne sugestie AI, aby poprawić jakość systemu
- Kryteria akceptacji:
  1. Użytkownik może zgłosić niepoprawną sugestię AI
  2. System umożliwia dodanie komentarza wyjaśniającego problem
  3. Zgłoszenia są przechowywane w systemie w celu analizy
  4. Użytkownik otrzymuje potwierdzenie przyjęcia zgłoszenia
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

### Zarządzanie kontem

#### US-030: Edycja profilu użytkownika

- Jako zalogowany użytkownik, chcę edytować swój profil, aby zaktualizować moje dane osobowe
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do strony edycji profilu
  2. Użytkownik może zmieniać imię, nazwisko, avatar i inne dane osobowe
  3. Użytkownik może zmienić hasło (z potwierdzeniem starego hasła)
  4. System zapisuje zmiany i aktualizuje dane profilu
  5. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

#### US-031: Usuwanie konta

- Jako zalogowany użytkownik, chcę usunąć moje konto, jeśli nie chcę już korzystać z aplikacji
- Kryteria akceptacji:
  1. Użytkownik może zainicjować proces usuwania konta z poziomu ustawień profilu
  2. System wymaga potwierdzenia hasła i intencji usunięcia konta
  3. System informuje o konsekwencjach usunięcia konta (utrata wszystkich projektów)
  4. Po potwierdzeniu, konto jest trwale usuwane wraz z wszystkimi danymi użytkownika
  5. Dane są usuwane zgodnie z wymogami RODO
  6. Funkcjonalność nie jest dostępna bez logowania się do systemu (US-002)

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
- Procent projektów z utworzonymi zadaniami (cel: minimum 60% wszystkich projektów)
- Średnia liczba zadań na blok funkcjonalny (wskaźnik szczegółowości planowania)
- Liczba projektów eksportowanych do formatów zewnętrznych (cel: minimum 20% wszystkich projektów)

### 6.6 Metryki zarządzania zadaniami

- Procent użytkowników wykorzystujących funkcje zarządzania zadaniami (cel: powyżej 70%)
- Średnia liczba zadań utworzonych przez AI na blok funkcjonalny (wskaźnik efektywności AI)
- Odsetek zadań z estymacją czasu (cel: powyżej 80%)
- Procent estymacji wykonanych przez AI vs ręcznie (wskaźnik adopcji AI)
- Średni czas na utworzenie zadania (cel: poniżej 3 minut)
- Procent zadań z zdefiniowanymi zależnościami (wskaźnik zaawansowania planowania)
