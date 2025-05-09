# Plan implementacji widoku szczegółów projektu

## 1. Przegląd
Widok szczegółów projektu umożliwia użytkownikowi przeglądanie kompleksowych informacji o projekcie podzielonych na sekcje: opis, założenia, bloki funkcjonalne oraz harmonogram. Strona oferuje intuicyjną nawigację między sekcjami, opcje edycji projektu oraz eksportu danych projektu do zewnętrznych formatów.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/projects/:id`, gdzie `:id` to unikalny identyfikator projektu (UUID).

## 3. Struktura komponentów
```
ProjectDetailsPage (Astro)
├── ProjectHeader (Astro)
│   ├── EditProjectButton (React)
│   └── BackToProjectsButton (React)
├── ProjectTabsNavigation (React)
├── ErrorBoundary (React)
│   └── ProjectDetailsContent (React)
│       ├── LoadingSkeleton (React) [warunkowy]
│       ├── ProjectAssumptionsPanel (React) [warunkowy]
│       ├── ProjectFunctionalBlocksPanel (React) [warunkowy]
│       └── ProjectSchedulePanel (React) [warunkowy]
└── ExportButton (React)
```

## 4. Szczegóły komponentów

### ProjectDetailsPage (Astro)
- **Opis komponentu**: Główny plik strony Astro, który działa jako kontener dla wszystkich komponentów widoku szczegółów projektu. Pobiera parametr identyfikatora projektu z URL i odpowiada za wstępną walidację oraz przekazanie go do wewnętrznych komponentów.
- **Główne elementy**: Struktura strony, metadane, importy niezbędnych komponentów.
- **Obsługiwane interakcje**: Wczytanie strony, przekierowanie w przypadku nieprawidłowego ID.
- **Obsługiwana walidacja**: Sprawdzenie formatu UUID identyfikatora projektu.
- **Typy**: Wykorzystuje typy ProjectDto, ErrorResponseDto.
- **Propsy**: Jako komponent strony Astro, nie przyjmuje propsów od rodzica.

### ProjectHeader (Astro)
- **Opis komponentu**: Nagłówek widoku projektu prezentujący podstawowe informacje o projekcie, zawierający przyciski nawigacyjne.
- **Główne elementy**: Tytuł projektu, przyciski nawigacyjne (powrót do listy projektów, edycja projektu).
- **Obsługiwane interakcje**: Kliknięcia przycisków nawigacyjnych.
- **Obsługiwana walidacja**: Brak specyficznej walidacji.
- **Typy**: Wykorzystuje podstawowe pola z ProjectDto (id, name).
- **Propsy**: 
  - `project`: Pick<ProjectDto, 'id' | 'name'>
  - `isLoading`: boolean

### EditProjectButton (React)
- **Opis komponentu**: Przycisk umożliwiający przejście do strony edycji projektu.
- **Główne elementy**: Przycisk z odpowiednią ikonką i etykietą.
- **Obsługiwane interakcje**: Kliknięcie przenoszące na stronę edycji.
- **Obsługiwana walidacja**: Brak specyficznej walidacji.
- **Typy**: Podstawowe typy dla identyfikatora projektu.
- **Propsy**: 
  - `projectId`: string
  - `disabled`: boolean (opcjonalnie)

### BackToProjectsButton (React)
- **Opis komponentu**: Przycisk umożliwiający powrót do listy projektów.
- **Główne elementy**: Przycisk z odpowiednią ikonką i etykietą.
- **Obsługiwane interakcje**: Kliknięcie przenoszące na stronę listy projektów.
- **Obsługiwana walidacja**: Brak specyficznej walidacji.
- **Typy**: Brak specyficznych typów.
- **Propsy**: Brak wymaganych propsów.

### ProjectTabsNavigation (React)
- **Opis komponentu**: Komponent nawigacyjny umożliwiający przełączanie się między różnymi sekcjami projektu.
- **Główne elementy**: Zakładki odpowiadające różnym sekcjom projektu (opis, założenia, bloki funkcjonalne, harmonogram).
- **Obsługiwane interakcje**: Wybór zakładki, zmiana aktywnej sekcji.
- **Obsługiwana walidacja**: Sprawdzanie, czy wybrana zakładka jest prawidłowa.
- **Typy**: Wykorzystuje typy TabType, ProjectTabProps, ProjectTabsNavigationProps.
- **Propsy**: 
  - `tabs`: ProjectTabProps[]
  - `activeTab`: TabType
  - `onSelectTab`: (tab: TabType) => void (opcjonalnie)
  - `projectId`: string (opcjonalnie)
  - `isLoading`: boolean (opcjonalnie)
  - `className`: string (opcjonalnie)

### ProjectDetailsContent (React)
- **Opis komponentu**: Kontener dla zawartości projektu, który zmienia wyświetlaną zawartość w zależności od wybranej zakładki.
- **Główne elementy**: Panel z zawartością odpowiadającą wybranej zakładce, indykator ładowania, komunikaty błędów.
- **Obsługiwane interakcje**: Obsługa stanu ładowania, wyświetlanie odpowiedniej zawartości.
- **Obsługiwana walidacja**: Sprawdzanie poprawności danych projektu.
- **Typy**: Wykorzystuje typy ProjectDto, TabType, ErrorResponseDto.
- **Propsy**: 
  - `projectId`: string
  - `selectedTab`: TabType
  - `project`: ProjectDto | null
  - `isLoading`: boolean
  - `error`: Error | null

### ProjectDescriptionsPanel (React)
- **Opis komponentu**: Panel wyświetlający opis projektu.
- **Główne elementy**: Formatowana prezentacja opisu projektu.
- **Obsługiwane interakcje**: Potencjalne akcje związane z opisem (tylko przeglądanie w tym widoku).
- **Obsługiwana walidacja**: Sprawdzanie struktury danych założeń.
- **Typy**: Wykorzystuje typ ProjectDescriptionViewModel.
- **Propsy**: 
  - `description`: ProjectDescriptionViewModel | null
  - `isLoading`: boolean

### ProjectAssumptionsPanel (React)
- **Opis komponentu**: Panel wyświetlający założenia projektu.
- **Główne elementy**: Formatowana prezentacja założeń projektu.
- **Obsługiwane interakcje**: Potencjalne akcje związane z założeniami (tylko przeglądanie w tym widoku).
- **Obsługiwana walidacja**: Sprawdzanie struktury danych założeń.
- **Typy**: Wykorzystuje typ AssumptionsViewModel.
- **Propsy**: 
  - `assumptions`: AssumptionsViewModel | null
  - `isLoading`: boolean

### ProjectFunctionalBlocksPanel (React)
- **Opis komponentu**: Panel wyświetlający bloki funkcjonalne projektu.
- **Główne elementy**: Lista bloków funkcjonalnych z odpowiednimi szczegółami.
- **Obsługiwane interakcje**: Potencjalne akcje związane z blokami funkcjonalnymi (tylko przeglądanie w tym widoku).
- **Obsługiwana walidacja**: Sprawdzanie struktury danych bloków funkcjonalnych.
- **Typy**: Wykorzystuje typ FunctionalBlocksViewModel.
- **Propsy**: 
  - `functionalBlocks`: FunctionalBlocksViewModel | null
  - `isLoading`: boolean

### ProjectSchedulePanel (React)
- **Opis komponentu**: Panel wyświetlający harmonogram projektu.
- **Główne elementy**: Wizualizacja harmonogramu projektu, potencjalnie w formie wykresu Gantta lub listy etapów.
- **Obsługiwane interakcje**: Potencjalne akcje związane z harmonogramem (tylko przeglądanie w tym widoku).
- **Obsługiwana walidacja**: Sprawdzanie struktury danych harmonogramu.
- **Typy**: Wykorzystuje typ ScheduleViewModel.
- **Propsy**: 
  - `schedule`: ScheduleViewModel | null
  - `isLoading`: boolean

### LoadingSkeleton (React)
- **Opis komponentu**: Szkielet interfejsu wyświetlany podczas ładowania danych.
- **Główne elementy**: Bloki imitujące wygląd docelowego interfejsu, animacje ładowania.
- **Obsługiwane interakcje**: Brak specyficznych interakcji.
- **Obsługiwana walidacja**: Brak specyficznej walidacji.
- **Typy**: Proste typy konfiguracyjne.
- **Propsy**: 
  - `type`: 'descriptions' | 'assumptions' | 'functional-blocks' | 'schedule'

### ExportButton (React)
- **Opis komponentu**: Przycisk umożliwiający eksport danych projektu.
- **Główne elementy**: Przycisk z ikoną i etykietą, potencjalnie menu wyboru formatu eksportu.
- **Obsługiwane interakcje**: Kliknięcie inicjujące proces eksportu, wybór formatu eksportu.
- **Obsługiwana walidacja**: Sprawdzanie dostępności danych do eksportu.
- **Typy**: Wykorzystuje typy związane z eksportem oraz identyfikatorem projektu.
- **Propsy**: 
  - `projectId`: string
  - `formats`: ExportFormat[]
  - `disabled`: boolean

### ErrorBoundary (React)
- **Opis komponentu**: Komponent przechwytujący i wyświetlający błędy.
- **Główne elementy**: Logika przechwytywania błędów, komunikat błędu, opcje naprawy.
- **Obsługiwane interakcje**: Przycisk ponowienia próby, przekierowanie do listy projektów.
- **Obsługiwana walidacja**: Brak specyficznej walidacji.
- **Typy**: Typy związane z błędami i fallbackiem.
- **Propsy**: 
  - `children`: ReactNode
  - `fallback`: ReactNode | ((error: Error) => ReactNode)

## 5. Typy

```typescript
// Typy związane z zakładkami
export type TabType = "descriptions" | "assumptions" | "functional-blocks" | "schedule";

export interface ProjectTabProps {
  id: TabType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Rozszerzone typy widoku
export interface ProjectViewModel extends ProjectDto {
  isLoading: boolean;
  error: Error | null;
  selectedTab: TabType;
}

// Typy dla poszczególnych sekcji
export interface ProjectDescriptionViewModel {
  description: string;
}

export interface AssumptionsViewModel {
  // Struktura zależna od dokładnego formatu danych założeń
  // Przykładowo:
  projectGoals?: string;
  targetAudience?: string;
  keyFeatures?: string;
  technologyStack?: string;
  constraints?: string;
}

export interface FunctionalBlocksViewModel {
  blocks: FunctionalBlockDto[];
}

export interface ScheduleViewModel {
  stages: ScheduleStageDto[];
}

// Typy dla komponentu nawigacji
export interface ProjectTabsNavigationProps {
  tabs: ProjectTabProps[];
  activeTab: TabType;
  projectId?: string;
  onSelectTab?: (tab: TabType) => void;
  isLoading?: boolean;
  className?: string;
}

// Typy dla operacji eksportu
export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
}
```

## 6. Zarządzanie stanem

### useProjectDetails
Hook odpowiedzialny za pobieranie i zarządzanie danymi projektu:

```typescript
function useProjectDetails(projectId: string) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Wywołanie API
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        // Obsługa błędów HTTP
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Nieznany błąd');
      }
      
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Nieznany błąd'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Pobierz dane przy montowaniu komponentu
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    fetchProject
  };
}
```

### useProjectTabs
Hook zarządzający stanem zakładek:

```typescript
function useProjectTabs(initialTab: TabType = 'assumptions') {
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);
  
  // Synchronizacja z URL za pomocą fragmentu hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabType;
    if (hash && ['descriptions', 'assumptions', 'functional-blocks', 'schedule'].includes(hash)) {
      setSelectedTab(hash);
    }
  }, []);
  
  // Aktualizacja URL przy zmianie zakładki
  const handleTabChange = useCallback((tab: TabType) => {
    setSelectedTab(tab);
    
    // Aktualizacja URL za pomocą fragmentu hash
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#${tab}`);
    }
  }, []);
  
  // Generowanie konfiguracji zakładek
  const tabs: ProjectTabProps[] = [
    {
      id: 'descriptions',
      label: 'Opis',
      isActive: selectedTab === 'descriptions',
      onClick: () => handleTabChange('descriptions')
    },
    {
      id: 'assumptions',
      label: 'Założenia',
      isActive: selectedTab === 'assumptions',
      onClick: () => handleTabChange('assumptions')
    },
    {
      id: 'functional-blocks', // Zmieniono zgodnie z typem TabType w rzeczywistym komponencie
      label: 'Bloki funkcjonalne',
      isActive: selectedTab === 'functional-blocks',
      onClick: () => handleTabChange('functional-blocks')
    },
    {
      id: 'schedule',
      label: 'Harmonogram',
      isActive: selectedTab === 'schedule',
      onClick: () => handleTabChange('schedule')
    }
  ];
  
  return {
    selectedTab,
    setSelectedTab: handleTabChange,
    tabs,
    isLoading: false // Dodano dla spójności z komponentem ProjectTabsNavigation
  };
}
```

### useExportProject
Hook obsługujący funkcjonalność eksportu projektu:

```typescript
function useExportProject(projectId: string) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<Error | null>(null);
  
  const exportProject = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      // Wywołanie API eksportu (potencjalny przyszły endpoint)
      const response = await fetch(`/api/projects/${projectId}/export?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Błąd podczas eksportu');
      }
      
      // Pobierz i zapisz plik
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setExportError(err instanceof Error ? err : new Error('Nieznany błąd eksportu'));
    } finally {
      setIsExporting(false);
    }
  }, [projectId]);
  
  return {
    exportProject,
    isExporting,
    exportError
  };
}
```

## 7. Integracja API

Widok szczegółów projektu integruje się z następującymi endpointami:

### GET `/api/projects/{id}`
- **Cel**: Pobieranie szczegółów projektu
- **Parametry ścieżki**: id - UUID projektu
- **Nagłówki**: Authorization (automatycznie dodawany przez klienta Supabase)
- **Typ odpowiedzi**: ProjectDto
- **Obsługa błędów**:
  - 401 Unauthorized - Przekierowanie do logowania
  - 403 Forbidden - Komunikat o braku dostępu
  - 404 Not Found - Komunikat o nieistnieniu projektu

### GET `/api/projects/{id}/export` (potencjalny przyszły endpoint)
- **Cel**: Eksport danych projektu
- **Parametry ścieżki**: id - UUID projektu
- **Parametry zapytania**: format - format eksportu (np. 'json')
- **Nagłówki**: Authorization (automatycznie dodawany przez klienta Supabase)
- **Typ odpowiedzi**: Plik w wybranym formacie
- **Obsługa błędów**: Podobna jak w przypadku GET `/api/projects/{id}`

## 8. Interakcje użytkownika

### Interakcja 1: Wejście na stronę projektu
1. Użytkownik klika na projekt na liście projektów
2. System przekierowuje na stronę `/projects/:id`
3. Wyświetlany jest skeleton ładowania
4. System wysyła zapytanie GET do `/api/projects/:id`
5. Po otrzymaniu danych, wyświetlane są szczegóły projektu
6. Domyślnie aktywna jest pierwsza zakładka (założenia)

### Interakcja 2: Nawigacja między zakładkami
1. Użytkownik klika na wybraną zakładkę (opis, założenia, bloki funkcjonalne, harmonogram)
2. System podświetla wybraną zakładkę jako aktywną
3. Zawartość panelu zostaje zmieniona na odpowiednią dla wybranej zakładki
4. URL zostaje zaktualizowany o odpowiedni fragment (np. `#functional-blocks`)

#### Przykładowe użycie komponentu
```jsx
// W komponencie rodzica (np. ProjectDetailsPage.astro)
const { projectId } = Astro.params;

// W komponencie React (np. ProjectDetailsContent.tsx)
const { selectedTab, setSelectedTab, tabs } = useProjectTabs('assumptions');

return (
  <>
    <ProjectTabsNavigation 
      tabs={tabs} 
      activeTab={selectedTab}
      onSelectTab={setSelectedTab}
      isLoading={isLoading} 
    />
    <div className="mt-6">
      {selectedTab === 'descriptions' && (
        <ProjectDescriptionsPanel 
          description={project?.description ? { description: project.description } : null}
          isLoading={isLoading}
        />
      )}
      {selectedTab === 'assumptions' && (
        <ProjectAssumptionsPanel 
          assumptions={project?.assumptions || null}
          isLoading={isLoading}
        />
      )}
      {/* Pozostałe panele... */}
    </div>
  </>
);
```

### Interakcja 3: Edycja projektu
1. Użytkownik klika przycisk "Edytuj projekt"
2. System przekierowuje na stronę edycji projektu pod adresem `/projects/:id/edit`

### Interakcja 4: Eksport projektu
1. Użytkownik klika przycisk "Eksportuj projekt"
2. Jeśli dostępnych jest kilka formatów, wyświetlane jest menu wyboru
3. Użytkownik wybiera format eksportu
4. System inicjuje zapytanie o eksport
5. Po zakończeniu eksportu, przeglądarka pobiera plik

### Interakcja 5: Powrót do listy projektów
1. Użytkownik klika przycisk "Powrót do listy projektów"
2. System przekierowuje użytkownika na stronę listy projektów pod adresem `/dashboard`

## 9. Warunki i walidacja

1. **Walidacja ID projektu**:
   - Format: Poprawny UUID zgodny ze schematem walidacyjnym z plików API
   - Komponent: ProjectDetailsPage sprawdza ID przed wywołaniem API
   - Efekt: Nieprawidłowe ID powoduje wyświetlenie błędu i opcji powrotu do listy

2. **Sprawdzanie uprawnień**:
   - Warunek: Użytkownik musi być właścicielem projektu
   - Komponent: ProjectDetailsContent obsługuje błąd 403
   - Efekt: Wyświetlenie komunikatu o braku dostępu i opcji powrotu do listy

3. **Sprawdzanie istnienia projektu**:
   - Warunek: Projekt musi istnieć w systemie
   - Komponent: ProjectDetailsContent obsługuje błąd 404
   - Efekt: Wyświetlenie komunikatu o nieistnieniu projektu i opcji powrotu do listy

4. **Walidacja struktury danych sekcji**:
   - Warunek: Dane sekcji muszą mieć oczekiwaną strukturę
   - Komponenty: ProjectDescriptionsPanel, ProjectAssumptionsPanel, ProjectFunctionalBlocksPanel, ProjectSchedulePanel
   - Efekt: Graceful degradation, wyświetlenie komunikatu o niepoprawnej strukturze danych

## 10. Obsługa błędów

1. **Błąd uwierzytelnienia**:
   - Scenariusz: Sesja użytkownika wygasła
   - Obsługa: Przekierowanie do strony logowania z parametrem `redirectTo` wskazującym na bieżącą stronę
   - Komunikat: "Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować."

2. **Błąd autoryzacji**:
   - Scenariusz: Użytkownik próbuje uzyskać dostęp do projektu, do którego nie ma uprawnień
   - Obsługa: Wyświetlenie komunikatu błędu z przyciskiem powrotu do listy projektów
   - Komunikat: "Nie masz uprawnień do wyświetlenia tego projektu."

3. **Błąd braku zasobu**:
   - Scenariusz: Projekt o podanym ID nie istnieje
   - Obsługa: Wyświetlenie komunikatu błędu z przyciskiem powrotu do listy projektów
   - Komunikat: "Projekt nie istnieje lub został usunięty."

4. **Błąd sieci**:
   - Scenariusz: Problem z połączeniem sieciowym podczas pobierania danych
   - Obsługa: Wyświetlenie komunikatu błędu z przyciskiem ponowienia próby
   - Komunikat: "Wystąpił problem z połączeniem. Sprawdź połączenie i spróbuj ponownie."

5. **Błąd formatu danych**:
   - Scenariusz: Otrzymane dane mają nieoczekiwaną strukturę
   - Obsługa: Logowanie błędu, wyświetlenie komunikatu z opcją zgłoszenia problemu
   - Komunikat: "Wystąpił problem z wyświetleniem danych projektu. Zespół techniczny został powiadomiony."

## 11. Kroki implementacji

1. **Utworzenie struktury plików**:
   - Utworzenie pliku strony `/src/pages/projects/[id]/index.astro`
   - Utworzenie folderów dla komponentów projektu

2. **Implementacja typów**:
   - Dodanie nowych typów ViewModel w odpowiednich plikach
   - Rozszerzenie istniejących typów o niezbędne pola

3. **Implementacja hooków**:
   - Utworzenie pliku `/src/components/projects/hooks/useProjectDetails.ts`
   - Utworzenie pliku `/src/components/projects/hooks/useProjectTabs.ts`
   - Utworzenie pliku `/src/components/projects/hooks/useExportProject.ts`

4. **Implementacja głównego komponentu strony**:
   - Utworzenie szkieletu strony w `/src/pages/projects/[id]/index.astro`
   - Implementacja walidacji ID projektu
   - Integracja z komponentem ErrorBoundary

5. **Implementacja komponentów UI**:
   - Implementacja ProjectHeader
   - Implementacja ProjectTabsNavigation:
     - Wykorzystanie komponentów Tabs z shadcn/ui
     - Implementacja obsługi zmiany zakładek
     - Dodanie obsługi stanu ładowania (Skeleton)
     - Zapewnienie dostępności (ARIA) dla nawigacji
   - Implementacja LoadingSkeleton dla różnych sekcji

6. **Implementacja paneli sekcji**:
   - Implementacja ProjectDetailsContent jako koordynatora paneli
   - Implementacja ProjectDescriptionsPanel
   - Implementacja ProjectAssumptionsPanel
   - Implementacja ProjectFunctionalBlocksPanel
   - Implementacja ProjectSchedulePanel

7. **Implementacja funkcjonalności eksportu**:
   - Implementacja ExportButton
   - Integracja z hookiem useExportProject

8. **Testowanie i debugowanie**:
   - Testowanie różnych scenariuszy używania
   - Testowanie obsługi błędów
   - Testowanie wydajności przy dużych projektach

9. **Optymalizacja**:
   - Implementacja memoizacji dla kosztownych renderów
   - Optymalizacja ponownego renderowania komponentów
   - Implementacja lazy loading dla paneli sekcji

10. **Dostępność i UX**:
    - Implementacja obsługi klawiatury dla nawigacji
    - Dodanie odpowiednich atrybutów ARIA dla zakładek
    - Testowanie z czytnikami ekranowymi
    - Upewnienie się, że wszystkie interakcje są intuicyjne

11. **Kompletna integracja ProjectTabsNavigation w stronie szczegółów projektu**:
    ```jsx
    // W pliku /src/pages/projects/[id]/index.astro
    ---
    import Layout from '../../../layouts/MainLayout.astro';
    import ProjectHeader from '../../../components/projects/ProjectHeader.astro';
    import ProjectDetailsContent from '../../../components/projects/ProjectDetailsContent';
    import ErrorBoundary from '../../../components/ErrorBoundary';
    import type { TabType } from '../../../components/projects/types';
    
    const { id } = Astro.params;
    const initialTab = (Astro.url.hash.replace('#', '') || 'assumptions') as TabType;
    
    // Walidacja ID projektu
    // ...
    ---
    
    <Layout title="Szczegóły projektu">
      <ProjectHeader projectId={id} />
      
      <div class="container mx-auto mt-8 px-4">
        <ErrorBoundary>
          <ProjectDetailsContent projectId={id} initialTab={initialTab} />
        </ErrorBoundary>
      </div>
    </Layout>
    ```
    
    ```tsx
    // W pliku /src/components/projects/ProjectDetailsContent.tsx
    import { useState, useEffect } from 'react';
    import ProjectTabsNavigation from './ProjectTabsNavigation';
    import { useProjectDetails } from './hooks/useProjectDetails';
    import { useProjectTabs } from './hooks/useProjectTabs';
    import type { ProjectDetailsContentProps } from './types';
    
    export default function ProjectDetailsContent({ projectId, initialTab = 'assumptions' }: ProjectDetailsContentProps) {
      const { project, isLoading, error } = useProjectDetails(projectId);
      const { selectedTab, setSelectedTab, tabs } = useProjectTabs(initialTab);
      
      // Renderowanie odpowiednich paneli w zależności od wybranej zakładki
      const renderPanel = () => {
        if (isLoading) return <LoadingSkeleton type={selectedTab} />;
        
        switch (selectedTab) {
          case 'descriptions':
            return <ProjectDescriptionsPanel description={project?.description ? { description: project.description } : null} />;
          case 'assumptions':
            return <ProjectAssumptionsPanel assumptions={project?.assumptions || null} />;
          case 'functional-blocks':
            return <ProjectFunctionalBlocksPanel functionalBlocks={project?.functionalBlocks || null} />;
          case 'schedule':
            return <ProjectSchedulePanel schedule={project?.schedule || null} />;
          default:
            return <div>Wybierz sekcję projektu</div>;
        }
      };
      
      return (
        <div className="space-y-6">
          <ProjectTabsNavigation 
            tabs={tabs}
            activeTab={selectedTab}
            onSelectTab={setSelectedTab}
            isLoading={isLoading}
            className="mb-6"
          />
          
          {error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-700">
              <h3 className="text-lg font-medium">Wystąpił błąd</h3>
              <p>{error.message}</p>
            </div>
          ) : (
            renderPanel()
          )}
        </div>
      );
    }
    ```

12. **Końcowe testy i przegląd**:
    - Weryfikacja zgodności z PRD i user stories
    - Sprawdzenie czy wszystkie wymagania zostały spełnione
    - Przeprowadzenie testów końcowych