import { Fragment, MouseEvent, ReactNode, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EXPANDED_CONCORDANCE_CONTEXT_ERROR, SELECTED_WORD } from "@/constants";
import { ParagraphData } from "@/data/paragraph";
import { SentenceBundle } from "@/data/searchv2";
import { TextSource, WordInsert } from "@/db/schema";
import { getCleanSentenceWords } from "@/util/filter.util";
import { isHighlighted, isInContext } from "@/util/highlight.util";
import { getMaxLeftDistance, getMaxRightDistance } from "@/util/math.util";
import { parseSearchParams } from "@/util/parsing.util";
import { createUrl, getSelectedWordError, punctuationRegex } from "@/util/util";
import { clsx } from "clsx";

interface TabProps {
    data: ParagraphData;
    sentenceBundle: SentenceBundle;
    keywordErrId?: number;
}

export default function ParagraphCompareTab({ data, sentenceBundle, keywordErrId }: TabProps) {
    const tParagraph = useTranslations("Paragraph");
    const tMeta = useTranslations("Metadata");
    const tErrs = useTranslations("ErrorCodes");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const parsedFilters = parseSearchParams(searchParams);
    const contextWordErrId = searchParams.get(EXPANDED_CONCORDANCE_CONTEXT_ERROR) || undefined;
    const { keyword } = sentenceBundle;

    const origKeyword = keyword.id.includes("s.") ? keyword : sentenceBundle.orig?.words.find((w) => w.isKeyword);
    const corrKeyword = keyword.id.includes("t.") ? keyword : sentenceBundle.corr?.words.find((w) => w.isKeyword);

    // Filter out any special characters since they are not counted as words in distance calculations
    const cleanOrigSentence = getCleanSentenceWords(sentenceBundle.orig?.words ?? []);
    const cleanCorrSentence = getCleanSentenceWords(sentenceBundle.corr?.words ?? []);
    const cleanOrigKeywordIndex = cleanOrigSentence.findIndex((w) => w.id === origKeyword?.id);
    const cleanCorrKeywordIndex = cleanCorrSentence.findIndex((w) => w.id === corrKeyword?.id);

    const errorTargetIds =
        data.origErrors?.flatMap((e) => {
            let out = [];
            if (e.origWordId) out.push(e.origWordId);
            if (e.corrWordId) out.push(e.corrWordId);
            return out;
        }) ?? [];

    const selectedWordError = useMemo(
        () =>
            getSelectedWordError(
                searchParams.get(SELECTED_WORD),
                data.origErrors ?? [],
                keyword,
                keywordErrId,
                contextWordErrId,
            ),
        [searchParams, data, keyword, keywordErrId, contextWordErrId],
    );

    const keywordErrorGroup = useMemo(
        () => getSelectedWordError(keyword.id, data.origErrors ?? [], keyword, keywordErrId)?.groupId,
        [keyword, data, keywordErrId],
    );

    const onWordClick = (e: MouseEvent<HTMLButtonElement>) => {
        const newParams = new URLSearchParams(searchParams);
        const errGroupId = e.currentTarget.getAttribute("data-id");

        if (!errGroupId) return;

        newParams.set(SELECTED_WORD, errGroupId);
        router.replace(createUrl(path, newParams), { scroll: false });
    };

    const leftDistance = getMaxLeftDistance(parsedFilters);
    const rightDistance = getMaxRightDistance(parsedFilters);

    const generateWord = (w: Pick<WordInsert, "id" | "lemma" | "text">, type: TextSource) => {
        const cleanKeywordIndex = type === "ORIG" ? cleanOrigKeywordIndex : cleanCorrKeywordIndex;
        const sentence = type === "ORIG" ? cleanOrigSentence : cleanCorrSentence;
        const wordIndex = sentence.findIndex((w) => w.id === w.id);

        const wordErrorGroup = getSelectedWordError(w.id, data.origErrors ?? [], keyword, keywordErrId);
        const isTarget = errorTargetIds.includes(w.id);
        const isLemma =
            isHighlighted(w, keyword, type) ||
            isInContext(
                w,
                wordIndex,
                cleanKeywordIndex,
                parsedFilters.context,
                parsedFilters.advContext,
                leftDistance,
                rightDistance,
            ) ||
            (wordErrorGroup && wordErrorGroup.groupId === keywordErrorGroup);
        const isPunctuation = punctuationRegex.test(w.text);

        const dynamicClasses = clsx(
            isLemma && "font-bold",
            isTarget && "underline",
            isTarget && type === "ORIG" && "text-semantic-error",
            isTarget && type === "CORR" && "text-semantic-correct",
        );

        const Container = ({ children }: { children: ReactNode }) => (
            <Fragment key={w.id}>
                {!isPunctuation && " "}
                {children}
            </Fragment>
        );
        if (isTarget) {
            return (
                <Container>
                    <button className={dynamicClasses} data-id={w.id} onClick={onWordClick}>
                        {w.text}
                    </button>
                </Container>
            );
        }

        if (isLemma) {
            return (
                <Container>
                    <span className={dynamicClasses}>{w.text}</span>
                </Container>
            );
        }

        return <Container>{w.text}</Container>;
    };

    const mappedErrType = useMemo(() => selectedWordError?.type.split("|") ?? ["[???]"], [selectedWordError]);
    const selectedWordData = useMemo(() => {
        if (!selectedWordError) return null;

        const errorGroup = data.origErrors?.filter((e) => e.groupId === selectedWordError.groupId);

        const origIds = errorGroup?.map((e) => e.origWordId);
        const corrIds = errorGroup?.map((e) => e.corrWordId);

        const origSentenceId = origIds.at(0)?.slice(0, -4);
        const corrSentenceId = corrIds.at(0)?.slice(0, -4);

        const origSentence = data.sentences.find((s) => s.id === origSentenceId);
        const corrSentence = data.corrParagraph?.sentences.find((s) => s.id === corrSentenceId);

        const origWords = origSentence?.words.filter((w) => origIds?.includes(w.id)) ?? [];
        const corrWords = corrSentence?.words.filter((w) => corrIds?.includes(w.id)) ?? [];

        return { origWords, corrWords };
    }, [selectedWordError, data]);

    return (
        <div className="px-4 flex gap-4 justify-between">
            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col justify-between grow bg-surface-static-secondary rounded-md p-4 min-h-[8rem]">
                    <p className="example">{data.sentences.map((s) => s.words.map((w) => generateWord(w, "ORIG")))}</p>

                    <span className="caption text-light-grey mt-4">{tParagraph("orig")}</span>
                </div>

                <div className="flex flex-col justify-between grow bg-surface-static-secondary rounded-md p-4 min-h-[8rem]">
                    <p className="example">
                        {data.corrParagraph.sentences.map((s) => s.words.map((w) => generateWord(w, "CORR")))}
                    </p>
                    <span className="caption text-light-grey mt-4">{tParagraph("corr")}</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 shrink-0 w-64">
                <div className="bg-surface-static-secondary rounded-md p-4 flex flex-col justify-between h-40">
                    <h5 className="caption text-light-grey">{tParagraph("errorType")}</h5>

                    <div className="mt-2 grow flex flex-col justify-center">
                        <p className="text-semantic-error mb-3 body-2 h-5">
                            {selectedWordData?.origWords.map((w) =>
                                punctuationRegex.test(w.text) ? "" : " " + w.text,
                            )}
                        </p>
                        <p className="text-semantic-correct mb-3 body-2 h-5">
                            {selectedWordData?.corrWords.map((w) =>
                                punctuationRegex.test(w.text) ? "" : " " + w.text,
                            )}
                        </p>
                        <p className="caption">
                            {mappedErrType
                                .map((e) => {
                                    // @ts-expect-error - can't cast to lang type
                                    const er = tErrs.raw(e);

                                    return capitalize(er.category) + ": " + er.name;
                                })
                                .join(" | ")}
                        </p>
                    </div>
                </div>

                <div className="bg-surface-static-secondary rounded-md p-4 grow flex gap-6">
                    <div className="flex flex-col gap-6">
                        <MetaEntry title={tMeta("topic")} value={data.bibl.Topic} />
                        <MetaEntry title={tMeta("academicYear")} value={data.bibl.AcademicYear} />
                        <MetaEntry title={tMeta("taskSetting")} value={data.bibl.TaskSetting} />
                    </div>

                    <div className="flex flex-col gap-6">
                        <MetaEntry title={tMeta("proficSlv")} value={data.bibl.ProficSlv} />
                        <MetaEntry title={tMeta("programType")} value={data.bibl.ProgramType} />
                        <MetaEntry title={tMeta("inputType")} value={data.bibl.InputType} />
                        <MetaEntry title={tMeta("firstLang")} value={data.bibl.FirstLang} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaEntry({ title, value }: { title: string; value: string | null }) {
    return (
        <div className="flex flex-col gap-1">
            <h5 className="caption text-light-grey">{title}</h5>
            <span className="caption text-grey">{value || "/"}</span>
        </div>
    );
}

function capitalize(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
