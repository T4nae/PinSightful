import { NextResponse } from "next/server";
import axios from "axios";
import { Pinboard } from "@/actions/pinboard";
import { auth } from "@clerk/nextjs";
import { pin } from "@/actions/pin";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(
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

        const body: pin = await req.json();

        const res = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/update-pin/${params.userID}/${params.pinboardID}/${params.pinID}`,
            {
                ...body,
            }
        );

        const data: pin = res.data;
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.log("[PIN_PUT]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
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

        const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/delete-pin/${params.userID}/${params.pinboardID}/${params.pinID}`
        );
        return new NextResponse(res.data, { headers: corsHeaders });
    } catch (error) {
        console.log("[PIN_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
