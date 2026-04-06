import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSyncUser } from "@/lib/clerk-sync";

export async function POST(req: Request) {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, name, workspaceId, tmdb_id, title, poster_path, status } = body;

  try {
    if (action === "CREATE") {
      const workspace = await prisma.workspace.create({
        data: {
          workspace_name: name,
          ownerId: user.id,
          members: { create: { userId: user.id } }
        }
      });
      return NextResponse.json(workspace);
    }

    if (action === "ADD_MEMBER") {
      const { usernameOrEmail, userId_to_add, workspaceId } = body;
      
      let finalUserId = userId_to_add;
      if (!finalUserId && usernameOrEmail) {
        const foundUser = await prisma.user.findFirst({
           where: { OR: [ { name: usernameOrEmail }, { email: usernameOrEmail } ] }
        });
        if (foundUser) finalUserId = foundUser.id;
      }
      
      if (!finalUserId) {
         return NextResponse.json({ error: "User not found in local database. They must log in at least once." }, { status: 404 });
      }

      await prisma.workspaceMember.create({
        data: { workspaceId, userId: finalUserId }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "ADD_SERIES") {
      const { getFinaleAirDate } = require("@/lib/tmdb");
      const finaleDate = await getFinaleAirDate(tmdb_id);

      await prisma.seriesCache.upsert({
        where: { tmdb_id },
        update: { title, poster_path, status, next_ep_air_date: finaleDate !== null ? finaleDate : undefined },
        create: { tmdb_id, title, poster_path, status, next_ep_air_date: finaleDate !== null ? finaleDate : null }
      });

      await prisma.workspaceSeries.create({
        data: {
          workspaceId,
          tmdb_id,
          addedBy: user.id
        }
      });
      
      const wMembers = await prisma.workspaceMember.findMany({ where: { workspaceId }});
      const notifications = wMembers
        .filter(m => m.userId !== user.id)
        .map(m => ({
          userId: m.userId,
          message: `Ktoś z Twojej grupy zaproponował nowe wspólne odliczanie dla serialu: ${title}!`,
          link_workspace_id: workspaceId,
        }));
        
      if(notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }

      return NextResponse.json({ success: true });
    }
    
    if (action === "ARCHIVE_SERIES") {
      await prisma.workspaceSeries.update({
        where: { workspaceId_tmdb_id: { workspaceId, tmdb_id } },
        data: { is_group_archived: true }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "RESTORE_SERIES") {
      await prisma.workspaceSeries.update({
        where: { workspaceId_tmdb_id: { workspaceId, tmdb_id } },
        data: { is_group_archived: false }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "REMOVE_SERIES") {
      await prisma.workspaceSeries.deleteMany({
        where: { workspaceId, tmdb_id }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Action blocked or already applied" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  console.log("WORKSPACE GET triggered");
  const user = await getSyncUser().catch(e => {
    console.error("SYNC USER ERROR:", e);
    return null;
  });
  console.log("SYNC USER Result:", user?.id || "NULL");
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

    if (id) {
    const archived = searchParams.get("archived") === "true";
    const ws = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, image: true }} } },
        series: { 
          where: { is_group_archived: archived }, 
          include: { seriesCache: true, adder: { select: { name: true }} },
          orderBy: { seriesCache: { next_ep_air_date: { sort: 'asc', nulls: 'last' } } }
        }
      }
    });

    if (!ws) return NextResponse.json(null);
    
    // SECURITY BLOCK: Użytkownik musi należeć do tego pokoju
    const isMember = ws.members.some(m => m.userId === user.id);
    if (!isMember) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

    return NextResponse.json(ws);
  }

  const allWorkspaceOfUser = await prisma.workspace.findMany({
    where: { members: { some: { userId: user.id } } }
  });
  
  return NextResponse.json(allWorkspaceOfUser);
}

export async function DELETE(req: Request) {
  try {
    const user = await getSyncUser();
    if (!user?.id) return NextResponse.json({ error: "Brak zaufania." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Brak ID pokoju" }, { status: 400 });

    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if(!workspace) return NextResponse.json({ error: "Brak danych" }, { status: 404 });
    if(workspace.ownerId !== user.id) {
       return NextResponse.json({ error: "Tylko szef (owner) pokoju może go skasować." }, { status: 403 });
    }

    await prisma.workspaceMember.deleteMany({ where: { workspaceId: id } });
    await prisma.workspaceSeries.deleteMany({ where: { workspaceId: id } });
    await prisma.workspace.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch(error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
