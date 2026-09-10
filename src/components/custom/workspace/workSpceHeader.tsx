"use client"

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button";
import { Download, File, Loader2Icon, Save, Share } from "lucide-react";
import Link from "next/link";

type Props = {
    selectedTab: any,
    onExport: () => void,
    onSave: () => void,
    isSaving?: boolean,
    projectName: string
}

export default function WorkspaceHeader({ selectedTab, onExport, onSave, isSaving, projectName }: Props) {
    return (
        <div className="p-3 border-b flex justify-between">
            <div className="flex items-center gap-2">
                <Link href={"/dashboard"} className="flex items-center gap-2">
                <Image src={"/logo.svg"} alt="logo" width={100} height={100} />
                <h2>{projectName} </h2>
                </Link>
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
                <Button onClick={onSave} disabled={isSaving}>
                    {isSaving ? <Loader2Icon className="animate-spin" /> : <Save />}
                    {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant={"outline"}><Share />Share</Button>
                <Button onClick={onExport} variant={"outline"}><Download />Export</Button>
            </div>

        </div>
    )
}