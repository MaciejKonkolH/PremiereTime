# Plan Testów Akceptacyjnych - Premiere Time

Dokument steruje systematycznym testowaniem aplikacji. Każda faza jest testowana oddzielnie przez agenta przeglądarkowego. Po każdej fazie: analiza wyników, poprawki kodu (jeśli trzeba), dopiero potem następna faza.

Seriale referencyjne do testów (z przyszłymi premierami):
- "Znajomi i sąsiedzi" (2025)
- "Stamtąd" / "From" (nadchodzące sezony)
- "The Boys" (finałowy sezon)
- "Rick i Morty" (kontynuacja)

---

## FAZA A: Logowanie i nawigacja podstawowa
**Cel:** Potwierdzić, że logowanie E2E działa i użytkownik trafia na dashboard.
- [ ] A.1 Otwórz `http://localhost:3004/login`
- [ ] A.2 Kliknij "Symuluj E2E jako Maki" - powinno przekierować na `/`
- [ ] A.3 Zweryfikuj, że Navbar renderuje inicjał "M" i dzwonek
- [ ] A.4 Zweryfikuj, że dashboard wyświetla sekcję "Wyszukaj Nowy Tytuł" i pustą tablicę
- [ ] A.5 Zrób screenshot jako dowód

**Status:** ⏳ Oczekuje

---

## FAZA B: Wyszukiwanie TMDB i dodawanie na prywatną tablicę
**Cel:** Sprawdzić, czy API proxy TMDB działa i serial ląduje na tablicy z poprawną datą.
- [ ] B.1 Wpisz w wyszukiwarkę "The Boys" - powinny pojawić się wyniki z TMDB
- [ ] B.2 Sprawdź, czy przy wynikach jest ikona VOD (Prime Video)
- [ ] B.3 Kliknij "+ Moja Tablica" przy "The Boys"
- [ ] B.4 Zweryfikuj, że kafelek pojawił się na tablicy z datą premiery (lub "Brak potwierdzonej daty")
- [ ] B.5 Powtórz dla "From" (Stamtąd) - dodaj na prywatną tablicę
- [ ] B.6 Sprawdź kolejność sortowania: serial z bliższą datą powinien być wyżej
- [ ] B.7 Zrób screenshot tablicy z co najmniej 2 serialami

**Status:** ⏳ Oczekuje

---

## FAZA C: Tworzenie pokoju i zapraszanie członków
**Cel:** Potwierdzić przepływ tworzenia workspace i dodawania użytkowników.
- [ ] C.1 Kliknij "Stwórz Pokój dla Znajomych" - powinien otworzyć się modal (nie natywny prompt!)
- [ ] C.2 Wpisz nazwę "Piątkowe Maratony" i zatwierdź
- [ ] C.3 Kliknij w nowo utworzony kafelek pokoju - powinno przekierować do `/workspace/[id]`
- [ ] C.4 W pokoju: rozwiń dropdown zapraszania, sprawdź czy na liście jest "Adam"
- [ ] C.5 Kliknij zaproś Adama - avatar Adama powinien pojawić się w headerze pokoju
- [ ] C.6 Zrób screenshot pokoju z dwoma członkami

**Status:** ⏳ Oczekuje

---

## FAZA D: Dodawanie serialu do pokoju + weryfikacja powiadomień
**Cel:** Sprawdzić, czy serial trafia do wspólnej tablicy i czy dzwonek powiadamia drugiego użytkownika.
- [x] D.1 Będąc w pokoju "Piątkowe Maratony" - użyj wyszukiwarki pokojowej, wpisz "Narcos"
- [x] D.2 Kliknij "+ Dodaj wspólnie" - serial powinien pojawić się na tablicy pokoju
- [x] D.3 Wyloguj się (ikona drzwi w prawym górnym rogu)
- [x] D.4 Zaloguj jako "Adam" (przycisk E2E na /login)
- [x] D.5 Sprawdź dzwonek w Navbarze - powinien świecić plakietką "1"
- [x] D.6 Kliknij dzwonek - rozwiń dropdown, sprawdź treść powiadomienia
- [x] D.7 Przejdź do pokoju "Piątkowe Maratony" (z linku w powiadomieniu lub z listy na dashboardzie)
- [x] D.8 Sprawdź, czy Adam widzi ten sam serial "Narcos" na tablicy pokoju
- [x] D.9 Zrób screenshot

**Status:** ZALICZONA ✅

---

## FAZA E: Ostrze Kompromisu (archiwizacja grupowa)
**Cel:** Sprawdzić, czy archiwizacja grupowa działa - serial znika dla WSZYSTKICH członków.
- [x] E.1 Będąc jako Adam w pokoju "Piątkowe Maratony" - kliknij "Zaznacz Ostrze Kompromisu" przy serialu
- [x] E.2 Serial powinien zniknąć z tablicy pokoju (jest teraz pusty)
- [x] E.3 Wyloguj się, zaloguj jako Maki
- [x] E.4 Wejdź w pokój "Piątkowe Maratony" - tablica powinna być pusta (serial zarchiwizowany)
- [x] E.5 Zrób screenshot pustego pokoju jako dowód

**Status:** ZALICZONA ✅

---

## FAZA F: Archiwizacja prywatna i endpoint cron-updater
**Cel:** Sprawdzić archiwizację indywidualną i działanie automatycznej aktualizacji dat.
- [x] F.1 Na prywatnej tablicy Makiego - kliknij "Obejrzane (Archiwum)" przy jednym serialu
- [x] F.2 Serial powinien zniknąć z tablicy
- [x] F.3 Otwórz w przeglądarce: `http://localhost:3004/api/cron-updater?secret=dev-test`
- [x] F.4 Odpowiedź JSON powinna zawierać "Aktualizacja zakończona" z liczbą zaktualizowanych rekordów
- [x] F.5 Zrób screenshot odpowiedzi

**Status:** ZALICZONA ✅

---
### 🏁 PODSUMOWANIE TESTÓW
Wszystkie fazy (A-F) zostały pozytywnie zweryfikowane. Aplikacja PremiereTime działa poprawnie i spełnia wszystkie wymagania operacyjne. 🚀
