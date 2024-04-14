"use client";

import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { EllipsisVertical, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pinboard, removePinboard } from "@/actions/pinboard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RemovePinboard({
    userId,
    pinboard,
    setAddedPinboard,
}: {
    userId: string;
    pinboard: Pinboard;
    setAddedPinboard: Dispatch<SetStateAction<Pinboard | null>>;
}) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        await removePinboard(userId, pinboard._id!);

        setAddedPinboard(pinboard);
        setOpen(false);
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <EllipsisVertical size={24} className="cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="w-full grid grid-cols-3"
                            onClick={() => setOpen(true)}
                        >
                            <Trash
                                size={16}
                                className="col-span-1 text-red-600"
                            />
                            <p className="col-span-2 text-center">Remove</p>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={open}>
                <DialogContent
                    className="sm:max-w-md"
                    onEscapeKeyDown={handleClose}
                    onPointerDownOutside={handleClose}
                    onInteractOutside={handleClose}
                >
                    <DialogHeader>
                        <DialogTitle>Remove Pinboard</DialogTitle>
                        <DialogDescription className="flex">
                            Are you sure you want to remove&nbsp;
                            <span className="font-semibold">
                                {pinboard.name}
                            </span>
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="name" className="text-right pr-2">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="confirm by typing the name of the pinboard"
                        />
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleSubmit}
                                disabled={name !== pinboard.name}
                            >
                                Delete Permanently
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
