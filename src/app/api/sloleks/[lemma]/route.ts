import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: {
        lemma: string;
    };
}

export async function GET(req: NextRequest, { params }: Params) {
    const lemma = params.lemma;

    const response = await fetch(`https://viri.cjvt.si/sloleks/ajax_api/v1/slv/search_prefix/${lemma}`, {
        next: {
            revalidate: 60 * 60 * 12, // 12 hours
        },
    });
    const responseJson = await response.json();
    if (!response || !responseJson || responseJson.length < 1) return NextResponse.json({ status: 400 });
    return NextResponse.json(responseJson.at(0));
}
