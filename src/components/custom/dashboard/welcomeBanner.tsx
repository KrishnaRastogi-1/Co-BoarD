"use client"

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs"
import { Plus, Sparkle } from "lucide-react";

export default function WelcomeBanner() {
    const { user } = useUser();
    return (
        <div>
            <div className="p-10 border rounded-xl bg-gradient-to-r from-yellow-100 to-blue-200">
                <h2 className="text-2xl font-bold">Welcome Back, {user?.fullName}</h2>
                <p>Bring Your Ideas to life on infinite canvas</p>
                <div className="mt-5 flex items-enter gap-2">
                    <Button size={"lg"}><Plus />Create New Board</Button>
                    <Button size={"lg"} variant={"outline"}><Sparkle /> AI Helper</Button>
                </div>
            </div>
        </div>
    )
}