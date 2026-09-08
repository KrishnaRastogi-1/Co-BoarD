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

type AIGenerateResponse = {
  success: boolean;
  diagramResult?: {
    title?: string;
    width?: number;
    height?: number;
    elements: any[];
  };
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

      const generatedElements = result.data.diagramResult?.elements ?? [];
      const safeElements = generatedElements.map((element) =>
        element?.type === "text"
          ? {
              ...element,
              text:
                typeof element.text === "string" && element.text.trim()
                  ? element.text
                  : "Untitled",
            }
          : element,
      );

      const convertToExcalidrawElements = await loadExcalidrawConverter();
      const newElements = convertToExcalidrawElements(safeElements);

      removeAiPlaceholder();
      excalidrawApi.updateScene({
        elements: [...excalidrawApi.getSceneElements(), ...newElements],
      });

      console.log("AI diagram generated:", result.data);
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
