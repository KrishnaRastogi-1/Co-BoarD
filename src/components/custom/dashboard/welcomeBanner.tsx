"use client"

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs"
import { Plus, Sparkle } from "lucide-react";
import CreateNewBoardDialog from "./createNewBoardDialog";
import Image from "next/image";

export default function WelcomeBanner() {
    const { user } = useUser();
    return (
        <div>
            <div className="p-10 border rounded-xl bg-gradient-to-r from-yellow-100 to-blue-200 flex justify-between">
                <div>
                    <div className="flex gap-1">
                    <h2 className="text-2xl font-bold">Welcome Back,</h2>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">{user?.fullName} 👋</h2>
                </div>
                <p>Bring Your Ideas to life on infinite canvas</p>
                <div className="mt-5 flex items-enter gap-2">
                    <CreateNewBoardDialog />
                    <Button size={"lg"} variant={"outline"}><Sparkle/> AI Helper</Button>
                </div>
                </div>
                <div className="">
                    <Image src={"/Banner.jpg"} alt="Banner Image" width={250} height={250} className="shadow-xl rounded-xl"/>
                </div>
            </div>
            
        </div>
    )
}