import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "final_maki@test.com" }
  });
  console.log("USER:", JSON.stringify(user, null, 2));
  
  const token = await prisma.verificationToken.findFirst({
    where: { identifier: "final_maki@test.com" }
  });
  console.log("TOKEN:", JSON.stringify(token, null, 2));
}

main().finally(() => prisma.$disconnect());
