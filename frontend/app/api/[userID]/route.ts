import { NextResponse } from "next/server";
import axios from "axios";
import { user } from "@/actions/user";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
    req: Request,
    { params }: { params: { userID: string } }
) {
    try {
        const body: user = await req.json();

        if (!body.userId || !body.name || !body.email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/add-user`,
            {
                ...body,
            }
        );

        const data: user = res.data;
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.log("[USER_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { userID: string } }
) {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-user/${params.userID}`
        );

        const data: user = res.data;
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.log("[USER_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
