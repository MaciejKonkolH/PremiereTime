import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Zapewnia, że użytkownik Clerk istnieje w naszej lokalnej bazie Prisma.
 * Jeśli nie istnieje - tworzy go (Lazy Sync).
 * Bezpieczna wersja bez usuwania rekordów.
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

  // 3. Bezpieczny Upsert
  try {
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
  } catch (error) {
    // W przypadku kolizji unikalnego adresu e-mail, zwracamy istniejący rekord
    if (email) {
      const collidingUser = await prisma.user.findUnique({ where: { email } });
      if (collidingUser) return collidingUser;
    }
    console.error("Błąd synchronizacji użytkownika:", error);
    return null;
  }
}
