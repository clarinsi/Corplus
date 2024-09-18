import { Fragment, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ParagraphData } from "@/data/paragraph";
import { WordData } from "@/data/searchv2";
import { WordInsert } from "@/db/schema";
import { isHighlighted } from "@/util/highlight.util";
import { decodeAna } from "@/util/parsing.util";
import { getSelectedWordError, punctuationRegex } from "@/util/util";
import { clsx } from "clsx";

interface TabProps {
    data: ParagraphData;
    sentenceId?: string;
    keyword: WordData;
    keywordErrId?: number;
}

export default function ParagraphCorrTab({ data, sentenceId, keyword, keywordErrId }: TabProps) {
    const tParagraph = useTranslations("Paragraph");
    const tFilters = useTranslations("Filters");
    const corrParagraph = data.corrParagraph;
    const errorTargetIds = useMemo(
        () =>
            data.origErrors.flatMap((e) => {
                let out = [];
                if (e.origWordId) out.push(e.origWordId);
                if (e.corrWordId) out.push(e.corrWordId);
                return out;
            }),
        [data],
    );
    const sentence = corrParagraph?.sentences.find((s) => s.id === sentenceId);

    const keywordErrorGroup = useMemo(
        () => getSelectedWordError(keyword.id, data.origErrors ?? [], keyword, keywordErrId)?.groupId,
        [keyword, data, keywordErrId],
    );

    const generateWord = (w: Pick<WordInsert, "id" | "ana" | "text" | "lemma">) => {
        const wordErrorGroup = getSelectedWordError(w.id, data.origErrors ?? [], keyword, keywordErrId);
        const isTarget = errorTargetIds.includes("#" + w.id);
        const isLemma =
            isHighlighted(w, keyword, "CORR") || (wordErrorGroup && wordErrorGroup.groupId === keywordErrorGroup);
        const isPunctuation = punctuationRegex.test(w.text);

        const dynamicClasses = clsx(isLemma && "font-bold", isTarget && "text-semantic-correct");

        if (isLemma || isTarget) {
            return (
                <Fragment key={w.id}>
                    {!isPunctuation && " "}
                    <span className={dynamicClasses}>{w.text}</span>
                </Fragment>
            );
        }

        return (
            <Fragment key={w.id}>
                {!isPunctuation && " "}
                {w.text}
            </Fragment>
        );
    };

    if (!corrParagraph) return <>No data</>;

    return (
        <div className="px-4 flex gap-4 justify-between">
            <div className="flex flex-col gap-4 grow">
                <div className="bg-surface-static-secondary rounded-md p-4">
                    <p className="example text-justify">
                        {corrParagraph.sentences.map((s) => s.words.map(generateWord))}
                    </p>

                    <span className="caption text-light-grey">{tParagraph("corr")}</span>
                </div>

                <div className="flex flex-col">
                    <div className="grid grid-cols-6 caption-emphasised bg-surface-static-secondary text-left">
                        <p className="p-4">{tParagraph("details.word")}</p>
                        <p className="p-4">{tParagraph("details.lemma")}</p>
                        <p className="p-4 col-span-3">{tParagraph("details.lemmaFeatures")}</p>
                        <p className="p-4">{tParagraph("details.correctedType")}</p>
                    </div>

                    {sentence?.words.map((w) => {
                        const wordError = getSelectedWordError(w.id, data.origErrors, keyword, keywordErrId);
                        const rowStyle = clsx(
                            "grid grid-cols-6 caption odd:bg-surface-static-secondary",
                            isHighlighted(w, keyword, "CORR") && "!font-bold",
                        );

                        return (
                            <div key={w.id} className={rowStyle}>
                                <p className="p-4">{w.text}</p>
                                <p className="p-4">{w.lemma}</p>
                                <p className="p-4 col-span-3">
                                    {/* @ts-expect-error - next-intl doesn't like raw on parent items */}
                                    {decodeAna(w.ana, tFilters.raw("Category"), tFilters.raw("Schema"))}
                                </p>
                                <p className="p-4">{wordError?.type ?? "/"}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
