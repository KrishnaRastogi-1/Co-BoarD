import { db, whiteBoardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {

        const { projectId, elements, files, appState} = await req.json();
    
        const user = await currentUser();
    
        if (!user) {
            return NextResponse.json({
                message: "Unauthorized User",
                status: 401
            })
        }
    
        if (projectId) {
            const result = await db.insert(whiteBoardData).values({
                projectId: projectId,
                elements: elements,
                appState: appState,
                files: files
            }).onConflictDoUpdate({
                target: [whiteBoardData.projectId],
                set: {
                    elements: elements,
                    appState: appState,
                    files: files,
                    updateAt: new Date()
                }
            })
            return NextResponse.json(result)
        } else {
            return NextResponse.json({
                message: "Project Information Missing",
                status: 400
            })
        }
    } catch (error) {
        console.error("DB save error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
    }
}