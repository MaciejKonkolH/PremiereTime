import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const targetEmail = "konkol.maciej@gmail.com";
  
  const result = await prisma.user.deleteMany({
    where: {
      NOT: { email: targetEmail }
    }
  });
  
  console.log(`🧹 WYCZYCZONO BAZĘ! Usunięto ${result.count} użytkowników.`);
  console.log(`🛡️ Zostawiono konto: ${targetEmail}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
