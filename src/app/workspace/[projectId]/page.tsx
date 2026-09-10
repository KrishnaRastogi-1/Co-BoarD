"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import SmartDoc from "@/components/custom/workspace/smartDoc";
import Whiteboard from "@/components/custom/workspace/whiteBoard";
import WorkspaceHeader from "@/components/custom/workspace/workSpceHeader";
import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

type WhiteboardResponse = {
  projectId: string;
  elements: any[];
  appState: any;
  files: BinaryFiles | null;
  projectName: string;
  previewImage?: string | null;
};

// JSON storage turns Excalidraw's collaborators Map into a plain object.
// Restore it before sending the saved app state back to Excalidraw.
const normalizeAppState = (appState: any) => ({
  ...(appState ?? {}),
  collaborators: new Map(),
});

export default function Workspace() {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState("");
  const [saveNow, setSaveNow] = useState<(() => Promise<void>) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [needsInitialPreview, setNeedsInitialPreview] = useState(false);


  useEffect(() => {
    if (!projectId || !excalidrawAPI) return;

    const loadWhiteboard = async () => {
      try {
        const result = await axios.get<WhiteboardResponse>(
          `/api/projects?projectId=${encodeURIComponent(projectId)}`,
        );
        setProjectName(result.data.projectName)
        excalidrawAPI.updateScene({
          elements: result.data.elements ?? [],
          appState: normalizeAppState(result.data.appState),
        });

        if (result.data.files) {
          excalidrawAPI.addFiles(Object.values(result.data.files));
        }

        // If this board already has content but no preview thumbnail yet
        // (e.g. it was created or edited before the preview feature, or the
        // 10s auto-save debounce never got a chance to fire), generate one
        // right away instead of waiting on a debounce or a manual edit.
        if (!result.data.previewImage && (result.data.elements?.length ?? 0) > 0) {
          setNeedsInitialPreview(true);
        }
      } catch (error) {
        console.error("Failed to load whiteboard:", error);
      }
    };

    void loadWhiteboard();
  }, [projectId, excalidrawAPI]);

  // Runs once both the loaded board tells us it needs a preview AND the
  // save function has been handed up from Whiteboard — order-independent,
  // since this re-checks whenever either piece becomes available.
  useEffect(() => {
    if (needsInitialPreview && saveNow) {
      saveNow();
      setNeedsInitialPreview(false);
    }
  }, [needsInitialPreview, saveNow]);

  const handleExportImage = async () => {
    if (!excalidrawAPI) return;

    const { exportToBlob } = await import("@excalidraw/excalidraw");
    const blob = await exportToBlob({
      elements: excalidrawAPI.getSceneElements(),
      appState: {
        ...excalidrawAPI.getAppState(),
        exportBackground: true,
      },
      files: excalidrawAPI.getFiles(),
      mimeType: "image/png",
      quality: 1,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "whiteboard.png";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleManualSave = async () => {
    if (!saveNow) return;
    setIsSaving(true);
    try {
      await saveNow();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <WorkspaceHeader
        selectedTab={setActiveTab}
        onExport={handleExportImage}
        onSave={handleManualSave}
        isSaving={isSaving}
        projectName={projectName}
      />
      {activeTab === "whiteboard" ? (
        <Whiteboard
          onApiReady={setExcalidrawAPI}
          onSaveReady={(fn) => setSaveNow(() => fn)}
        />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
}