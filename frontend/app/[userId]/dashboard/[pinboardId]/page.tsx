"use client";

import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useTheme } from "next-themes";
import { ImperativePanelHandle } from "react-resizable-panels";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PinboardContextMenu } from "@/components/pinboardContextMenu";
import { usePin } from "@/hooks/usePin";
import { updatePinboard } from "@/actions/pinboard";
import { drawPins, updatePattern } from "@/lib/canvasHelpers";
import useDrag from "@/hooks/useDrag";
import { pin, updatePin } from "@/actions/pin";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatPanel from "@/components/chatPanel";

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
    const [dragPin, setDragPin] = useState<pin | null>(null);

    const {
        pins,
        pointer,
        setPointer,
        setPins,
        updateLoadedPin,
        setHoveredPin,
        notFound,
        pinboard,
        loadImages,
        embeds,
        overEmbed,
        setEmbeds,
        setOverEmbed,
    } = usePin();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const patternRef = useRef<CanvasPattern | null>(null);
    const zoomFactor = useRef<number>(1);
    const lastTheme = useRef<string | undefined>(undefined);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const panel = useRef<ImperativePanelHandle>(null);
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

        loadImages();
        updatePattern(zoomFactor, theme, patternRef, ctx, canvas);
        drawPins(pins, zoomFactor, ctx, theme, embeds, setEmbeds);

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
                    drawPins(pins, zoomFactor, ctx, theme, embeds, setEmbeds); // Redraw the pins
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

            // handle dragging pin set pos to mouse pos
            if (dragPin) {
                const newPin = {
                    ...dragPin,
                    pos: {
                        x: x / zoomFactor.current,
                        y: y / zoomFactor.current,
                    },
                };
                updateLoadedPin(newPin);
                if (patternRef.current) {
                    updatePattern(zoomFactor, theme, patternRef, ctx, canvas); // Recreate the pattern
                    ctx.fillStyle = patternRef.current;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawPins(pins, zoomFactor, ctx, theme, embeds, setEmbeds); // Redraw the pins
                }
            }
        };

        const handleMouseClick = (event: MouseEvent) => {
            if (dragPin) {
                // find updated pin and update
                const newPin = pins.find((pin) => pin._id === dragPin._id);
                if (!newPin) return;
                updatePin({
                    ...newPin,
                    userId,
                    pinBoardId: pinboardId,
                    pinId: dragPin._id,
                });
                setDragPin(null);
            }
        };

        const handleChatPanel = () => {
            if (overEmbed) window.open(overEmbed, "_blank");
            if (panel.current) {
                if (panel.current.getSize() > 0) panel.current.resize(1);
            }
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("click", handleMouseClick);
        canvas.addEventListener("dblclick", handleChatPanel);
        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
            canvas.removeEventListener("dblclick", handleChatPanel);
            canvas.removeEventListener("click", handleMouseClick);
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, [
        pinboardId,
        userId,
        reload,
        theme,
        pins,
        setHoveredPin,
        setPointer,
        loadImages,
        setEmbeds,
        overEmbed,
        setOverEmbed,
        embeds,
        setDragPin,
        dragPin,
        updateLoadedPin,
    ]);
    return (
        <ResizablePanelGroup
            direction="horizontal"
            style={{ height: "calc(100vh - 3.55rem)" }}
        >
            <ResizablePanel
                collapsible
                defaultSize={1}
                maxSize={35}
                ref={panel}
            >
                <ChatPanel Pins={pins} Panel={panel} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={99}>
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
                        setDragPin={setDragPin}
                        resizablePanel={panel}
                    >
                        <canvas ref={canvasRef}>
                            Your browser does not support the HTML5 canvas
                            element.
                        </canvas>
                    </PinboardContextMenu>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
