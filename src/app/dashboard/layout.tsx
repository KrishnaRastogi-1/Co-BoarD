import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/custom/dashboard/appSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div>
                <SidebarTrigger />
                {children}
            </div>
        </SidebarProvider>
    )
}