"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import ViewControl from "@/app/[locale]/[lemma]/ViewControl";
import SaveIcon from "@/assets/icons/SaveIcon";
import SearchResultsError from "@/components/SearchResultsError";
import SearchResultsLoader from "@/components/loaders/SearchResultsLoader";
import Paragraph from "@/components/paragraph/Paragraph";
import { SentenceBundle } from "@/data/searchv2";
import { SentenceContext } from "@/data/sentence";
import PaginateControl from "@/design-system/PaginateControl";
import { parseSearchParams } from "@/util/parsing.util";
import axios from "axios";

export default function SearchResults() {
    const locale = useLocale();
    const tComm = useTranslations("Filters.Common");
    const searchParams = useSearchParams();
    const parsedFilters = parseSearchParams(searchParams);

    const { data, isLoading, error } = useQuery<PaginatedResponse<SentenceBundle[]>>({
        retry: 1,
        queryKey: [
            "search-results",
            parsedFilters.page,
            parsedFilters.texts,
            parsedFilters.lemma,
            parsedFilters.firstLang,
            parsedFilters.taskSetting,
            parsedFilters.proficSlv,
            parsedFilters.programType,
            parsedFilters.inputType,
            parsedFilters.errorsFilters,
            parsedFilters.wordCategory,
            parsedFilters.context,
            parsedFilters.advContext,
            parsedFilters.formsFilter,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios.get(`/api/search?${searchParams.toString()}`, { signal }).then((res) => res.data),
    });

    const { data: sentenceContext } = useQuery<Record<string, SentenceContext>>({
        queryKey: [
            "search-results-sentence-context",
            parsedFilters.page,
            parsedFilters.texts,
            parsedFilters.lemma,
            parsedFilters.firstLang,
            parsedFilters.taskSetting,
            parsedFilters.proficSlv,
            parsedFilters.programType,
            parsedFilters.inputType,
            parsedFilters.errorsFilters,
            isLoading,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
            if (isLoading || error || !data) return {};
            const sentenceIds = data?.data
                .flatMap((bundle) => [bundle.orig?.id, bundle.corr?.id])
                .filter((id) => id !== undefined);
            return axios.get(`/api/sentence/?s=${sentenceIds.join(",")}`, { signal }).then((res) => res.data);
        },
    });

    if (isLoading) return <SearchResultsLoader />;
    if (error || !data) return <SearchResultsError />;

    const getSaveUrl = () => {
        return `/api/search/download?locale=${locale}&${searchParams.toString()}`;
    };

    const saveBtn = (
        <a href={getSaveUrl()} className="w-5 h-5 fill-grey">
            <SaveIcon />
        </a>
    );

    return (
        <div className="bg-white shadow-tiny rounded overflow-hidden col-span-3 flex flex-col h-fit">
            <div className="flex justify-between border-b border-static-border">
                <Suspense>
                    <ViewControl />

                    <PaginateControl
                        meta={data.meta}
                        links={data.links}
                        data={undefined}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                        showCopy={false}
                        trailing={saveBtn}
                    />
                </Suspense>
            </div>

            <div className="grow">
                {data.data.length === 0 && <p className="callout text-grey p-4">{tComm("no-results")}</p>}
                {data.data.map((bundle, index) => (
                    <Paragraph
                        key={bundle.keywordId + index}
                        sentenceBundle={bundle}
                        origSentenceContext={sentenceContext && sentenceContext[bundle.orig?.id ?? "/"]}
                        corrSentenceContext={sentenceContext && sentenceContext[bundle.corr?.id ?? "/"]}
                    />
                ))}
            </div>

            <div className="flex justify-end py-2">
                <Suspense>
                    <PaginateControl
                        meta={data.meta}
                        links={data.links}
                        data={data.data}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                    />
                </Suspense>
            </div>
        </div>
    );
}
