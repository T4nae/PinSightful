import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoader() {
    const skeleton = Array.from({ length: 4 });
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="flex gap-3 items-center font-sans font-bold text-3xl py-4">
                Dashboard
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {skeleton.map((_, index) => (
                    <div key={index} className="cursor-pointer">
                        <Skeleton className="h-[125px] w-full border rounded-lg p-4 shadow-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
