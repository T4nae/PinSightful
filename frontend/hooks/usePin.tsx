import { create } from "zustand";

import { getContents } from "@/actions/content";
import { content, getPins, pin } from "@/actions/pin";
import { getPinboard, Pinboard } from "@/actions/pinboard";

interface usePin {
    pinboard: Pinboard | null;
    pins: pin[];
    pointer: { x: number; y: number } | null;
    setPointer: (x: number, y: number) => void;
    setPins: (userId: string, pinboardId: string) => void;
    updateLoadedPin: (pin: pin) => void;
    hoveredPin: pin | null;
    setHoveredPin: (pin: pin | null) => void;
    loadImages: () => void;
    embeds: {
        embed: string;
        x: number;
        y: number;
    }[];
    setEmbeds: (embeds: { embed: string; x: number; y: number }[]) => void;
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
        var pinsData = await getPins(userId, pinboardId);
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
    updateLoadedPin: (pin: pin) => {
        const pins = get().pins;
        const index = pins.findIndex((p) => p._id === pin._id);
        pins[index] = pin;
        set({ pins });
    },
    hoveredPin: null,
    setHoveredPin: (hoveredPin: pin | null) => set({ hoveredPin }),
    notFound: false,
    loadImages: () => {
        const pins = get().pins;
        pins.forEach((pin) => {
            if (!pin.videos) return;
            for (let i = 0; i < pin.videos.length; i++) {
                const img = new Image();
                img.src = (pin.videos[i] as content).url!;
                img.setAttribute("crossorigin", "anonymous");
                img.onload = () => ((pin.videos![i] as content).image = img);
            }
        });
        set({ pins });
    },
    embeds: [],
    setEmbeds: (embeds: { embed: string; x: number; y: number }[]) =>
        set({ embeds }),
    overEmbed: null,
    setOverEmbed: (embed: string | null) => set({ overEmbed: embed }),
    setNotFound: (notFound: boolean) => set({ notFound }),
}));
