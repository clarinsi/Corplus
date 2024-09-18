import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBiblFilters } from "@/data/filters";
import { BiblInsert } from "@/db/schema";
import { parseSearchParams } from "@/util/parsing.util";
import { isDev } from "@/util/util";

interface Params {
    params: {
        args: string[];
    };
}

const cachedFilters = unstable_cache((type, searchParams) => getBiblFilters(type, searchParams), undefined, {
    revalidate: isDev ? false : 60 * 60,
});
const allowedTypes: (keyof BiblInsert)[] = ["FirstLang", "TaskSetting", "ProficSlv", "ProgramType", "InputType"];

export async function GET(req: NextRequest, { params }: Params) {
    const { args } = params;
    const biblType = args.at(0);

    const { searchParams } = new URL(req.url);
    const parsedFilters = parseSearchParams(searchParams);

    if (!biblType) return NextResponse.json("No type provided", { status: 400 });
    if (!allowedTypes.includes(biblType as never)) return NextResponse.json("Type not allowed", { status: 400 });

    const filters = await cachedFilters(biblType, parsedFilters).catch(() => undefined);
    if (!filters) return NextResponse.json("No data found", { status: 400 });
    return NextResponse.json(filters);
}
