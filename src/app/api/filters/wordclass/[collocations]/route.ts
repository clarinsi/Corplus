import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getCollocationsWordClass } from "@/data/wordclass";
import { ParsedSearchFilters } from "@/types/search.types";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedWordClassFilters = unstable_cache(
    (lemma: string, parsedFilters: ParsedSearchFilters) => getCollocationsWordClass(lemma, parsedFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lemma = searchParams.get("lemma");
    const parsedFilters = parseSearchParams(searchParams);
    if (!lemma) return NextResponse.json("No lemma provided", { status: 400 });

    const forms = await cachedWordClassFilters(lemma, parsedFilters).catch(() => undefined);
    if (!forms) return NextResponse.json("No data found", { status: 400 });
    return NextResponse.json(forms);
}
