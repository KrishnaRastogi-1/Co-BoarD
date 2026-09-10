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
      } catch (error) {
        console.error("Failed to load whiteboard:", error);
      }
    };

    void loadWhiteboard();
  }, [projectId, excalidrawAPI]);

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

  return (
    <div>
      <WorkspaceHeader
        selectedTab={setActiveTab}
        onExport={handleExportImage}
        projectName={projectName}
      />
      {activeTab === "whiteboard" ? (
        <Whiteboard onApiReady={setExcalidrawAPI} />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
}
