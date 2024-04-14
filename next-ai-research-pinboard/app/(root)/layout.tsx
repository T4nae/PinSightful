import { auth } from "@clerk/nextjs";
import { HomeIcon, LayoutDashboardIcon, StepForwardIcon } from "lucide-react";

import { HeroHighlight } from "@/components/ui/hero-highlight";
import { FloatingNav } from "@/components/ui/floating-navbar";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = auth();

    const navItems = [
        {
            name: "Home",
            link: "#home",
            icon: (
                <HomeIcon className="h-4 w-4 text-neutral-500 dark:text-white" />
            ),
        },
        {
            name: "Dashboard",
            link: `/${userId}/dashboard`,
            icon: (
                <LayoutDashboardIcon className="h-4 w-4 text-neutral-500 dark:text-white" />
            ),
        },
        {
            name: "get started",
            link: "#get-started",
            icon: (
                <StepForwardIcon className="h-4 w-4 text-neutral-500 dark:text-white" />
            ),
        },
    ];

    return (
        <>
            <HeroHighlight>
                <FloatingNav navItems={navItems} />
                {children}
            </HeroHighlight>
        </>
    );
}
