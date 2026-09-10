"use client";

import { useState, type ComponentType } from "react";
import axios from "axios";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2Icon,
  Monitor,
  Network,
  PencilRuler,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const loadExcalidrawConverter = async () => {
  const { convertToExcalidrawElements } = await import(
    "@excalidraw/excalidraw"
  );

  return convertToExcalidrawElements;
};

const getSafeText = (value: unknown, fallback = "Untitled"): string =>
  typeof value === "string" && value.trim() ? value : fallback;

type Tool = {
  name: string;
  desc: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  prompt: string;
};

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  onClose: () => void;
  onGenerate: (prompt: string, tool: string) => void;
};

type AIDiagram = {
  title?: string;
  width?: number;
  height?: number;
  elements: any[];
  connections?: any[];
};

type AIGenerateResponse = {
  success: boolean;
  diagramResult?: AIDiagram;
  message?: string;
};

const AI_TOOLS: Tool[] = [
  {
    name: "Generate Diagrams",
    desc: "Create visual diagrams",
    icon: PencilRuler,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    prompt: `You are an expert visual diagram generation agent. Convert the user's idea into a clear, structured, professional diagram. Identify key concepts and relationships. Use rectangles for concepts or processes, diamonds only for decisions, and arrows for relationships. Keep labels concise, spacing consistent, and avoid overlaps. Prefer a simple left-to-right or top-to-bottom layout. Output only valid Excalidraw-compatible JSON elements.`,
  },
  {
    name: "Flowchart",
    desc: "Visualize workflows",
    icon: Workflow,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    prompt: `You are an expert flowchart generation agent. Convert the user's description into a professional flowchart. Identify starts, actions, decisions, branches, and endings. Use rounded rectangles for starts and ends, rectangles for actions, diamonds for decisions, and arrows to connect steps. Label decision arrows clearly. Keep the primary workflow top-to-bottom and avoid crossing arrows. Output only valid Excalidraw-compatible JSON elements.`,
  },
  {
    name: "Architecture",
    desc: "Design system architecture",
    icon: Network,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    prompt: `You are a senior software architect and system design visualization agent. Convert the user's description into a clear architecture diagram. Identify clients, frontend applications, services, APIs, databases, queues, storage, authentication, infrastructure, and external services when relevant. Group related components, show data flow with arrows, and keep the layout readable. Output only valid Excalidraw-compatible JSON elements.`,
  },
  {
    name: "Web Mockup",
    desc: "Generate web wireframes",
    icon: Monitor,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    prompt: `You are an expert product designer and web wireframe generation agent. Convert the user's description into a professional desktop wireframe. Use simple rectangles and text elements for layouts, navigation, sidebars, cards, tables, forms, buttons, and content panels when relevant. Keep it low-fidelity, spacious, aligned, and within a desktop-sized canvas. Output only valid Excalidraw-compatible JSON elements.`,
  },
];

const AI_PLACEHOLDER_IDS = {
  container: "ai-placeholder-container",
  title: "ai-placeholder-title",
  subtitle: "ai-placeholder-subtitle",
  skeleton1: "ai-placeholder-skeleton-1",
  skeleton2: "ai-placeholder-skeleton-2",
  skeleton3: "ai-placeholder-skeleton-3",
} as const;

const PLACEHOLDER_IDS: ReadonlySet<string> = new Set(
  Object.values(AI_PLACEHOLDER_IDS),
);

export default function AIFloatingSidebar({
  excalidrawApi,
  onClose,
  onGenerate,
}: Props) {
  const [selectedTool, setSelectedTool] = useState<Tool>(AI_TOOLS[0]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getEmptyCanvasPosition = () => {
    if (!excalidrawApi) return { x: 100, y: 100 };

    const elements = excalidrawApi
      .getSceneElements()
      .filter((element) => !element.isDeleted);

    if (!elements.length) return { x: 100, y: 100 };

    return {
      x: Math.max(...elements.map((element) => element.x + element.width)) + 150,
      y: Math.min(...elements.map((element) => element.y)),
    };
  };

  const removeAiPlaceholder = () => {
    if (!excalidrawApi) return;

    excalidrawApi.updateScene({
      elements: excalidrawApi
        .getSceneElements()
        .filter((element) => !PLACEHOLDER_IDS.has(element.id)),
    });
  };

  const addAiPlaceholder = async () => {
    if (!excalidrawApi) return;

    removeAiPlaceholder();

    const position = getEmptyCanvasPosition();
    const convertToExcalidrawElements = await loadExcalidrawConverter();
    const placeholderElements = convertToExcalidrawElements(
      [
        {
          type: "rectangle",
          id: AI_PLACEHOLDER_IDS.container,
          x: position.x,
          y: position.y,
          width: 420,
          height: 250,
          backgroundColor: "#f5f3ff",
          strokeColor: "#d9cfff",
          roughness: 0,
          fillStyle: "solid",
          strokeWidth: 2,
          roundness: { type: 3 },
        },
        {
          type: "text",
          id: AI_PLACEHOLDER_IDS.title,
          x: position.x + 24,
          y: position.y + 28,
          text: "Generating your diagram",
          fontSize: 22,
          fontFamily: 2,
          strokeColor: "#312e81",
        },
        {
          type: "text",
          id: AI_PLACEHOLDER_IDS.subtitle,
          x: position.x + 24,
          y: position.y + 65,
          text: "AI is turning your idea into editable elements…",
          fontSize: 15,
          fontFamily: 2,
          strokeColor: "#64748b",
        },
        ...[
          [AI_PLACEHOLDER_IDS.skeleton1, 118, 250, "#ddd6fe"],
          [AI_PLACEHOLDER_IDS.skeleton2, 150, 340, "#e9e5ff"],
          [AI_PLACEHOLDER_IDS.skeleton3, 182, 180, "#ddd6fe"],
        ].map(([id, offsetY, width, color]) => ({
          type: "rectangle" as const,
          id: String(id),
          x: position.x + 24,
          y: position.y + Number(offsetY),
          width: Number(width),
          height: 14,
          backgroundColor: String(color),
          strokeColor: String(color),
          roughness: 0,
          fillStyle: "solid" as const,
          strokeWidth: 1,
          roundness: { type: 3 as const },
        })),
      ],
      { regenerateIds: false },
    );

    excalidrawApi.updateScene({
      elements: [...excalidrawApi.getSceneElements(), ...placeholderElements],
    });
  };

  const getConnectionPoints = (
    fromNode: any,
    toNode: any,
    origin: { x: number; y: number },
  ) => {
    const fromX = origin.x + Number(fromNode.x || 0);
    const fromY = origin.y + Number(fromNode.y || 0);
    const fromWidth = Number(fromNode.width || 200);
    const fromHeight = Number(fromNode.height || 80);

    const toX = origin.x + Number(toNode.x || 0);
    const toY = origin.y + Number(toNode.y || 0);
    const toWidth = Number(toNode.width || 200);
    const toHeight = Number(toNode.height || 80);

    const fromCenterX = fromX + fromWidth / 2;
    const fromCenterY = fromY + fromHeight / 2;
    const toCenterX = toX + toWidth / 2;
    const toCenterY = toY + toHeight / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    // Vertical connection
    if (Math.abs(dy) >= Math.abs(dx)) {
      if (dy > 0) {
        return {
          startX: fromCenterX,
          startY: fromY + fromHeight,
          endX: toCenterX,
          endY: toY,
        };
      }
      return {
        startX: fromCenterX,
        startY: fromY,
        endX: toCenterX,
        endY: toY + toHeight,
      };
    }

    // Horizontal connection
    if (dx > 0) {
      return {
        startX: fromX + fromWidth,
        startY: fromCenterY,
        endX: toX,
        endY: toCenterY,
      };
    }

    return {
      startX: fromX,
      startY: fromCenterY,
      endX: toX + toWidth,
      endY: toCenterY,
    };
  };

  const renderAIDiagram = async (diagram: AIDiagram) => {
    if (!excalidrawApi) return;

    const origin = getEmptyCanvasPosition();
    const aiElements = diagram?.elements || [];
    const connections = diagram?.connections || [];

    if (!aiElements.length) return;

    const getNode = (id: string) =>
      aiElements.find((element: any) => element.id === id);

    const shapeElements = aiElements.flatMap((element: any): any[] => {
      if (!element?.type || !element?.id) return [];

      const x = origin.x + (Number(element.x) || 0);
      const y = origin.y + (Number(element.y) || 0);
      const width = Number(element.width) || 200;
      const height = Number(element.height) || 80;

      const baseElement = {
        id: element.id,
        type: element.type,
        x,
        y,
        width,
        height,
        strokeColor: element.strokeColor || "#1e1e1e",
        backgroundColor: element.backgroundColor || "transparent",
        strokeWidth: Number(element.strokeWidth) || 2,
        strokeStyle: element.strokeStyle || "solid",
        fillStyle: element.fillStyle || "solid",
        roughness: element.roughness ?? 1,
        opacity: element.opacity ?? 100,
      };

      if (element.type === "text") {
        return [
          {
            ...baseElement,
            text: getSafeText(element.text || element.label),
            fontSize: Number(element.fontSize) || 18,
          },
        ];
      }

      const labelText = getSafeText(
        typeof element.label === "object" && element.label !== null
          ? element.label.text
          : element.label ?? element.text,
        "",
      );

      return [
        {
          ...baseElement,
          ...(labelText && {
            label: {
              text: labelText,
              fontSize: Number(element.fontSize) || 18,
            },
          }),
        },
      ];
    });

    const connectionElements = connections
      .map((connection: any, index: number) => {
        const fromNode = getNode(connection.from);
        const toNode = getNode(connection.to);

        if (!fromNode || !toNode) {
          console.warn("Unable to create connection", connection);
          return null;
        }

        const { startX, startY, endX, endY } = getConnectionPoints(
          fromNode,
          toNode,
          origin,
        );

        return {
          id: connection.id || `connection-${index}`,
          type: "arrow",
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
          start: { id: connection.from },
          end: { id: connection.to },
          strokeColor: connection.strokeColor || "#1e1e1e",
          strokeWidth: Number(connection.strokeWidth) || 2,
          strokeStyle: connection.strokeStyle || "solid",
          roughness: connection.roughness ?? 1,
          opacity: connection.opacity ?? 100,
          startArrowhead: null,
          endArrowhead: connection.endArrowhead || "arrow",
          ...(connection.label && {
            label: {
              text: getSafeText(connection.label),
              fontSize: Number(connection.fontSize) || 16,
            },
          }),
        };
      })
      .filter(Boolean);

    const elementsToConvert = [...shapeElements, ...connectionElements];

    const convertToExcalidrawElements = await loadExcalidrawConverter();
    const newElements = convertToExcalidrawElements(elementsToConvert as any, {
      regenerateIds: false,
    });

    const currentElements = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
      elements: [...currentElements, ...newElements],
    });

    // Uncomment to auto-scroll the generated diagram into view:
    // excalidrawApi.scrollToContent(newElements, {
    //   fitToViewport: true,
    //   viewportZoomFactor: 0.8,
    // });
  };

  const handleGenerate = async () => {
    const description = userInput.trim();
    if (!description || !excalidrawApi) return;

    setLoading(true);

    try {
      await addAiPlaceholder();

      const result = await axios.post<AIGenerateResponse>(
        "/api/ai",
        {
          prompt: description,
          tool: selectedTool.name,
          systemPrompt: selectedTool.prompt,
        },
        { timeout: 120_000 },
      );

      if (!result.data.success) {
        throw new Error(result.data.message ?? "AI generation failed.");
      }

      removeAiPlaceholder();

      if (result.data.diagramResult) {
        await renderAIDiagram(result.data.diagramResult);
      }

      onGenerate(description, selectedTool.name);
      setUserInput("");
    } catch (error) {
      const apiError = error as {
        code?: string;
        message?: string;
        response?: { status?: number; data?: unknown };
      };

      console.error("AI request details:", {
        code: apiError.code,
        message: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data,
      });

      removeAiPlaceholder();
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="absolute bottom-6 right-6 z-50 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]">
      <header className="border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">AI Helper</h2>
              <p className="mt-0.5 text-xs text-slate-500">Turn an idea into a visual in seconds.</p>
            </div>
          </div>
          <button type="button" aria-label="Close AI helper" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="p-5">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Start with a template</h3>
            <span className="text-xs text-slate-400">{AI_TOOLS.length} options</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AI_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool.name === tool.name;

              return (
                <button key={tool.name} type="button" disabled={loading} onClick={() => setSelectedTool(tool)} className={`rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? "border-violet-300 bg-violet-50/70 ring-1 ring-violet-200" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tool.bgColor} ${tool.color}`}><Icon size={18} /></div>
                  <p className="text-sm font-medium text-slate-800">{tool.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">{tool.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 border-t border-slate-100 pt-5">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-800">Describe your {selectedTool.name.toLowerCase()}</label>
            <span className="text-xs text-slate-400">Required</span>
          </div>
          <Textarea id="ai-prompt" value={userInput} disabled={loading} onChange={(event) => setUserInput(event.target.value)} placeholder="e.g. Customer onboarding flow with approval decision points" className="min-h-[92px] resize-none border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus-visible:bg-white" />
          <Button type="button" onClick={handleGenerate} disabled={!userInput.trim() || loading || !excalidrawApi} className="mt-3 flex w-full items-center justify-center gap-2 bg-violet-600 font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2Icon size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Generating..." : `Generate ${selectedTool.name}`}
          </Button>
        </section>
      </div>
    </aside>
  );
}