import { NextResponse } from "next/server";
import axios from "axios";
import { auth } from "@clerk/nextjs";
import { content } from "@/actions/pin";

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
    {
        params,
    }: { params: { userID: string; pinboardID: string; pinID: string } }
) {
    try {
        const body: content = await req.json();

        const { userId } = auth();

        if (!userId || userId !== params.userID) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/add-video`,
            {
                ...body,
            }
        );

        const data: content = res.data;
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.log("[VIDEO_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    {
        params,
    }: { params: { userID: string; pinboardID: string; pinID: string } }
) {
    try {
        const { userId } = auth();

        if (!userId || userId !== params.userID) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/get-videos/${params.userID}/${params.pinboardID}/${params.pinID}`
        );
        const data: content[] = res.data;
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.log("[VIDEO_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
