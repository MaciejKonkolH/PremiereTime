const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old users...");
  // Usuwamy wszystko co nie ma 'user_' w ID (czyli stare ID)
  // UWAGA: Trzeba usunąć relacje bo FK zablokują
  await prisma.notification.deleteMany({});
  await prisma.workspaceMember.deleteMany({});
  await prisma.workspaceSeries.deleteMany({});
  await prisma.workspace.deleteMany({});
  const deleted = await prisma.user.deleteMany({});
  console.log(`Deleted ${deleted.count} old users and their data.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
