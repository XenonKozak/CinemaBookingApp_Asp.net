# 🤖 Poradnik: Jak wyklikać usługę Azure AI Text Analytics

Ten poradnik pokazuje, jak założyć darmową usługę do analizy sentymentu w Azure (aby sztuczna inteligencja oceniała, czy recenzja jest pozytywna czy negatywna).

## Krok 1: Utworzenie zasobu AI w Azure
1. Zaloguj się do [Azure Portal](https://portal.azure.com/).
2. W pasku wyszukiwania na samej górze wpisz **Language** i kliknij w **Language** (pod kafelkiem Cognitive Services / AI Services).
3. Kliknij przycisk **+ Create** (Utwórz).
4. Na liście funkcji wybierz kafelek **Language** i kliknij **Continue to create your resource**.
5. Wypełnij formularz (zakładka Basics):
   - **Subscription:** Twoja subskrypcja studencka (Azure for Students).
   - **Resource group:** Wybierz tę samą grupę, co dla Cosmos DB (np. `CinemaApp-RG`).
   - **Region:** Wybierz najbliższy (np. `West Europe` lub `North Europe`).
   - **Name:** Wpisz unikalną nazwę (np. `cinema-ai-twojeimie`).
   - **Pricing tier:** Wybierz **Free (F0)** – daje 5000 darmowych zapytań miesięcznie!
6. Przewiń na sam dół i zaznacz kwadracik oświadczający przeczytanie warunków (Terms).
7. Kliknij **Review + create**, a po pomyślnej walidacji **Create**.

## Krok 2: Pobranie kluczy i wklejenie do kodu
1. Kiedy zasób zostanie utworzony, kliknij **Go to resource** (Przejdź do zasobu).
2. W menu po lewej stronie znajdź sekcję **Resource Management** i kliknij w **Keys and Endpoint** (Klucze i punkt końcowy).
3. Skopiuj wartość pola **KEY 1** (Klucz 1) i wklej do pliku `appsettings.json` oraz `appsettings.Development.json` w sekcji `AzureAI -> Key`.
4. Skopiuj wartość pola **Endpoint** (Punkt końcowy) (np. *https://cinema-ai.cognitiveservices.azure.com/*) i wklej w tych samych plikach jako `Endpoint`.

> [!IMPORTANT]
> **Aby poprawka zadziałała (i żeby zniknęło kółko ładowania na telefonie!), musisz koniecznie zrestartować projekt `.NET` (backend).** Po restarcie aplikacja wczyta nowe klucze i zacznie automatycznie oceniać recenzje za pomocą AI!
