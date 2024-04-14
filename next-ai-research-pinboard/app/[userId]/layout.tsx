import { auth } from "@clerk/nextjs";
import { users } from "@clerk/nextjs/api";
import { redirect } from "next/navigation";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { getUser, setUser } from "@/actions/user";

export default async function UserIdCheckLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: {
        userId: string;
    };
}) {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }
    const user = await users.getUser(userId!);

    let db = await getUser(userId!);

    if (!db) {
        await setUser({
            userId: userId!,
            name: user.username!,
            email: user.emailAddresses![0].emailAddress,
        });
    }

    if (params.userId !== userId) {
        redirect(`/${userId}/dashboard`);
    }
    return (
        <div className="h-screen dark:bg-[#0F0F0F]">
            <Navbar>
                <Sidebar />
            </Navbar>
            {children}
        </div>
    );
}
