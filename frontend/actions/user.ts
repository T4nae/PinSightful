import axios from "axios";

export interface user {
    userId: string;
    name: string;
    email: string;
    pinboards?: string[];
    createdAt?: string;
}

export async function setUser(user: user) {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${user.userId}`,
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
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/${userId}`,
            {
                params: {
                    userId,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error(error);
    }
}
