"use client"
import { Button } from "@/components/ui/button";
import { Folder, Loader2Icon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react"
import CreateNewBoardDialog from "./createNewBoardDialog";
import axios from "axios";

interface ProjectItem {
    id: number;
    projectId: string;
    projectName: string;
    userEmail: string;
    createdAt: string;
    previewImage?: string | null;
    updatedAt?: string | null;
}

export default function ProjectList() {
    const [projectList, setProjectList] = useState<ProjectItem[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        GetProjectList();
    }, [])

    const GetProjectList = async () => {
        try {
            const result = await axios.get<ProjectItem[]>("/api/projects");
            setProjectList(result.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Delete this board? This can't be undone.");
        if (!confirmed) return;

        setDeletingId(id);
        try {
            await axios.delete(`/api/projects?projectId=${id}`);
            setProjectList((prev) => prev.filter((project) => project.id !== id));
        } catch (error) {
            console.error("Error deleting project:", error);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div>
            {projectList.length === 0 ? (
                <div className="flex flex-col items-center p-10 justify-center border rounded-xl mt-10 gap-3">
                    <Image src={"/folder.png"} alt="Folder" width={90} height={90} />
                    <h2 className="text-2xl font-bold">No Boards Found</h2>
                    <p className="text-muted-foreground">Create your first board to start brainstorming, Planning !!!</p>
                    <CreateNewBoardDialog />
                </div>
            ) : (
                <div className="mt-10">
                    <h2 className="font-bold text-2xl">Your Boards</h2>
                    <p className="text-muted-foreground">Create and organize your boards</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10 lg:grid-cols-4">
                        {projectList.map((project) => (
                            <div
                                key={project.id}
                                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <Link href={`/workspace/${project.projectId}`} className="block">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                                        {project.previewImage ? (
                                            <Image
                                                src={project.previewImage}
                                                alt={project.projectName}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Folder className="h-10 w-10 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-medium text-slate-800">
                                            {project.projectName}
                                        </h2>
                                        {project.updatedAt && (
                                            <p className="truncate text-xs text-slate-400">
                                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Delete ${project.projectName}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDelete(project.id);
                                        }}
                                        disabled={deletingId === project.id}
                                        className="h-8 w-8 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        {deletingId === project.id ? (
                                            <Loader2Icon className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}