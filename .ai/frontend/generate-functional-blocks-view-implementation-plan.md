# Plan implementacji widoku Bloków Funkcjonalnych

## 1. Przegląd
Widok Bloków Funkcjonalnych to interaktywny interfejs umożliwiający użytkownikowi podział projektu aplikacji na logiczne bloki funkcjonalne z pomocą AI. Pozwala on na generowanie bloków przez sztuczną inteligencję na podstawie założeń projektu, a następnie na ich modyfikację, dodawanie nowych, usuwanie i zmianę kolejności. Głównym celem jest zapewnienie użytkownikom strukturyzacji procesu rozwoju aplikacji.

## 2. Routing widoku
- Ścieżka: `/projects/:id/functional-blocks`
- Parametry:
  - `id`: UUID projektu

## 3. Struktura komponentów

```
FunctionalBlocksPage (Astro)
└── ProjectTabsNavigation (React)
└── FunctionalBlocksContainer (React)
    ├── EmptyState (React) [warunkowy]
    ├── LoadingState (React) [warunkowy]
    ├── GenerateBlocksButton (React)
    └── FunctionalBlocksList (React)
        ├── FunctionalBlockItem (React) [wiele]
        │   └── FunctionalBlockForm (React) [warunkowy]
        │       ├── BlockCategorySelect (React)
        │       └── BlockDependenciesSelect (React)
        └── AddBlockButton (React)
```

## 4. Szczegóły komponentów

### FunctionalBlocksPage
- Opis komponentu: Główny komponent strony Astro, który renderuje komponenty React
- Główne elementy: 
  - Nagłówek projektu
  - ProjectTabsNavigation
  - FunctionalBlocksContainer
- Obsługiwane interakcje: Brak (komponent statyczny Astro)
- Obsługiwana walidacja: Brak
- Typy: Wykorzystuje `ProjectDto`
- Propsy: Brak (komponent strony)

### ProjectTabsNavigation
- Opis komponentu: Pasek nawigacyjny z zakładkami projektu
- Główne elementy:
  - Zakładki (Assumptions, Functional Blocks, Schedule)
  - Aktywna zakładka (Functional Blocks)
- Obsługiwane interakcje: Przełączanie między zakładkami
- Obsługiwana walidacja: Brak
- Typy: String dla identyfikatora projektu
- Propsy:
  - `projectId: string` - ID projektu
  - `activeTab: string` - Aktywna zakładka

### FunctionalBlocksContainer
- Opis komponentu: Kontener zarządzający stanem bloków funkcjonalnych
- Główne elementy:
  - GenerateBlocksButton
  - FunctionalBlocksList lub EmptyState
  - LoadingState (warunkowy)
- Obsługiwane interakcje:
  - Inicjalizacja pobierania danych projektu
  - Obsługa stanu ładowania
  - Obsługa błędów API
- Obsługiwana walidacja: Brak
- Typy:
  - `ProjectDto`
  - `FunctionalBlockDto[]`
  - `FunctionalBlocksViewModel`
- Propsy:
  - `projectId: string` - ID projektu

### EmptyState
- Opis komponentu: Wyświetlany, gdy nie ma żadnych bloków funkcjonalnych
- Główne elementy:
  - Ilustracja
  - Opis
  - Przycisk do generowania bloków
- Obsługiwane interakcje: Kliknięcie przycisku generowania bloków
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych
- Propsy:
  - `onGenerate: () => void` - Callback do generowania bloków
  - `isLoading: boolean` - Czy trwa ładowanie

### GenerateBlocksButton
- Opis komponentu: Przycisk do generowania bloków funkcjonalnych przez AI
- Główne elementy:
  - Przycisk z ikoną i tekstem
  - Wskaźnik ładowania
- Obsługiwane interakcje: Kliknięcie w celu generowania bloków
- Obsługiwana walidacja: Przycisk wyłączony podczas generowania
- Typy: Brak specyficznych
- Propsy:
  - `onClick: () => void` - Callback do generowania bloków
  - `isLoading: boolean` - Czy trwa ładowanie
  - `disabled: boolean` - Czy przycisk jest wyłączony

### FunctionalBlocksList
- Opis komponentu: Lista bloków funkcjonalnych z możliwością przeciągania i upuszczania
- Główne elementy:
  - Kontener drag & drop
  - FunctionalBlockItem dla każdego bloku
  - AddBlockButton
- Obsługiwane interakcje:
  - Przeciąganie i upuszczanie bloków
  - Dodawanie nowego bloku
- Obsługiwana walidacja: Brak
- Typy:
  - `FunctionalBlockDto[]`
- Propsy:
  - `blocks: FunctionalBlockDto[]` - Lista bloków
  - `onReorder: (blocks: FunctionalBlockDto[]) => void` - Callback zmiany kolejności
  - `onAddBlock: () => void` - Callback dodawania bloku
  - `onEditBlock: (blockId: string) => void` - Callback edycji bloku
  - `onDeleteBlock: (blockId: string) => void` - Callback usuwania bloku
  - `selectedBlockId: string | null` - ID zaznaczonego bloku

### FunctionalBlockItem
- Opis komponentu: Pojedynczy element bloku funkcjonalnego
- Główne elementy:
  - Nagłówek z nazwą i kategorią
  - Rozwijany opis
  - Przyciski edycji i usuwania
  - FunctionalBlockForm (warunkowy)
- Obsługiwane interakcje:
  - Rozwijanie/zwijanie opisu
  - Edytowanie bloku
  - Usuwanie bloku
- Obsługiwana walidacja: Brak
- Typy:
  - `FunctionalBlockDto`
- Propsy:
  - `block: FunctionalBlockDto` - Dane bloku
  - `isSelected: boolean` - Czy blok jest zaznaczony
  - `onEdit: () => void` - Callback edycji
  - `onDelete: () => void` - Callback usuwania
  - `allBlocks: FunctionalBlockDto[]` - Wszystkie bloki (do wyświetlania zależności)

### FunctionalBlockForm
- Opis komponentu: Formularz do edycji lub tworzenia bloku funkcjonalnego
- Główne elementy:
  - Pole nazwy
  - Pole opisu
  - BlockCategorySelect
  - BlockDependenciesSelect
  - Przyciski zapisania i anulowania
- Obsługiwane interakcje:
  - Zmiana pól formularza
  - Zatwierdzenie formularza
  - Anulowanie edycji
- Obsługiwana walidacja:
  - Nazwa: wymagana, max 100 znaków
  - Opis: wymagany, max 1000 znaków
  - Kategoria: wymagana
  - Zależności: brak cyklicznych zależności
- Typy:
  - `FunctionalBlockDto`
  - `FunctionalBlockFormValues`
- Propsy:
  - `block?: FunctionalBlockDto` - Edytowany blok (null dla nowego)
  - `allBlocks: FunctionalBlockDto[]` - Wszystkie bloki (do wyboru zależności)
  - `onSave: (values: FunctionalBlockFormValues) => void` - Callback zapisania
  - `onCancel: () => void` - Callback anulowania

### BlockCategorySelect
- Opis komponentu: Dropdown do wyboru kategorii bloku
- Główne elementy:
  - Komponent Select z biblioteki shadcn/ui
  - Lista predefiniowanych kategorii
- Obsługiwane interakcje: Zmiana wybranej kategorii
- Obsługiwana walidacja: Wartość wymagana
- Typy:
  - `BlockCategory[]`
- Propsy:
  - `value: string` - Aktualna wartość
  - `onChange: (value: string) => void` - Callback zmiany
  - `error?: string` - Komunikat błędu walidacji

### BlockDependenciesSelect
- Opis komponentu: Wielokrotny wybór zależności bloku
- Główne elementy:
  - Komponent MultiSelect z biblioteki shadcn/ui
  - Lista dostępnych bloków
- Obsługiwane interakcje: Dodawanie/usuwanie zależności
- Obsługiwana walidacja: Zapobieganie zależnościom cyklicznym
- Typy:
  - `FunctionalBlockDto[]`
- Propsy:
  - `values: string[]` - Aktualne wartości (ID bloków)
  - `onChange: (values: string[]) => void` - Callback zmiany
  - `availableBlocks: FunctionalBlockDto[]` - Dostępne bloki
  - `currentBlockId?: string` - ID aktualnego bloku (do wykluczenia)
  - `error?: string` - Komunikat błędu walidacji

### AddBlockButton
- Opis komponentu: Przycisk do dodawania nowego bloku funkcjonalnego
- Główne elementy:
  - Przycisk z ikoną plusa i tekstem
- Obsługiwane interakcje: Kliknięcie w celu dodania bloku
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych
- Propsy:
  - `onClick: () => void` - Callback dodawania bloku

### LoadingState
- Opis komponentu: Wskaźnik ładowania podczas operacji AI lub API
- Główne elementy:
  - Animacja ładowania
  - Komunikat o trwającej operacji
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych
- Propsy:
  - `message?: string` - Opcjonalny komunikat ładowania

## 5. Typy

```typescript
// Istniejące typy z types.ts
import type { ProjectDto, FunctionalBlockDto, GenerateFunctionalBlocksResponseDto } from "../types";

// Nowe typy dla widoku bloków funkcjonalnych

// Model widoku dla zarządzania blokami funkcjonalnymi
interface FunctionalBlocksViewModel {
  blocks: FunctionalBlockDto[];
  isLoading: boolean;
  selectedBlockId: string | null;
  editMode: boolean;
  error: string | null;
}

// Wartości formularza dla edycji bloku
interface FunctionalBlockFormValues {
  name: string;
  description: string;
  category: string;
  dependencies: string[];
}

// Definicja kategorii bloku
interface BlockCategory {
  value: string;
  label: string;
  description?: string;
}

// Predefiniowane kategorie bloków
const BLOCK_CATEGORIES: BlockCategory[] = [
  { 
    value: "auth", 
    label: "Autentykacja", 
    description: "Funkcjonalności związane z logowaniem, rejestracją i zarządzaniem użytkownikami" 
  },
  { 
    value: "core", 
    label: "Funkcjonalności podstawowe", 
    description: "Główne funkcjonalności definiujące charakter aplikacji" 
  },
  { 
    value: "ui", 
    label: "Interfejs użytkownika", 
    description: "Komponenty i widoki interfejsu użytkownika" 
  },
  { 
    value: "data", 
    label: "Zarządzanie danymi", 
    description: "Funkcjonalności związane z przechowywaniem i przetwarzaniem danych" 
  },
  { 
    value: "api", 
    label: "Integracje API", 
    description: "Integracje z zewnętrznymi usługami i API" 
  },
  { 
    value: "admin", 
    label: "Panel administracyjny", 
    description: "Funkcjonalności związane z zarządzaniem aplikacją" 
  },
  { 
    value: "other", 
    label: "Inne", 
    description: "Funkcjonalności niepasujące do pozostałych kategorii" 
  }
];

// Stan przeciągania dla drag & drop
interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  dragOverId: string | null;
}
```

## 6. Zarządzanie stanem

### Hook useFunctionalBlocks

```typescript
/**
 * Hook zarządzający stanem bloków funkcjonalnych
 */
function useFunctionalBlocks(projectId: string) {
  // Stan bloków
  const [blocks, setBlocks] = useState<FunctionalBlockDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Pobieranie bloków z projektu
  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Pobieranie projektu
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych projektu");
      }
      
      const project: ProjectDto = await response.json();
      
      // Konwersja functionalBlocks z JSON do tablicy
      const functionalBlocksData = project.functionalBlocks 
        ? (project.functionalBlocks as { blocks: FunctionalBlockDto[] }).blocks || []
        : [];
        
      setBlocks(functionalBlocksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas pobierania danych");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  // Aktualizacja bloków w projekcie
  const updateBlocks = useCallback(async (updatedBlocks: FunctionalBlockDto[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Aktualizacja projektu
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionalBlocks: { blocks: updatedBlocks }
        }),
      });
      
      if (!response.ok) {
        throw new Error("Nie udało się zapisać zmian");
      }
      
      setBlocks(updatedBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania zmian");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  // Generowanie bloków przez AI
  const generateBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Wywołanie endpoint'u do generowania bloków
      const response = await fetch(`/api/projects/${projectId}/generate-functional-blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error("Nie udało się wygenerować bloków funkcjonalnych");
      }
      
      const data: GenerateFunctionalBlocksResponseDto = await response.json();
      
      // Aktualizacja bloków po generowaniu
      await updateBlocks(data.functionalBlocks.blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas generowania bloków");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, updateBlocks]);
  
  // Dodawanie nowego bloku
  const addBlock = useCallback(() => {
    // Tworzenie nowego bloku z unikalnymi id
    const newBlock: FunctionalBlockDto = {
      id: crypto.randomUUID(),
      name: "Nowy blok funkcjonalny",
      description: "Opis bloku funkcjonalnego",
      category: "other",
      dependencies: [],
      order: blocks.length,
    };
    
    const updatedBlocks = [...blocks, newBlock];
    updateBlocks(updatedBlocks);
    setSelectedBlockId(newBlock.id);
  }, [blocks, updateBlocks]);
  
  // Aktualizacja istniejącego bloku
  const updateBlock = useCallback((blockId: string, values: FunctionalBlockFormValues) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, ...values }
        : block
    );
    
    updateBlocks(updatedBlocks);
    setSelectedBlockId(null);
  }, [blocks, updateBlocks]);
  
  // Usuwanie bloku
  const deleteBlock = useCallback((blockId: string) => {
    // Filtrowanie bloków i aktualizacja zależności
    const updatedBlocks = blocks
      .filter(block => block.id !== blockId)
      .map(block => ({
        ...block,
        dependencies: block.dependencies.filter(dep => dep !== blockId)
      }));
    
    updateBlocks(updatedBlocks);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [blocks, selectedBlockId, updateBlocks]);
  
  // Zmiana kolejności bloków
  const reorderBlocks = useCallback((reorderedBlocks: FunctionalBlockDto[]) => {
    // Przypisanie nowych wartości order na podstawie pozycji w tablicy
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    
    updateBlocks(updatedBlocks);
  }, [updateBlocks]);
  
  // Efekt pobierający bloki przy montowaniu komponentu
  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);
  
  return {
    blocks: useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks]),
    isLoading,
    error,
    selectedBlockId,
    setSelectedBlockId,
    generateBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    refreshBlocks: fetchBlocks,
  };
}
```

### Hook useFunctionalBlockForm

```typescript
/**
 * Hook do zarządzania stanem formularza bloku funkcjonalnego
 */
function useFunctionalBlockForm(
  block: FunctionalBlockDto | null,
  allBlocks: FunctionalBlockDto[],
  onSave: (values: FunctionalBlockFormValues) => void,
  onCancel: () => void
) {
  // Domyślne wartości formularza
  const defaultValues: FunctionalBlockFormValues = {
    name: block?.name || "",
    description: block?.description || "",
    category: block?.category || "other",
    dependencies: block?.dependencies || [],
  };
  
  // Formularz
  const form = useForm<FunctionalBlockFormValues>({
    defaultValues,
    resolver: zodResolver(functionalBlockFormSchema),
  });
  
  // Walidacja formularza
  const validateDependencies = (values: FunctionalBlockFormValues): boolean => {
    // Sprawdzenie czy zależności nie tworzą cyklu
    if (block && values.dependencies.includes(block.id)) {
      form.setError("dependencies", { 
        message: "Blok nie może być zależny od samego siebie" 
      });
      return false;
    }
    
    return true;
  };
  
  // Obsługa zatwierdzenia formularza
  const handleSubmit = (values: FunctionalBlockFormValues) => {
    if (validateDependencies(values)) {
      onSave(values);
    }
  };
  
  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    onCancel,
  };
}

// Schema walidacji formularza bloku
const functionalBlockFormSchema = z.object({
  name: z.string()
    .min(1, "Nazwa jest wymagana")
    .max(100, "Nazwa nie może przekraczać 100 znaków")
    .trim(),
  description: z.string()
    .min(1, "Opis jest wymagany")
    .max(1000, "Opis nie może przekraczać 1000 znaków")
    .trim(),
  category: z.string()
    .min(1, "Kategoria jest wymagana"),
  dependencies: z.array(z.string()),
});
```

## 7. Integracja API

### Pobieranie projektu
```typescript
// Pobieranie danych projektu
const fetchProject = async (projectId: string): Promise<ProjectDto> => {
  const response = await fetch(`/api/projects/${projectId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Nie udało się pobrać danych projektu");
  }
  
  return await response.json();
};
```

### Aktualizacja projektu
```typescript
// Aktualizacja danych projektu
const updateProject = async (
  projectId: string, 
  data: UpdateProjectRequestDto
): Promise<UpdateProjectResponseDto> => {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Nie udało się zapisać zmian");
  }
  
  return await response.json();
};
```

### Generowanie bloków funkcjonalnych
```typescript
// Generowanie bloków funkcjonalnych przez AI
const generateFunctionalBlocks = async (
  projectId: string
): Promise<GenerateFunctionalBlocksResponseDto> => {
  const response = await fetch(`/api/projects/${projectId}/generate-functional-blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Nie udało się wygenerować bloków funkcjonalnych");
  }
  
  return await response.json();
};
```

## 8. Interakcje użytkownika

### Generowanie bloków funkcjonalnych
1. Użytkownik klika przycisk "Generuj bloki funkcjonalne"
2. Interfejs pokazuje stan ładowania
3. System wywołuje endpoint `/api/projects/{id}/generate-functional-blocks`
4. Po otrzymaniu odpowiedzi, bloki są wyświetlane w interfejsie
5. W przypadku błędu, wyświetlany jest komunikat z opcją ponowienia próby

### Dodawanie nowego bloku
1. Użytkownik klika przycisk "Dodaj blok"
2. System tworzy nowy blok z domyślnymi wartościami
3. Formularz edycji bloku jest automatycznie otwierany
4. Użytkownik wypełnia formularz i zatwierdza zmiany
5. System zapisuje nowy blok i aktualizuje listę

### Edycja bloku
1. Użytkownik klika przycisk "Edytuj" na bloku
2. Formularz edycji bloku jest otwierany z aktualnymi wartościami
3. Użytkownik modyfikuje formularz i zatwierdza zmiany
4. System waliduje dane i zapisuje zmiany
5. Lista bloków jest aktualizowana

### Usuwanie bloku
1. Użytkownik klika przycisk "Usuń" na bloku
2. System wyświetla okno dialogowe potwierdzenia
3. Po potwierdzeniu, blok jest usuwany
4. Lista bloków jest aktualizowana
5. Zależności innych bloków są automatycznie aktualizowane

### Zmiana kolejności bloków
1. Użytkownik przeciąga blok
2. System pokazuje wizualny wskaźnik miejsca docelowego
3. Po upuszczeniu, kolejność bloków jest aktualizowana
4. System zapisuje nową kolejność

## 9. Warunki i walidacja

### Walidacja formularza bloku
1. Nazwa bloku:
   - Jest wymagana
   - Maksymalna długość: 100 znaków
   - Białe znaki na początku i końcu są usuwane

2. Opis bloku:
   - Jest wymagany
   - Maksymalna długość: 1000 znaków
   - Białe znaki na początku i końcu są usuwane

3. Kategoria bloku:
   - Jest wymagana
   - Musi być wybrana z predefiniowanej listy

4. Zależności bloku:
   - Są opcjonalne
   - Nie można wybrać zależności od samego siebie
   - Zależności muszą być istniejącymi blokami

### Warunki dla komponentów
1. GenerateBlocksButton:
   - Wyłączony podczas generowania bloków
   - Wyłączony gdy nie ma założeń projektu

2. FunctionalBlocksList:
   - Wyświetlany tylko gdy istnieją bloki
   - Podczas przeciągania bloku, wskaźnik pokazuje miejsce docelowe

3. FunctionalBlockForm:
   - Walidacja w czasie rzeczywistym
   - Przycisk Zapisz wyłączony gdy formularz zawiera błędy lub nic się nie zmieniło

## 10. Obsługa błędów

### API Errors
1. Błąd pobierania projektu:
   - Wyświetlenie komunikatu błędu
   - Przycisk ponowienia próby
   - Rejestrowanie błędu w konsoli

2. Błąd aktualizacji projektu:
   - Zachowanie lokalnego stanu
   - Wyświetlenie powiadomienia o błędzie
   - Automatyczne ponawianie próby przez określony czas
   - Opcja ręcznego ponowienia próby

3. Błąd generowania bloków:
   - Wyświetlenie przyjaznego komunikatu
   - Przycisk ponowienia próby
   - Szczegółowe informacje w konsoli

### Błędy walidacji formularza
1. Nieprawidłowe dane:
   - Podkreślenie pól z błędami
   - Wyświetlenie opisu błędu pod polem
   - Wskazanie wymaganych pól

2. Nieprawidłowe zależności:
   - Wyświetlenie komunikatu o cyklicznych zależnościach
   - Uniemożliwienie wyboru niedozwolonych zależności

### Błędy przeciągania i upuszczania
1. Niepowodzenie aktualizacji kolejności:
   - Przywrócenie poprzedniej kolejności
   - Wyświetlenie komunikatu o błędzie
   - Automatyczne ponowienie próby

## 11. Kroki implementacji

1. Utworzenie pliku strony Astro `src/pages/projects/[id]/functional-blocks.astro`:
   - Implementacja podstawowego szablonu strony
   - Dodanie komponentu ProjectTabsNavigation
   - Dodanie kontenera dla komponentów React

2. Utworzenie głównych komponentów React:
   - FunctionalBlocksContainer
   - EmptyState
   - LoadingState
   - GenerateBlocksButton

3. Implementacja komponentów listy i elementów:
   - FunctionalBlocksList z obsługą drag & drop
   - FunctionalBlockItem z możliwością rozwijania
   - AddBlockButton

4. Implementacja komponentów formularzy:
   - FunctionalBlockForm
   - BlockCategorySelect
   - BlockDependenciesSelect

5. Utworzenie customowych hooków:
   - useFunctionalBlocks do zarządzania stanem bloków
   - useFunctionalBlockForm do zarządzania stanem formularza

6. Integracja z API:
   - Implementacja funkcji fetch dla endpointów
   - Obsługa błędów API
   - Dodanie mechanizmu zapisywania zmian w czasie rzeczywistym

7. Implementacja funkcjonalności drag & drop:
   - Dodanie biblioteki react-beautiful-dnd
   - Implementacja wizualnych wskaźników przeciągania
   - Zapisywanie nowej kolejności po przeciągnięciu

8. Dodanie obsługi błędów i stanów ładowania:
   - Wskaźniki ładowania
   - Komunikaty błędów
   - Przyciski ponowienia próby

9. Optymalizacja wydajności:
   - Wykorzystanie useMemo i useCallback
   - Debouncing zapisywania zmian
   - Optymalizacja renderowania listy

10. Testy:
    - Testowanie wszystkich interakcji użytkownika
    - Testowanie walidacji formularzy
    - Testowanie obsługi błędów API
    - Testowanie zapisywania zmian w czasie rzeczywistym