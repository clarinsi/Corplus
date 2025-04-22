import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getWordClass } from "@/data/wordclass";
import { ParsedSearchFilters } from "@/types/search.types";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedWordClassFilters = unstable_cache(
    (parsedFilters: ParsedSearchFilters) => getWordClass(parsedFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsedFilters = parseSearchParams(searchParams);

    const forms = await cachedWordClassFilters(parsedFilters).catch(() => undefined);
    if (!forms) return NextResponse.json("No data found", { status: 400 });
    return NextResponse.json(forms);
}
