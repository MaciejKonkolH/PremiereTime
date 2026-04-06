const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  const userIds = users.map(u => u.id);
  
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, workspace_name: true, ownerId: true }
  });

  const orphans = workspaces.filter(ws => !userIds.includes(ws.ownerId));

  console.log(JSON.stringify({
    totalUsers: userIds.length,
    totalWorkspaces: workspaces.length,
    orphanedWorkspaces: orphans
  }, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
