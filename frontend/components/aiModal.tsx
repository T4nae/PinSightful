"use client";

import React, { useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useModel } from "@/hooks/useModel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addPin } from "@/actions/pin";

export default function AiModal({
    setReload,
    opened,
    handleClose,
    pointer,
    userId,
    pinBoardId,
}: {
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    opened: "ai-pin" | "text" | "link" | null;
    handleClose: () => void;
    pointer: {
        x: number;
        y: number;
    } | null;
    userId: string;
    pinBoardId: string;
}) {
    const [topic, setTopic] = useState("");
    const [searchResult, setSearchResult] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const worker = useRef<Worker | null>(null);
    const { currentModel, chatGptApiKey, ollamaApiUrl } = useModel();
    const [saving, setSaving] = useState<boolean>(false);

    const modelConfig =
        currentModel.provider === "OpenAi" && chatGptApiKey !== ""
            ? {
                  model: currentModel.name,
                  temperature: 0.5,
                  apiKey: chatGptApiKey,
              }
            : {
                  baseUrl: ollamaApiUrl,
                  temperature: 0.3,
                  model: currentModel.name,
              };

    const handleSearch = async () => {
        if (loading) return;
        setError(null);

        try {
            if (!worker.current) {
                throw new Error("Worker not initialized");
            }
            if (searchResult.length > 0) setSearchResult([]);
            worker.current.postMessage({
                provider: currentModel.provider,
                topic,
                modelConfig,
                type: "websearch"
            });

            worker.current.onmessage = (event) => {
                const { type, data, error } = event.data;
                if (type === "log") {
                    setLoading(true);
                } else if (type === "chunk") {
                    setSearchResult((prevResult) => [...prevResult, data]);
                } else if (type === "complete") {
                    setLoading(false);
                } else if (type === "error") {
                    setError(error);
                    setLoading(false);
                }
            };
        } catch (error) {
            setError("Error occurred while searching. Please try again.");
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!pointer || searchResult.length == 0) {
            handleClose();
            return;
        }
        setSaving(true);
        const newPin = await addPin({
            userId,
            pinBoardId,
            texts: [searchResult.join("")],
            pos: pointer,
        });
        if (newPin) setReload(true);
        setSaving(false);
        handleClose();
    };

    useEffect(() => {
        if (!worker.current) {
            // Create the worker if it does not yet exist.
            worker.current = new Worker(
                new URL("../lib/worker.ts", import.meta.url),
                {
                    type: "module",
                }
            );
            setLoading(false);
        }
    }, []);

    return (
        <Dialog open={opened !== null}>
            <DialogContent
                className="sm:max-w-[425px]"
                onEscapeKeyDown={handleClose}
                onPointerDownOutside={handleClose}
                onInteractOutside={handleClose}
            >
                <DialogHeader>
                    <DialogTitle>AI Pin</DialogTitle>
                    <DialogDescription>
                        Generate a pin using AI
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="w-full  grid-cols-4 items-center gap-4">
                        <Label htmlFor="topic" className="text-right">
                            Topic
                        </Label>
                        <Input
                            className="col-span-3"
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter topic to search"
                        />
                        <div className="text-left col-span-4  mt-5">
                            <Label htmlFor="result">
                                Generated Result
                                {loading && " Loading..."}
                                {error && ` Error = ${error}`}
                            </Label>
                            <ScrollArea
                                id="result"
                                className="h-72 w-full rounded-md border"
                            >
                                {searchResult.length > 0 && (
                                    <p className="col-span-4">
                                        {searchResult.join("")}
                                    </p>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        disabled={topic.length == 0 || loading}
                        onClick={handleSearch}
                    >
                        Generate
                    </Button>
                    <Button
                        type="button"
                        disabled={loading || searchResult.length == 0}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                    <Button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
