# Premiere Time - Koncepcja i Specyfikacja Wymagań

## 🎯 Dotychczasowe Wymagania i Założenia

*   **Cel Główny:** Aplikacja internetowa służąca do śledzenia dat premier ulubionych seriali.
*   **Główna Funkcjonalność:** Wyświetlanie listy obserwowanych seriali posortowanych rosnąco według **daty premiery ostatniego odcinka najnowszego sezonu** (idealne pod binge-watching).
*   **Zarządzanie Listą:** 
    *   Wyszukiwanie tytułów seriali.
    *   Dodawanie ich do prywatnej listy obserwowanych.
    *   Po dodaniu, tytuły automatycznie lądują na liście nadchodzących premier.
*   **Źródło Danych:** Zewnętrzne, otwarte API z bazą filmów i seriali (np. The Movie Database - TMDB, TVMaze).

---

## ❓ Pytania Doprecyzowujące (Faza 1)

Wybierz odpowiedzi z poniższej listy, abyśmy mogli przejść do kolejnego, bardziej szczegółowego etapu planowania architektury i stacku technologicznego.

**1. Jaka ma być domyślna forma tej aplikacji?**
a) Głównie aplikacja mobilna (Smartfon) PWA – chcę tego używać leżąc na kanapie przed TV.
b) Klasyczna aplikacja webowa przeglądarkowa do odpalania na PC.
c) Rozszerzenie do przeglądarki, do którego mam szybki dostęp z paska zakładek.
d) Pełnoprawny, responsywny wariant: Mobile-First, ale pięknie wyglądający też na ekranach monitorów. <wybieram>

**2. Jak chcemy traktować produkcje, których sezon właśnie ruszył i odcinki wychodzą co tydzień?**
a) Zależy mi na powiadomieniu/focusie tylko na **finale** – ma pokazywać "Data finału to X" i odliczać czas. <wybieram>
b) Totalnie ignoruj taki serial w widoku głównym do dnia finału. Niech nie zaśmieca widoku "gotowych".
c) Pokaż status: "Wychodzi (odcinek 3/10) - estymowany finał: X".
d) Rozbijmy to na dwie zakałdki: "Oczekujące na Finał" oraz "Finał Gotowy do Obejrzenia".

**3. Dla kogo docelowo budujemy ten system pod kątem zarządzania kontem/stanem?**
a) Tylko dla Ciebie. 100% prywaty, dane (lista obserwowanych) mogą się trzymać w LocalStorage w przeglądarce i nie potrzebujemy bazy backendowej.
b) Tylko dla Ciebie, ALE używasz na wielu urządzeniach – potrzebujemy prostej bazy i jednego profilu.
c) Docelowo SaaS/Projekt otwartoźródłowy dla ludzi. Rejestracja, logowanie Google, profile użytkowników.
d) Chcę testować na sobie bez bazy, ale architekturę zróbmy taką, by łatwo dopiąć bazę SQL/NoSQL za miesiąc.
e) Dla mnie plus kilku moich znajomych. Każdy ma swoje konto i listę obserwowanych seriali. <wybieram>

**4. Jakie masz preferencje co do otwartego API z danymi o serialach?**
a) TVMaze – jest rewelacyjne pod kątem seriali TV, odcinków, dobre otwarte endpointy.
b) TMDB (The Movie Database) – rozbudowane, gigantyczne community (potrzebny będzie tylko darmowy klucz API). <wybieram>
c) Trakt.tv – popularne wśród trackerów epizodów, bardziej społecznościowe.
d) Zdajesz się całkowicie na moją decyzję deweloperską.

---

## ❓ Pytania Doprecyzowujące (Faza 2: Odkrywanie Funkcjonalności i Use Cases)

Masz 100% racji, wybiegłem przed szereg w stronę "jak zrobimy" zamiast "co ma się stać". Skupmy się dzisiaj na Twoim "User Experience" i twardym procesie biznesowym – wchodzimy w tryb analityka! Zostaw znaczniki `<wybieram>`.

**5. Cykl życia. Gdy doczekasz się premiery finału i nareszcie wchłoniesz sezon (binge-watching), co robisz z tym tytułem w systemie?**
a) Wciskam "Binge Zakończony / Archiwizuj". Serial opuszcza główną oś czasu i ląduje w "Archiwum". Do głównych nowości wraca jako alert w sekcji To-Do dopiero z dniem ogłoszenia daty ewentualnego, całkowicie nowego sezonu. <wybieram>
b) Tradycyjne "Usuń". Kasuję go z mojej listy zupełnie. Kiedy internet zapowie za X lat kolejny sezon, najzwyczajniej od nowa znajdę go w wyszukiwarce.
c) W ogłoszeniach aplikacji nie ma ostatecznego kasowania - tytuły potulnie lądują na samym końcu listy/dołku kolekcji ze znacznikiem "Obejrzane". Kolekcja puchnie budując Twoją bibliotekę lat ubiegłych.

**6. Znajomi - Use Cases. Mówiłeś o koncie dla paczki znajomych, z osobnymi listami dla każdego - jaki to model udostępniania?**
a) Zero udostępniania (Pełna Prywatność): Siedzicie na jednej bazie, ale każdy widzi tylko absolutnie swój dashboard.
b) Tablica Odkrywania/Inspiracji (Odczyt obcych): Każdy zaproszony ma widok swojej strefy domowej, ale może z menu "Koledzy z pokoju" odwiedzić ich profil by zobaczyć co akurat umieścili na celowniku (fajne by złapać inspiracje). <wybieram>
c) Oś Aktywności: Oprócz publicznych tablic masz "Z Tablicy", co robi za feed z rzucaniem eventami typu: "Adaś właśnie dodał The Witcher na stół". Opcja bardzo dla spiętego community.

**7. Stare produkcje ("Klasyczne"). Co na poziomie logiki ma zrobić aplikacja, kiedy przy zakładaniu listy dodajesz przez wyszukiwarkę słynny stary serial z zamkniętą lata temu historią (np. The Wire / Breaking Bad)?**
a) Wymuszać to, co ma tytuł. Ostrzega i odrzuca (tylko tracker nowości!).
b) Przejmuje do zestawu i po prostu z automatu kładzie na półkę "Gotowe do obejrzenia tu i teraz". Robisz w apce tymczasową logikę do odhaczania na żywo kultowej retro rozrywki z paczką po jednym lecie.
c) Rozbiera to na dwa strumienie: nowości biegną na liście do góry ekranu, a starożytności siedzą w drugiej odseparowanej części ekranu dla "długofalowego wciągania".
d) Jeżeli dodamy tutuł który jest stary i nie ma podanej daty premiery nowego sezon to nie wyświetla się na liście nadchodzących premier tylko na liście archiwalnych tytułów.

**8. Układ Główny, UX Złoty Standard. Otwierasz aplikację o 22:30 na tablecie, jak to tam wygląda w widoku startowym?**
a) **Klasycznie i Dużo Info (Kafelki jak platformy VOD):** Potężne kafelki jeden pod drugim, chronologicznie od najbliższego finału do najdalszego.  <wybieram>
b) **Optyczna Oś Czasu (Timeline):** Przewijasz pionowo ścieżkę chronologiczną (wertykalna kreska pośrodku) wysadzaną co kawałek gałązką prosto w okładkę serialu doczepioną do poszczególnych dni w kalendarzu.
c) **Widok Kanban (Tablica Statusów):** Kolumnowy standard zarządzania: "Tu i Teraz!" (Kolumna A) | "Nadzieje do końca roku" (Kolumna B) | "Czekają na lepsze jutro i daty" (Kolumna C). Najszybszy skaner sytuacji.

---

## ❓ Pytania Doprecyzowujące (Faza 3: Listy Kolaboracyjne / Współdzielone)

Wprowadzasz nową, potężną figurę angażującą użytkowników! Zwykła, prywatna lista służy jednostce. Pojawia się teraz twór zwany "Listą Publiczną/Grupy", do której nadajesz uprawnienia (zaproszenia) dla kumpli. Musimy uszczegółowić, jak to prawnie wygląda pod maską - zostaw znacznik `<wybieram>`.

**9. Uprawnienia na liście współdzielonej. Co konkretnie może zrobić "Zaproszony Znajomy" po kliknięciu udostępnionej tablicy?**
a) Własność Demokracji (Full Admin): Każdy na tej liście może swobodnie dodawać nowe seriale oraz usuwać te, które dodali inni (w tym sam twórca - całkowite równe uprawnienia w zespole). <wybieram>
b) Bezpieczny standard: Zaproszony kumpel ma wolną rękę na dodawanie swoich propozycji do strumienia, ale tylko twardy właściciel tej publicznej listy posiada przyciski wyrzucania serialu (np. by uniknąć przypadkowego sprzątania). 
c) Kwarantanna: Znajomy dodaje nowy serial do współdzielonej tablicy, ale musi on najpierw wisieć "na szaro" u właściciela w celu zatwierdzenia przez niego, że produkcja faktycznie nadaje się dla grupy.

**10. Kasowanie "z grupy" (Rozwój Pyt. 5). Kto zarządza pchnięciem wielkiego grupowego serialu do grupowego archiwum, gdy wyjdzie wreszcie finał i wszyscy usiądą na kanapach?**
a) Ostrze kompromisu: Każdy członek zespołu ma guzik z Archiwum. Skoro ktokolwiek obejrzy pierwszy i "klepnie", serial ląduje w archiwum na tej liście by nie zaśmiecać widoku wszystkim innym. Opcja ryzykowna ale szybka. <wybieram>
b) Niezależny Tracking: Tytuł znajduje się w otwartych wielkich finałach na stronie grupowej tak długo, aż każdy z członków przypisanych fizycznie do niej u siebie nie zaliczy przycisku "Obejrzałem". Gaśnie, gdy cała tablica się opamięta.
c) Tablica to wyłącznie Tablica Ogłoszeń! Wspólna tablica jest obdarta w ogóle z trackingów. Narzuca po prostu bazę tytułów. Żeby śledzić faktycznie kiedy serial finiszuje - musisz kliknąc Plusik "DODAJ SOBIE" i przerzucić go na swój widok prywatny. Znika obciążenie "Kto komu skasował progres grupy".

**11. Socjalna wibracja - Powiadomienia w grupach. Gdzie łapać informacje o wrzutkach innych członków układanki na wspólną kupkę?**
a) Pasywny standard UI: Mała kropka informacyjna na głównym kokpicie, jeśli na Wspólnej Tablicy zaszła modyfikacja (np. nowy tytuł dojrzał z rąk Piotra). Cicho, klasowo, nowocześnie.
b) Centrum Powiadomień z Ikonką: Aplikacja ma ukrytą klasyczną zakładkę obok Profilu z logiem "Dzwonka". Gromadzą się tam w feedzie powiadomienia "Adam dorzucił *The Office* pod wieczorne sesje". <wybieram>
c) Wyskocz i hałasuj: Web-Push dla przypisanych znajomych na telefonie stawiający ekipę na nogi: "Maciek właśnie wywołał tryb Binge! Na grupie ląduje *Breaking Bad*!". Świetne do rozpalania WhatsAppa/Discorda.

---

## ❓ Pytania Doprecyzowujące (Faza 4: Dobór Technologii)

Mamy cel i model logiczny gotowy. Rozumiemy funkcjonalność w 100%. Nadeszła chwila na dobór "silników". Oznacz swojego faworyta znacznikiem `<wybieram>`.

**12. Back-end i Baza Danych: Zdecydowaliśmy się na system kont (OAuth2 Google/FB), co oznacza architekturę serwerową. Jaki kierunek obierasz?**
a) **Supabase / Firebase (Backend-as-a-Service):** Dostajemy "za darmo" potężną, hostowaną instancję PostgreSQL z pełnym pakietem podięcia kont społecznościowych za pomocą gotowych modułów Auth. Skraca to nam robotę z wielotygodniowej męczarni od zera do kilku wieczorów – idealne pod projekty dla znajomych i proste webowe zaplecza danych. <wybieram>
b) **Trudna droga - własna maszyna VPS (Czysty Ręczny Kod):** Pełnowymiarowy, rzeźbiony kontener (np. FastAPI / Python) oraz postawiona ręcznie baza (PostgreSQL w oddzielnym Dockerze), gdzie moduły weryfikacji i tokenów JWT musimy napisać i zabezpieczyć od zera własnym nakładami czasu.
c) **VPS "Golden Way" (Gotowiec NextAuth):** Skoro niżej leży środowisko Next.js, a na górze posiadasz własny serwer - stawiamy całą aplikację w 100% u Ciebie pod klucz (baza kont i seriali żyje stricte na Twoim dysku VPS pod chmurą AWS/GCP). Jednak sam proces autoryzacji rozwiązujemy gotową certyfikowaną nakładką systemową dedykowaną dla takich portali `auth.js` omijając tkanie cudów od zera. 100% niezależności, minuty wdrożenia profilów.

**13. Stos Frontendowy: Co powoła do życia tak zaawansowany i responsywny interfejs użytkownika?**
a) **Meta-Framework (React z Next.js lub Vue.js z Nuxtem):** Pociąga za sobą świat instalatora NPM, ale na powrót błyskawicznie radzi sobie z renderowaniem list, komponentami społecznościowymi i wsparciem bezpośrednim do Supabase jednym małym pluginem. (Opcja najpowszechniejsza na 2026 i dedykowana pod nowoczesne Web Apps). <wybieram>
b) **Tradycyjne i ultra-lekkie JS (Vanilla JS + Vite + Custom CSS):** Opcja surowa, rzemieślnicza w myśl dyrektywy Enkiego. Zero magii, 100% panowania nad każdym plikiem CSS. Mniejszy bałagan z dependenccy, ale mozolne tkanie logiki do listowania i stanów logowania Oauth z palca.

**14. Cykl odpytań i Synchronizacja TMDB: Posiadając już silnik danych (12), jak będziemy w locie odświeżać zmianę premiery po ogłoszeniach z USA?**
a) **Smart Frontend (Klient pyta):** Serwer zapisuje tylko nasze powiązania serial-usert. Kiedykolwiek włączasz appkę (lub przewijasz jej timeline), skrypt front-endowy po otwarciu idzie "za nas" pytać do chmurowego API TMDB i podaje odpowiedź "Dziś jest ta data, obejrzyj w HBO" w Twojej przeglądarce. Pozwala to na niezagracanie serwera potężną wiedzą z Hollywood, ograniczając tabele.
b) **Mechanika Serwera (Worker/CronJob):** Aplikacja kliencka żąda wyników tylko z naszego własnego serwera. To z kolei nasz Back-end (np. o 3 w nocy) uruchamia potężny pług po API z TMDB wyszukując zmian we wszystkich zapamiętanych u nas produkcjach od znajomych aktualizując stan w naszej bazie. Odpowiedzialność przerzucona za plecy. Wspomaga darmowe limity do TMDB. <wybieram>
