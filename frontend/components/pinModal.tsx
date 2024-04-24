import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AiModal from "@/components/aiModal";
import { pin, content } from "@/actions/pin";
import { Textarea } from "@/components/ui/textarea";
import { addContent } from "@/actions/content";
import { Switch } from "@/components/ui/switch";
import { usePin } from "@/hooks/usePin";

export function PinDialog({
    children,
    opened,
    setActive,
    pointer,
    pin,
    setReload,
    userId,
    pinBoardId,
}: {
    children: React.ReactNode;
    opened: "text" | "video" | "ai-pin" | null;
    setActive: Dispatch<SetStateAction<"text" | "video" | "ai-pin" | null>>;
    pointer: {
        x: number;
        y: number;
    } | null;
    pin: pin | null;
    setReload: Dispatch<SetStateAction<boolean>>;
    userId: string;
    pinBoardId: string;
}) {
    const [text, setText] = useState<string>("");
    const [redirectUrl, setRedirectUrl] = useState<string>("");
    const [type, setType] = useState<"text" | "video" | "image">("image");
    const [saving, setSaving] = useState<boolean>(false);
    const { pins, updatePins } = usePin();
    const handleSave = async () => {
        if (!pin) return;
        setSaving(true);

        type == "text"
            ? updatePins(
                  pins.map((p) => {
                      if (p._id == pin._id) {
                          const newContent: content = {
                              _id: "",
                              pin: pin._id!,
                              text: text,
                              createdAt: "",
                              type: "text",
                          };
                          return {
                              ...p,
                              texts: (p.texts as content[])
                                  ? [...(p.texts as content[]), newContent]
                                  : [newContent],
                          };
                      }
                      return p;
                  })
              )
            : updatePins(
                  pins.map((p) => {
                      if (p._id == pin._id) {
                          const newContent: content = {
                              _id: "",
                              pin: pin._id!,
                              createdAt: "",
                              type: type,
                              url: text,
                              redirect: redirectUrl,
                          };
                          return {
                              ...p,
                              texts: (p.texts as content[])
                                  ? [...(p.texts as content[]), newContent]
                                  : [newContent],
                          };
                      }
                      return p;
                  })
              );
        setSaving(false);
        handleClose();

        const content = await addContent({
            type: opened == "text" ? "text" : type,
            text: text,
            url: text,
            pinId: pin._id!,
            pinBoardId: pinBoardId,
            userId: userId,
            redirect: redirectUrl,
        });
        if (content) setReload(true);
    };

    const handleClose = () => {
        setActive(null);
        setReload(true);
    };

    useEffect(() => {
        if (opened !== null) {
            setText("");
            setRedirectUrl("");
            setType("image");
        }
    }, [opened]);

    return opened === "ai-pin" ? (
        <AiModal
            opened={opened}
            handleClose={handleClose}
            pointer={pointer}
            setReload={setReload}
            userId={userId}
            pinBoardId={pinBoardId}
        />
    ) : (
        <Dialog open={opened !== null}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px]"
                onEscapeKeyDown={handleClose}
                onPointerDownOutside={handleClose}
                onInteractOutside={handleClose}
            >
                <DialogHeader>
                    <DialogTitle>
                        Add new {opened == "text" ? "Texts" : "Embeds"}
                    </DialogTitle>
                    <DialogDescription>
                        Add new {opened == "text" ? "texts" : "embeds"} content
                        to the Pin
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="text" className="text-left col-span-2">
                            Content
                        </Label>
                        {opened == "video" && (
                            <>
                                <div className="flex items-center justify-between col-span-2">
                                    <Label htmlFor="type">Image</Label>
                                    <Switch
                                        id="type"
                                        onCheckedChange={(checked) => {
                                            setType(
                                                checked ? "video" : "image"
                                            );
                                        }}
                                    />
                                    <Label htmlFor="type">Embed</Label>
                                </div>
                            </>
                        )}
                        <Textarea
                            id="text"
                            placeholder={
                                opened == "text"
                                    ? "Write text content for the pin"
                                    : "Paste the link here"
                            }
                            className="col-span-4"
                            onChange={(e) => setText(e.target.value)}
                        />

                        {type == "video" && (
                            <>
                                <Label
                                    htmlFor="redirect"
                                    className="text-left col-span-2"
                                >
                                    Redirect Url
                                </Label>
                                <Input
                                    id="redirect"
                                    placeholder="Paste the link here"
                                    className="col-span-4"
                                    onChange={(e) =>
                                        setRedirectUrl(e.target.value)
                                    }
                                />
                            </>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
