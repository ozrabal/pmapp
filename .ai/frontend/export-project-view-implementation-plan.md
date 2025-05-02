# Plan implementacji widoku "Eksportuj projekt"

## 1. Przegląd
Widok "Eksportuj projekt" to funkcjonalność umożliwiająca użytkownikowi eksport danych projektu do pliku w formacie JSON. Funkcjonalność ta jest dostępna z widoku szczegółów projektu, gdzie użytkownik może wybrać opcję eksportu, wybrać format pliku, a następnie pobrać wygenerowany plik zawierający wszystkie informacje o projekcie.

## 2. Routing widoku
Funkcjonalność eksportu projektu będzie dostępna w istniejącym widoku szczegółów projektu:
```
/projects/{id}
```

## 3. Struktura komponentów
```
ProjectDetailsContent
└── ExportButton
    └── ExportProjectDialog
        └── FormatSelector
```

## 4. Szczegóły komponentów
### ExportButton
- Opis komponentu: Przycisk "Eksportuj projekt" umieszczony w nagłówku widoku szczegółów projektu. Po kliknięciu otwiera dialog z opcjami eksportu.
- Główne elementy:
  - Button z ikoną eksportu i tekstem "Eksportuj"
  - ExportProjectDialog (renderowany warunkowo)
- Obsługiwane interakcje:
  - onClick: Otwiera dialog z opcjami eksportu
- Obsługiwana walidacja:
  - Przycisk jest dostępny tylko dla zalogowanych użytkowników z dostępem do projektu
- Typy:
  - ProjectDto (dane projektu)
  - ExportFormat (dostępne formaty eksportu)
- Propsy:
  - projectId: string
  - projectData?: ProjectDto (opcjonalne, jeśli dane są już pobrane)

### ExportProjectDialog
- Opis komponentu: Dialog umożliwiający wybór formatu eksportu oraz potwierdzenie eksportu projektu.
- Główne elementy:
  - Dialog (Shadcn/ui)
  - Nagłówek i opis
  - FormatSelector
  - Przyciski "Anuluj" i "Eksportuj"
  - Wskaźnik postępu eksportu
  - Komunikaty błędów
- Obsługiwane interakcje:
  - onFormatChange: Zmiana formatu eksportu
  - onExport: Potwierdzenie eksportu i rozpoczęcie procesu generowania pliku
  - onClose: Zamknięcie dialogu
- Obsługiwana walidacja:
  - Format eksportu musi być wybrany, aby przycisk "Eksportuj" był aktywny
  - Walidacja błędów w procesie eksportu
- Typy:
  - ProjectDto (dane projektu)
  - ExportFormat (dostępne formaty eksportu)
- Propsy:
  - project: ProjectDto
  - isOpen: boolean
  - onClose: () => void
  - onExport: (format: ExportFormat) => void

### FormatSelector
- Opis komponentu: Komponent umożliwiający wybór formatu eksportu (aktualnie tylko JSON, ale przygotowany na rozszerzenie w przyszłości).
- Główne elementy:
  - Select (Shadcn/ui)
  - Opcje formatów
- Obsługiwane interakcje:
  - onChange: Zmiana wybranego formatu eksportu
- Obsługiwana walidacja:
  - Co najmniej jeden format musi być dostępny
- Typy:
  - ExportFormat (dostępne formaty eksportu)
- Propsy:
  - value: ExportFormat
  - onChange: (value: ExportFormat) => void
  - availableFormats: ExportFormat[]
  - disabled?: boolean

## 5. Typy
Istniejące typy z `src/types.ts`:
```typescript
export type ExportFormat = "json";

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  assumptions: Json | null;
  functionalBlocks: Json | null;
  schedule: Json | null;
  createdAt: string;
  updatedAt: string;
}
```

Nowe typy do zaimplementowania:

```typescript
// Struktura eksportowanego pliku
export interface ProjectExportData {
  project: ProjectDto;
  metadata: {
    version: string;
    exportDate: string;
    format: ExportFormat;
  };
}

// Props dla komponentów
export interface ExportButtonProps {
  projectId: string;
  projectData?: ProjectDto;
}

export interface ExportProjectDialogProps {
  project: ProjectDto;
  isOpen: boolean;
  onClose: () => void;
}

export interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
  availableFormats: ExportFormat[];
  disabled?: boolean;
}

// Zwracane wartości z hooka useExportProject
export interface UseExportProjectReturn {
  exportProject: (project: ProjectDto) => Promise<void>;
  selectedFormat: ExportFormat;
  setSelectedFormat: (format: ExportFormat) => void;
  isExporting: boolean;
  error: Error | null;
  availableFormats: ExportFormat[];
}
```

## 6. Zarządzanie stanem
Dla funkcjonalności eksportu projektu potrzebny jest niestandardowy hook `useExportProject`, który będzie zarządzać stanem i logiką eksportu:

```typescript
const useExportProject = (projectId: string): UseExportProjectReturn => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const availableFormats: ExportFormat[] = ["json"]; // W przyszłości można rozszerzyć o inne formaty

  const exportProject = async (project: ProjectDto): Promise<void> => {
    try {
      setIsExporting(true);
      setError(null);

      // Przygotowanie danych eksportu
      const exportData: ProjectExportData = {
        project,
        metadata: {
          version: "1.0", // Wersja formatu eksportu
          exportDate: new Date().toISOString(),
          format: selectedFormat,
        },
      };

      // Konwersja danych do wybranego formatu
      const fileContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([fileContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Utworzenie i symulacja kliknięcia linku pobrania
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${project.name.toLowerCase().replace(/\s+/g, "-")}-${project.id.slice(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Zwolnienie URL po pobraniu
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      setIsExporting(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Nieznany błąd podczas eksportu projektu"));
      setIsExporting(false);
    }
  };

  return {
    exportProject,
    selectedFormat,
    setSelectedFormat,
    isExporting,
    error,
    availableFormats,
  };
};
```

## 7. Integracja API
Funkcjonalność eksportu wymaga dostępu do pełnych danych projektu, które są pobierane przy użyciu istniejącego endpointu:

**GET** `/api/projects/{id}`

### Typy żądania:
- Parametr ścieżki: `id` - UUID projektu

### Typy odpowiedzi:
- Sukces (200 OK): `ProjectDto` - pełne dane projektu
- Błąd (401): Nieautoryzowany - użytkownik nie jest zalogowany
- Błąd (403): Zabroniony - użytkownik nie ma uprawnień do projektu
- Błąd (404): Nie znaleziono - projekt o podanym ID nie istnieje

Integracja API w komponencie ExportButton:
```typescript
const ExportButton: React.FC<ExportButtonProps> = ({ projectId, projectData }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectDto | undefined>(projectData);
  const [isLoading, setIsLoading] = useState<boolean>(!projectData);
  const [error, setError] = useState<Error | null>(null);
  
  // Pobieranie danych projektu, jeśli nie zostały przekazane przez propsy
  useEffect(() => {
    if (!projectData && isDialogOpen) {
      setIsLoading(true);
      fetch(`/api/projects/${projectId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setProject(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [projectId, projectData, isDialogOpen]);

  // ...reszta implementacji
}
```

## 8. Interakcje użytkownika
1. **Kliknięcie przycisku "Eksportuj projekt"**
   - Użytkownik klika przycisk "Eksportuj projekt" w nagłówku widoku szczegółów projektu
   - System otwiera dialog z opcjami eksportu
   - Jeśli pełne dane projektu nie są jeszcze pobrane, system rozpoczyna ich pobieranie

2. **Wybór formatu eksportu**
   - Użytkownik wybiera format eksportu z listy dostępnych formatów (aktualnie tylko JSON)
   - System aktywuje przycisk "Eksportuj", jeśli format został wybrany

3. **Kliknięcie przycisku "Eksportuj"**
   - Użytkownik potwierdza chęć eksportu projektu przez kliknięcie przycisku "Eksportuj"
   - System pokazuje wskaźnik postępu
   - System generuje plik w wybranym formacie zawierający wszystkie dane projektu
   - System automatycznie rozpoczyna pobieranie wygenerowanego pliku
   - System zamyka dialog po zakończeniu eksportu

4. **Kliknięcie przycisku "Anuluj"**
   - Użytkownik klika przycisk "Anuluj" w dialogu
   - System zamyka dialog bez eksportowania projektu

## 9. Warunki i walidacja
1. **Dostęp do eksportu projektu**
   - Warunek: Użytkownik musi być zalogowany i mieć dostęp do projektu
   - Komponent: ExportButton
   - Wpływ na interfejs: Jeśli warunek nie jest spełniony, przycisk eksportu nie jest renderowany lub jest nieaktywny

2. **Wybór formatu eksportu**
   - Warunek: Format eksportu musi być wybrany
   - Komponent: FormatSelector, ExportProjectDialog
   - Wpływ na interfejs: Przycisk "Eksportuj" jest nieaktywny, dopóki format nie zostanie wybrany

3. **Pobieranie danych projektu**
   - Warunek: Pełne dane projektu muszą być dostępne przed eksportem
   - Komponent: ExportButton
   - Wpływ na interfejs: Podczas pobierania danych projektu wyświetlany jest wskaźnik ładowania

## 10. Obsługa błędów
1. **Błąd pobierania danych projektu**
   - Scenariusz: Nie udało się pobrać danych projektu przed eksportem
   - Obsługa: Wyświetlenie komunikatu o błędzie w dialogu z opcją ponowienia próby
   - Wpływ na interfejs: Przycisk "Eksportuj" jest nieaktywny, komunikat błędu jest widoczny

2. **Błąd podczas generowania pliku eksportu**
   - Scenariusz: Wystąpił błąd podczas przetwarzania danych projektu do formatu eksportu
   - Obsługa: Wyświetlenie komunikatu o błędzie z opcją ponowienia próby
   - Wpływ na interfejs: Wskaźnik postępu znika, komunikat błędu jest widoczny

3. **Błąd podczas pobierania pliku**
   - Scenariusz: Plik został wygenerowany, ale nie może zostać pobrany
   - Obsługa: Wyświetlenie komunikatu o błędzie z informacją, jak ręcznie pobrać plik
   - Wpływ na interfejs: Komunikat błędu jest widoczny, opcjonalnie link do ręcznego pobrania

4. **Błąd uprawnień do projektu**
   - Scenariusz: Użytkownik próbuje eksportować projekt, do którego nie ma uprawnień
   - Obsługa: Wyświetlenie komunikatu o braku uprawnień
   - Wpływ na interfejs: Dialog jest zamykany, komunikat o błędzie jest widoczny

## 11. Kroki implementacji
1. **Utworzenie komponentów**
   - Stworzenie pliku `ExportButton.tsx` w katalogu `src/components/projects`
   - Stworzenie pliku `ExportProjectDialog.tsx` w katalogu `src/components/projects`
   - Stworzenie pliku `FormatSelector.tsx` w katalogu `src/components/projects`

2. **Zaimplementowanie niestandardowego hooka**
   - Stworzenie pliku `useExportProject.ts` w katalogu `src/components/projects/hooks`
   - Implementacja logiki eksportowania projektu

3. **Integracja z istniejącym komponentem widoku szczegółów projektu**
   - Dodanie `ExportButton` do istniejącego komponentu `ProjectHeader.astro` w widoku szczegółów projektu
   - Przekazanie odpowiednich propsów do komponentu

4. **Implementacja komponentów**
   - Implementacja `FormatSelector.tsx` - komponent wyboru formatu
   - Implementacja `ExportProjectDialog.tsx` - dialog z opcjami eksportu
   - Implementacja `ExportButton.tsx` - przycisk eksportu i integracja z dialogiem

5. **Testowanie**
   - Testowanie scenariusza eksportu w różnych stanach projektu
   - Testowanie obsługi błędów
   - Testowanie eksportu dużych projektów

6. **Poprawki i finalizacja**
   - Poprawki stylistyczne i UX
   - Optymalizacja wydajności
   - Dokumentacja kodu