import { NextResponse } from "next/server";
import axios from "axios";
import { auth } from "@clerk/nextjs";
import { SearchResult } from "@/actions/web-search";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");
        const timerange = searchParams.get("timerange");
        const region = searchParams.get("region");
        const numResults = Number(searchParams.get("numResults"));
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!query || !numResults) {
            return new NextResponse("Bad request", { status: 400 });
        }

        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/search`,
            {
                params: {
                    query,
                    timerange,
                    region,
                    numResults,
                },
            }
        );
        const data: SearchResult = res.data;
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.log("[SEARCH_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
