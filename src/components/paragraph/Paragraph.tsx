"use client";

import { SyntheticEvent, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ParagraphDetails from "@/components/paragraph/ParagraphDetails";
import {
    EXPANDED_CONCORDANCE,
    EXPANDED_CONCORDANCE_CONTEXT_ERROR,
    EXPANDED_CONCORDANCE_ERROR,
    SELECTED_TAB,
    SELECTED_WORD,
} from "@/constants";
import { SentenceBundle } from "@/data/searchv2";
import { SentenceContext } from "@/data/sentence";
import Concordance from "@/design-system/Concordance";
import { getCleanSentenceWords } from "@/util/filter.util";
import { isInContext } from "@/util/highlight.util";
import { getMaxLeftDistance, getMaxRightDistance } from "@/util/math.util";
import { parseSearchParams } from "@/util/parsing.util";
import { createUrl } from "@/util/util";

interface ParagraphProps {
    sentenceBundle: SentenceBundle;
    origSentenceContext?: SentenceContext;
    corrSentenceContext?: SentenceContext;
}

export default function Paragraph({ sentenceBundle, origSentenceContext, corrSentenceContext }: ParagraphProps) {
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const parsedFilters = useMemo(() => parseSearchParams(searchParams), [searchParams]);
    const paragraphId = sentenceBundle.orig?.paragraphId ?? sentenceBundle.corr?.paragraphId ?? "-1";
    const errId = sentenceBundle.keyword.errors.at(0)?.id;

    const sourceSentence = parsedFilters.searchSource === "ORIG" ? sentenceBundle.orig : sentenceBundle.corr;
    const cleanSourceSentence = getCleanSentenceWords(sourceSentence?.words ?? []);
    const cleanKeywordIndex = cleanSourceSentence.findIndex((w) => w.id === sentenceBundle.keyword.id);

    const leftDistance = getMaxLeftDistance(parsedFilters);
    const rightDistance = getMaxRightDistance(parsedFilters);

    const contextWords = cleanSourceSentence?.filter((w, index) =>
        isInContext(
            w,
            index,
            cleanKeywordIndex,
            parsedFilters.context,
            parsedFilters.advContext,
            leftDistance,
            rightDistance,
        ),
    );
    const contextErrId = sentenceBundle.keyword.contextErrors.find((e) => e.wordId === contextWords?.at(0)?.id)?.id;

    const isOpen = useMemo(() => {
        const base =
            searchParams.get(EXPANDED_CONCORDANCE) == sentenceBundle.keywordId &&
            errId !== undefined &&
            searchParams.get(EXPANDED_CONCORDANCE_ERROR) == String(errId);

        if (contextErrId !== undefined) {
            return base && searchParams.get(EXPANDED_CONCORDANCE_CONTEXT_ERROR) == String(contextErrId);
        }
        return base;
    }, [searchParams, sentenceBundle, errId, contextErrId]);

    const onToggle = (e: SyntheticEvent<HTMLDetailsElement, MouseEvent>) => {
        const newParams = new URLSearchParams(searchParams);
        if (e.currentTarget.open) {
            newParams.set(EXPANDED_CONCORDANCE, sentenceBundle.keywordId);
            errId && newParams.set(EXPANDED_CONCORDANCE_ERROR, String(errId));
            contextErrId && newParams.set(EXPANDED_CONCORDANCE_CONTEXT_ERROR, String(contextErrId));
        } else {
            newParams.delete(SELECTED_TAB);
            newParams.delete(SELECTED_WORD);
        }

        router.replace(createUrl(path, newParams), { scroll: false });
    };

    return (
        <details onToggle={onToggle} open={isOpen} className="even:bg-surface-static-secondary" data-id={paragraphId}>
            <summary className="list-none cursor-pointer">
                <Concordance
                    parsedFilters={parsedFilters}
                    sentenceBundle={sentenceBundle}
                    origSentenceContext={origSentenceContext}
                    corrSentenceContext={corrSentenceContext}
                />
            </summary>

            {isOpen && (
                <ParagraphDetails
                    id={paragraphId}
                    keyword={sentenceBundle.keyword}
                    keywordErrId={errId}
                    sentenceBundle={sentenceBundle}
                />
            )}

            {isOpen && <hr className="text-static-border mt-4" />}
        </details>
    );
}
