import axios from "axios";

export interface Pinboard {
    _id?: string;
    userId: string;
    name: string;
    preview?: string;
    pins?: string[];
    createdAt?: string;
}

export async function addPinboard(pinboard: Pinboard) {
    try {
        let res = await axios.post(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${pinboard.userId}/pinboard`,
            {
                ...pinboard,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error(error);
    }
}

export async function getPinboard(userId: string, pinboardId: string) {
    try {
        let res = await axios.get(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${userId}/${pinboardId}`
        );
        return res.data;
    } catch (error) {
        console.error(error);
    }
}

export async function getPinboards(userId: string): Promise<Pinboard[] | null> {
    try {
        let res = await axios.get(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${userId}/pinboard`
        );
        return res.data;
    } catch (error) {
        return null;
    }
}

export async function removePinboard(userId: string, pinboardId: string) {
    try {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${userId}/${pinboardId}`
        );
    } catch (error) {
        console.error(error);
    }
}

export async function updatePinboard(
    pinboard: Pinboard,
    pinboardId: string,
    userId: string
) {
    try {
        await axios.put(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${userId}/${pinboardId}`,
            {
                ...pinboard,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error(error);
    }
}
