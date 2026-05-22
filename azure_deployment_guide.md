# 🚀 Poradnik: Wdrażanie (Deployment) Aplikacji do Azure App Service (Jak dla małpy 🐒)

Masz już gotową usługę **Web App** oraz skonfigurowane hasła w zmiennych środowiskowych. Teraz musimy wgrać Twój kod z komputera do chmury Azure.

Poniżej znajdziesz dwie najprostsze metody. **Wybierz JEDNĄ z nich**, która bardziej Ci odpowiada!

---

## 🔵 METODA 1: Przez Visual Studio (Najszybsza i najprostsza) 💻
*Ta metoda polega na kliknięciu "Publikuj" bezpośrednio z programu Visual Studio.*

1. **Uruchom Visual Studio** i otwórz swój projekt (`CinemaBookingApp2.sln`).
2. W oknie *Solution Explorer* (Eksplorator Rozwiązań) po prawej stronie kliknij **prawym przyciskiem myszy** na główny projekt: **`CinemaBookingApp2`**.
3. Z menu wybierz **Publish...** (Publikuj).
4. Otworzy się kreator wdrożenia:
   * **Target (Cel):** Wybierz **Azure** i kliknij *Next*.
   * **Specific target:** Wybierz **Azure App Service (Linux)** (ponieważ tak skonfigurowaliśmy nasz serwer!) i kliknij *Next*.
   * **App Service:**
     * Jeśli nie jesteś zalogowany, kliknij w prawym górnym rogu i zaloguj się swoim uczelnianym kontem Microsoft (tym samym, na którym masz Azure).
     * Wybierz swoją subskrypcję (*Azure for Students*).
     * Na liście powinieneś zobaczyć swoją aplikację: **`cinema-api-gdansk-2026`** (pod grupą zasobów `N32-32`). Zaznacz ją i kliknij *Next*.
   * **API Management:** Zaznacz *Skip this step* (Pomiń ten krok) i kliknij *Next*.
   * **Finish:** Kliknij **Finish** (Zakończ).
5. Visual Studio utworzy profil publikowania. Teraz na środku ekranu zobaczysz wielki zielony/niebieski przycisk **Publish** w prawym górnym rogu. **Kliknij go!**
6. W dolnej konsoli (*Output*) zobaczysz postęp kompilacji i wysyłania plików. Po około 1-2 minutach otrzymasz komunikat **Publish Succeeded** (Publikowanie powiodło się), a w przeglądarce automatycznie otworzy się strona Twojej aplikacji działająca już w chmurze!

---

## 🟢 METODA 2: Przez GitHub Actions (Automatyczna – profesjonalna) 🐙
*Ta metoda łączy Twojego GitHuba z Azure. Za każdym razem, gdy zrobisz `git push`, Azure sam pobierze i wdroży nową wersję.*

1. Zaloguj się na [portal.azure.com](https://portal.azure.com/) i przejdź do swojej usługi **Web App** (`cinema-api-gdansk-2026`).
2. W lewym czarnym menu, w sekcji **Deployment** (Wdrożenie), kliknij **Deployment Center** (Centrum wdrażania).
3. W zakładce *Settings* (Ustawienia) wypełnij formularz:
   * **Source (Źródło):** Wybierz **GitHub**.
   * **GitHub Account:** Jeśli nie jesteś połączony, kliknij przycisk *Authorize* i zaloguj się na swoje konto GitHub.
   * **Organization:** Wybierz swoją nazwę użytkownika na GitHubie.
   * **Repository:** Wybierz repozytorium swojego projektu (np. `CinemaBookingApp_Asp.net`).
   * **Branch:** Wybierz gałąź, z której chcesz wdrażać (najczęściej `main` lub `master`).
4. Azure automatycznie wykryje, że to projekt `.NET` i sam przygotuje plik konfiguracyjny.
5. Na samej górze ekranu kliknij przycisk **Save** (Zapisz).
6. **Co się teraz wydarzy?**
   * Azure automatycznie dodał do Twojego repozytorium na GitHubie specjalny plik workflow (w folderze `.github/workflows/`).
   * Na GitHubie w zakładce **Actions** uruchomi się automatyczny proces budowania i wdrażania. Potrwa około 2-3 minut.
   * Gdy kółko na GitHubie zmieni kolor na zielony ✅, Twoja strona będzie już działać na żywo w Azure!

> [!IMPORTANT]
> **Bardzo ważny krok PO wdrożeniu przez GitHub (Metoda 2):**
> Ponieważ Azure sam dodał plik konfiguracyjny do Twojego GitHuba, musisz pobrać te zmiany na swój komputer. Otwórz terminal w VS Code i wpisz:
> ```bash
> git pull
> ```

---

## 🧪 Jak sprawdzić, czy aplikacja działa w chmurze?
Twój adres URL w chmurze to:
`https://cinema-api-gdansk-2026.azurewebsites.net`

Możesz wejść na ten adres w przeglądarce i dopisać na końcu `/swagger` (np. `https://cinema-api-gdansk-2026.azurewebsites.net/swagger/index.html`), aby otworzyć dokumentację Swaggera i przetestować API!
