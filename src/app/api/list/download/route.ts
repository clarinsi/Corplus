import { getFormatter, getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { downloadListSearchResults } from "@/data/download/list";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";
import dayjs from "dayjs";

const cachedListResultsDownload = unstable_cache(
    async (translations, formatter, parsedSearchFilters) =>
        downloadListSearchResults(translations, formatter, parsedSearchFilters),
    undefined,
    {
        revalidate: isDev ? false : 60 * 60,
    },
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsedSearchFilters = parseSearchParams(searchParams);
    const locale = searchParams.get("locale") || "sl";
    const translations = await getTranslations({ locale });
    const formatter = await getFormatter({ locale });

    const result = await cachedListResultsDownload(translations, formatter, parsedSearchFilters).catch((e) => {
        console.log(e);
        return undefined;
    });
    if (!result) return NextResponse.json({ error: "No results found" }, { status: 400 });

    const timestamp = dayjs().format("YYYYMMDDHHmmss");
    const filename = `${translations("Export.filename")}-${translations("Export.list")}-${timestamp}.tsv`;

    return new NextResponse(result, {
        status: 200,
        headers: {
            "Content-Type": "text/tsv",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
