"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import CollocationEntry from "@/app/[locale]/[lemma]/collocation/CollocationEntry";
import SaveIcon from "@/assets/icons/SaveIcon";
import SearchResultsError from "@/components/SearchResultsError";
import SortableHeader from "@/components/SortableHeader";
import SearchResultsLoader from "@/components/loaders/SearchResultsLoader";
import { SORT_ASC, SORT_BY } from "@/constants";
import { CollocationStats } from "@/data/collocation";
import PaginateControl from "@/design-system/PaginateControl";
import { parseSearchParams } from "@/util/parsing.util";
import axios from "axios";

interface CollocationResultsProps {
    currentLemma: string;
}

export default function CollocationResults({ currentLemma }: CollocationResultsProps) {
    const locale = useLocale();
    const t = useTranslations("Collocation");
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<string | undefined>();
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const handleSortClick = (sortBy: string, sortAsc: boolean) => {
        setSortBy(sortBy);
        setSortAsc(sortAsc);
    };

    const writableSearchParams = new URLSearchParams(searchParams.toString());
    if (sortBy) {
        writableSearchParams.set(SORT_BY, sortBy);
    } else {
        writableSearchParams.delete(SORT_BY);
    }

    if (sortAsc) {
        writableSearchParams.set(SORT_ASC, "true");
    } else {
        writableSearchParams.delete(SORT_ASC);
    }

    const parsedFilters = parseSearchParams(writableSearchParams);
    const { data, isLoading, error } = useQuery<PaginatedResponse<CollocationStats[]>>({
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
            parsedFilters.collocationWordCategory,
            parsedFilters.formsFilter,
            sortBy,
            sortAsc,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios.get(`/api/collocations?${writableSearchParams.toString()}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL }).then((res) => res.data),
    });

    if (isLoading) return <SearchResultsLoader hideViewControl={true} />;
    if (error || !data) return <SearchResultsError />;

    const getSaveUrl = () => {
        return `/api/collocations/download?locale=${locale}&${writableSearchParams.toString()}`;
    };

    const saveBtn = (
        <a href={getSaveUrl()} className="w-5 h-5 fill-grey">
            <SaveIcon />
        </a>
    );

    return (
        <div className="bg-white rounded overflow-hidden col-span-3 flex flex-col h-fit">
            <div className="flex justify-end py-1 border-b border-static-border">
                <Suspense>
                    <PaginateControl
                        meta={data.meta}
                        links={data.links}
                        data={undefined}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                        showCopy={false}
                        trailing={saveBtn}
                        useAlternativeResultsLabel={true}
                    />
                </Suspense>
            </div>

            <div className="grow m-4">
                <div className="border-b border-static-border grid grid-cols-5">
                    <SortableHeader
                        text={t("table.words")}
                        sortBy="words"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                    />
                    <SortableHeader
                        text={t("table.count")}
                        sortBy="count"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                        alignRight={true}
                    />
                    <SortableHeader
                        text={t("table.totalCount")}
                        sortBy="totalCount"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                        alignRight={true}
                    />
                    <SortableHeader
                        text={t("table.logDice")}
                        sortBy="logDice"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                        alignRight={true}
                    />
                    <SortableHeader
                        text={t("table.errCount")}
                        sortBy="errCount"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                        alignRight={true}
                    />
                </div>
                {data.data.map((coll) => (
                    <CollocationEntry
                        key={coll.lemma}
                        stats={coll}
                        currentLemma={currentLemma}
                        withErrors={parsedFilters.texts === "with-error"}
                        searchSource={parsedFilters.searchSource}
                    />
                ))}
            </div>

            <div className="flex justify-end py-2">
                <Suspense>
                    <PaginateControl
                        meta={data.meta}
                        links={data.links}
                        data={undefined}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                        showCopy={false}
                    />
                </Suspense>
            </div>
        </div>
    );
}
