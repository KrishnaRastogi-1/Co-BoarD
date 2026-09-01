"use client"

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button";
import { Save, Share } from "lucide-react";

type Props = {
    selectedTab: any
}

export default function WorkspaceHeader({ selectedTab }: Props) {
    return (
        <div className="p-3 border-b flex justify-between">
            <div className="flex items-center gap-2">
                <Image src={"/logo.svg"} alt="logo" width={100} height={100} />
                <h2>Workspace Name </h2>
            </div>
            {/* switch views   */}
            <div>
                <Tabs defaultValue="whiteboard"
                onValueChange={(value) => selectedTab(value)}>
                    <TabsList>
                        <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                        <TabsTrigger value="document">Document</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {/* Extra Buttons*/}
            <div className="flex gap-2">
                <Button><Save />Save</Button>
                <Button variant={"outline"}><Share />Share</Button>
            </div>

        </div>
    )
}