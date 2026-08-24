import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return new NextResponse("No email on user", { status: 400 });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email));

    if (userResult.length > 0) {
        return NextResponse.json(userResult[0]);
    } else {
        const newUser = await db.insert(users).values({
            name: user.fullName,
            email: email,
        }).returning();

        return NextResponse.json(newUser[0]);
    }

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}