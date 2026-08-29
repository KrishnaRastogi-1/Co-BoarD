"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"
import { Archive, LucideLayoutGrid, Plus, Settings, Sparkle, UserPlus } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import CreateNewBoardDialog from "./createNewBoardDialog"

export function AppSidebar() {
    const path = usePathname();
    const { user } = useUser();

    return (
        <Sidebar>
            <SidebarHeader>
                <Image src={"/logo.svg"} alt="logo" width={100} height={100} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup >
                    <CreateNewBoardDialog /> 
                </SidebarGroup>
                <SidebarGroup >
                    <SidebarGroupLabel>My Boards</SidebarGroupLabel>
                    <SidebarMenuButton className="p-4 mt-2 items-center" isActive={path === "/dashboard"} >
                        <LucideLayoutGrid />
                        <span>All Files </span>
                    </SidebarMenuButton>
                    <SidebarMenuButton className="p-4 mt-2 items-center" isActive={path === "/share-files"} >
                        <UserPlus />
                        <span>Share </span>
                    </SidebarMenuButton>
                    <SidebarMenuButton className="p-4 mt-2 items-center" isActive={path === "/archived"} >
                        <Archive />
                        <span>Archived </span>
                    </SidebarMenuButton>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Others</SidebarGroupLabel>
                    <SidebarMenuButton className="p-4 mt-2 items-center" isActive={path === "/ai"} >
                        <Sparkle />
                        <span>AI Helper </span>
                    </SidebarMenuButton>
                    <SidebarMenuButton className="p-4 mt-2 items-center" isActive={path === "/settings"} >
                        <Settings />
                        <span>Settings </span>
                    </SidebarMenuButton>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <CreateNewBoardDialog />
                <div className="p-4 my-3 border rounded-md">
                    <h2 className="text-sm flex justify-between mb-1">2 files created <span>total 3</span></h2>
                    <Progress value={66} className="h-2 mt-2" />
                </div>
                <div>
                    {user?.imageUrl && (
                        <div className="flex items-center p-4 gap-3 border rounded-md">
                            <Image
                                src={user.imageUrl}
                                alt="User"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <h2>{user?.firstName} {user?.lastName}</h2>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}