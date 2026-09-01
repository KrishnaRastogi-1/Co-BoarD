"use client"
import { toast } from "@/components/ui/toast";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false }
);

export default function Whiteboard() {
     const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
     const saveTimeRef = useRef<any>(null);
     const { projectId } = useParams();

    const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
        if (saveTimeRef?.current) {
            clearTimeout(saveTimeRef.current)
        }
        saveTimeRef.current = setTimeout(() => {
            SaveCanvasChange(elements, appState, files);
            toast.add({
                title: "Changes Saved",
                type: "success"
            })
        }, 10000)
    }

    const SaveCanvasChange = async (elements: readonly any[], appState: any, files: any) => {
        const result = await axios.post("/api/whiteboard", {
            elements: elements,
            appState: appState,
            files: files,
            projectId: projectId
        })
    }

    return (
        <div style={{ height: "93vh" }}>
            <Excalidraw 
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                onChange={handleCanvasChange}
            />
        </div>
    )
}