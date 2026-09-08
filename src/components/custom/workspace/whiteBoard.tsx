"use client"
import { toast } from "@/components/ui/toast";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "./whiteboard.css"
import { Hand, MousePointer, Square, Circle, Diamond, ArrowRight, Eraser, Pencil, TypeIcon, Image, Sparkle } from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import FloatingProperties from "./floatingProperties";
import { Button } from "@/components/ui/button";
import AIFloatingSidebar from "./aiFloatingSidebar";

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
    const [selectedElement, setSelectedElements] = useState<any>(null);
    const [canvasState, setCanvasState] = useState<any>(null);
    const [showAiSidebar, setShowAiSidebar] = useState(false);

    const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {

        setCanvasState(appState);

        const selectedIds = Object.keys(
            appState.selectedElementIds || {}
        )

        if (selectedIds?.length === 1) {
            const element = elements.find(
                (element) => element.id === selectedIds[0]
            )

            setSelectedElements(element)
        } else {
            setSelectedElements(null);
        }

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

    const getFloatingPosition = () => {
        if (!selectedElement || !canvasState) {
            return { left: 0, top: 0 }
        }

        const zoom = canvasState.zoom?.value ?? 1

        const scrollX = canvasState.scrollX ?? 0

        const scrollY = canvasState.scrollY ?? 0

        const centerX = selectedElement.x + selectedElement.width / 2

        const screenX = (centerX + scrollX) * zoom

        const screenY = (selectedElement.y + scrollY) * zoom

        return {
            left: screenX,
            top: screenY - 60
        }
    }

    const floatingPosition = getFloatingPosition();

    const handlePropertyChange = (property: string, value: any) => {
        if (!excalidrawAPI || !selectedElement) return;

        const element = excalidrawAPI.getSceneElements();
        const updatedElements = element.map((element) => {
            if (element.id !== selectedElement.id) {
                return element;
            }

            return {
                ...element,
                [property]: value,
                version: element.version + 1,
                updated: Date.now()
            }
        });

        excalidrawAPI.updateScene({
            elements: updatedElements
        });

    }

    const HandleDeleteElement = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if (element.id === selectedElement.id) {
                return {
                    ...element,
                    isDeleted: true,
                    version: element.version + 1,
                    updated: Date.now()
                }
            }
            return element;
        });

        excalidrawAPI.updateScene({
            elements: updatedElements
        })

        setSelectedElements(null);
    }

    const HandleOnDuplicate = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const duplicateElement = {
            ...selectedElement,
            id: crypto.randomUUID(),
            x: selectedElement.x + 20,
            y: selectedElement.y + 20,
            seed: Math.floor(Math.random() * 10000),
            version: 1,
            updated: Date.now(),
            isDeleted: false,
        };
        excalidrawAPI.updateScene({
            elements: [
                ...elements,
                duplicateElement
            ]
        })
    }

    const HandleBringFrontBack = (type: "front" | "back") => {
        if (!excalidrawAPI || !selectedElement) return;
        const elements = excalidrawAPI.getSceneElements();
        const selectedElements = elements.filter((element) => element.id === selectedElement.id);

        if (!selectedElement) return;

        const remainingElements = elements.filter((element) => element.id !== selectedElement.id);

        if (type === "front") {
            excalidrawAPI.updateScene({
                elements: [
                    ...remainingElements,
                    selectedElement
                ]
            })
        } else {
            excalidrawAPI.updateScene({
                elements: [
                    selectedElement,
                    ...remainingElements
                ]
            })
        }

    }

    const HandleLockElement = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if (element.id === selectedElement.id) {
                return {
                    ...element,
                    locked: !element.locked,
                    version: element.version + 1,
                    updated: Date.now()
                }
            }
            return element;
        });
        excalidrawAPI.updateScene({
            elements: updatedElements
        })
    };

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
                            <Icon size="19" className={tool.color} />
                        </button>
                    )
                })}
            </div>
            <div>
                <FloatingProperties
                    selectedElement={selectedElement}
                    position={floatingPosition}
                    onPropertyChange={(property, value) => handlePropertyChange(property, value)}
                    onDelete={() => HandleDeleteElement()}
                    onDuplicate={() => HandleOnDuplicate()}
                    onBringToFront={() => HandleBringFrontBack("front")}
                    onSendToBack={() => HandleBringFrontBack("back")}
                    onLock={() => HandleLockElement()}
                />
            </div>
            <div className="absolute right-15 bottom-5 z-50">
                <Button size={"lg"} onClick={() => setShowAiSidebar(!showAiSidebar)}>
                    <Sparkle /> AI
                </Button>
            </div>
            {showAiSidebar && (
                <AIFloatingSidebar
                    excalidrawApi={excalidrawAPI}
                    onClose={() => setShowAiSidebar(false)}
                    onGenerate={(prompt: string, tool: string) => {
                        console.log(prompt, tool);
                    }}
                />
            )}
        </div>
    )
}