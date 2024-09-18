import { getFormatter, getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { getStats } from "@/data/meta";
import Stats from "@/design-system/Stats";

const cachedStats = unstable_cache(getStats);

export default async function StatsWrapper() {
    const t = await getTranslations("Index");
    const formatter = await getFormatter();
    const stats = await cachedStats();

    return (
        <>
            <Stats title={t("stats.words")} value={formatter.number(stats.wordCount)} />
            <Stats title={t("stats.sentences")} value={formatter.number(stats.sentenceCount)} />
            <Stats title={t("stats.paragraphs")} value={formatter.number(stats.paragraphCount)} />
            <Stats title={t("stats.paragraphs-corrected")} value={formatter.number(stats.correctedParagraphCount)} />
        </>
    );
}
