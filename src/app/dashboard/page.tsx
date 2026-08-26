import ProjectList from "@/components/custom/dashboard/projectList";
import WelcomeBanner from "@/components/custom/dashboard/welcomeBanner";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
    return (
        <div>
            {/* // welcome Banner */}
            <WelcomeBanner />
            {/*  Project list / empty state */}
            <ProjectList /> 
        </div>
    )
}