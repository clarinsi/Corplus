import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getGlobalSpeakerLangFilters } from "@/data/filters";
import { ParsedSearchFilters } from "@/types/search.types";
import { isDev } from "@/util/util";

export const dynamic = "force-dynamic";

const cachedFirstLangFilters = unstable_cache(() => getGlobalSpeakerLangFilters({} as ParsedSearchFilters), undefined, {
    revalidate: isDev ? false : 60 * 60,
});

export async function GET() {
    const filters = await cachedFirstLangFilters();
    return NextResponse.json(filters);
}
