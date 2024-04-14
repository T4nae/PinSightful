import axios from "axios";

export interface SearchRequest {
    query: string;
    timerange: string;
    region: string;
    numResults: number;
}

export interface SearchResult {
    title: string;
    snippet: string;
    link: string;
}

export async function webSearch(
    search: SearchRequest
): Promise<SearchResult[]> {
    const results = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/search`,
        {
            params: {
                query: search.query,
                timerange: search.timerange,
                region: search.region,
                numResults: search.numResults,
            },
        }
    );

    return results.data;
}
