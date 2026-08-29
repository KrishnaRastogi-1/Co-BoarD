"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { LoaderCircle, Plus } from "lucide-react"
import { useState } from "react"
import axios from "axios";
import { useRouter } from "next/navigation"

export default function CreateNewBoardDialog() {
    const [workspaceName, setWorkspaceName] = useState("");
    const [Loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(false);
    const route = useRouter();

    const handleCreatBoard = async () => {
        if (workspaceName.trim().length === 0 || workspaceName.length > 30) {
            toast.add({
                type: "error",
                title: "Invalid Workspace Name",
                description: "Please enter a valid workspace name (1-30 characters)."
            });
            return;
        }
        setLoading(true);

        const projectId = crypto.randomUUID();
        const result = await axios.post("/api/projects", {
            projectName: workspaceName,
            projectId: projectId,
        });
        console.log(result?.data);
        toast.add({
            type: "success",
            title: "New Workspace Created"
        })
        setLoading(false);
        setDialog(false)
        route.push(`/workspace/${projectId}`)
    }

    return (
        <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger render={
                <Button><Plus /> Create New Board</Button>
            } />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Whiteboard Workspace Name</DialogTitle>
                </DialogHeader>
                <div>
                    <label className="text-gray-500">Enter Whiteboard Workspace Name</label>
                    <Input
                        className="mt-1"
                        placeholder="Workspace Name"
                        onChange={(e) => {
                            setWorkspaceName(e.target.value);
                        }}
                    />
                </div>
                <DialogFooter>
                    <DialogClose render={
                        <Button variant="outline">Cancel</Button>
                    } />
                    <Button disabled={workspaceName?.length === 0 || Loading} onClick={handleCreatBoard}>
                        {Loading && <LoaderCircle className="animate-spin" /> }
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}