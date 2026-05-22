# Przewodnik: Autoskalowanie Azure App Service (Web Role)

Ten dokument opisuje krok po kroku, jak skonfigurować autoskalowanie (Scale Out) dla usługi Azure App Service (hostującej aplikację CinemaBookingApp). Spełnia to wymaganie punktowe: **Autoscaling witryny / Skalowalna Web Role jako cloud service**.

> [!IMPORTANT]
> **Wymagania planu:** Autoskalowanie nie jest dostępne w darmowej warstwie (Free - F1) ani współdzielonej (Shared - D1). Aby z niego skorzystać w ramach licencji studenckiej, Twój plan App Service (App Service Plan) musi być ustawiony minimum na warstwę **Standard (S1)** lub **Premium**. Warstwa Basic (B1) oferuje tylko skalowanie ręczne (Manual Scale).
> Pamiętaj, aby po zakończeniu prezentacji projektu/obronie przeskalować plan z powrotem w dół, aby nie wyczerpać studenckiego budżetu 100$!

## Instrukcja konfiguracji Autoskalowania (Portal Azure)

1. **Zaloguj się do portalu Azure** (https://portal.azure.com).
2. Przejdź do swojego zasobu **App Service** (Aplikacja sieci Web), w którym hostowane jest API (np. `cinema-api-gdansk-2026`).
3. W lewym menu nawigacyjnym, w sekcji **Settings (Ustawienia)**, kliknij **Scale out (App Service plan)** *(Skalowanie w poziomie)*.
4. Na samej górze ekranu wybierz zakładkę **Rules Based** (oparte na regułach) lub kliknij **Custom autoscale** (Niestandardowe autoskalowanie).
5. Jeśli pojawi się monit o zmianę warstwy cenowej (ponieważ jesteś np. na F1 lub B1), kliknij "Upgrade" i wybierz plan **Standard S1**.
6. W oknie konfiguracji reguł ustaw następujące parametry:
   * **Scale mode:** Rule based (oparte na regułach)
   * **Instance limits:**
     * **Minimum:** 1 (aby aplikacja zawsze działała)
     * **Maximum:** 3 (bezpieczny limit dla licencji studenckiej, aby nie wygenerować potężnych kosztów)
     * **Default:** 1
7. Kliknij **+ Add a rule** (Dodaj regułę), aby skonfigurować warunek *dodania* instancji (Scale out):
   * **Metric source:** Current resource
   * **Metric name:** CPU Percentage (Procent użycia procesora)
   * **Operator:** Greater than (Większe niż)
   * **Metric threshold to trigger scale action:** 70 (skaluj, jeśli użycie CPU przekroczy 70%)
   * **Duration (in minutes):** 5
   * **Action:** Increase count by
   * **Instance count:** 1
   * *Kliknij Add.*
8. Kliknij ponownie **+ Add a rule**, aby skonfigurować warunek *usunięcia* instancji (Scale in) - to bardzo ważne dla oszczędności!:
   * **Metric name:** CPU Percentage
   * **Operator:** Less than (Mniejsze niż)
   * **Metric threshold to trigger scale action:** 30 (skaluj w dół, gdy CPU spadnie poniżej 30%)
   * **Duration (in minutes):** 5
   * **Action:** Decrease count by
   * **Instance count:** 1
   * *Kliknij Add.*
9. Kliknij przycisk **Save (Zapisz)** na górnym pasku.

## Weryfikacja dla wykładowcy

Aby udowodnić wykładowcy, że system działa:
1. Pokaż mu skonfigurowane reguły w zakładce **Scale out**.
2. Pokaż zakładkę **Run history (Historia uruchomień)** w tym samym oknie, która narysuje wykres, ile instancji działało w danym momencie.
3. (Opcjonalnie) Możesz wygenerować sztuczny ruch na swojej aplikacji za pomocą programu typu *JMeter* lub wysyłając bardzo dużo zapytań w pętli. Po kilku minutach powinieneś zobaczyć w historii, że Azure automatycznie dodał drugą wirtualną maszynę do obsługi ruchu.

## Ważne ostrzeżenie budżetowe (Azure for Students)
Gdy masz włączone 3 instancje w planie Standard S1, płacisz za 3 serwery jednocześnie. Zaraz po zaprezentowaniu działania systemu, **koniecznie zmień Scale Mode z powrotem na "Manual Scale" ustawione na 1 instancję**, lub całkowicie zmień plan App Service z powrotem na darmowy (F1), aby nie wyzerować swoich środków!
