"use client"
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react"
import CreateNewBoardDialog from "./createNewBoardDialog";

export default function ProjectList() {
    const [projectList, setProjectList] = useState([]);

    return (
        <div>
            {projectList.length === 0 ? (
                <div className="flex flex-col items-center p-10 justify-center border rounded-xl mt-10 gap-3">
                    <Image src={"/folder.png"} alt="Folder" width={90} height={90}/>
                    <h2 className="text-2xl font-bold">No Boards Found</h2>
                    <p className="text-muted-foreground">Create your first board to start brainstorming, Planning !!!</p>
                    <CreateNewBoardDialog />
                </div>
            ): <div></div>}
        </div>
    )
}