import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getSentencesContext } from "@/data/sentence";
import { isDev } from "@/util/util";

const cachedSentenceContext = unstable_cache(async (sentenceIds) => getSentencesContext(sentenceIds), undefined, {
    revalidate: isDev ? false : 60 * 60,
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawSentenceIdsList = searchParams.get("s");
    const sentenceIds = rawSentenceIdsList?.split(",") ?? [];

    const result = await cachedSentenceContext(sentenceIds);
    return NextResponse.json(result);
}
