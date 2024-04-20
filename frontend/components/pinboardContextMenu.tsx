"use client";

import {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { addPin, pin, removePin } from "@/actions/pin";
import { ContextMenuSub } from "@radix-ui/react-context-menu";
import { PinDialog } from "@/components/pinModal";
import { usePin } from "@/hooks/usePin";
import { Badge } from "@/components/ui/badge";

export function PinboardContextMenu({
    children,
    pointer,
    setReload,
    pinboardId,
    userId,
    setDragPin,
    resizablePanel,
}: {
    children?: React.ReactNode;
    pointer: { x: number; y: number } | null;
    setReload: Dispatch<SetStateAction<boolean>>;
    pinboardId: string;
    userId: string;
    setDragPin: Dispatch<SetStateAction<pin | null>>;
    resizablePanel: RefObject<ImperativePanelHandle>;
}) {
    const { hoveredPin, overEmbed } = usePin();

    const [platform, setPlatform] = useState<"⌘" | "alt" | "❖">("❖");
    const [activeDialog, setActiveDialog] = useState<
        "text" | "video" | "ai-pin" | null
    >(null);

    const handleReload = useCallback(() => {
        setReload(true);
    }, [setReload]);
    const handleNewPin = useCallback(() => {
        (async () => {
            if (!pointer) return;
            const pin = await addPin({
                userId,
                pinBoardId: pinboardId,
                pos: pointer,
            });
            if (pin) setReload(true);
        })();
    }, [pointer, userId, pinboardId, setReload]);

    const handleRemovePin = useCallback(() => {
        // remove hovered pin
        (async () => {
            if (!hoveredPin) return;
            await removePin({
                userId,
                pinBoardId: pinboardId,
                pinId: hoveredPin._id,
                pos: hoveredPin.pos,
            });
            setReload(true);
        })();
    }, [hoveredPin, userId, pinboardId, setReload]);

    const handleChatPanel = () => {
        const panel = resizablePanel.current;
        if (panel) {
            panel.resize(35);
        }
    };

    useEffect(() => {
        // check client platform using user agent
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Macintosh")) {
            setPlatform("⌘");
        } else if (userAgent.includes("Windows")) {
            setPlatform("alt");
        } else {
            setPlatform("❖");
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if the platform-specific key is pressed
            const platformKey = platform === "⌘" ? event.metaKey : event.altKey;
            if (!platformKey) return;

            switch (event.key) {
                case "A":
                case "a":
                    if (event.shiftKey) setActiveDialog("ai-pin");
                    break;
                case "L":
                case "l":
                    if (event.shiftKey) setActiveDialog("video");
                    break;
                case "P":
                case "p":
                    handleNewPin();
                    break;
                case "R":
                case "r":
                    handleReload();
                    break;
                case "T":
                case "t":
                    if (event.shiftKey) setActiveDialog("text");
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [platform, handleNewPin, handleReload, handleRemovePin]);

    return (
        <ContextMenu>
            <PinDialog
                pin={hoveredPin}
                opened={activeDialog}
                setActive={setActiveDialog}
                pointer={pointer}
                setReload={setReload}
                userId={userId}
                pinBoardId={pinboardId!}
            >
                <>
                    <ContextMenuTrigger>{children}</ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                        <ContextMenuItem
                            onClick={() => setActiveDialog("ai-pin")}
                            className="flex items-center"
                            disabled={hoveredPin !== null}
                        >
                            Expert Pin <Badge className="ml-2">AI</Badge>
                            <ContextMenuShortcut>
                                {platform} + ⇧ + A
                            </ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={handleNewPin}
                            disabled={hoveredPin !== null}
                        >
                            New Pin
                            <ContextMenuShortcut>
                                {platform} + ⇧ + P
                            </ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger inset>
                                Add
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                <ContextMenuItem
                                    disabled={hoveredPin == null}
                                    onClick={() => setActiveDialog("text")}
                                >
                                    Add Text
                                    <ContextMenuShortcut>
                                        {platform} + ⇧ + T
                                    </ContextMenuShortcut>
                                </ContextMenuItem>

                                <ContextMenuItem
                                    disabled={hoveredPin == null}
                                    onClick={() => {
                                        setActiveDialog("video");
                                    }}
                                >
                                    Add Embed
                                    <ContextMenuShortcut>
                                        {platform} + ⇧ + L
                                    </ContextMenuShortcut>
                                </ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuItem
                            onClick={handleRemovePin}
                            disabled={hoveredPin == null}
                        >
                            Remove Pin
                        </ContextMenuItem>
                        <ContextMenuSeparator />

                        <ContextMenuItem
                            disabled={!overEmbed}
                            onClick={() => window.open(overEmbed!)}
                        >
                            Visit
                        </ContextMenuItem>
                        <ContextMenuItem
                            disabled={!hoveredPin}
                            onClick={() => setDragPin(hoveredPin!)}
                        >
                            Move Pin
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={handleChatPanel}
                            disabled={
                                !resizablePanel.current ||
                                resizablePanel.current.getSize() > 1
                            }
                        >
                            Ask Pinboard <Badge className="ml-2">AI</Badge>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleReload}>
                            Refresh
                            <ContextMenuShortcut>
                                {platform} + R
                            </ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </>
            </PinDialog>
        </ContextMenu>
    );
}
