import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { SEARCH_SOURCE, TEXTS_FILTER } from "@/constants";
import { getCorpusSize } from "@/data/meta";
import { parseSearchSource } from "@/util/parsing.util";
import { isDev } from "@/util/util";

const cachedData = unstable_cache((type, withErrors) => getCorpusSize(type, withErrors), undefined, {
    revalidate: isDev ? false : 60 * 60,
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const searchSource = parseSearchSource(searchParams.get(SEARCH_SOURCE));
    const withErrors = searchParams.get(TEXTS_FILTER) === "with-error";
    const dbResult = await cachedData(searchSource, withErrors);
    return NextResponse.json({ count: dbResult });
}
