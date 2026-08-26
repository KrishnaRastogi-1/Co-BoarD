import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/custom/dashboard/appSidebar";
import Header from "@/components/custom/dashboard/appHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                {children}
            </div>
        </SidebarProvider>
    )
}