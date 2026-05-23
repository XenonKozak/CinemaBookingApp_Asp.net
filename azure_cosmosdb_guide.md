# 🐵 Super Prosty Poradnik: Jak Wyklikać Darmowy Azure Cosmos DB (Krok po Kroku)

Ten przewodnik jest napisany tak prostym językiem, aby każdy (nawet kompletny początkujący) poradził sobie z konfiguracją bazy danych **Cosmos DB** w portalu Azure oraz połączeniem jej z Twoją aplikacją kinową (`CinemaBookingAppV3`).

Użycie Cosmos DB pozwoli Ci na zaliczenie punktu za bazę danych NoSQL w projekcie chmurowym.

---

> [!IMPORTANT]
> **Darmowe limity (Free Tier):**
> Masz licencję studencką z budżetem 100$. Cosmos DB może być drogi, jeśli zostanie źle skonfigurowany, ale oferuje **Free Tier** (1 darmowe konto na subskrypcję). 
> **Postępuj DOKŁADNIE według poniższych kroków**, aby upewnić się, że nie zapłacisz ani grosza z Twojego studenckiego kredytu!

---

## 🛠️ Krok 1: Stworzenie Konta Cosmos DB w Portalu Azure

1. Zaloguj się na portalu chmurowym: [portal.azure.com](https://portal.azure.com/).
2. Na samej górze w pasku wyszukiwania wpisz **Azure Cosmos DB** i kliknij w tę usługę (ikona niebieskiej planety / bazy danych).
3. Kliknij niebieski przycisk **+ Create** (lub **Utwórz**).
4. Zobaczysz kilka kafelków. Wybierz pierwszy z lewej: **Azure Cosmos DB for NoSQL** i kliknij przycisk **Create**.
5. Wypełnij zakładkę **Basics** dokładnie według tych wskazówek:
   * **Subscription:** Wybierz swoją subskrypcję studencką (*Azure for Students*).
   * **Resource Group:** Wybierz tę samą grupę, w której masz resztę projektu (np. `rg-cinema-booking` lub kliknij *Create new* i stwórz np. `rg-cinema-app`).
   * **Account Name:** Wpisz unikalną nazwę dla swojej bazy, np. `cinema-cosmos-twojeimie` (tylko małe litery i cyfry).
   * **Location:** Wybierz region najbliżej Ciebie – najlepiej **North Europe** (Irlandia) lub **West Europe** (Holandia).
   * **Capacity mode:** Upewnij się, że zaznaczone jest **Provisioned throughput** (wymagane dla darmowej warstwy!).
   * **Apply Free Tier Discount:** 🌟 **NAJWAŻNIEJSZE!** 🌟 Zaznacz opcję **Apply** (Zastosuj). Zobaczysz komunikat potwierdzający: *"You will receive 1000 RU/s and 25 GB of storage for free..."*.
   * **Limit total account throughput:** Zaznacz tę opcję (zazwyczaj domyślnie włączona przy Free Tier), aby system nie pozwolił na przekroczenie darmowej wydajności.
6. Kliknij na samym dole niebieski przycisk **Review + create** (Przegląd + tworzenie).
7. Poczekaj na zielony komunikat o poprawnej walidacji i kliknij **Create** (Utwórz).
8. **Cierpliwości!** Tworzenie konta Cosmos DB w chmurze trwa zwykle od 2 do 5 minut. W tym czasie Azure konfiguruje Twoje zasoby.

---

## 📁 Krok 2: Utworzenie Bazy Danych i Kontenera na Recenzje

Gdy wdrażanie dobiegnie końca, zobaczysz przycisk **Go to resource** (Przejdź do zasobu). Kliknij go. Teraz stworzymy bazę danych i tabelę (kontener) na nasze recenzje filmów.

1. W lewym menu nowo otwartego zasobu kliknij w zakładkę **Data Explorer** (Eksplorator danych).
2. Na górnym pasku narzędzi kliknij **New Container** (Nowy kontener).
3. Po prawej stronie wysunie się panel konfiguracyjny. Wypełnij go **dokładnie** w ten sposób:
   * **Database id:** Zaznacz opcję **Create new** i wpisz nazwę: `CinemaDB`
   * **Share throughput across containers:** ❌ **Odznacz to!** (Upewnij się, że ten checkbox jest **PUSTY**).
   * **Container id:** Wpisz nazwę tabeli: `Reviews`
   * **Partition key:** Wpisz **dokładnie**: `/movieId` (pamiętaj o ukośniku `/` na początku i wielkości liter!).
   * **Container throughput (RU/s):** Zaznacz **Manual** (Ręczny) i wpisz najmniejszą dopuszczalną wartość: `400`.
4. Kliknij niebieski przycisk **OK** na samym dole panelu.
5. Po kilku sekundach w Data Explorerze zobaczysz drzewo z bazą `CinemaDB` oraz kontenerem `Reviews`.

---

## 🔑 Krok 3: Połączenie bazy danych z kodem w Visual Studio

Teraz musimy powiedzieć Twojej aplikacji C#, gdzie znajduje się baza danych i jak ma się do niej zalogować.

1. W lewym menu swojego zasobu Cosmos DB w Azure przejdź do zakładki **Keys** (Klucze - pod sekcją *Settings*).
2. Zobaczysz tam klucze i adresy. Skopiuj dwie wartości (klikając ikonkę niebieskich kwadracików "Kopiuj" obok nich):
   * **URI** (np. `https://cinema-cosmos-twojeimie.documents.azure.com:443/`)
   * **PRIMARY KEY** (bardzo długi ciąg losowych znaków zakończony znakami `==`)
3. Otwórz projekt w Visual Studio / VS Code.
4. Otwórz plik [appsettings.json](file:///c:/Users/wikto/Desktop/CinemaBookingAppV3/appsettings.json).
5. Znajdź sekcję `"CosmosDb"` (ok. linii 33) i podmień wartości `Endpoint` oraz `Key` na Twoje skopiowane z Azure:

```json
"CosmosDb": {
    "Endpoint": "https://cinema-cosmos-twojeimie.documents.azure.com:443/",
    "Key": "TUTAJ_WKLEJ_TWOJ_SKOPIOWANY_DLUUUUGI_PRIMARY_KEY",
    "DatabaseName": "CinemaDB",
    "ContainerName": "Reviews"
}
```

6. Zrób dokładnie to samo w pliku `appsettings.Development.json` (jeśli go używasz lokalnie podczas testowania).
7. Zapisz pliki!

---

## 🧪 Krok 4: Testowanie – sprawdzenie działania "jak dla małpy"

Czas udowodnić wykładowcy (i sobie!), że wszystko działa idealnie.

1. Uruchom backend aplikacji w Visual Studio (kliknij zieloną strzałkę / przycisk Run).
2. Przeglądarka powinna automatycznie otworzyć stronę ze **Swaggerem** (zwykle pod adresem `http://localhost:5000/swagger` lub podobnym).
3. Na liście kontrolerów znajdź sekcję **Review** i kliknij w endpoint **POST `/api/Review`** (służący do dodawania opinii).
4. Kliknij przycisk **Try it out** (Wypróbuj) po prawej stronie.
5. Wklej do okienka Request Body ten przykładowy JSON:
   ```json
   {
     "movieId": "testowy-film-123",
     "userId": "student-test-999",
     "rating": 5,
     "comment": "Super film! Baza Cosmos DB dziala rewelacyjnie w chmurze Azure."
   }
   ```
6. Kliknij duży niebieski przycisk **Execute** (Wykonaj).
7. Sprawdź odpowiedź serwera:
   * Jeśli dostałeś kod statusu **201 Created** oraz serwer zwrócił Twój obiekt z wygenerowanym ID oraz datą utworzenia (`createdAt`) – **SUKCES!** 🥳
   * Jeśli dostałeś błąd 500, upewnij się, czy poprawnie wkleiłeś URI i Key w pliku konfiguracyjnym i czy nie ma tam zbędnych spacji.

---

## 🖥️ Krok 5: Prezentacja wyników w chmurze

Jak udowodnić, że recenzja faktycznie jest zapisana w Azure w chmurze NoSQL?

1. Wróć do przeglądarki z otwartym portalem Azure na stronie Twojego Cosmos DB.
2. Wejdź w **Data Explorer** z lewego menu.
3. Rozwiń folder **CinemaDB**, następnie rozwiń **Reviews** i kliknij w folder **Items** (Elementy).
4. Kliknij na liście wygenerowany dokument (zobaczysz klucz partycji `testowy-film-123`).
5. Po prawej stronie wyświetli się pełen dokument JSON Twojej recenzji.
6. **Zrób zrzut ekranu!** To jest Twój żelazny dowód na obronę projektu, że baza Cosmos DB działa w chmurze. 🚀
