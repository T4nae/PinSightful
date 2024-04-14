"use client";

import Link from "next/link";
import { HomeIcon, LayoutDashboardIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { ModeToggle } from "@/components/ui/model-toggle";

export default function Navbar({ children }: { children?: React.ReactNode }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link href="/">
                        <h1 className="text-2xl font-bold">PinSightful</h1>
                    </Link>
                </div>

                <nav className="flex items-center gap-4 text-sm lg:gap-6">
                    <Link href="/dashboard">
                        <p className="hidden sm:flex">Dashboard</p>
                        <LayoutDashboardIcon className="sm:hidden flex h-[1.2rem] w-[1.2rem] text-neutral-500 dark:text-white" />
                    </Link>
                    <Link href="/">
                        <p className="hidden sm:flex">Home</p>
                        <HomeIcon className="sm:hidden flex h-[1.2rem] w-[1.2rem] text-neutral-500 dark:text-white" />
                    </Link>
                    {children}
                </nav>

                <div className="flex items-center space-x-2">
                    <div className="w-auto flex-none">
                        <nav className="flex items-center space-x-4">
                            <ModeToggle />
                            <UserButton />
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
