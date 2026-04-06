const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const targetEmail = "konkol.maciej@gmail.com";
  
  try {
    const usersToDelete = await prisma.user.findMany({
      where: { NOT: { email: targetEmail } },
      select: { id: true }
    });
    
    const ids = usersToDelete.map(u => u.id);
    console.log(`🔍 Znaleziono ${ids.length} kont do usunięcia.`);

    if (ids.length > 0) {
      // 1. Czyścimy powiązania bez kaskady
      await prisma.workspaceSeries.deleteMany({ where: { addedBy: { in: ids } } });
      await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
      await prisma.userSeries.deleteMany({ where: { userId: { in: ids } } });
      await prisma.workspaceMember.deleteMany({ where: { userId: { in: ids } } });
      
      // 2. Czyścimy konta, sesje i same profile
      await prisma.account.deleteMany({ where: { userId: { in: ids } } });
      await prisma.session.deleteMany({ where: { userId: { in: ids } } });
      
      const res = await prisma.user.deleteMany({
        where: { id: { in: ids } }
      });
      
      console.log(`🧹 WYCZYCZONO BAZĘ! Usunięto ${res.count} użytkowników.`);
    } else {
      console.log("ℹ️ Brak kont do usunięcia (tylko baza makiety).");
    }
    
    console.log(`🛡️ Zostawiono konto: ${targetEmail}`);
  } catch (e) {
    console.error("💥 Błąd podczas czystki:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
