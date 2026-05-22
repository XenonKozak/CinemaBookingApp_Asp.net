# 🐒 Jak naprawić Service Bus w Azure (krok po kroku — wersja dla małpy)

Ten poradnik naprawia błąd w konsoli:

```text
[ServiceBus Worker] Wykryto błąd na kolejce 'user-events': Nieznany host. ErrorCode: HostNotFound
[ServiceBus Worker] Wykryto błąd na kolejce 'ticket-queue': Nieznany host. ErrorCode: HostNotFound
```

**Co to znaczy po ludzku?**  
Twoja aplikacja w chmurze próbuje połączyć się z **Azure Service Bus** (kolejka wiadomości), ale adres jest **zły** albo **nie istnieje**. Najczęściej w Azure w Web App wisi stary placeholder z `appsettings.json` typu `YOUR_SERVICE_BUS` zamiast prawdziwego connection stringa.

> [!IMPORTANT]
> **Dobra wiadomość:** Rezerwacje, filmy i seanse **działają bez Service Bus**. Service Bus jest tylko do **automatycznych e-maili** (powitanie po rejestracji + bilet po rezerwacji). Jeśli nie potrzebujesz maili na zaliczenie — możesz Service Bus wyłączyć (patrz **OPCJA B** na końcu).

---

## 📋 Co musisz mieć przed startem

- Konto Azure (np. *Azure for Students*)
- Działająca **Web App** z API, np. `cinema-api-gdansk-2026`
- Około **15–20 minut**
- Notatnik — będziesz kopiować connection stringi (nie wrzucaj ich na publicznego GitHuba!)

---

## 🎯 OPCJA A — Pełna naprawa (maile + kolejki działają)

### KROK 1: Wejdź na portal Azure

1. Otwórz przeglądarkę.
2. Wejdź na: [https://portal.azure.com](https://portal.azure.com)
3. Zaloguj się kontem studenckim Microsoft.

---

### KROK 2: Znajdź lub utwórz **Service Bus Namespace**

**Namespace** = „budynek”, w którym stoją kolejki. Bez niego nic nie zadziała.

#### Masz już Service Bus?

1. W górnym pasku wyszukiwarki wpisz: **`Service Bus namespaces`**
2. Kliknij w wynik.
3. Zobacz listę. Szukaj czegoś w stylu `cinemabus2137` lub podobnej nazwy.

#### Nie masz żadnego Service Bus?

1. Na liście kliknij **`+ Create`**
2. Wypełnij:
   - **Subscription**: Twoja subskrypcja studencka
   - **Resource group**: Ta sama grupa co Web App i SQL (np. `N32-32`)
   - **Namespace name**: np. `cinemabus-gdansk-2026` *(musi być unikalna w całym Azure — tylko małe litery, cyfry, myślniki)*
   - **Location**: `Poland Central` lub `West Europe`
   - **Pricing tier**: **Basic** (wystarczy na projekt; masz kredyty studenckie)
3. Kliknij **Review + create** → **Create**
4. Poczekaj aż status będzie **Succeeded** → **Go to resource**

Zapisz sobie **dokładną nazwę namespace**, np. `cinemabus-gdansk-2026`.

---

### KROK 3: Utwórz 3 kolejki (Queues)

Aplikacja Cinema Booking używa **trzech** kolejek:

| Nazwa kolejki | Do czego służy |
|---------------|----------------|
| `user-events` | E-mail powitalny po rejestracji |
| `ticket-queue` | E-mail z biletem po rezerwacji |
| `screening-events` | Zdarzenie po dodaniu seansu (opcjonalnie / logika w tle) |

**Jak je dodać (dla każdej z trzech — powtórz 3 razy):**

1. Jesteś w swoim **Service Bus namespace** (nie w Web App!).
2. W lewym menu: **Entities** → **Queues**
3. Kliknij **`+ Queue`**
4. W polu **Name** wpisz dokładnie nazwę, np. `user-events` *(małe litery, myślnik — kopiuj z tabeli!)*
5. Resztę zostaw domyślnie.
6. Kliknij **Create**
7. Powtórz dla `ticket-queue` i `screening-events`.

Po tym na liście **Queues** muszą być wszystkie trzy. Jak brakuje jednej — dostaniesz błąd w logach.

---

### KROK 4: Skopiuj **prawdziwy** Connection String

To najważniejszy krok. Bez tego będzie `HostNotFound`.

1. Nadal w **Service Bus namespace** (ten sam ekran co w kroku 3).
2. W lewym menu kliknij **Shared access policies** (Zasady dostępu współdzielonego).
3. Kliknij w policy **`RootManageSharedAccessKey`**
4. Po prawej znajdź **Primary Connection String**
5. Kliknij ikonę **kopiuj** 📋

Connection string wygląda mniej więcej tak:

```text
Endpoint=sb://TWOJA-NAZWA.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=jakis_dlugi_klucz...
```

**Sprawdź czy dobrze skopiowałeś:**
- Jest `Endpoint=sb://`
- Jest `.servicebus.windows.net`
- **NIE MA** słów `YOUR_SERVICE_BUS` ani `YOUR_KEY`
- To jedna długa linia (bez enterów w środku)

---

### KROK 5: Wklej connection string do **Web App** (Environment variables)

Teraz mówimy o aplikacji API, nie o Service Bus.

1. W wyszukiwarce Azure wpisz: **`cinema-api-gdansk-2026`** (albo Twoja nazwa Web App)
2. Otwórz swoją **Web App**
3. W lewym menu: **Settings** → **Environment variables**
4. Zakładka **App settings**

#### 5a. Service Bus — connection string

1. Kliknij **`+ Add`**
2. **Name** (nazwa — wpisz DOKŁADNIE, z dwoma podkreśleniami):

   ```text
   ConnectionStrings__ServiceBus
   ```

3. **Value**: wklej skopiowany **Primary Connection String** z kroku 4
4. Zaznacz **Deployment slot setting** — możesz zostawić odznaczone
5. Kliknij **Apply** w panelu bocznym

#### 5b. Włącz Service Bus w aplikacji

1. Kliknij znowu **`+ Add`**
2. **Name**:

   ```text
   UseServiceBus
   ```

3. **Value**:

   ```text
   true
   ```

4. Kliknij **Apply**

> [!WARNING]
> Jeśli masz starą zmienną `ConnectionStrings__ServiceBus` z wartością `YOUR_SERVICE_BUS` — **usuń ją** albo **nadpisz** prawdziwym stringiem. Stara wartość = błąd HostNotFound.

#### 5c. (Polecane) SMTP — żeby maile faktycznie wychodziły

Bez SMTP worker dostanie wiadomość z kolejki, ale mail się nie wyśle.

Dodaj (każda osobno, **+ Add**):

| Name | Przykładowa wartość |
|------|---------------------|
| `SmtpSettings__Host` | `smtp.gmail.com` |
| `SmtpSettings__Port` | `587` |
| `SmtpSettings__Username` | `twoj.email@gmail.com` |
| `SmtpSettings__Password` | hasło aplikacji Gmail (16 znaków) |

> Gmail: **Google Account** → **Security** → **2-Step Verification** → **App passwords** → wygeneruj hasło do „Mail”.

#### 5d. Reszta (jeśli jeszcze nie masz)

Upewnij się, że są też (z portalu Azure / SQL / Storage):

| Name | Skąd wziąć |
|------|------------|
| `ConnectionStrings__DefaultConnection` | Azure SQL → Connection strings |
| `ConnectionStrings__BlobStorage` | Storage Account → Access keys |
| `Jwt__Key` | Dowolny sekret min. 32 znaki (ten sam co lokalnie na produkcji) |
| `Jwt__Issuer` | `CinemaApp` |
| `Jwt__Audience` | `CinemaAppUsers` |

Redis opcjonalny — jak nie masz, ustaw:

| Name | Value |
|------|-------|
| `UseRedis` | `false` |

---

### KROK 6: Zapisz i zrestartuj Web App

1. Na górze strony Environment variables kliknij **`Apply`**
2. Potem **`Confirm`**
3. Poczekaj ~1–2 minuty — Azure sam zrestartuje aplikację

Alternatywnie: Web App → **Overview** → **Restart**

---

### KROK 7: Wdróż najnowszy kod API

Żeby działała logika `UseServiceBus` i czyszczenie cache, musisz mieć aktualny kod na serwerze.

**Najprościej (GitHub Actions):**

```powershell
cd C:\Users\wikto\Desktop\CinemaBookingAppV3
git add .
git commit -m "Azure Service Bus config"
git push origin main
```

Potem na GitHubie: **Actions** → czekaj na zielony ✅.

**Albo Visual Studio:** PPM na `CinemaBookingApp2` → **Publish** → Twoja Web App → **Publish**.

---

### KROK 8: Sprawdź logi — czy błąd zniknął

1. Web App → **Monitoring** → **Log stream** (lub **Logs**)
2. Odśwież stronę API w przeglądarce (żeby „obudzić” aplikację)
3. **Nie powinno** już spamować `HostNotFound`

**Dobry znak:** cisza albo jednorazowy komunikat o starcie aplikacji.

**Zły znak:** nadal `HostNotFound` → wróć do kroku 4 i 5, connection string jest zły.

---

### KROK 9: Przetestuj maile (opcjonalnie)

1. Wejdź na frontend / mobile, **zarejestruj** nowe konto (testowy e-mail).
2. Zrób **rezerwację** miejsca.
3. Sprawdź skrzynkę (i spam).

W logach Web App możesz zobaczyć:

```text
[ServiceBus Worker] Otrzymano zdarzenie o nowym użytkowniku: ...
[ServiceBus Worker] Otrzymano zdarzenie o rezerwacji: ...
```

---

## 🛑 OPCJA B — Wyłącz Service Bus (zero błędów, zero maili)

Jeśli na zaliczenie **nie potrzebujesz** automatycznych e-maili:

1. Web App → **Environment variables**
2. Dodaj lub edytuj:

   | Name | Value |
   |------|-------|
   | `UseServiceBus` | `false` |

3. **Apply** → **Confirm** → **Restart**

Błędy `HostNotFound` znikną. Aplikacja (filmy, seanse, rezerwacje) działa normalnie.

---

## 🔧 Rozwiązywanie problemów (ściąga)

| Problem | Co zrobić |
|---------|-----------|
| `HostNotFound` | Zły connection string w `ConnectionStrings__ServiceBus` — skopiuj ponownie z Service Bus → RootManageSharedAccessKey |
| `Unauthorized` | Zły klucz w connection string — skopiuj **Primary** jeszcze raz |
| Kolejka nie istnieje | Utwórz brakującą queue w Service Bus (krok 3) |
| Maile nie przychodzą | Ustaw SMTP + hasło aplikacji Gmail (krok 5c) |
| Worker „śpi” | Plan F1 usypia app — ustaw plan **B1** + **Always On** w Configuration → General settings |
| Nadal stary błąd po poprawce | **Restart** Web App + sprawdź czy deploy się udał (GitHub Actions na zielono) |

---

## ✅ Checklista „czy małpa zrobiła dobrze”

- [ ] Service Bus **namespace** istnieje w Azure
- [ ] Kolejki: `user-events`, `ticket-queue`, `screening-events`
- [ ] Connection string skopiowany z **RootManageSharedAccessKey**
- [ ] W Web App: `ConnectionStrings__ServiceBus` = prawdziwy string (bez `YOUR_`)
- [ ] W Web App: `UseServiceBus` = `true` (albo `false` jeśli wyłączasz)
- [ ] Kliknięte **Apply** + **Confirm**
- [ ] Web App zrestartowana
- [ ] Najnowszy kod wdrożony (`git push` lub Publish)
- [ ] W Log stream **brak** `HostNotFound`

---

## 📎 Powiązane poradniki w tym projekcie

- `azure_env_variables_guide.md` — wszystkie zmienne środowiskowe Web App
- `azure_deployment_guide.md` — jak wdrożyć API (Publish / GitHub)
- `azure_worker_role_guide.md` — jak działają workery w tle

---

**Koniec.** Jak utkniesz na konkretnym kroku, zrób zrzut ekranu z Azure (Environment variables + lista Queues) — wtedy da się powiedzieć dokładnie co jest nie tak.
