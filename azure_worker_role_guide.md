# 👷 Uruchomienie Worker Role w Chmurze Azure (Licencja Studencka)

Cześć! Ten poradnik pokaże Ci, jak krok po kroku uruchomić i skonfigurować Twój **Worker Role (Background Service)** w chmurze Microsoft Azure przy użyciu darmowego konta studenckiego. Dowiesz się też, jak to działa w połączeniu z Twoją funkcją bezserwerową (Serverless).

---

## 💡 Jak to działa w Twojej aplikacji?
1. Kiedy nowy użytkownik rejestruje się w aplikacji, system wysyła powiadomienie (wiadomość) do kolejki **Service Bus** o nazwie `user-events`.
2. Twój **Worker Role** (`UserRegistrationEmailWorker`) działa jako proces w tle wewnątrz aplikacji ASP.NET Core. Cały czas nasłuchuje on tej kolejki i kiedy pojawi się w niej nowa rejestracja, natychmiast wysyła maila powitalnego.
3. **Ważna uwaga:** Masz również projekt **Azure Functions** (`CinemaFunctions`), który robi dokładnie to samo za pomocą mechanizmu Serverless. W środowisku produkcyjnym zazwyczaj wybiera się jedno z tych rozwiązań, ale posiadanie obu w projekcie studenckim to świetny sposób na dodatkowe punkty!

---

## 🛠️ Krok 1: Upewnij się, że kolejka `user-events` istnieje w Azure Service Bus
W Twoim pliku `appsettings.json` widnieje już skonfigurowany Service Bus (`cinemabus2137`). Musimy upewnić się, że wewnątrz niego istnieje odpowiednia kolejka.

1. Zaloguj się na [portal.azure.com](https://portal.azure.com/).
2. W górnym pasku wyszukiwania wpisz **Service Bus** i kliknij w tę usługę.
3. Kliknij na swoją przestrzeń nazw (np. **cinemabus2137**).
4. W menu po lewej stronie znajdź sekcję **Entities** i kliknij **Queues** (Kolejki).
5. Sprawdź, czy na liście znajduje się kolejka o nazwie **`user-events`**.
6. Jeśli jej nie ma:
   - Kliknij na górze **`+ Queue`** (Utwórz kolejkę).
   - W polu **Name** wpisz `user-events`.
   - Pozostałe opcje pozostaw domyślne i kliknij **Create** na samym dole.
7. Powtórz krok 6 dla kolejki **`screening-events`** (jest używana przy tworzeniu nowych seansów!).

---

## 🚀 Krok 2: Wdrożenie aplikacji na Azure App Service (Web App)
Ponieważ Twój Background Worker został zarejestrowany bezpośrednio w kodzie API (`builder.Services.AddHostedService<UserRegistrationEmailWorker>()`), uruchomi się on automatycznie razem z Twoją główną stroną/API.

Najwygodniejszym sposobem uruchomienia tego na darmowej licencji studenckiej jest wdrożenie do **Azure App Service**:

1. Wyszukaj **App Services** w portalu Azure i kliknij **+ Create** -> **Web App**.
2. Wypełnij formularz:
   - **Subscription**: Twoja subskrypcja studencka (np. *Azure for Students*).
   - **Resource Group**: Wybierz istniejącą lub kliknij *Create new* (np. `CinemaBookingRG`).
   - **Name**: Unikalna nazwa Twojej witryny (np. `cinema-booking-api-2137`).
   - **Publish**: `Code`
   - **Runtime stack**: `.NET 8 (LTS)`
   - **Operating System**: `Linux` lub `Windows` (Linux jest zazwyczaj tańszy/szybszy).
   - **Region**: Wybierz region blisko Ciebie (np. `West Europe` lub `North Europe`).
   - **Pricing Plan**: Wybierz darmowy plan **F1 (Free)** lub najtańszy płatny z kredytów studenckich **B1 (Basic)**.
3. Kliknij **Review + create**, a następnie **Create**.

> [!WARNING]
> **Kluczowa uwaga dla darmowego planu (F1):**
> Darmowy plan Azure App Service automatycznie "usypia" aplikację, jeśli przez pewien czas nikt na nią nie wejdzie. Kiedy aplikacja śpi, Twój proces w tle (Worker) również zostanie wstrzymany!
> *   **Rozwiązanie 1**: Jeśli korzystasz z darmowych kredytów studenckich (zazwyczaj $100 na start), wybierz plan **B1 (Basic)**. W ustawieniach wdrożonej aplikacji wejdź w zakładkę **Configuration** -> **General settings** i włącz opcję **Always On** (Zawsze włączona). To zapobiegnie usypianiu Workera.
> *   **Rozwiązanie 2**: Jeśli musisz zostać przy całkowicie darmowym planie **F1**, Twój Worker w tle będzie działał tylko wtedy, gdy aplikacja jest wybudzona. Wtedy to właśnie **Azure Functions** (które są w pełni bezserwerowe i nie usypiają się) będą idealnym i niezawodnym sposobem na przetwarzanie tych maili w tle!

---

## 📧 Krok 3: Konfiguracja bezpiecznych zmiennych środowiskowych (SMTP)
Aby Twój Worker mógł wysyłać e-maile, potrzebuje danych logowania do poczty (SMTP). Przechowywanie ich bezpośrednio w pliku `appsettings.json` w otwartym kodzie na GitHubie to duże ryzyko (Microsoft może zablokować konto za wyciek haseł!).

Zamiast tego skonfiguruj je bezpiecznie w Azure:

1. W portalu Azure przejdź do swojej wdrożonej **Web App**.
2. W lewym menu w sekcji **Settings** kliknij **Environment variables** (lub *Configuration* w starszym panelu).
3. W zakładce **Application settings** dodaj nowe zmienne poprzez kliknięcie **+ Add**:
   *   `SmtpSettings__Host` = `smtp.gmail.com`
   *   `SmtpSettings__Port` = `587`
   *   `SmtpSettings__Username` = `TwójEmailStudencki@gmail.com`
   *   `SmtpSettings__Password` = `TwojeHasłoAplikacjiGmail` *(Uwaga: dla Gmaila musisz wygenerować tzw. "Hasło aplikacji" w ustawieniach konta Google, zwykłe hasło nie zadziała).*
4. Dodaj również połączenie do bazy danych, Redisa i Service Busa, aby aplikacja działała w chmurze:
   *   `ConnectionStrings__DefaultConnection` = *(Twój connection string SQL)*
   *   `ConnectionStrings__ServiceBus` = *(Twój connection string Service Bus)*
   *   `ConnectionStrings__RedisConnection` = *(Twój connection string Redis)*
   *   `ConnectionStrings__BlobStorage` = *(Twój connection string Storage Account)*
5. Kliknij **Apply** na dole strony, a potem **Confirm**, aby zapisać zmiany. Aplikacja zrestartuje się automatycznie z bezpiecznymi ustawieniami!

---

## 🧪 Krok 4: Jak przetestować czy to działa?
1. Uruchom aplikację backendową (lokalnie lub w chmurze Azure) oraz frontend.
2. Zarejestruj nowego użytkownika przez formularz rejestracji na frontendzie.
3. W tym momencie:
   - Aplikacja doda użytkownika do bazy danych SQL.
   - Wyśle wiadomość DTO o nowym użytkowniku na kolejkę `user-events` w Service Busie.
   - Twój zarejestrowany **Worker** (albo **Azure Function**) natychmiast przechwyci tę wiadomość z kolejki Azure, przetworzy ją i wyśle e-mail powitalny na skrzynkę użytkownika!
4. Status działania możesz obserwować w konsoli aplikacji (w logach zobaczysz napis: `[ServiceBus Worker] Otrzymano zdarzenie o nowym użytkowniku...`).
