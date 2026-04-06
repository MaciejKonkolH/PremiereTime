import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Zapewnia, że użytkownik Clerk istnieje w naszej lokalnej bazie Prisma.
 * Jeśli nie istnieje - tworzy go (Lazy Sync).
 */
export async function getSyncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Sprawdzamy czy mamy go po ID Clerka
  const existingById = await prisma.user.findUnique({ where: { id: userId } });
  if (existingById) return existingById;

  // 2. Pobieramy detale z Clerka
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  // 3. Jeśli nie było po ID, szukamy po E-MAILU (migracja ze starego systemu)
  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      // Znaleźliśmy starego użytkownika po mailu. 
      // Skoro zalogował się Clerkiem na ten sam mail, to "przejmujemy" rekord.
      // Usuwamy stary rekord i tworzymy nowy z tym samym mailem ale ID Clerka.
      // UWAGA: To wymaga przepięcia relacji lub (bezpieczniej) usunięcia starego konta 
      // jeśli nie ma tam krytycznych danych, ALBO po prostu dodania pola clerkId do bazy.
      
      // DECYZJA: Ponieważ Maki czyścił bazę, najbezpieczniej będzie po prostu:
      // Jeśli mail istnieje pod innym ID, usuwamy go (śmieć po starym systemie) i tworzymy na nowo.
      // Dziwne? Tak, ale przy PK na ID nie da się go zmienić bez migracji relacji.
      console.log(`Migrating user ${email} to Clerk ID ${userId}`);
      try {
         await prisma.user.delete({ where: { email } });
      } catch(e) {
         // Może być zablokowane przez klucze obce (pokoje/seriale)
         console.error("Migration failed due to relations, creating new record instead.");
      }
    }
  }

  return await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      image: clerkUser.imageUrl,
    },
    create: {
      id: userId,
      email: email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      image: clerkUser.imageUrl,
    }
  });
}
