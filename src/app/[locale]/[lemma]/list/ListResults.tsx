"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import ListEntry from "@/app/[locale]/[lemma]/list/ListEntry";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import SaveIcon from "@/assets/icons/SaveIcon";
import SearchResultsError from "@/components/SearchResultsError";
import SortableHeader from "@/components/SortableHeader";
import SearchResultsLoader from "@/components/loaders/SearchResultsLoader";
import { LIST_TYPE, SORT_ASC, SORT_BY } from "@/constants";
import { ListStats } from "@/data/list";
import PaginateControl from "@/design-system/PaginateControl";
import TextButton from "@/design-system/button/TextButton";
import { parseSearchParams } from "@/util/parsing.util";
import axios from "axios";
import { clsx } from "clsx";

interface ListResultsProps {
    currentLemma: string;
}

export default function ListResults({ currentLemma }: ListResultsProps) {
    const locale = useLocale();
    const t = useTranslations("List");
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<string | undefined>();
    const [selectedTab, setSelectedTab] = useState<"lemma" | "text" | "ana">("lemma");
    const handleSelectTab = (tab: "lemma" | "text" | "ana") => {
        setSortBy(undefined);
        setSelectedTab(tab);
    };
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const handleSortClick = (sortBy: string, sortAsc: boolean) => {
        setSortBy(sortBy);
        setSortAsc(sortAsc);
    };

    const writableSearchParams = new URLSearchParams(searchParams.toString());
    writableSearchParams.set(LIST_TYPE, selectedTab);
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
    const { data, isLoading, error } = useQuery<PaginatedResponse<ListStats[]>>({
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
            parsedFilters.formsFilter,
            selectedTab,
            sortBy,
            sortAsc,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios.get(`/api/list?${writableSearchParams.toString()}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL }).then((res) => res.data),
    });

    const handleAnaClick = () => {
        if (selectedTab === "ana") {
            handleSelectTab("text");
        } else {
            handleSelectTab("ana");
        }
    };

    const tableWrapperClasses = clsx(
        "border-b border-static-border grid",
        selectedTab === "lemma" && "grid-cols-2",
        selectedTab === "text" && "grid-cols-4",
        selectedTab === "ana" && "grid-cols-4",
    );

    if (isLoading) return <SearchResultsLoader hideViewControl={true} />;
    if (error || !data) return <SearchResultsError />;

    const getSaveUrl = () => {
        return `/api/list/download?locale=${locale}&${writableSearchParams.toString()}`;
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

            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-1">
                    <TextButton
                        bg="light"
                        hiearchy={selectedTab === "lemma" ? "primary" : "secondary"}
                        size="small"
                        onClick={() => handleSelectTab("lemma")}
                    >
                        {t("btn.basic-forms")}
                    </TextButton>
                    <TextButton
                        bg="light"
                        hiearchy={selectedTab === "text" || selectedTab === "ana" ? "primary" : "secondary"}
                        size="small"
                        onClick={() => handleSelectTab("text")}
                    >
                        {t("btn.all-forms")}
                    </TextButton>
                </div>
                {(selectedTab === "text" || selectedTab === "ana") && (
                    <TextButton
                        bg="light"
                        hiearchy={selectedTab === "ana" ? "primary" : "secondary"}
                        size="small"
                        trailingIcon={selectedTab === "ana" ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                        onClick={handleAnaClick}
                    >
                        {t("btn.ana")}
                    </TextButton>
                )}
            </div>

            <div className="grow mx-4">
                <div className={tableWrapperClasses}>
                    {(selectedTab === "text" || selectedTab === "ana") && (
                        <SortableHeader
                            text={t("table.form")}
                            sortBy="text"
                            currentSortBy={sortBy}
                            currentSortAsc={sortAsc}
                            onSortClick={handleSortClick}
                        />
                    )}
                    <SortableHeader
                        text={t("table.basic-form")}
                        sortBy="lemma"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                    />
                    {selectedTab === "ana" && (
                        <SortableHeader
                            text={t("table.ana")}
                            sortBy="none"
                            currentSortBy="none"
                            currentSortAsc={false}
                            showTrailing={false}
                        />
                    )}
                    <SortableHeader
                        text={t("table.count")}
                        sortBy="count"
                        currentSortBy={sortBy}
                        currentSortAsc={sortAsc}
                        onSortClick={handleSortClick}
                        alignRight={true}
                    />
                    {selectedTab === "text" && (
                        <SortableHeader
                            text={t("table.err-count")}
                            sortBy="errCount"
                            currentSortBy={sortBy}
                            currentSortAsc={sortAsc}
                            onSortClick={handleSortClick}
                            alignRight={true}
                        />
                    )}
                </div>
                {data.data.map((coll) => (
                    <ListEntry
                        key={`${coll.lemma}${coll.text}${coll.ana}`}
                        stats={coll}
                        currentLemma={currentLemma}
                        selectedTab={selectedTab}
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
                        trailing={saveBtn}
                        useAlternativeResultsLabel={true}
                    />
                </Suspense>
            </div>
        </div>
    );
}
