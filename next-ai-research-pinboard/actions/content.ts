import axios from "axios";

interface Content {
    _id?: string;
    type?: "text" | "video" | "image";
    userId?: string;
    pinBoardId?: string;
    pinId?: string;
    text?: string;
    url?: string;
    createdAt?: string;
    pin?: string;
    redirect?: string;
}

export const addContent = async (content: Content) => {
    try {
        if (content.type === "text") {
            let res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/add-text`,
                {
                    ...content,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data;
        } else if (content.type === "video" || content.type === "image") {
            let res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/add-video`,
                {
                    ...content,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data;
        } else return null;
    } catch (error) {
        return null;
    }
};

export const getContents = async (
    userId: string,
    pinboardId: string,
    pinId: string
) => {
    try {
        // get from both texts and videos then merge them together and return them as one array
        let resText = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-texts/${userId}/${pinboardId}/${pinId}`
        );
        let resVideo = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-videos/${userId}/${pinboardId}/${pinId}`
        );

        return {
            texts: resText.data,
            videos: resVideo.data,
        };
    } catch (error) {
        return null;
    }
};
