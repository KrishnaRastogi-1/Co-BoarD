"use client"

import SmartDoc from "@/components/custom/workspace/smartDoc";
import Whiteboard from "@/components/custom/workspace/whiteBoard";
import WorkspaceHeader from "@/components/custom/workspace/workSpceHeader";
import { useState } from "react";

 
export default function Workspace () {
    const [activeTab, setActiveTab] = useState("whiteboard")
    return (
        <div>
            <WorkspaceHeader selectedTab={(value: string) => setActiveTab(value)} />
            {activeTab == "whiteboard" ? <Whiteboard /> : <SmartDoc />} 
        </div>
    )
}