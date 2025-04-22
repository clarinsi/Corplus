"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import ListEntry from "@/app/[locale]/[lemma]/list/ListEntry";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import SaveIcon from "@/assets/icons/SaveIcon";
import SearchResultsError from "@/components/SearchResultsError";
import SortableHeader from "@/components/SortableHeader";
import SearchResultsLoader from "@/components/loaders/SearchResultsLoader";
import { LEMMA, LIST_TYPE, SORT_ASC, SORT_BY, TEXT } from "@/constants";
import { ListStats } from "@/data/list";
import PaginateControl from "@/design-system/PaginateControl";
import TextButton from "@/design-system/button/TextButton";
import { usePathname, useRouter } from "@/navigation";
import { parseSearchParams } from "@/util/parsing.util";
import { createUrl } from "@/util/util";
import axios from "axios";
import { clsx } from "clsx";

export default function ListResults() {
    const t = useTranslations("List");
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const parsedFilters = useMemo(() => parseSearchParams(searchParams), [searchParams]);

    const [selectedLemma, setSelectedLemma] = useState<string | undefined>();
    const [selectedText, setSelectedText] = useState<string | undefined>();

    const tableWrapperClasses = useMemo(
        () =>
            clsx(
                "border-b border-static-border grid",
                parsedFilters.listType === "lemma" && "grid-cols-2",
                parsedFilters.listType === "text" && "grid-cols-4",
                parsedFilters.listType === "ana" && "grid-cols-4",
            ),
        [parsedFilters.listType],
    );

    function handleSelectTab(tab: "lemma" | "text" | "ana") {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(SORT_ASC);
        newParams.delete(SORT_BY);
        newParams.set(LIST_TYPE, tab);

        const lemma = selectedLemma ?? parsedFilters.lemma![0];

        if (tab === "text" && lemma) {
            newParams.set(LEMMA, lemma);
        }

        const text = selectedText ?? data?.data.at(0)?.text;

        if (tab === "ana" && text) {
            newParams.set(TEXT, text);
        } else {
            newParams.delete(TEXT);
            setSelectedText(undefined);
        }

        if (tab === "lemma") {
            newParams.delete(TEXT);
        }

        router.push(createUrl(pathname, newParams), { scroll: false });
    }

    function handleSortClick(newSortBy: string, newSortAsc: boolean) {
        const newParams = new URLSearchParams(searchParams);
        if (!newSortBy) {
            newParams.delete(SORT_BY);
        } else {
            newParams.set(SORT_BY, newSortBy);
        }

        if (!newSortAsc) {
            newParams.delete(SORT_ASC);
        } else {
            newParams.set(SORT_ASC, "true");
        }

        router.push(createUrl(pathname, newParams), { scroll: false });
    }

    function handleAnaClick() {
        if (parsedFilters.listType === "ana") {
            handleSelectTab("text");
        } else {
            handleSelectTab("ana");
        }
    }

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
            parsedFilters.listType,
            parsedFilters.sortBy,
            parsedFilters.sortAsc,
            parsedFilters.text,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios
                .get(`/api/list?${searchParams.toString()}`, {
                    signal,
                    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
                })
                .then((res) => res.data),
    });

    if (isLoading) return <SearchResultsLoader hideViewControl={true} />;
    if (error || !data) return <SearchResultsError />;

    const getSaveUrl = () => {
        return `${process.env.NEXT_PUBLIC_BASE_URL}/api/list/download?locale=${locale}&${searchParams.toString()}`;
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
                        hiearchy={parsedFilters.listType === "lemma" ? "primary" : "secondary"}
                        size="small"
                        onClick={() => handleSelectTab("lemma")}
                    >
                        {t("btn.basic-forms")}
                    </TextButton>
                    <TextButton
                        bg="light"
                        hiearchy={
                            parsedFilters.listType === "text" || parsedFilters.listType === "ana"
                                ? "primary"
                                : "secondary"
                        }
                        size="small"
                        onClick={() => handleSelectTab("text")}
                    >
                        {t("btn.all-forms")}
                    </TextButton>
                </div>
                {(parsedFilters.listType === "text" || parsedFilters.listType === "ana") && (
                    <TextButton
                        bg="light"
                        hiearchy={parsedFilters.listType === "ana" ? "primary" : "secondary"}
                        size="small"
                        trailingIcon={parsedFilters.listType === "ana" ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                        onClick={handleAnaClick}
                    >
                        {t("btn.ana")}
                    </TextButton>
                )}
            </div>

            <div className="grow mx-4">
                <div className={tableWrapperClasses}>
                    {(parsedFilters.listType === "text" || parsedFilters.listType === "ana") && (
                        <SortableHeader
                            text={t("table.form")}
                            sortBy="text"
                            currentSortBy={parsedFilters.sortBy}
                            currentSortAsc={parsedFilters.sortAsc}
                            onSortClick={handleSortClick}
                        />
                    )}
                    <SortableHeader
                        text={t("table.basic-form")}
                        sortBy="lemma"
                        currentSortBy={parsedFilters.sortBy}
                        currentSortAsc={parsedFilters.sortAsc}
                        onSortClick={handleSortClick}
                    />
                    {parsedFilters.listType === "ana" && (
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
                        currentSortBy={parsedFilters.sortBy}
                        currentSortAsc={parsedFilters.sortAsc}
                        onSortClick={handleSortClick}
                        alignRight={true}
                    />
                    {parsedFilters.listType === "text" && (
                        <SortableHeader
                            text={t("table.err-count")}
                            sortBy="errCount"
                            currentSortBy={parsedFilters.sortBy}
                            currentSortAsc={parsedFilters.sortAsc}
                            onSortClick={handleSortClick}
                            alignRight={true}
                        />
                    )}
                </div>
                {data.data.map((coll) => (
                    <ListEntry
                        key={`${coll.lemma}${coll.text}${coll.ana}`}
                        stats={coll}
                        selectedTab={parsedFilters.listType}
                        withErrors={parsedFilters.texts === "with-error"}
                        searchSource={parsedFilters.searchSource}
                        selectedLemma={selectedLemma}
                        selectedText={selectedText}
                        setSelectedLemma={setSelectedLemma}
                        setSelectedText={setSelectedText}
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
