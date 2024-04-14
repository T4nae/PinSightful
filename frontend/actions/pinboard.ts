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
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/add-pinboard`,
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
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-pinboard/${userId}/${pinboardId}`
        );
        return res.data;
    } catch (error) {
        console.error(error);
    }
}

export async function getPinboards(userId: string): Promise<Pinboard[] | null> {
    try {
        let res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-pinboards/${userId}`
        );
        return res.data;
    } catch (error) {
        return null;
    }
}

export async function removePinboard(userId: string, pinboardId: string) {
    try {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/delete-pinboard/${userId}/${pinboardId}`
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
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/update-pinboard/${userId}/${pinboardId}`,
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
