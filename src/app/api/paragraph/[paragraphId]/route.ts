import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getParagraphData } from "@/data/paragraph";
import { isDev } from "@/util/util";

interface Params {
    params: {
        paragraphId: string;
    };
}

const cachedData = unstable_cache((paragraphId, keywordId) => getParagraphData(paragraphId, keywordId), undefined, {
    revalidate: isDev ? false : 60 * 60,
});

export async function GET(req: NextRequest, { params }: Params) {
    const { searchParams } = new URL(req.url);
    const paragraphId = params.paragraphId;
    const keywordId = searchParams.get("keywordId");

    const paragraph = await cachedData(paragraphId, keywordId);
    if (!paragraph) return NextResponse.json("Paragrpah not found", { status: 400 });
    return NextResponse.json(paragraph);
}
