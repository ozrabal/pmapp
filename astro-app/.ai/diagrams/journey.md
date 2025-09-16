# Diagram podróży użytkownika - autentykacja

<user_journey_analysis>
## Analiza podróży użytkownika

### 1. Zidentyfikowane ścieżki użytkownika
Na podstawie plików referencyjnych zidentyfikowano następujące ścieżki użytkownika:

1. **Rejestracja nowego użytkownika (US-001)**:
   - Wypełnienie formularza rejestracyjnego (email, hasło, imię)
   - Walidacja danych w czasie rzeczywistym
   - Wysłanie formularza i utworzenie konta
   - Otrzymanie emaila z linkiem aktywacyjnym
   - Aktywacja konta poprzez kliknięcie linku

2. **Logowanie do systemu (US-002)**:
   - Wprowadzenie danych logowania (email i hasło)
   - Weryfikacja poprawności danych
   - Przekierowanie po poprawnym logowaniu lub wyświetlenie błędu

3. **Odzyskiwanie hasła (US-003)**:
   - Inicjacja procesu odzyskiwania hasła
   - Podanie adresu email
   - Otrzymanie emaila z linkiem do resetowania hasła
   - Ustawienie nowego hasła
   - Potwierdzenie zmiany hasła

4. **Korzystanie z aplikacji jako zalogowany użytkownik**:
   - Dostęp do funkcjonalności dla zalogowanych użytkowników
   - Automatyczna weryfikacja sesji przy dostępie do chronionych zasobów
   - Odświeżanie tokenu autoryzacyjnego
   - Wylogowanie z systemu

### 2. Główne podróże i stany

#### Podróż 1: Rejestracja i aktywacja konta
Stany:
- Strona główna (punkt wejścia)
- Formularz rejestracji
- Walidacja danych rejestracyjnych
- Potwierdzenie rejestracji
- Oczekiwanie na aktywację
- Aktywacja konta
- Przekierowanie do logowania

#### Podróż 2: Logowanie i korzystanie z aplikacji
Stany:
- Formularz logowania
- Walidacja danych logowania
- Panel główny aplikacji (Dashboard)
- Korzystanie z funkcji aplikacji
- Wylogowanie

#### Podróż 3: Odzyskiwanie hasła
Stany:
- Formularz resetowania hasła
- Podanie adresu email
- Potwierdzenie wysłania linku
- Formularz ustawienia nowego hasła
- Potwierdzenie zmiany hasła
- Przekierowanie do logowania

### 3. Punkty decyzyjne i alternatywne ścieżki

#### Punkty decyzyjne w procesie rejestracji:
- Czy adres email jest unikalny?
- Czy hasło spełnia wymagania bezpieczeństwa?
- Czy użytkownik potwierdził adres email?

#### Punkty decyzyjne w procesie logowania:
- Czy dane logowania są poprawne?
- Czy konto zostało aktywowane?

#### Punkty decyzyjne w procesie resetowania hasła:
- Czy podany email istnieje w systemie?
- Czy token resetujący hasło jest ważny?
- Czy nowe hasło spełnia wymagania bezpieczeństwa?

#### Punkty decyzyjne w korzystaniu z aplikacji:
- Czy sesja użytkownika jest aktywna?
- Czy token JWT jest ważny?

### 4. Cel każdego stanu

- **Strona główna**: Zapoznanie użytkownika z aplikacją i umożliwienie przejścia do rejestracji/logowania
- **Formularz rejestracji**: Zebranie danych niezbędnych do utworzenia konta
- **Walidacja danych rejestracyjnych**: Zapewnienie poprawności i bezpieczeństwa danych
- **Potwierdzenie rejestracji**: Informacja o konieczności aktywacji konta
- **Aktywacja konta**: Weryfikacja adresu email i aktywacja konta
- **Formularz logowania**: Wprowadzenie danych uwierzytelniających
- **Panel główny aplikacji**: Centralny punkt dostępu do funkcji aplikacji
- **Formularz resetowania hasła**: Inicjacja procesu odzyskiwania dostępu
- **Formularz ustawienia nowego hasła**: Wprowadzenie nowego, bezpiecznego hasła
- **Wylogowanie**: Zakończenie sesji i zabezpieczenie konta
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2
    [*] --> StronaGlowna
    
    state "Dostęp publiczny" as DostepPubliczny {
        StronaGlowna --> OpcjeLogowania: Kliknięcie przycisku zaloguj/zarejestruj
        
        state OpcjeLogowania <<choice>>
        OpcjeLogowania --> FormularzLogowania: Wybór logowania
        OpcjeLogowania --> FormularzRejestracji: Wybór rejestracji
        OpcjeLogowania --> FormularzResetowaniaHasla: Zapomniałem hasła
        
        state "Proces rejestracji" as ProcesRejestracji {
            FormularzRejestracji --> WalidacjaDanych
            
            state WalidacjaDanych {
                state sprawdzEmail <<choice>>
                WprowadzenieDanych --> sprawdzEmail
                sprawdzEmail --> BladWalidacji: Email zajęty/niepoprawny
                sprawdzEmail --> sprawdzHaslo: Email OK
                
                state sprawdzHaslo <<choice>>
                sprawdzHaslo --> BladWalidacji: Hasło za słabe
                sprawdzHaslo --> WyslanieFormularza: Hasło OK
                
                BladWalidacji --> WprowadzenieDanych: Popraw dane
            }
            
            WyslanieFormularza --> KontoUtworzoneDoAktywacji
            
            note right of KontoUtworzoneDoAktywacji
                Email z linkiem aktywacyjnym 
                został wysłany
            end note
        }
        
        state "Proces aktywacji konta" as ProcesAktywacji {
            KontoUtworzoneDoAktywacji --> KlikniecieLinku: Użytkownik klika link w emailu
            
            state weryfikacjaTokenu <<choice>>
            KlikniecieLinku --> weryfikacjaTokenu
            weryfikacjaTokenu --> TokenWygasl: Token nieważny/wygasł
            weryfikacjaTokenu --> KontoAktywne: Token poprawny
            
            TokenWygasl --> FormularzRejestracji: Ponowna rejestracja
            KontoAktywne --> FormularzLogowania: Przekierowanie do logowania
        }
        
        state "Proces logowania" as ProcesLogowania {
            FormularzLogowania --> WprowadzenieDanychLogowania
            WprowadzenieDanychLogowania --> WeryfikacjaDanychLogowania
            
            state weryfikacjaLogowania <<choice>>
            WeryfikacjaDanychLogowania --> weryfikacjaLogowania
            weryfikacjaLogowania --> BladLogowania: Dane niepoprawne
            weryfikacjaLogowania --> ZalogowanyUzytkownik: Dane poprawne
            
            BladLogowania --> WprowadzenieDanychLogowania: Popraw dane
        }
        
        state "Proces resetowania hasła" as ProcesResetowaniaHasla {
            FormularzResetowaniaHasla --> PodanieEmaila
            PodanieEmaila --> WyslanieLinku
            WyslanieLinku --> PotwierdzenieWyslaniaLinku
            
            note right of PotwierdzenieWyslaniaLinku
                Email z linkiem do resetowania
                hasła został wysłany
            end note
            
            PotwierdzenieWyslaniaLinku --> KlikniecieLinku2: Użytkownik klika link w emailu
            
            state weryfikacjaTokenuResetu <<choice>>
            KlikniecieLinku2 --> weryfikacjaTokenuResetu
            weryfikacjaTokenuResetu --> TokenResetuWygasl: Token nieważny/wygasł
            weryfikacjaTokenuResetu --> FormularzNowegoHasla: Token poprawny
            
            TokenResetuWygasl --> FormularzResetowaniaHasla: Ponowna próba
            
            FormularzNowegoHasla --> WalidacjaNowegoHasla
            
            state walidacjaHasla <<choice>>
            WalidacjaNowegoHasla --> walidacjaHasla
            walidacjaHasla --> BladWalidacjiHasla: Hasło za słabe
            walidacjaHasla --> HasloZmienione: Hasło OK
            
            BladWalidacjiHasla --> FormularzNowegoHasla: Popraw hasło
            HasloZmienione --> FormularzLogowania: Przekierowanie do logowania
        }
    }
    
    state "Obszar chroniony" as ObszarChroniony {
        ZalogowanyUzytkownik --> Dashboard: Przekierowanie po zalogowaniu
        
        state "Panel użytkownika" as PanelUzytkownika {
            Dashboard --> MojeProjekty: Przejście do projektów
            Dashboard --> UstawieniaKonta: Przejście do ustawień
            
            state "Zarządzanie projektami" as ZarzadzanieProjektami {
                MojeProjekty --> ListaProjektow
                ListaProjektow --> SzczególyProjektu: Wybór projektu
                ListaProjektow --> TworzenieProjektu: Nowy projekt
                SzczególyProjektu --> EdycjaProjektu: Edycja projektu
            }
            
            state "Ustawienia konta" as Ustawienia {
                UstawieniaKonta --> EdycjaProfilu
                UstawieniaKonta --> ZmianaHasla
                UstawieniaKonta --> UsuwanieKonta
            }
        }
        
        state "Proces wylogowania" as ProcesWylogowania {
            PrzyciskWylogowania --> PotwierdzenieWylogowania
            PotwierdzenieWylogowania --> FormularzLogowania: Przekierowanie do logowania
        }
        
        Dashboard --> PrzyciskWylogowania: Kliknięcie "Wyloguj"
        MojeProjekty --> PrzyciskWylogowania: Kliknięcie "Wyloguj"
        UstawieniaKonta --> PrzyciskWylogowania: Kliknięcie "Wyloguj"
    }
    
    state "Weryfikacja sesji" as WeryfikacjaSesji {
        state weryfikacjaAutoryzacji <<choice>>
        SprawdzenieSesji --> weryfikacjaAutoryzacji
        weryfikacjaAutoryzacji --> FormularzLogowania: Brak sesji/token wygasł
        weryfikacjaAutoryzacji --> ObszarChroniony: Sesja aktywna
        
        note left of SprawdzenieSesji
            Wykonywane przez middleware
            przy każdym żądaniu do
            chronionego zasobu
        end note
    }
    
    state timeout <<choice>>
    ObszarChroniony --> timeout: Czas nieaktywności
    timeout --> WygaslaSesja: Przekroczony limit czasu
    timeout --> ObszarChroniony: Automatyczne odświeżenie tokenu
    
    WygaslaSesja --> FormularzLogowania: Przekierowanie do logowania
    
    FormularzLogowania --> SprawdzenieSesji: Przekierowanie po logowaniu
    ZalogowanyUzytkownik --> SprawdzenieSesji
```
</mermaid_diagram>

Diagram przedstawia kompletną podróż użytkownika przez system autentykacji w aplikacji Plan My App, obejmując następujące główne procesy:

1. **Rejestracja i aktywacja konta** - proces utworzenia nowego konta użytkownika, wraz z walidacją danych wejściowych, wysłaniem emaila aktywacyjnego i aktywacją konta poprzez link.

2. **Logowanie do systemu** - proces uwierzytelniania użytkownika, weryfikacja danych logowania i przekierowanie do panelu głównego aplikacji.

3. **Resetowanie hasła** - wieloetapowy proces umożliwiający użytkownikowi odzyskanie dostępu do konta w przypadku zapomnienia hasła.

4. **Korzystanie z obszaru chronionego** - poruszanie się po funkcjach aplikacji dostępnych dla zalogowanych użytkowników, z uwzględnieniem zarządzania projektami i ustawieniami konta.

5. **Weryfikacja sesji** - automatyczny proces sprawdzania stanu sesji użytkownika przy dostępie do chronionych zasobów, z obsługą wygasania sesji i automatycznym odświeżaniem tokenu.

6. **Wylogowanie** - bezpieczne zakończenie sesji użytkownika i powrót do formularza logowania.

Diagram uwzględnia również różne punkty decyzyjne i alternatywne ścieżki, takie jak niepoprawne dane logowania, wygasłe tokeny czy błędy walidacji. Przedstawiona jest także struktura obszaru publicznego i chronionego aplikacji, zgodnie z wymaganiami określonymi w dokumentacji projektowej.