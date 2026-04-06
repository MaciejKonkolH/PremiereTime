# Premiere Time - Specyfikacja Akcji Użytkownika (Use Cases)

Dokument ten jest twardym, analitycznym zbiorem wszystkich funkcjonalności, które aplikacja musi oferować, by spełnić nasze założenia biznesowe z koncepcji. Jest to nasza **"Piramida Wymagań"** pod budowę odpowiednich modułów w kodzie.

## 1. Moduł: Rejestracja i Autoryzacja
Aplikacja ma być zamkniętym domem dla Ciebie i zaprzyjaźnionej ekipy VIP. 
*   **1.1. Utworzenie konta (Rejestracja Oauth2):** Głównym i priorytetowym kanałem tworzenia profilu jest jedno kliknięcie przy użyciu **Google lub Facebooka**. Architektura logowania ma w pełni opierać się na gotowym rozwiązaniu (np. usługach dostarczających pełen proces logowania out-of-the-box). Tradycyjna rejestracja adresem e-mail to tylko poboczna alternatywa.
*   **1.2. Logowanie i Wylogowanie (Social Login):** Bezszwowe wchodzenie do aplikacji na obcych urządzeniach dzięki sesjom z Google/Facebook. Opcja twardego wylogowania i ucięcia zgody.
*   **1.3. Resetowanie hasła:** Standardowy proces odzyskiwania dostępu via e-mail.

## 2. Moduł: Przeszukiwanie i Dodawanie (Zewnętrzne TMDB API)
*   **2.1. Wyszukiwanie Zewnętrzne:** Pole tekstowe (Lupa) pozwalające wyszukać serial z gigantycznej, darmowej bazy theMovieDatabase. 
*   **2.2. Dodawanie Zwykłe (Trwające emisje):** Użytkownik widzi pożądany, istniejący serial w wynikach wyszukiwania i przyciskiem "Dodaj" dorzuca go do swojej prywatnej listy obserwowanych.
*   **2.3. Autokategoryzacja wg Dat (Zakończone / Klasyki):** Jeśli serial dodawany w pkt 2.1 okaże się historycznym (nie posiada dat przyszłych sezonów), system z automatu wrzuca go do zakłady "Archiwum / Zakończone", by nie zaśmiecać widoku nadchodzących premier.
*   **2.4. Routing na Tablice:** Przy kliknięciu "Dodaj", użytkownik może zdecydować, czy serial leci na listę prywatną, czy na wspólną z kumplami.

## 3. Moduł: Pulpit Główny i Obsługa Prywatna (Binge Dashboard)
To miejsce to serce aplikacji. Klasyczne kafelki o dużym zagęszczeniu detali.
*   **3.1. Widok Estymacji Finału:** System dla aktywnych seriali wylicza datę "Premiery Finałowego Odcinka". Jeżeli sezon wypluwa odcinki co tydzień, UI ignoruje to, pompując zegar tylko w kierunku odcinka oznaczającego "koniec sezonu".
*   **3.2. Sortowanie Chronologiczne:** Głośne i wyraźne kafelki posortowane malejąco w myśl zasady "Finał, który będzie najszybciej, znajduje się na samej górze".
*   **3.3. Zakończenie Seansu ("Binge Wykonany - Archiwizuj"):** Przycisk na aktywnym serialu rzucający go na stałe do osobnej historycznej zakładki "Archiwum / Obejrzane".
*   **3.4. Automatyczny Powrót (Zmartwychwstanie z Archiwum):** Uśpiony system musi weryfikować "Zarchiwizowane tytuły". Jeśli po 2 latach TMDB powiadomi o powstaniu kolejnego sezonu w przyszłości, serial zostaje wyciągnięty z Archiwum na główną Tablicę Oczekujących alertem "Nowy Sezon w Tle!".
*   **3.5. Inteligentny Wskaźnik VOD (Gdzie Oglądamy):** Wzbogacenie kafelka informacją wyciągniętą prosto z TMDB (w oparciu o providerów per kraj w JustWatch) – ładna ikona w interfejsie kierujaca wzrok od razu po informacji czy serial wjeżdża z finałem na *Netflix*, *HBO* czy *Amazon* oszczędzająca użytkownikowi zgadywanek.

## 4. Moduł: Tablice Kolaboracyjne i Znajomi (Shared Workspaces)
Esencja gry zespołowej - grupowy binge-watching.
*   **4.1. Tworzenie Listy Publicznej/Grupowej:** Nazwanie nowej listy (np. "Piątkowe Seansy u Maćka") i wygenerowanie prośby/zaproszenia dla znajomych na koncie.
*   **4.2. Totalna Demokracja (Uprawnienia):** Każdy podpięty użytkownik ma identyczne uprawnienia – może przynieść nowy serial (Dodać) oraz usunąć pozycję wrzuconą przez kogoś innego (Full Admin-Share).
*   **4.3. Odhaczanie Zespołowe (Zasada 1=Wszyscy):** Gdy ktokolwiek ze zrzeszonych uderzy w przycisk "Binge Wykonany", serial zostaje zarchiwizowany na tej wspólnej grupie dla *każdego podpiętego członka* – usuwając go im z oczu. Ostrze kompromisu w czystej postaci.
*   **4.4. Tablice Podglądaczy (Snoop-Mode):** Możliwość wejścia z poziomu znajomych w bezpośredni PROFIL Pytry / Ali / Jana, by zajrzeć na jego całkowicie *prywatną* ścianę, bez opcji edycji, jako galeria poleceń.

## 5. Moduł: Powiadomienia (Notification Hub)
*   **5.1. Spisywanie Akcji:** Aplikacja gromadzi eventy. Kiedy ktoś coś wrzuca na listę współdzieloną, system notuje zdarzenie (Baza Danych - Tabela Notifications).
*   **5.2. Panel Dzwonków:** Górny przycisk "Dzwoneczka" pulsujący w momencie niezobaczonego eventu.
*   **5.3. Interakcja z Eventem:** Po kliknięciu dzwonka, system podaje Feed: "Marek dorzucił nową bekę - The Office - do grupy Piątkowe Seansy. Sprawdź to.". Kliknięcie przenosi nas od razu do danego widoku grupy.
