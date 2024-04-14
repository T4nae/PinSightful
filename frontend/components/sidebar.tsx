"use client";

import { useEffect } from "react";
import { Settings } from "lucide-react";

import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Sidebar() {
    const {
        setModels,
        models,
        setCurrentModel,
        currentModel,
        setChatGptApi,
        chatGptApi,
        setChatGptApiKey,
        chatGptApiKey,
        ollamaApiUrl,
        setOllamaApiUrl,
    } = useModel();

    useEffect(() => {
        if (models.length === 0) setModels();
    }, [setModels, models]);

    return (
        <Sheet>
            <SheetTrigger asChild className="">
                <a className="cursor-pointer">
                    <Settings className="sm:hidden flex h-[1.2rem] w-[1.2rem] text-neutral-500 dark:text-white" />
                    <p className="hidden sm:flex">Settings</p>
                </a>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Tweak AI Settings</SheetTitle>
                    <SheetDescription>
                        Make changes to your Personal Research Assistant here.
                    </SheetDescription>
                </SheetHeader>
                <div className="w-full py-4">
                    <ToggleGroup
                        type="single"
                        className="flex flex-col items-start w-full"
                        value={currentModel.name}
                    >
                        <Label className="text-neutral-400 opacity-50 font-bold uppercase pb-2">
                            Local Models
                        </Label>
                        {models.map((m) => (
                            <ToggleGroupItem
                                className="w-full border border-gray-300 rounded p-2"
                                key={m.name}
                                onClick={() => setCurrentModel(m)}
                                value={m.name}
                            >
                                {m.name}
                            </ToggleGroupItem>
                        ))}
                        <Separator className="my-2" />
                        <Label className="text-neutral-400 opacity-50 font-bold uppercase">
                            API Models
                        </Label>
                        <ToggleGroupItem
                            className="size-full flex flex-col w-full items-start border border-gray-300 rounded p-2"
                            value="chatgpt"
                            onClick={() => {
                                if (
                                    chatGptApi.length > 0 &&
                                    chatGptApiKey.length > 0
                                )
                                    setCurrentModel({
                                        name: "chatgpt",
                                        provider: "OpenAI",
                                    });
                            }}
                        >
                            <Label className="font-semibold pt-2">
                                ChatGpt
                            </Label>
                            <p className="text-neutral-600 text-sm">
                                Best Language model API Paid per use.
                            </p>
                            <Label className="text-sm pt-2" htmlFor="api-key">
                                api key
                            </Label>
                            <Input
                                id="api-key"
                                type="text"
                                placeholder="sk-xxxxxx"
                                value={chatGptApiKey}
                                className="w-full"
                                onChange={(e) => {
                                    setChatGptApiKey(e.target.value);
                                }}
                            />
                            <Label
                                className="text-sm pt-2"
                                htmlFor="model-name"
                            >
                                chat model
                            </Label>
                            <Input
                                id="model-name"
                                type="text"
                                placeholder="Model Name"
                                value={chatGptApi}
                                className="w-full"
                                onChange={(e) => {
                                    setChatGptApi(e.target.value);
                                }}
                            />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <Label
                        htmlFor="ollama"
                        className="text-neutral-400 opacity-50 font-bold uppercase"
                    >
                        Ollama API URL
                    </Label>
                    <Input
                        id="ollama"
                        type="text"
                        placeholder="http://localhost:11434"
                        value={ollamaApiUrl}
                        className="w-full"
                        onChange={(e) => {
                            setOllamaApiUrl(e.target.value);
                        }}
                    />
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
