# PLAN KONTYNUACJI: IMPLEMENTACJA AUTH (EMAIL + HASŁO)

## 📌 AKTUALNY STAN
1. **Prisma**: Do modelu `User` w `schema.prisma` dodano pole `password` (String?).
2. **Biblioteki**: Do `package.json` dodano `bcryptjs` oraz `@types/bcryptjs`.
3. **Problem**: Ostatnia próba `npx prisma generate` zakończyła się błędem `EPERM` (blokada pliku przez system Windows). Prawdopodobnie serwer deweloperski jest odpalony i blokuje dostęp do bazy.

## 🚀 ZADANIA DO WYKONANIA (W KOLEJNOŚCI)

### 1. Synchronizacja Bazy Danych
Zatrzymaj serwer dev i wymuś aktualizację bazy:
- `npx prisma generate`
- `npx prisma db push`

### 2. Backend - Logika Autentykacji (`web/src/lib/auth.ts`)
- Dodać pełną obsługę `CredentialsProvider`.
- W metodzie `authorize` zaimplementować:
  - Wyszukiwanie użytkownika po e-mailu.
  - Weryfikację hasła za pomocą `bcrypt.compare`.

### 3. Backend - Rejestracja (`web/src/app/api/register/route.ts`)
- Stworzyć endpoint POST.
- Pobierać: `name`, `email`, `password`.
- Haszować hasło: `bcrypt.hash(password, 10)`.
- Zapisywać nowego użytkownika do bazy przez Prismę.

### 4. Frontend - Interfejs Logowania (`web/src/app/login/page.tsx`)
- Dodać pola typu `input` dla Email i Password.
- Dodać stan `isRegistering` (boolean), który przełącza widok między Logowaniem a Rejestracją.
- Podpiąć `signIn("credentials", { email, password, callbackUrl: "/" })`.

## ⚠️ UWAGI
Zrezygnowaliśmy z Facebooka z powodu blokady konta (Ad Ban). Skupiamy się na uniezależnieniu od zewnętrznych dostawców.
