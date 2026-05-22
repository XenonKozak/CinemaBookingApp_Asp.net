# 🚀 Poradnik: Tworzenie Web App i Zmienne Środowiskowe w Azure (Wersja dla Studenta 🎓)

Ten poradnik przeprowadzi Cię przez dwa kluczowe etapy: utworzenie nowej usługi **Web App** dla Twojego backendu (API) oraz dodanie **Zmiennych Środowiskowych** (aby ukryć hasła). 

> [!TIP]
> **Kwestia Twojego budżetu (75 EUR):**
> Nie martw się! Możesz stworzyć tę aplikację za **okrągłe 0 zł** korzystając z planu Free (F1). Jeśli wybierzesz nieco wyższy plan Basic (B1), który zapobiega zasypianiu aplikacji, koszt wyniesie około **12-14 EUR za cały miesiąc**. Mając 75 EUR, absolutnie **nie zużyjesz całego budżetu**, nawet jeśli projekt będzie wisiał w chmurze przez miesiąc przed zaliczeniem!

---

## 🏗️ CZĘŚĆ 1: Tworzenie usługi Web App (Jak dla małpy 🐒)

Aby wdrożyć Twoje API oraz Workery (w tym ten od biletów), musisz założyć usługę Web App.

1. Zaloguj się na [portal.azure.com](https://portal.azure.com/).
2. W wyszukiwarce na górze wpisz **App Services** i wybierz tę usługę.
3. W lewym górnym rogu kliknij niebieski przycisk **+ Create** (Utwórz) i z listy wybierz **Web App**.
4. Zobaczysz kreator wdrożenia. Wypełnij zakładkę **Basics** dokładnie w ten sposób:
   *   **Subscription**: Twoja licencja studencka (*Azure for Students*).
   *   **Resource Group**: Wybierz z listy istniejącą (np. tę, w której masz bazę danych) lub kliknij *Create new*.
   *   **Name**: Wpisz unikalną nazwę swojej aplikacji, np. `cinema-api-gdansk-2026` (będzie to część Twojego linku, więc nie może być zajęta).
   *   **Publish**: Zaznacz `Code`.
   *   **Runtime stack**: Wybierz `.NET 8 (LTS)`.
   *   **Operating System**: Wybierz **Linux** (dla .NET jest o wiele lżejszy i dużo tańszy w wyższych planach!).
   *   **Region**: Wybierz np. `Poland Central` lub `West Europe`.
5. **Pricing Plan (Najważniejsze dla budżetu!):** 
   Na samym dole w sekcji Pricing Plan kliknij **Explore pricing plans**. Pojawi się lista dostępnych pakietów.
   *   Chcesz totalnie za darmo? Wybierz **Free (F1)**. Kosztuje **0.00 EUR**. Niestety po 20 minutach bezczynności aplikacja "zaśnie", więc Worker z e-mailami nie wyśle maila, póki nie wejdziesz ponownie na stronę i jej nie "obudzisz".
   *   Moja rekomendacja (skoro masz 75 EUR): Wybierz pakiet **Basic (B1)**. Kosztuje mało, ma gwarancję dostępności i funkcję *Always On*, dzięki której bilet przyjdzie na maila natychmiast, nawet w środku nocy.
6. Kliknij niebieski przycisk na samym dole: **Review + create**, a po krótkiej weryfikacji kliknij **Create**.
7. Zrób sobie kawę ☕ (Zajmie to około minuty). Pojawi się wielki napis "Your deployment is complete". Kliknij **Go to resource**.

---

## 🔐 CZĘŚĆ 2: Ustawianie zmiennych środowiskowych

Gdy aplikacja została utworzona, musimy bezpiecznie przekazać jej Twoje hasła (do Gmaila, Service Busa, Redisa i SQL). 

1. Jesteś teraz w głównym oknie utworzonej przed chwilą aplikacji **Web App**.
2. W lewym, długim, czarnym menu zjedź w dół do sekcji **Settings** (Ustawienia).
3. Kliknij w **Environment variables** (Zmienne środowiskowe). *(Uwaga: W starym Azure to się nazywało "Configuration").*
4. Na środku ekranu, w zakładce *App settings*, znajduje się przycisk **+ Add** (Dodaj). Będziesz musiał w niego klikać dla każdego hasła.

### Jakie zmienne dodać? Klikaj po kolei "+ Add" i wpisuj:

**Konfiguracja Poczty (SMTP):**
*   Kliknij **+ Add**:
    *   **Name**: Wpisz dokładnie `SmtpSettings__Username` *(Uwaga: to są DWA znaki podkreślenia!)*
    *   **Value**: Twój e-mail, np. `cinemabookingappgdansk@gmail.com`
    *   Kliknij **Apply** w bocznym panelu.
*   Kliknij **+ Add**:
    *   **Name**: `SmtpSettings__Password`
    *   **Value**: Twoje 16-literowe hasło, np. `lafyiognpbrvwyrn`
    *   Kliknij **Apply**.

**Konfiguracja Usług Chmurowych:**
*(Przekopiuj odpowiednie Connection Stringi z Twojego pliku appsettings.json)*
*   Kliknij **+ Add**:
    *   **Name**: `ConnectionStrings__DefaultConnection`
    *   **Value**: Twój Connection String do bazy SQL
    *   Kliknij **Apply**.
*   Kliknij **+ Add**:
    *   **Name**: `ConnectionStrings__ServiceBus`
    *   **Value**: Twój Connection String z parametrem `Endpoint=sb://...`
    *   Kliknij **Apply**.
*   Kliknij **+ Add**:
    *   **Name**: `ConnectionStrings__RedisConnection`
    *   **Value**: Twój Connection String do Redisa
    *   Kliknij **Apply**.

### 💾 Zapis i Restart
1. Gdy dodasz wszystko, na samym początku strony kliknij wielki przycisk **Apply** (lub Save), aby zatwierdzić nową listę zmiennych do serwera.
2. Azure zapyta Cię, czy na pewno to zapisać. Kliknij **Confirm** (Potwierdź).
3. Serwer w Azure automatycznie się zrestartuje, bezpiecznie zaczyta nowe zmienne i będzie w 100% gotowy do przyjmowania requestów od użytkowników na żywo!
