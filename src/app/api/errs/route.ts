import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getErrsFilters } from "@/data/errs";
import { ParsedSearchFilters } from "@/types/search.types";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedErrorsFilters = unstable_cache(
    (parsedFilters: ParsedSearchFilters) => getErrsFilters(parsedFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsedSearchFilters = parseSearchParams(searchParams);

    const result = await cachedErrorsFilters(parsedSearchFilters).catch(() => undefined);
    if (!result) return NextResponse.json({ error: "No results found" }, { status: 400 });
    return NextResponse.json(result);
}
