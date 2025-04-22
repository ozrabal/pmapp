# Schemat bazy danych PostgreSQL dla Plan My App

## 1. Tabele i kolumny

### 1.1 Tabela `profiles`
Rozszerza funkcjonalność wbudowanej tabeli `auth.users` Supabase o dodatkowe informacje o użytkownikach.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL | Unikalny identyfikator profilu, zgodny z id z auth.users |
| first_name | VARCHAR(100) | NOT NULL | Imię użytkownika |
| last_name | VARCHAR(100) | | Nazwisko użytkownika |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' | Strefa czasowa użytkownika |
| last_login_at | TIMESTAMP WITH TIME ZONE | | Data i czas ostatniego logowania |
| projects_limit | INTEGER | NOT NULL, DEFAULT 5 | Limit liczby projektów dla użytkownika |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data utworzenia profilu |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data aktualizacji profilu |
| deleted_at | TIMESTAMP WITH TIME ZONE | | Data usunięcia konta (soft delete) |

### 1.2 Tabela `projects`
Przechowuje informacje o projektach użytkowników.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator projektu |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) | ID użytkownika będącego właścicielem projektu |
| name | VARCHAR(200) | NOT NULL | Nazwa projektu |
| description | TEXT | | Opis projektu |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'active' | Status projektu (np. 'active', 'archived', 'completed') |
| assumptions | JSONB | | Podstawowe założenia projektu jako struktura JSON |
| functional_blocks | JSONB | | Bloki funkcjonalne projektu jako zagnieżdżona struktura JSON |
| schedule | JSONB | | Harmonogram projektu jako serializowany obiekt JSON |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data utworzenia projektu |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data aktualizacji projektu |
| deleted_at | TIMESTAMP WITH TIME ZONE | | Data usunięcia projektu (soft delete) |

### 1.3 Tabela `user_activities`
Rejestruje aktywności użytkowników w systemie.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator aktywności |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) | ID użytkownika |
| activity_type | VARCHAR(50) | NOT NULL | Typ aktywności (np. 'login', 'create_project', 'edit_project') |
| duration_seconds | INTEGER | | Czas spędzony na danej aktywności w sekundach |
| metadata | JSONB | | Dodatkowe informacje o aktywności |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data i czas aktywności |

### 1.4 Tabela `ai_suggestion_feedbacks`
Przechowuje oceny sugestii AI przez użytkowników.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator oceny |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) | ID użytkownika |
| suggestion_context | VARCHAR(100) | NOT NULL | Kontekst, w którym sugestia została wygenerowana |
| suggestion_hash | VARCHAR(64) | NOT NULL | Hash identyfikujący konkretną sugestię |
| is_helpful | BOOLEAN | NOT NULL | Czy sugestia była przydatna |
| feedback_text | TEXT | | Dodatkowy komentarz od użytkownika |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data i czas udzielenia oceny |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data i czas aktualizacji oceny |

### 1.5 Tabela `user_sessions`
Przechowuje informacje o sesjach użytkowników.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator sesji |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) | ID użytkownika |
| start_time | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Czas rozpoczęcia sesji |
| end_time | TIMESTAMP WITH TIME ZONE | | Czas zakończenia sesji |
| total_duration_seconds | INTEGER | | Całkowity czas trwania sesji w sekundach |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Czy sesja jest aktywna |

## 2. Relacje między tabelami

| Tabela źródłowa | Relacja | Tabela docelowa | Opis |
|----------------|----------|-----------------|------|
| profiles | 1:N | projects | Użytkownik może mieć wiele projektów |
| profiles | 1:N | user_activities | Użytkownik może mieć wiele aktywności |
| profiles | 1:N | ai_suggestion_feedbacks | Użytkownik może mieć wiele ocen sugestii AI |
| profiles | 1:N | user_sessions | Użytkownik może mieć wiele sesji |

## 3. Indeksy

| Tabela | Kolumna | Typ indeksu | Opis |
|--------|---------|-------------|------|
| projects | user_id | B-tree | Przyspiesza wyszukiwanie projektów dla danego użytkownika |
| projects | (functional_blocks) | GIN | Przyspiesza wyszukiwanie w strukturze JSONB bloków funkcjonalnych |
| projects | (schedule) | GIN | Przyspiesza wyszukiwanie w strukturze JSONB harmonogramów |
| projects | deleted_at | B-tree | Przyspiesza filtrowanie usuniętych/nieusiniętych projektów |
| user_activities | user_id | B-tree | Przyspiesza wyszukiwanie aktywności dla danego użytkownika |
| user_activities | activity_type | B-tree | Przyspiesza wyszukiwanie po typie aktywności |
| ai_suggestion_feedbacks | user_id | B-tree | Przyspiesza wyszukiwanie ocen od danego użytkownika |
| ai_suggestion_feedbacks | (suggestion_context, suggestion_hash) | B-tree | Przyspiesza wyszukiwanie konkretnych sugestii |
| user_sessions | user_id | B-tree | Przyspiesza wyszukiwanie sesji dla danego użytkownika |
| user_sessions | is_active | B-tree | Przyspiesza wyszukiwanie aktywnych sesji |

## 4. Zasady PostgreSQL Row Level Security (RLS)

### 4.1 RLS dla tabeli `profiles`

```sql
-- Zasada dostępu do odczytu profilu
CREATE POLICY "Użytkownicy mogą czytać tylko swój profil" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Zasada dostępu do aktualizacji profilu
CREATE POLICY "Użytkownicy mogą aktualizować tylko swój profil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### 4.2 RLS dla tabeli `projects`

```sql
-- Zasada dostępu do odczytu projektów
CREATE POLICY "Użytkownicy mogą czytać tylko swoje projekty" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Zasada dostępu do tworzenia projektów
CREATE POLICY "Użytkownicy mogą tworzyć swoje projekty" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Zasada dostępu do aktualizacji projektów
CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje projekty" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Zasada dostępu do usuwania projektów (soft delete)
CREATE POLICY "Użytkownicy mogą usuwać tylko swoje projekty" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL);
```

### 4.3 RLS dla tabeli `user_activities`

```sql
-- Zasada dostępu do odczytu aktywności
CREATE POLICY "Użytkownicy mogą czytać tylko swoje aktywności" 
  ON user_activities FOR SELECT 
  USING (auth.uid() = user_id);

-- Zasada dostępu do tworzenia wpisów aktywności
CREATE POLICY "System może tworzyć wpisy aktywności" 
  ON user_activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### 4.4 RLS dla tabeli `ai_suggestion_feedbacks`

```sql
-- Zasada dostępu do odczytu ocen sugestii
CREATE POLICY "Użytkownicy mogą czytać tylko swoje oceny sugestii" 
  ON ai_suggestion_feedbacks FOR SELECT 
  USING (auth.uid() = user_id);

-- Zasada dostępu do tworzenia ocen sugestii
CREATE POLICY "Użytkownicy mogą tworzyć swoje oceny sugestii" 
  ON ai_suggestion_feedbacks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Zasada dostępu do aktualizacji ocen sugestii
CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje oceny sugestii" 
  ON ai_suggestion_feedbacks FOR UPDATE 
  USING (auth.uid() = user_id);
```

### 4.5 RLS dla tabeli `user_sessions`

```sql
-- Zasada dostępu do odczytu sesji
CREATE POLICY "Użytkownicy mogą czytać tylko swoje sesje" 
  ON user_sessions FOR SELECT 
  USING (auth.uid() = user_id);

-- Zasada dostępu do tworzenia sesji
CREATE POLICY "System może tworzyć wpisy sesji" 
  ON user_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Zasada dostępu do aktualizacji sesji
CREATE POLICY "System może aktualizować sesje" 
  ON user_sessions FOR UPDATE 
  USING (auth.uid() = user_id);
```

## 5. Funkcje i wyzwalacze

### 5.1 Funkcja i wyzwalacz dla aktualizacji `updated_at`

```sql
-- Funkcja aktualizująca pole updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Wyzwalacz dla tabeli profiles
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Wyzwalacz dla tabeli projects
CREATE TRIGGER update_projects_modtime
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Wyzwalacz dla tabeli ai_suggestion_feedbacks
CREATE TRIGGER update_ai_suggestion_feedbacks_modtime
BEFORE UPDATE ON ai_suggestion_feedbacks
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
```

### 5.2 Funkcja i wyzwalacz dla sprawdzania limitu projektów

```sql
-- Funkcja sprawdzająca limit projektów użytkownika
CREATE OR REPLACE FUNCTION check_projects_limit()
RETURNS TRIGGER AS $$
DECLARE
  projects_count INTEGER;
  max_projects INTEGER;
BEGIN
  SELECT COUNT(*) INTO projects_count 
  FROM projects 
  WHERE user_id = NEW.user_id AND deleted_at IS NULL;
  
  SELECT projects_limit INTO max_projects 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  IF projects_count >= max_projects THEN
    RAISE EXCEPTION 'Przekroczono limit projektów dla tego użytkownika';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Wyzwalacz dla sprawdzania limitu przed dodaniem nowego projektu
CREATE TRIGGER check_projects_limit_trigger
BEFORE INSERT ON projects
FOR EACH ROW EXECUTE PROCEDURE check_projects_limit();
```

### 5.3 Funkcja i wyzwalacz dla aktualizacji czasu ostatniego logowania

```sql
-- Funkcja aktualizująca czas ostatniego logowania
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Wyzwalacz dla aktualizacji czasu logowania po utworzeniu nowej sesji
CREATE TRIGGER update_last_login_trigger
AFTER INSERT ON user_sessions
FOR EACH ROW
WHEN (NEW.is_active = TRUE)
EXECUTE PROCEDURE update_last_login();
```

## 6. Dodatkowe uwagi i objaśnienia

1. **Schemat uwierzytelniania**:
   - Korzystamy z wbudowanego mechanizmu `auth.users` Supabase, który zapewnia podstawową funkcjonalność uwierzytelniania.
   - Tabela `profiles` rozszerza funkcjonalność `auth.users` o dodatkowe informacje o użytkownikach.
   - Weryfikacja adresu email i resetowanie hasła jest obsługiwane przez Supabase Auth.

2. **Soft Delete**:
   - Zaimplementowaliśmy mechanizm soft delete dla tabel `profiles` i `projects` poprzez kolumnę `deleted_at`.
   - Dane są przechowywane przez 30 dni po usunięciu zgodnie z wymogami RODO. Można to zaimplementować poprzez cykliczne zadanie usuwające rekordy, gdzie `deleted_at` jest starsze niż 30 dni.

3. **Struktura danych JSONB**:
   - Wykorzystujemy typ danych JSONB dla elastycznego przechowywania złożonych struktur:
     - `assumptions` - założenia projektu
     - `functional_blocks` - bloki funkcjonalne z zależnościami
     - `schedule` - harmonogram projektu
   - Proponowana struktura dla `functional_blocks`:
     ```json
     {
       "blocks": [
         {
           "id": "b1",
           "name": "Logowanie użytkownika",
           "description": "Funkcjonalność logowania",
           "dependencies": ["b2", "b3"],
           "category": "authentication",
           "order": 1
         }
       ]
     }
     ```

   - Proponowana struktura dla `schedule`:
     ```json
     {
       "stages": [
         {
           "id": "s1",
           "name": "Projektowanie interfejsu",
           "start_date": null,
           "end_date": null,
           "dependencies": ["s2"],
           "related_blocks": ["b1", "b2"],
           "order": 1
         }
       ]
     }
     ```

4. **Śledzenie aktywności użytkowników**:
   - Tabela `user_activities` śledzi różne typy aktywności użytkowników.
   - Tabela `user_sessions` śledzi sesje użytkowników i czas spędzony w aplikacji.
   - Łącząc te dwie tabele, można uzyskać dokładne dane o korzystaniu z aplikacji.

5. **Ocena sugestii AI**:
   - Tabela `ai_suggestion_feedbacks` przechowuje tylko ostatnią ocenę dla każdej sugestii (identyfikowanej przez `suggestion_hash`).
   - Nie przechowujemy samych sugestii AI ani nieprzetworzonych danych wejściowych dla modelu AI.

6. **Skalowalność**:
   - Wszystkie tabele używają UUID jako kluczy podstawowych, co ułatwia potencjalną dystrybucję danych w przyszłości.
   - Indeksy GIN dla kolumn JSONB umożliwiają wydajne wyszukiwanie w złożonych strukturach danych.
   - Struktura zapewnia możliwość łatwego rozszerzenia w przyszłości (np. o organizacje, zespoły, wersjonowanie).

7. **Bezpieczeństwo**:
   - Row Level Security (RLS) zapewnia, że użytkownicy mają dostęp tylko do swoich danych.
   - Każda tabela ma zdefiniowane zasady RLS dla różnych operacji (SELECT, INSERT, UPDATE, DELETE).
   - Wykorzystujemy mechanizm uwierzytelniania Supabase, który zapewnia bezpieczne przechowywanie haseł.