import { create } from "zustand";

import { getContents } from "@/actions/content";
import { getPins, pin } from "@/actions/pin";
import { getPinboard, Pinboard } from "@/actions/pinboard";

interface usePin {
    pinboard: Pinboard | null;
    pins: pin[];
    pointer: { x: number; y: number } | null;
    setPointer: (x: number, y: number) => void;
    setPins: (userId: string, pinboardId: string) => void;
    addPin: (pin: pin) => void;
    hoveredPin: pin | null;
    setHoveredPin: (pin: pin | null) => void;
    embeds: {
        embed: string;
        x: number;
        y: number;
    }[];
    addEmbed: (embed: string, x: number, y: number) => void;
    overEmbed: string | null;
    setOverEmbed: (embed: string | null) => void;
    notFound: boolean;
    setNotFound: (notFound: boolean) => void;
}

export const usePin = create<usePin>((set, get) => ({
    pinboard: null,
    pins: [],
    pointer: null,
    setPointer: (x: number, y: number) => {
        set({ pointer: { x, y } });
    },
    setPins: async (userId: string, pinboardId: string) => {
        const data = await getPinboard(userId, pinboardId);
        if (!data) {
            set({ notFound: true });
            return;
        }
        set({ pinboard: data });
        const pinsData = await getPins(userId, pinboardId);
        if (!pinsData) return;
        for (let pin of pinsData) {
            const content = await getContents(userId, pinboardId, pin._id);
            if (content) {
                pin.texts = content.texts;
                pin.videos = content.videos;
            }
        }
        set({ pins: pinsData });
    },
    addPin: (pin: pin) => {
        const pins = get().pins;
        set({ pins: [...pins, pin] });
    },
    hoveredPin: null,
    setHoveredPin: (hoveredPin: pin | null) => set({ hoveredPin }),
    notFound: false,
    embeds: [],
    addEmbed: (embed: string, x: number, y: number) => {
        const embeds = get().embeds;
        set({ embeds: [...embeds, { embed, x, y }] });
    },
    overEmbed: null,
    setOverEmbed: (embed: string | null) => set({ overEmbed: embed }),
    setNotFound: (notFound: boolean) => set({ notFound }),
}));
