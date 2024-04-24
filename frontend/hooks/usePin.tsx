import { create } from "zustand";

import { content, getPins, pin } from "@/actions/pin";
import { getPinboard, Pinboard } from "@/actions/pinboard";

interface usePin {
    pinboard: Pinboard | null;
    pins: pin[];
    pointer: { x: number; y: number } | null;
    setPointer: (x: number, y: number) => void;
    setPins: (userId: string, pinboardId: string) => void;
    updatePins: (pins: pin[]) => void;
    updateLoadedPin: (pin: pin) => void;
    hoveredPin: pin | null;
    setHoveredPin: (pin: pin | null) => void;
    loadImages: () => void;
    embeds: {
        _id: string;
        embed: string;
        x: number;
        y: number;
    }[];
    setEmbeds: (
        embeds: { _id: string; embed: string; x: number; y: number }[]
    ) => void;
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
        set({ embeds: []});
        const data = await getPinboard(userId, pinboardId);
        if (!data) {
            set({ notFound: true });
            return;
        }
        set({ pinboard: data });
        var pinsData = await getPins(userId, pinboardId);
        if (!pinsData) return;
        set({ pins: pinsData });
    },
    updatePins: (pins: pin[]) => {
        set({ pins });
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
        const pins: pin[] = get().pins;
        pins.forEach((pin: pin) => {
            if (!pin.videos) return;
            for (let i = 0; i < pin.videos.length; i++) {
                const img = new Image();
                img.src = (pin.videos[i] as content).url!;
                img.setAttribute("crossorigin", "anonymous");
                (pin.videos![i] as content).image = img;
            }
        });
        set({ pins });
    },
    embeds: [],
    setEmbeds: (
        embeds: { _id: string; embed: string; x: number; y: number }[]
    ) => set({ embeds }),
    overEmbed: null,
    setOverEmbed: (embed: string | null) => set({ overEmbed: embed }),
    setNotFound: (notFound: boolean) => set({ notFound }),
}));
