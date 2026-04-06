import { NextResponse } from "next/server";
import { getSyncUser } from "@/lib/clerk-sync";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const notifs = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { created_at: 'desc' },
    take: 10
  });
  return NextResponse.json(notifs);
}

export async function PATCH(req: Request) {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  await prisma.notification.updateMany({
    where: { userId: user.id, is_read: false },
    data: { is_read: true }
  });
  return NextResponse.json({ success: true });
}
