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
| default_estimation_unit | VARCHAR(20) | NOT NULL, DEFAULT 'hours' | Preferowana jednostka estymacji (hours/story_points) |
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
| estimation_unit | VARCHAR(20) | NOT NULL, DEFAULT 'hours' | Jednostka estymacji dla zadań w projekcie (hours/story_points) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data utworzenia projektu |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data aktualizacji projektu |
| deleted_at | TIMESTAMP WITH TIME ZONE | | Data usunięcia projektu (soft delete) |

### 1.3 Tabela `tasks`
Przechowuje zadania należące do bloków funkcjonalnych projektów.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator zadania |
| project_id | UUID | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | ID projektu, do którego należy zadanie |
| functional_block_id | VARCHAR(100) | NOT NULL | Identyfikator bloku funkcjonalnego z JSONB w tabeli projects |
| name | VARCHAR(200) | NOT NULL | Nazwa zadania |
| description | TEXT | | Szczegółowy opis zadania |
| priority | task_priority_enum | NOT NULL, DEFAULT 'medium' | Priorytet zadania (low, medium, high) |
| estimated_value | DECIMAL(10,2) | | Wartość estymacji (liczba godzin lub story points) |
| estimated_by_ai | BOOLEAN | NOT NULL, DEFAULT FALSE | Czy estymacja została wykonana przez AI |
| ai_confidence_score | DECIMAL(3,2) | | Poziom pewności AI w estymacji (0.00-1.00) |
| ai_suggestion_context | VARCHAR(100) | | Kontekst sugestii AI dla celów feedback |
| ai_suggestion_hash | VARCHAR(64) | | Hash sugestii AI dla celów feedback |
| metadata | JSONB | | Dodatkowe metadane zadania |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data utworzenia zadania |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data aktualizacji zadania |
| deleted_at | TIMESTAMP WITH TIME ZONE | | Data usunięcia zadania (soft delete) |

### 1.4 Tabela `task_dependencies`
Przechowuje zależności między zadaniami (relacje poprzednik/następnik).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator zależności |
| predecessor_task_id | UUID | NOT NULL, REFERENCES tasks(id) ON DELETE CASCADE | ID zadania poprzedzającego |
| successor_task_id | UUID | NOT NULL, REFERENCES tasks(id) ON DELETE CASCADE | ID zadania następującego |
| dependency_type | VARCHAR(50) | NOT NULL, DEFAULT 'finish_to_start' | Typ zależności między zadaniami |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data utworzenia zależności |

### 1.5 Tabela `user_activities`
Rejestruje aktywności użytkowników w systemie.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator aktywności |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) | ID użytkownika |
| activity_type | VARCHAR(50) | NOT NULL | Typ aktywności (np. 'login', 'create_project', 'edit_project') |
| duration_seconds | INTEGER | | Czas spędzony na danej aktywności w sekundach |
| metadata | JSONB | | Dodatkowe informacje o aktywności |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Data i czas aktywności |

### 1.6 Tabela `ai_suggestion_feedbacks`
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

### 1.7 Tabela `user_sessions`
Przechowuje informacje o sesjach użytkowników.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unikalny identyfikator sesji |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) | ID użytkownika |
| start_time | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Czas rozpoczęcia sesji |
| end_time | TIMESTAMP WITH TIME ZONE | | Czas zakończenia sesji |
| total_duration_seconds | INTEGER | | Całkowity czas trwania sesji w sekundach |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Czy sesja jest aktywna |

## 2. Typy wyliczeniowe (ENUM)

### 2.1 task_priority_enum
```sql
CREATE TYPE task_priority_enum AS ENUM ('low', 'medium', 'high');
```

## 3. Relacje między tabelami

| Tabela źródłowa | Relacja | Tabela docelowa | Opis |
|----------------|----------|-----------------|------|
| profiles | 1:N | projects | Użytkownik może mieć wiele projektów |
| profiles | 1:N | user_activities | Użytkownik może mieć wiele aktywności |
| profiles | 1:N | ai_suggestion_feedbacks | Użytkownik może mieć wiele ocen sugestii AI |
| profiles | 1:N | user_sessions | Użytkownik może mieć wiele sesji |
| projects | 1:N | tasks | Projekt może mieć wiele zadań |
| tasks | N:N | tasks | Zadania mogą mieć zależności między sobą (przez task_dependencies) |

## 4. Indeksy

| Tabela | Kolumna | Typ indeksu | Opis |
|--------|---------|-------------|------|
| profiles | default_estimation_unit | B-tree | Przyspiesza filtrowanie po jednostce estymacji |
| projects | user_id | B-tree | Przyspiesza wyszukiwanie projektów dla danego użytkownika |
| projects | (functional_blocks) | GIN | Przyspiesza wyszukiwanie w strukturze JSONB bloków funkcjonalnych |
| projects | (schedule) | GIN | Przyspiesza wyszukiwanie w strukturze JSONB harmonogramów |
| projects | deleted_at | B-tree | Przyspiesza filtrowanie usuniętych/nieusiniętych projektów |
| projects | estimation_unit | B-tree | Przyspiesza filtrowanie po jednostce estymacji projektu |
| tasks | project_id | B-tree | Przyspiesza wyszukiwanie zadań dla danego projektu |
| tasks | functional_block_id | B-tree | Przyspiesza wyszukiwanie zadań dla danego bloku funkcjonalnego |
| tasks | (project_id, functional_block_id) | B-tree | Przyspiesza złożone zapytania zadań w ramach bloku |
| tasks | priority | B-tree | Przyspiesza filtrowanie po priorytecie |
| tasks | estimated_by_ai | B-tree | Przyspiesza filtrowanie zadań estymowanych przez AI |
| tasks | deleted_at | B-tree | Przyspiesza filtrowanie usuniętych/nieusiniętych zadań |
| tasks | (metadata) | GIN | Przyspiesza wyszukiwanie w metadanych JSONB |
| task_dependencies | predecessor_task_id | B-tree | Przyspiesza wyszukiwanie zależności dla zadania |
| task_dependencies | successor_task_id | B-tree | Przyspiesza wyszukiwanie zadań zależnych |
| task_dependencies | (predecessor_task_id, successor_task_id) | UNIQUE B-tree | Zapobiega duplikatom zależności |
| user_activities | user_id | B-tree | Przyspiesza wyszukiwanie aktywności dla danego użytkownika |
| user_activities | activity_type | B-tree | Przyspiesza wyszukiwanie po typie aktywności |
| ai_suggestion_feedbacks | user_id | B-tree | Przyspiesza wyszukiwanie ocen od danego użytkownika |
| ai_suggestion_feedbacks | (suggestion_context, suggestion_hash) | B-tree | Przyspiesza wyszukiwanie konkretnych sugestii |
| user_sessions | user_id | B-tree | Przyspiesza wyszukiwanie sesji dla danego użytkownika |
| user_sessions | is_active | B-tree | Przyspiesza wyszukiwanie aktywnych sesji |
| ## 5. Zasady PostgreSQL Row Level Security (RLS)

### 5.1 RLS dla tabeli `profiles`

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

### 5.2 RLS dla tabeli `projects`

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
  USING (auth.uid() = user_id AND deleted_at IS NULL);
```

### 5.3 RLS dla tabeli `tasks`

```sql
-- Zasada dostępu do odczytu zadań
CREATE POLICY "Użytkownicy mogą czytać zadania tylko ze swoich projektów" 
  ON tasks FOR SELECT 
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id) 
    AND deleted_at IS NULL
  );

-- Zasada dostępu do tworzenia zadań
CREATE POLICY "Użytkownicy mogą tworzyć zadania tylko w swoich projektach" 
  ON tasks FOR INSERT 
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  );

-- Zasada dostępu do aktualizacji zadań
CREATE POLICY "Użytkownicy mogą aktualizować zadania tylko ze swoich projektów" 
  ON tasks FOR UPDATE 
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id) 
    AND deleted_at IS NULL
  );

-- Zasada dostępu do usuwania zadań (soft delete)
CREATE POLICY "Użytkownicy mogą usuwać zadania tylko ze swoich projektów" 
  ON tasks FOR UPDATE 
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id) 
    AND deleted_at IS NULL
  );
```

### 5.4 RLS dla tabeli `task_dependencies`

```sql
-- Zasada dostępu do odczytu zależności zadań
CREATE POLICY "Użytkownicy mogą czytać zależności zadań tylko ze swoich projektów" 
  ON task_dependencies FOR SELECT 
  USING (
    auth.uid() = (
      SELECT p.user_id FROM projects p 
      JOIN tasks t ON p.id = t.project_id 
      WHERE t.id = predecessor_task_id OR t.id = successor_task_id
    )
  );

-- Zasada dostępu do tworzenia zależności zadań
CREATE POLICY "Użytkownicy mogą tworzyć zależności zadań tylko w swoich projektach" 
  ON task_dependencies FOR INSERT 
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id FROM projects p 
      JOIN tasks t ON p.id = t.project_id 
      WHERE t.id = predecessor_task_id
    ) AND
    auth.uid() = (
      SELECT p.user_id FROM projects p 
      JOIN tasks t ON p.id = t.project_id 
      WHERE t.id = successor_task_id
    )
  );

-- Zasada dostępu do usuwania zależności zadań
CREATE POLICY "Użytkownicy mogą usuwać zależności zadań tylko ze swoich projektów" 
  ON task_dependencies FOR DELETE 
  USING (
    auth.uid() = (
      SELECT p.user_id FROM projects p 
      JOIN tasks t ON p.id = t.project_id 
      WHERE t.id = predecessor_task_id OR t.id = successor_task_id
    )
  );
```

### 5.5 RLS dla pozostałych tabel

```sql
-- user_activities
CREATE POLICY "Użytkownicy mogą czytać tylko swoje aktywności" 
  ON user_activities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje aktywności" 
  ON user_activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ai_suggestion_feedbacks
CREATE POLICY "Użytkownicy mogą czytać tylko swoje oceny sugestii" 
  ON ai_suggestion_feedbacks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje oceny sugestii" 
  ON ai_suggestion_feedbacks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje oceny sugestii" 
  ON ai_suggestion_feedbacks FOR UPDATE 
  USING (auth.uid() = user_id);

-- user_sessions
CREATE POLICY "Użytkownicy mogą czytać tylko swoje sesje" 
  ON user_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje sesje" 
  ON user_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje sesje" 
  ON user_sessions FOR UPDATE 
  USING (auth.uid() = user_id);
```

## 6. Ograniczenia i walidacje

### 6.1 Ograniczenia tabel

```sql
-- Sprawdzenie poprawności jednostek estymacji w profilu
ALTER TABLE profiles ADD CONSTRAINT check_default_estimation_unit 
  CHECK (default_estimation_unit IN ('hours', 'story_points'));

-- Sprawdzenie poprawności jednostek estymacji w projekcie
ALTER TABLE projects ADD CONSTRAINT check_estimation_unit 
  CHECK (estimation_unit IN ('hours', 'story_points'));

-- Sprawdzenie poprawności wartości estymacji
ALTER TABLE tasks ADD CONSTRAINT check_estimated_value_positive 
  CHECK (estimated_value IS NULL OR estimated_value > 0);

-- Sprawdzenie poprawności wyniku pewności AI
ALTER TABLE tasks ADD CONSTRAINT check_ai_confidence_score_range 
  CHECK (ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 1));

-- Zapobieganie cyklicznym zależnościom zadań (prostych)
ALTER TABLE task_dependencies ADD CONSTRAINT check_no_self_dependency 
  CHECK (predecessor_task_id != successor_task_id);
```

### 6.2 Triggery

```sql
-- Trigger automatycznej aktualizacji updated_at w tabeli profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_suggestion_feedbacks_updated_at BEFORE UPDATE ON ai_suggestion_feedbacks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 7. Uwagi projektowe

### 7.1 Decyzje projektowe dotyczące zadań

1. **Jednostki estymacji**: Przechowywane zarówno na poziomie profilu użytkownika (domyślna preferencja) jak i projektu (konkretne ustawienie). Dzięki temu każdy projekt może mieć własną jednostkę estymacji.

2. **Priorytet zadań**: Implementowany jako ENUM z trzema poziomami zgodnie z wymaganiami MVP. Można łatwo rozszerzyć w przyszłości.

3. **Zależności zadań**: Prosta implementacja relacji poprzednik/następnik z możliwością rozszerzenia o różne typy zależności w przyszłości.

4. **Integracja z AI**: Zadania zawierają pola wspierające śledzenie sugestii AI i możliwość zbierania feedback podobnie jak w istniejącym systemie.

5. **Soft delete**: Wszystkie główne tabele wspierają soft delete dla zachowania integralności danych i możliwości odzyskania.

6. **JSONB dla metadanych**: Elastyczne przechowywanie dodatkowych informacji o zadaniach bez konieczności zmian schematu.

### 7.2 Wydajność i skalowalność

1. **Indeksy kompozytowe**: Dla często używanych kombinacji zapytań (np. project_id + functional_block_id).

2. **GIN indeksy**: Dla efektywnego wyszukiwania w strukturach JSONB.

3. **Unikalne ograniczenia**: Zapobieganie duplikatom zależności między zadaniami.

4. **RLS optymalizacja**: Zapytania RLS zoptymalizowane pod kątem wydajności z wykorzystaniem indeksów.

### 7.3 Zgodność z istniejącym systemem

1. **Zachowanie spójności**: Nowe tabele wykorzystują te same wzorce co istniejące (UUID, timestamps, soft delete).

2. **Integracja z functional_blocks**: Zadania referencują bloki funkcjonalne przez identyfikator, co pozwala na elastyczną strukturę bez denormalizacji.

3. **System feedback AI**: Wykorzystuje ten sam wzorzec co istniejąca tabela ai_suggestion_feedbacks. 
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

### 5.1 Funkcja i wyzwalacz do automatycznego tworzenia profilu użytkownika

```sql
-- Funkcja tworząca profil użytkownika po rejestracji
CREATE OR REPLACE FUNCTION create_profile_after_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    timezone,
    projects_limit,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'User',                -- Domyślna wartość dla first_name
    NULL,                  -- Domyślna wartość dla last_name (NULL)
    'UTC',                 -- Domyślna strefa czasowa
    5,                     -- Domyślny limit projektów
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wyzwalacz tworzący profil po rejestracji użytkownika
CREATE TRIGGER create_profile_after_signup_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_after_signup();
```

### 5.2 Funkcja i wyzwalacz dla aktualizacji `updated_at`

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

### 5.3 Funkcja i wyzwalacz dla sprawdzania limitu projektów

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

### 5.4 Funkcja i wyzwalacz dla aktualizacji czasu ostatniego logowania

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