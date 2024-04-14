"use client";

import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useTheme } from "next-themes";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PinboardContextMenu } from "@/components/pinboardContextMenu";
import { usePin } from "@/hooks/usePin";
import { updatePinboard } from "@/actions/pinboard";
import { drawPins, updatePattern } from "@/lib/canvasHelpers";
import useDrag from "@/hooks/useDrag";

export default function PinboardPage({
    params,
}: {
    params: {
        userId: string;
        pinboardId: string;
    };
}) {
    const { theme } = useTheme();
    const { userId, pinboardId } = params;
    const [reload, setReload] = useState<boolean>(true);

    const {
        pins,
        pointer,
        setPointer,
        setPins,
        setHoveredPin,
        notFound,
        pinboard,
        embeds,
        addEmbed,
        setOverEmbed,
    } = usePin();
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const patternRef = useRef<CanvasPattern | null>(null);
    const zoomFactor = useRef<number>(1);
    const lastTheme = useRef<string | undefined>(undefined);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    useDrag(scrollRef);

    useEffect(() => {
        const interval = setInterval(() => {
            (async () => {
                if (!pinboard || !canvasRef.current) return;
                pinboard.preview = canvasRef.current.toDataURL("image/png");
                const res = await updatePinboard(pinboard, pinboardId, userId);
            })();
        }, 60000);
        return () => clearInterval(interval);
    }, [pinboard, pinboardId, userId]);

    useEffect(() => {
        if (reload) setPins(userId, pinboardId);
    }, [userId, pinboardId, reload, setPins]);

    if (notFound) redirect(`/${userId}/dashboard`);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (reload || lastTheme.current !== theme) {
            lastTheme.current = theme;
            setReload(false);
        }
        canvas.width = 1920 * 2 * zoomFactor.current;
        canvas.height = 1080 * 2 * zoomFactor.current;

        updatePattern(zoomFactor, theme, patternRef, ctx, canvas);
        drawPins(
            pins,
            zoomFactor,
            ctx,
            theme,
            imagesLoaded,
            setImagesLoaded,
            embeds,
            addEmbed
        );

        const handleWheel = (event: WheelEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
                zoomFactor.current += event.deltaY > 0 ? -0.1 : 0.1;
                zoomFactor.current = Math.max(1, zoomFactor.current); // Limit zoom factor to prevent negative zoom
                zoomFactor.current = Math.min(2, zoomFactor.current); // Limit zoom factor to prevent excessive zoom
                canvas.width = 1920 * 2 * zoomFactor.current;
                canvas.height = 1080 * 2 * zoomFactor.current;
                if (patternRef.current) {
                    updatePattern(zoomFactor, theme, patternRef, ctx, canvas); // Recreate the pattern
                    ctx.fillStyle = patternRef.current;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawPins(
                        pins,
                        zoomFactor,
                        ctx,
                        theme,
                        imagesLoaded,
                        setImagesLoaded,
                        embeds,
                        addEmbed
                    ); // Redraw the pins
                }
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setPointer(x / zoomFactor.current, y / zoomFactor.current);

            // Check if mouse is over a pin
            const overPin = pins?.find((pin) => {
                const pinX = (pin.pos.x - 100) * zoomFactor.current;
                const pinY = (pin.pos.y - 300 / 2) * zoomFactor.current;
                const pinWidth = 300 * zoomFactor.current;
                const pinHeight = pin.height
                    ? pin.height
                    : 300 * zoomFactor.current;

                return (
                    x >= pinX &&
                    x <= pinX + pinWidth &&
                    y >= pinY &&
                    y <= pinY + pinHeight
                );
            });
            setHoveredPin(overPin || null);

            // Check if mouse is over an embed
            const overEmbed = embeds.find((embed) => {
                const embedX = embed.x;
                const embedY = embed.y;
                const embedWidth = 280 * zoomFactor.current;
                const embedHeight = 158 * zoomFactor.current;

                return (
                    x >= embedX &&
                    x <= embedX + embedWidth &&
                    y >= embedY &&
                    y <= embedY + embedHeight
                );
            });
            setOverEmbed(overEmbed ? overEmbed.embed : null);
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, [
        reload,
        theme,
        pins,
        setHoveredPin,
        setPointer,
        imagesLoaded,
        addEmbed,
        setOverEmbed,
        embeds,
    ]);
    return (
        <ScrollArea
            type="scroll"
            style={{ height: "calc(100vh - 3.55rem)" }}
            ref={scrollRef}
            className="w-full"
        >
            <PinboardContextMenu
                pointer={pointer}
                setReload={setReload}
                pinboardId={pinboardId}
                userId={userId}
            >
                <canvas ref={canvasRef}>
                    Your browser does not support the HTML5 canvas element.
                </canvas>
            </PinboardContextMenu>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
