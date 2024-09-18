import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAndCountLemmaForms } from "@/data/lemma";
import { ParsedSearchFilters } from "@/types/search.types";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

interface Params {
    params: {
        searchString: string;
    };
}

const cachedLemmaFormsFilters = unstable_cache(
    (searchString: string, parsedFilters: ParsedSearchFilters) => getAndCountLemmaForms(searchString, parsedFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest, { params }: Params) {
    const { searchString } = params;

    const { searchParams } = new URL(req.url);
    const parsedFilters = parseSearchParams(searchParams);

    if (!searchString) return NextResponse.json("No search string provided", { status: 400 });

    const forms = await cachedLemmaFormsFilters(searchString, parsedFilters).catch(() => undefined);
    if (!forms) return NextResponse.json("No data found", { status: 400 });
    return NextResponse.json(forms);
}
