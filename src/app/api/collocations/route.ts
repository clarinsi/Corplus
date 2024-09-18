import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getPaginatedCollocations } from "@/data/collocation";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedCollocationResults = unstable_cache(
    async (lemma, parsedSearchFilters) => getPaginatedCollocations(lemma, parsedSearchFilters, 25),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lemma = searchParams.get("lemma");
    const parsedSearchFilters = parseSearchParams(searchParams);

    const result = await cachedCollocationResults(lemma, parsedSearchFilters).catch(() => undefined);
    if (!result) return NextResponse.json({ error: "No results found" }, { status: 400 });
    return NextResponse.json(result);
}
