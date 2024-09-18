import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getPaginatedSearchResultsv2 } from "@/data/searchv2";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedSearchResults = unstable_cache(
    async (parsedSearchFilters) => getPaginatedSearchResultsv2(parsedSearchFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsedSearchFilters = parseSearchParams(searchParams);

    const result = await cachedSearchResults(parsedSearchFilters).catch(() => undefined);
    if (!result) return NextResponse.json({ error: "No results found" }, { status: 400 });
    return NextResponse.json(result);
}
