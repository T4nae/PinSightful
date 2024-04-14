"use client";

import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPinboard, Pinboard } from "@/actions/pinboard";

export default function AddNewPinboard({
    userId,
    setAddedPinboard,
}: {
    userId: string;
    setAddedPinboard: Dispatch<SetStateAction<Pinboard | null>>;
}) {
    const [name, setName] = useState("new pinboard");

    const handleSubmit = async (event: FormEvent) => {
        // event.preventDefault();

        // create new pinboard
        const pinboard = await addPinboard({ name, userId });
        setAddedPinboard(pinboard);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link">
                    <PlusCircle
                        size={32}
                        className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-200 ease-in-out md:text-blue-600 lg:text-blue-800"
                    />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create new Pinboard</DialogTitle>
                    <DialogDescription>
                        Fill in the fields below to create a new pinboard
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="new pinboard"
                            className="col-span-3"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!name}
                        >
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
