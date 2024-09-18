import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getPaginatedLists } from "@/data/list";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedListResults = unstable_cache(
    async (parsedSearchFilters) => getPaginatedLists(parsedSearchFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsedSearchFilters = parseSearchParams(searchParams);

    const result = await cachedListResults(parsedSearchFilters).catch(() => undefined);
    if (!result) return NextResponse.json({ error: "No results found" }, { status: 400 });
    return NextResponse.json(result);
}
