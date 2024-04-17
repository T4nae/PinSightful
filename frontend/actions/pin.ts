import axios from "axios";

export interface content {
    _id: string;
    pin: string;
    text?: string;
    url?: string;
    createdAt: string;
    type?: "text" | "video" | "image";
    redirect?: string;
    image?: HTMLImageElement;
}

export interface pin {
    _id?: string;
    pinId?: string;
    userId: string;
    pinBoardId?: string;
    pos: { x: number; y: number };
    texts?: string[] | content[];
    videos?: string[] | content[];
    pinboard?: string;
    height?: number;
}

export const addPin = async (pin: pin) => {
    try {
        let res = await axios.post(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${pin.userId}/${pin.pinBoardId}/pin`,
            {
                ...pin,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    } catch (error) {
        return null;
    }
};

export const getPins = async (userId: string, pinboardId: string) => {
    try {
        let res = await axios.get(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${userId}/${pinboardId}/pin`
        );
        return res.data;
    } catch (error) {
        return null;
    }
};

export const removePin = async (pin: pin) => {
    try {
        let res = await axios.delete(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${pin.userId}/${pin.pinBoardId}/${pin.pinId}`
        );
        return res.data;
    } catch (error) {
        return null;
    }
};

export const updatePin = async (pin: pin) => {
    try {
        let res = await axios.put(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${pin.userId}/${pin.pinBoardId}/${pin.pinId}`,
            {
                ...pin,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    } catch (error) {
        return null;
    }
};
