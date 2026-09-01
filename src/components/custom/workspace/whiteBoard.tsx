"use client"
import { toast } from "@/components/ui/toast";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "./whiteboard.css"
import { Hand, MousePointer, Square, Circle, Diamond, ArrowRight, Eraser, Pencil, TypeIcon, Image } from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const tools = [
    {
        name: "selection",
        icon: MousePointer,
        color: "text-blue-600"
    },
    {
        name: "hand",
        icon: Hand,
        color: "text-cyan-600"
    },
    {
        name: "rectangle",
        icon: Square,
        color: "text-blue-600"
    },
    {
        name: "ellipse",
        icon: Circle,
        color: "text-green-600"
    },
    {
        name: "diamond",
        icon: Diamond,
        color: "text-purple-600"
    },
    {
        name: "arrow",
        icon: ArrowRight,
        color: "text-orange-600"
    },
    {
        name: "freedraw",
        icon: Pencil,
        color: "text-pink-600"
    },
    {
        name: "text",
        icon: TypeIcon,
        color: "text-indigo-600"
    },
    {
        name: "image",
        icon: Image,
        color: "text-emerald-600"
    },
    {
        name: "eraser",
        icon: Eraser,
        color: "text-red-600"
    }

]

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false }
);

export default function Whiteboard() {
     const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
     const saveTimeRef = useRef<any>(null);
     const { projectId } = useParams();
     const [activeTools, setActiveTools] = useState("selection");

    const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
        if (saveTimeRef?.current) {
            clearTimeout(saveTimeRef.current)
        }
        // saveTimeRef.current = setTimeout(() => {
        //     SaveCanvasChange(elements, appState, files);
        //     toast.add({
        //         title: "Changes Saved",
        //         type: "success"
        //     })
        // }, 2000)
    }

    const SaveCanvasChange = async (elements: readonly any[], appState: any, files: any) => {
        try {
            const result = await axios.post("/api/whiteboard", {
                elements: elements,
                appState: appState,
                files: files,
                projectId: projectId
            });
            console.log("Save response:", result.data);
        } catch (err) {
            console.error("Save failed:", err);
        }
    }

    const changeTool = (tool: any) => {
        if (!excalidrawAPI) return;
        setActiveTools(tool);
        excalidrawAPI.setActiveTool({
            type: tool
        })
    }

    return (
        <div style={{ height: "93vh" }}>
            <Excalidraw 
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                onChange={handleCanvasChange}
            />
            <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white border p-1.5 shadow-xl">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <button key={tool.name} onClick={() => changeTool(tool.name)} className={`flex h-10 w-10 items-center justify-center hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ${activeTools === tool.name ? "bg-primary/10" : ""}`}>
                            <Icon size="19" className={tool.color}/>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}