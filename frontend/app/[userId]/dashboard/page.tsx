"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { getPinboards, Pinboard } from "@/actions/pinboard";
import AddNewPinboard from "@/components/addNewPinboard";
import RemovePinboard from "@/components/removePinboard";

export default function Dashboard({
    params,
}: {
    params: {
        userId: string;
    };
}) {
    const router = useRouter();
    const [pinboards, setPinboards] = useState<Pinboard[] | null>([]);
    const [addedPinboard, setAddedPinboard] = useState<Pinboard | null>(null);

    useEffect(() => {
        const fetchPinboards = async () => {
            const data = await getPinboards(params.userId);
            setPinboards(data);
        };

        fetchPinboards();

        if (addedPinboard !== null) setAddedPinboard(null);
    }, [params.userId, addedPinboard, setAddedPinboard]);

    const handleRedirect = (pinboardId: string) => () => {
        router.push(`/${params.userId}/dashboard/${pinboardId}`);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="flex gap-3 items-center font-sans font-bold text-3xl py-4">
                Dashboard
                <AddNewPinboard
                    userId={params.userId}
                    setAddedPinboard={setAddedPinboard}
                />
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pinboards !== null ? (
                    pinboards.map((pinboard) => (
                        <div
                            key={pinboard._id}
                            className="flex flex-col justify-between cursor:pointer h-[18rem] w-full border rounded-lg p-4 shadow-lg"
                            onClick={handleRedirect(pinboard._id!)}
                        >
                            <h2 className="flex justify-between font-semibold text-xl truncate">
                                {pinboard.name}
                                <RemovePinboard
                                    userId={params.userId}
                                    pinboard={pinboard}
                                    setAddedPinboard={setAddedPinboard}
                                />
                            </h2>
                            {pinboard.preview && (
                                <Image
                                    src={pinboard.preview!}
                                    alt="preview"
                                    width={280}
                                    height={158}
                                    className="object-cover rounded-lg my-2 aspect-w-16 aspect-h-9 w-full"
                                />
                            )}
                            <p className="text-gray-600">
                                {pinboard.createdAt}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">
                        No pinboards found
                    </p>
                )}
            </div>
        </div>
    );
}
