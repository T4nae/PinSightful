import axios from "axios";

interface user {
    userId: string;
    name: string;
    email: string;
    pinboards?: string[];
    createdAt?: string;
}

export async function setUser(user: user) {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/add-user`,
            {
                ...user,
            }
        );
        return res.data;
    } catch (error) {
        console.error(error);
    }
}

export async function getUser(userId: string) {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-user/${userId}`
        );
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
