"use client";

import { useEffect, useRef, useState } from "react";

import { useModel } from "@/hooks/useModel";
import { pin } from "@/actions/pin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { CircleStopIcon, ForwardIcon } from "lucide-react";

export default function ChatPanel({ Pins }: { Pins: pin[] }) {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const worker = useRef<Worker | null>(null);
    const { currentModel, chatGptApiKey, ollamaApiUrl } = useModel();
    const [chat, setChat] = useState<
        {
            role: "user" | "ai";
            text: string;
        }[]
    >([]);

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

    let pins: pin[];

    // map Pins to pins but dont include videos
    pins = Pins.map((pin) => {
        let data: pin = {
            _id: pin._id,
            pinId: pin.pinId,
            userId: pin.userId,
            pinBoardId: pin.pinBoardId,
            pos: pin.pos,
            texts: pin.texts,
            pinboard: pin.pinboard,
            height: pin.height,
        };
        return data;
    });

    const handleSearch = async () => {
        if (loading) return;
        setError(null);
        try {
            if (!worker.current) {
                throw new Error("Worker not initialized");
            }
            if (topic.length > 0) setTopic("");
            worker.current.postMessage({
                provider: currentModel.provider,
                topic,
                modelConfig,
                type: "answer",
                pins,
            });
            setChat((prevChat) => [
                ...prevChat,
                { role: "user", text: topic },
                { role: "ai", text: "" },
            ]);

            worker.current.onmessage = (event) => {
                const { type, data, error } = event.data;
                if (type === "log") {
                    setLoading(true);
                } else if (type === "chunk") {
                    // update last chat bubble to show the answer
                    setChat((prevChat) => {
                        const last = prevChat[prevChat.length - 1];
                        if (last.role === "ai") {
                            return [
                                ...prevChat.slice(0, prevChat.length - 1),
                                { role: "ai", text: last.text + data },
                            ];
                        } else {
                            return [...prevChat, { role: "ai", text: data }];
                        }
                    });
                } else if (type === "complete") {
                    setLoading(false);
                } else if (type === "error") {
                    setError(error);
                    setLoading(false);
                }
            };
        } catch (error) {
            console.log(error);
            setError("Error occurred while searching. Please try again.");
            setLoading(false);
        }
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

        return () => {
            worker.current?.terminate();
            worker.current = null;
        };
    }, []);

    return (
        <div className="py-4 px-2 flex flex-col h-full">
            <ScrollArea className="flex-grow mb-2">
                <div className="mr-4">
                    {chat.map((c, i) => (
                        <Bubble key={i} role={c.role} text={c.text} />
                    ))}
                    {error && (
                        <div className="text-red-500 text-center">{error}</div>
                    )}
                </div>
            </ScrollArea>

            <div className="flex items-center">
                <Input
                    className="flex-grow mr-2"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ask a question"
                />
                <Button
                    onClick={handleSearch}
                    disabled={loading || topic.length == 0 || pins.length == 0}
                >
                    {loading ? (
                        <CircleStopIcon size={25} />
                    ) : (
                        <ForwardIcon size={25} />
                    )}
                </Button>
            </div>
        </div>
    );
}

const Bubble = ({ role, text }: { role: "user" | "ai"; text: string }) => {
    return (
        <div
            className={`flex ${
                role === "user" ? "justify-end" : "justify-start"
            } mb-2`}
        >
            <div
                className={`rounded-lg p-2 ${
                    role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                }`}
            >
                {text}
            </div>
        </div>
    );
};
