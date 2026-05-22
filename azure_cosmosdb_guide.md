# Przewodnik: Dodanie darmowej bazy Azure Cosmos DB

Ten prosty poradnik krok po kroku pomoże Ci wyklikać darmową (Free Tier) bazę danych Cosmos DB do przechowywania recenzji i zintegrować ją z aplikacją. Dzięki temu zgarniesz punkt za Cosmos DB.

> [!IMPORTANT]
> Masz licencję studencką 100$. Zwykły Cosmos DB może pożreć sporo kasy, ale ma **Free Tier** (1 darmowe konto na subskrypcję). Postępuj DOKŁADNIE według poniższej instrukcji, aby upewnić się, że nie zapłacisz ani grosza.

## Krok 1: Tworzenie konta Cosmos DB w portalu Azure

1. Zaloguj się na [portal.azure.com](https://portal.azure.com/).
2. W górnym pasku wyszukiwania wpisz **Azure Cosmos DB** i kliknij w wynik.
3. Kliknij przycisk **+ Create (Utwórz)**.
4. Zobaczysz kilka opcji API. Przy kafelku **Azure Cosmos DB for NoSQL** kliknij **Create**.
5. Wypełnij formularz następująco:
   * **Subscription:** (Twoja subskrypcja studencka)
   * **Resource Group:** (Wybierz tę samą grupę, w której masz App Service i resztę projektu, np. `rg-cinema-gdansk`)
   * **Account Name:** Wpisz unikalną nazwę, np. `cinema-cosmosdb-TwojeImie`
   * **Location:** (Najlepiej `West Europe` lub `North Europe`)
   * **Capacity mode:** Wybierz **Provisioned throughput**.
   * **Apply Free Tier Discount:** ZAZNACZ NA **"Apply" (Zastosuj)**. To najwazniejszy punkt! Pojawi się informacja, że dostaniesz pierwsze 1000 RU/s oraz 25GB miejsca za darmo na zawsze.
   * Resztę opcji (Global Distribution, Networking, itp.) zostaw domyślnie, na najtańszych ustawieniach (bez redunancji).
6. Kliknij na samym dole **Review + create**, a po weryfikacji kliknij **Create**. Wdrażanie potrwa kilka minut.

## Krok 2: Utworzenie bazy danych i kontenera

1. Gdy zasób się utworzy, przejdź do niego (kliknij **Go to resource**).
2. W lewym menu wybierz **Data Explorer**.
3. Kliknij na górze **New Container** (Nowy kontener).
4. Wypełnij panel po prawej stronie następująco:
   * **Database id:** Zaznacz "Create new" i wpisz `CinemaDB`
   * **Container id:** Wpisz `Reviews`
   * **Partition key:** Wpisz `/movieId`
   * **Container throughput (RU/s):** Ustaw na "Manual" i wpisz `400` (to się mieści w darmowym progu).
5. Kliknij **OK** u dołu ekranu. Baza i kontener zostały utworzone.

## Krok 3: Połączenie bazy z kodem

1. Przejdź z powrotem do swojego konta Cosmos DB w portalu Azure (wyjdź z Data Explorera).
2. W lewym menu wybierz **Keys (Klucze)**.
3. Kopiuj dwie wartości (klikając ikonkę kopiowania obok nich):
   * **URI** (np. `https://cinema-cosmos...`)
   * **PRIMARY KEY** (długi ciąg znaków)
4. Wejdź w kodzie swojej aplikacji do plików `appsettings.json` oraz `appsettings.Development.json`.
5. Znajdź sekcję `"CosmosDb"` i wklej skopiowane dane:

```json
"CosmosDb": {
    "Endpoint": "https://<SKOPIOWANE_URI>.documents.azure.com:443/",
    "Key": "<SKOPIOWANY_KLUCZ_PRIMARY_KEY>",
    "DatabaseName": "CinemaDB",
    "ContainerName": "Reviews"
}
```

Gotowe! Twoja aplikacja zapisuje teraz recenzje w chmurze NoSQL.

## Krok 4: Weryfikacja dla wykładowcy

1. Odpal aplikację lokalnie (lub na chmurze po wdrożeniu) z podpiętymi kluczami.
2. Wejdź w Swaggera.
3. Znajdź endpoint `POST /api/Review`
4. Wyślij JSON:
```json
{
  "movieId": "matrix1",
  "userId": "user123",
  "rating": 5,
  "comment": "Super film polecam."
}
```
5. Przejdź do portalu Azure -> Twoje konto Cosmos DB -> Data Explorer -> Rozwiń `CinemaDB` -> Rozwiń `Reviews` -> Kliknij **Items**. Pokaż wykładowcy, że utworzył się tam nowy dokument z Twoim komentarzem JSON!
