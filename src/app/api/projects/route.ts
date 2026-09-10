import { db, projects, whiteBoardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { projectName, projectId } = await req.json();

    if (!projectId || !projectName) {
      return NextResponse.json(
        { error: "Project information missing" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await db
      .insert(projects)
      .values({
        projectId,
        projectName,
        userEmail,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!projectId && user) {
      const projectList = await db.select({
        id: projects.id,
        projectId: projects.projectId,
        projectName: projects.projectName,
        userEmail: projects.userEmail,
        createdAt: projects.createdAt,
        previewImage: whiteBoardData.previewImage,
        updatedAt: whiteBoardData.updateAt
      }).from(projects)
        .leftJoin(whiteBoardData, eq(projects.projectId, whiteBoardData.projectId))
        .where(eq(projects.userEmail, email ?? ""));
      return NextResponse.json(projectList)
    }


    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "No Project Id found"}
      )
    }
    const [userProject] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, email),
        ),
      );

    if (!userProject) {
      return NextResponse.json(
        { error: "Unauthorized user" },
        { status: 403 },
      );
    }

    const result = await db
      .select()
      .from(whiteBoardData)
      .where(eq(whiteBoardData.projectId, projectId));

    return NextResponse.json({
      ...(result[0] ?? {
        projectId,
        elements: [],
        appState: {},
        files: {},
      }),
      projectName: userProject.projectName,
    });
  } catch (error) {
    console.error("Failed to fetch whiteboard:", error);

    return NextResponse.json(
      { error: "Failed to fetch whiteboard data" },
      { status: 500 },
    );
  }
}

