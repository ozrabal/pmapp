# Architektura UI dla Plan My App - Zarządzanie zadaniami

## 1. Przegląd struktury UI

Zarządzanie zadaniami w Plan My App jest integralną częścią modułu zarządzania blokami funkcjonalnymi projektu. Struktura UI dla zarządzania zadaniami została zaprojektowana z myślą o płynnej integracji z istniejącym interfejsem, umożliwiając użytkownikom tworzenie, edycję i usuwanie zadań w kontekście bloków funkcjonalnych bez konieczności przechodzenia do oddzielnych widoków.

Kluczowe założenia rozszerzenia architektury UI:

- Zadania są zarządzane w kontekście bloków funkcjonalnych
- Interfejs umożliwia zarówno ręczne tworzenie zadań, jak i generowanie przez AI
- Wizualne rozróżnienie zadań utworzonych manualnie i generowanych przez AI
- Intuicyjny interfejs do definiowania zależności między zadaniami
- Obsługa estymacji zadań (ręczna i wspomagana przez AI)
- Integracja z harmonogramem projektu

## 2. Lista widoków i komponentów

### Rozszerzenie widoku bloków funkcjonalnych

- **Ścieżka:** `/projects/:id/functional-blocks` (rozszerzenie istniejącego widoku)
- **Główny cel:** Umożliwienie zarządzania zadaniami w kontekście bloków funkcjonalnych
- **Kluczowe informacje:** Lista zadań w ramach bloku, opcje zarządzania zadaniami
- **Kluczowe komponenty:**
  - Rozwijana lista zadań w ramach każdego bloku funkcjonalnego
  - Nagłówek listy zadań z liczbą zadań i przyciskami akcji
  - Przycisk "Dodaj zadanie" dla manualnego tworzenia zadań
  - Przycisk "Generuj zadania z AI" dla automatycznego tworzenia zadań
  - Lista zadań z informacjami (nazwa, status, estymacja)
  - Akcje dla każdego zadania (edycja, usunięcie)
  - Stan pusty dla bloków bez zadań z instrukcją
- **UX i dostępność:**
  - Zwijane/rozwijane listy zadań dla przejrzystości
  - Wizualne oznaczenie źródła zadania (manualne/AI)
  - Opcje sortowania i filtrowania zadań
  - Spójne stany ładowania i obsługa błędów
  - Dostępna nawigacja klawiaturą

### Modal tworzenia zadania

- **Kontekst:** Otwierany z widoku bloku funkcjonalnego
- **Główny cel:** Umożliwienie użytkownikowi utworzenia nowego zadania
- **Kluczowe informacje:** Formularz tworzenia zadania z polami: nazwa, opis, estymacja
- **Kluczowe komponenty:**
  - Nagłówek modalu "Nowe zadanie"
  - Pole nazwy zadania
  - Pole opisu zadania
  - Sekcja estymacji czasu/nakładu pracy
  - Przycisk "Estymuj z AI" (opcjonalny)
  - Selektor zależności (zadania poprzedzające)
  - Przyciski "Anuluj" i "Utwórz zadanie"
- **UX i dostępność:**
  - Walidacja pól w czasie rzeczywistym
  - Pomoc kontekstowa dla pól formularza
  - Wyraźne rozróżnienie między polami manualnymi i wspomaganymi przez AI
  - Dostępne kontrolki formularza
  - Obsługa klawiatury (Tab, Enter)

### Modal edycji zadania

- **Kontekst:** Otwierany z listy zadań w bloku funkcjonalnym
- **Główny cel:** Umożliwienie użytkownikowi edycji istniejącego zadania
- **Kluczowe informacje:** Formularz edycji zadania z wypełnionymi polami
- **Kluczowe komponenty:**
  - Nagłówek modalu "Edycja zadania"
  - Pole nazwy zadania (wypełnione)
  - Pole opisu zadania (wypełnione)
  - Sekcja estymacji czasu/nakładu pracy (wypełniona)
  - Przycisk "Estymuj z AI" (opcjonalny)
  - Selektor zależności (zadania poprzedzające) z wybranymi wartościami
  - Przyciski "Anuluj" i "Zapisz zmiany"
- **UX i dostępność:**
  - Walidacja pól w czasie rzeczywistym
  - Pomoc kontekstowa dla pól formularza
  - Wyraźne rozróżnienie między polami manualnymi i wspomaganymi przez AI
  - Dostępne kontrolki formularza
  - Obsługa klawiatury (Tab, Enter)

### Modal generowania zadań z AI

- **Kontekst:** Otwierany po kliknięciu "Generuj zadania z AI" w bloku funkcjonalnym
- **Główny cel:** Umożliwienie generowania i przeglądu zadań proponowanych przez AI
- **Kluczowe informacje:** Lista wygenerowanych zadań z możliwością edycji i akceptacji
- **Kluczowe komponenty:**
  - Nagłówek modalu "Zadania proponowane przez AI"
  - Stan ładowania podczas przetwarzania przez AI
  - Lista wygenerowanych zadań z podstawowymi informacjami
  - Opcje edycji dla każdego wygenerowanego zadania
  - Checkboxy do wyboru zadań do zaakceptowania
  - Przycisk "Dodaj wybrane zadania" i "Anuluj"
  - Komponent oceny przydatności sugestii AI
- **UX i dostępność:**
  - Wyraźne rozróżnienie między istniejącymi i nowo wygenerowanymi zadaniami
  - Możliwość selektywnej akceptacji/odrzucenia wygenerowanych zadań
  - Wskaźniki ładowania podczas przetwarzania przez AI
  - Obsługa błędów w przypadku niepowodzenia AI
  - Dostępne kontrolki interaktywne

### Modal walidacji zadań przez AI

- **Kontekst:** Otwierany po kliknięciu "Waliduj zadania z AI" w bloku funkcjonalnym
- **Główny cel:** Umożliwienie walidacji istniejących zadań przez AI
- **Kluczowe informacje:** Lista zadań z komentarzami walidacyjnymi AI
- **Kluczowe komponenty:**
  - Nagłówek modalu "Walidacja zadań przez AI"
  - Stan ładowania podczas przetwarzania przez AI
  - Lista zadań z komentarzami walidacyjnymi
  - Wskazówki dotyczące estymacji, kompletności i spójności
  - Przyciski "Zastosuj sugestie" i "Zamknij"
  - Komponent oceny przydatności walidacji AI
- **UX i dostępność:**
  - Wyraźne oznaczenie zadań z problemami
  - Przejrzyste komentarze walidacyjne
  - Wskaźniki ładowania podczas przetwarzania przez AI
  - Dostępne kontrolki interaktywne

## 3. Mapa podróży użytkownika

### Proces tworzenia i zarządzania zadaniami

1. **Przeglądanie bloków funkcjonalnych** - Użytkownik przechodzi do zakładki bloków funkcjonalnych w widoku projektu
2. **Rozwinięcie bloku** - Klika na blok funkcjonalny, aby rozwinąć jego zawartość
3. **Przeglądanie zadań** - Przegląda listę istniejących zadań w bloku funkcjonalnym
4. **Tworzenie nowego zadania** - Klika "Dodaj zadanie", wypełnia formularz i zatwierdza
5. **Edycja zadania** - W razie potrzeby, klika ikonę edycji przy zadaniu, modyfikuje dane i zatwierdza zmiany
6. **Definiowanie zależności** - Podczas tworzenia lub edycji zadania, wybiera zadania poprzedzające z listy
7. **Usuwanie zadania** - W razie potrzeby, klika ikonę usunięcia przy zadaniu i potwierdza operację

### Proces generowania zadań przez AI

1. **Inicjacja generowania** - Z widoku bloku funkcjonalnego, użytkownik klika "Generuj zadania z AI"
2. **Oczekiwanie** - Obserwuje wskaźnik ładowania podczas przetwarzania przez AI
3. **Przegląd propozycji** - Przegląda listę wygenerowanych zadań
4. **Selekcja zadań** - Wybiera zadania, które chce dodać do bloku funkcjonalnego
5. **Edycja wygenerowanych zadań** - Opcjonalnie modyfikuje szczegóły wygenerowanych zadań
6. **Akceptacja zadań** - Klika "Dodaj wybrane zadania", aby zapisać zaakceptowane zadania
7. **Feedback** - Ocenia przydatność sugestii AI za pomocą systemu oceny

### Proces estymacji zadań z AI

1. **Wybór zadania** - Użytkownik tworzy nowe zadanie lub edytuje istniejące
2. **Inicjacja estymacji** - Klika "Estymuj z AI" w formularzu zadania
3. **Oczekiwanie** - Obserwuje wskaźnik ładowania podczas przetwarzania przez AI
4. **Przegląd estymacji** - Otrzymuje sugerowany czas/nakład pracy od AI
5. **Akceptacja lub modyfikacja** - Akceptuje sugestię AI lub modyfikuje ją manualnie
6. **Zapisanie** - Zatwierdza formularz z wybraną estymacją

### Proces walidacji zadań przez AI

1. **Wybór bloku funkcjonalnego** - Z listy bloków funkcjonalnych, użytkownik rozszerza wybrany blok
2. **Inicjacja walidacji** - Klika "Waliduj zadania z AI" dla danego bloku
3. **Oczekiwanie** - Obserwuje wskaźnik ładowania podczas przetwarzania przez AI
4. **Przegląd walidacji** - Otrzymuje komentarze walidacyjne dla zadań w bloku
5. **Zastosowanie sugestii** - Opcjonalnie klika "Zastosuj sugestie" aby automatycznie poprawić problemy
6. **Zamknięcie** - Zamyka modal walidacji i wraca do listy zadań
7. **Feedback** - Ocenia przydatność walidacji AI za pomocą systemu oceny

## 4. Układ i struktura nawigacji

### Integracja z istniejącą strukturą

- Zarządzanie zadaniami jest zintegrowane z widokiem bloków funkcjonalnych
- Nie wymaga dodatkowych elementów w głównej nawigacji
- Wszystkie operacje na zadaniach są dostępne bezpośrednio z widoku bloku funkcjonalnego

### Nawigacja w bloku funkcjonalnym

- Przycisk rozwijania/zwijania listy zadań w bloku funkcjonalnym
- Przyciski akcji dla zadań (dodawanie, generowanie przez AI, walidacja)
- Przyciski akcji dla każdego zadania (edycja, usunięcie)

### Nawigacja w modalach

- Modalne okna z przyciskami akcji (Anuluj, Zapisz/Zatwierdź)
- Navigacja klawiaturą między polami formularza
- Przyciski przełączające między różnymi sekcjami modalu (np. w generatorze zadań)

### Wskaźniki stanu

- Wyróżnienie aktywnego bloku funkcjonalnego
- Wizualne oznaczenie źródła zadania (manualne/AI)
- Oznaczenia zależności między zadaniami
- Wskaźniki błędów walidacji i statusu

## 5. Kluczowe komponenty

### Komponenty zadań

- **TaskList** - Lista zadań w ramach bloku funkcjonalnego z możliwością sortowania i filtrowania
- **TaskItem** - Pojedyncze zadanie w liście z podstawowymi informacjami i akcjami
- **TaskForm** - Formularz tworzenia i edycji zadania
- **TaskDependencySelector** - Komponent wyboru zależności między zadaniami
- **TaskEmptyState** - Stan pusty dla bloków bez zadań

### Komponenty AI

- **AITaskGenerator** - Komponent obsługujący proces generowania zadań przez AI
- **AITaskEstimator** - Komponent obsługujący proces estymacji zadań przez AI
- **AITaskValidator** - Komponent obsługujący proces walidacji zadań przez AI
- **AIGeneratedTaskPreview** - Podgląd zadań wygenerowanych przez AI z opcjami selekcji
- **AIFeedbackTask** - Komponenty oceny przydatności sugestii AI dla zadań

### Komponenty modalne

- **CreateTaskModal** - Modal tworzenia nowego zadania
- **EditTaskModal** - Modal edycji istniejącego zadania
- **GenerateTasksModal** - Modal generowania zadań przez AI
- **ValidateTasksModal** - Modal walidacji zadań przez AI
- **DeleteTaskConfirmationModal** - Modal potwierdzenia usunięcia zadania

### Komponenty pomocnicze

- **TaskEstimationInput** - Komponent wprowadzania estymacji czasu/nakładu pracy
- **TaskStatusBadge** - Etykieta statusu zadania
- **TaskDependencyBadge** - Etykieta zależności zadania
- **TaskSourceIndicator** - Wskaźnik źródła zadania (manualne/AI)
- **TaskValidationMessage** - Komunikat walidacyjny dla zadania
