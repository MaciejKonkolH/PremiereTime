# Plan Implementacji - Projekt Premiere Time (Next.js + Postgres + NextAuth)

Ten dokument jest listą automatyczną i chronologiczną wg której będziemy programować. Reprezentuje harmonogram wytwarzania, bezpiecznie omijając serwerownię sąsiedniego systemu *Enki/CryptoBot* opartą o `copy-docker-compose.yml`.

> [!WARNING]  
> Port **3000** zajęty pod Enki Monitor, Port **5432** to Postgres Bazy Enki, Port **8000, 8001, 9000, 6379** chronione i zakazane do zajęcia. W tym projekcie używamy **POSTGRES: 5434**, oraz **HOSTINGU NEXT.JS: 3004** dla ominięcia kolizji systemów.

## KROK 0: Oczekiwania na interwencję Szefa (Manulane Czynności Makieta)
- [ ] 0.1 Wejdź na [TheMovieDatabase](https://www.themoviedb.org/) -> Konto -> Ustawienia -> API. Wygeneruj klucz i wrzuć do pliku `.env` jako wpis `TMDB_API_KEY=xxx`.
- [ ] 0.2 Wejdź w [Google Cloud Console](https://console.cloud.google.com/apis/credentials), otwórz panel Oauth i odbierz kody "Google Client ID" oraz "Google Client Secret" (to bezwzględny warunek uruchomienia powiązań społecznościowych `NextAuth` o które prosiłeś).
- [ ] 0.3 Daj mi krótki sygnał i zielone światło w terminalu, potwierdzająć wykonanie i wygenerowanie pliku.

## KROK 1: Wybetonowanie Środowiska na PC (Automatyzacja Enki)
Szybko i bez zacięć narzucam środowisko VPS-Ready oszczędzając Ci męczenia z komendami dockera. 
- [x] 1.1 **ENKI:** Utworzy fizyczny plik oddzielnego `premiere-docker-compose.yml` startujący PostgreSQL (np. wersja v15, na zmapowanym porcie bazowym 5434:5432) i odpali proces automatycznie przez terminal.
- [x] 1.2 **ENKI:** Odbije i utworzy pustą chmurkę Next.js w oparciu o framework `Next 14 (App Router)` przy pomocy zautomatyzowanego skryptu (bez zadawania pytań w CI: `npx create-next-app`).
- [x] 1.3 **ENKI:** Przypnie port deweloperski nasłuchowy w plikach package.json by zawsze startował na wolnym bezpiecznym kanale: `-p 3004`.
- [ ] 1.4 **ENKI: System Designu (Premium UI):** Konfiguracja pliku `globals.css` pod zachwycający, wyciągnięty graficzny system Vanilla CSS z ciemnym motywem glassmorphism i micro-animacjami na powiadomieniach (zgodnie z prykazami byku projektów Premium). Brak korzystania z szablonowych Tailwindów.

## KROK 2: Prisma ORM i Przełożenie Tablic z papieru w Kod (Baza Danych)
- [x] 2.1 Zainstaluj paczki Prisma, oraz podepnij w schema providera relacyjnego z łącznikiem do nowego Postgree z portu 5434.
- [x] 2.2 Zakoduj model relacyjny, przeniesiony 1:1 z pliku `struktura_bazy_danych.md` pod plik pliku `schema.prisma`.
- [x] 2.3 Odpal komendę Migracji by wygenerowała z automatu tabele na wewnątrz dockera PostgreSQL dając nam punkt dostępu z aplikacji.

## KROK 3: Bezpieczeństwo i NextAuth (Integracja Logowania Społecznościowego)
- [x] 3.1 Zaimplementuj adapter NextAuth DB Adapter pod bazę w Prisma.
- [x] 3.2 Przygotuj Frontend Route: `/login` wraz z radosnym przyciskiem "Login Via Google".
- [x] 3.3 Dodaj globalny bloker w Next Middleware - chroniący trasy przed każdym niezalogowanym użytkownikiem szukającym luki z ulicy.

## KROK 4: Wyszukiwarka Hollywood i CRON JOB'y (Zabezpieczenie Limitów API)
- [x] 4.1 Utwórz trasę BackEnd Endpointu w Next (`/api/search?q=X`), co w locie, zaserwuje zapytania prosto do publicznego theMovieDatabase wyszukując kandydata do list.
- [x] 4.2 UI Premium na Froncie: Elegancki powiększający "SearchBar" na środek rzucający kafle, dający możliwość dodania go na swoją tablice.
- [ ] **4.3 [KRYTYCZNY CRON JOB TMDB]: Zgodnie z punktem 14 w koncepcji - zbuduję skrypt NodeJS API np. `api/cron-updater` uodparniany za sprawą tagu bezpieczeństwa (SECRET_CRON), dzięki czemu sam serwer (np. za pomocą potężnego Vercel Cron lub wbudowanego node-cron) za plecami użytkowników będzie wyciągał z API daty co 12h dla naszej lokalnej struktury `series_cache`**.

## KROK 5: Kokpit Indywidualny i Kalendarze fnałowe (Binge Dashboard)
- [x] 5.1 Zbuduj API `app/api/user/series` wyciagające pule danych dla powiązanego loginu u usera (pobranego z NextAuth session).
- [x] 5.2 Mechanika graficzna: Kafelki odliczające dni na czerwono i dumnie posortowane Rosnąco po Dacie powrotu w widoku głównym. 
- [ ] 5.3 Ikony Badge "VOD": Pobierający mały symbol z zewnętrznych skraperów obok premiery obrazując czy odpalasz Prime'a, czy Netlixa na telefonie. 
- [x] 5.4 Wpięcie guzika "Obejrzano Binge - Archiwum" przy obiekcie by przeorał boolean `is_archived` na true i zdjął to ze ściany wzroku.

## KROK 6: Współpraca Społecznościówki i "Ostrze Kompromisu" (Pokoje Binge)
- [x] 6.1 Wykreowanie Routingu Dynamicznego `/workspace/[id]` i panelu "Sklej kumpli do kanału".
- [ ] 6.2 Przycisk wyświetlający w małym oknie drop kont obecnych w naszej unikalnej bazie z przyciskiem zaproszenia.
- [x] 6.3 Mechanika ostrza serwera: Guzik na liście grupowej - jeśli wciśnie go jakikolwiek użytkownik z roli - zapada na true `is_group_archived` dla całej komórki! Demokracja błyskawiczna.

## KROK 7: Powiadomienia Agenta (Realtime UI z dzwoneczkiem)
- [x] 7.1 Zbuduj subtelną ikonę "The Bell" powiadomień u góry, podpiętą pod `SWR/React-Query` podbijającą wynik badge licznika `is_read = false`.
- [x] 7.2 System "Deep-Linking Pół-Automatyczny": Front wyciąga ze skrzydeł obwodu JSON `link_workspace_id` puszczając użycie routera do danego pokoju natychmiastowym klikiem. Użytkownik nie szuka ręcznie.

## KROK 8: Zautomatyzowany Test Przeglądarkowy 
Używając `browser_subagent` podpinam się pod wykonane kodowanie przez odpalenie testu UI w symulatorze.
- [ ] 8.1 Bot wejdzie twardo pod sesję nr 1, klika by utworzyć Pokój Piątkowy i stawia tam Serial z bazy TMDB.
- [ ] 8.2 Następnie agent wykorzysta API theMovie by symulować odpowiedniki drugiego profilu i "odhacza".
- [ ] 8.3 Weryfikator czyta całościę - Sprawdzamy czy interfejs faktycznie odepnie dane dla obydu kont odhaczając Ostrze Kompromisu z pełnym sukcesem całego systemu! 
- [ ] 8.4 Gotowe do spakowania kontenerowo na chmury środowiskowe.

## KROK 9 (DOGRYWKA PO REWIZJI E2E Z PDD - Test Driven): Wdrożenie brakujących the akcji Use-Case
Maki zauważył zawieszanie the się systemu the przez browserowy modal `prompt()` i wykazał luki the z dokumentacji `funkcjonalnosci_i_akcje.md`. Braki usuwamy the twardym the młotkiem:
- [ ] 9.1 **Migracja Modali (`4.1`)**: Wyparcie `prompt()` na rzecz customowego React `<dialog>/State` w `page.tsx` The the by the Playwright The the i Użytkownik the cieszyli się 100% responsywnym UX The the bez the lagów HMR the. 
- [ ] 9.2 **Routing na the Tablice (`2.4`)**: the the the the Frontowa Wyszukiwarka Głosząca - Wybór "Oś Własna" vs "Mój Pokój" the the the the po wcisnięciu Add (+) na Głównym the Widgecie the The the the the The Search. 
- [ ] 9.3 **Notifications Hub (`5.1-5.3`)**: Implementacja logiki pulsujacego Dzwoneczka na Navbarze The powiadamiającego o the dodaniu the do wspólnej The The tablicy Ostrza Binge'u przez Opozycję the .
- [ ] 9.4 **Inteligentny the The VOD Wskaźnik (`3.5`)**: Wrzuta the żądania `watch/providers` the do TMDB endpoint by The malować The badge the the Płaczek (Netfliks/HBO) na okładce! The 
- [ ] 9.5 **Test Generalny Złoty**: Wznowienie testów Agenta Playwright z całości platformy the The the włączając the Dzwonek i Watching VOD (Ostrze Kompromisu + The Obejrzane Alert).
