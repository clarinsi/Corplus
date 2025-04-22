"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ANA, FORMS_FILTER, LEMMA, LIST_TYPE, RAW_QUERY, SHOW_CORRECT, SHOW_ORIG, TEXT } from "@/constants";
import { ListStats } from "@/data/list";
import { TextSource } from "@/db/schema";
import { Link } from "@/navigation";
import { decodeAna } from "@/util/parsing.util";
import { clsx } from "clsx";

interface ListEntryProps {
    stats: ListStats;
    selectedTab: "lemma" | "text" | "ana";
    withErrors: boolean;
    searchSource: TextSource;
    selectedLemma?: string;
    selectedText?: string;
    setSelectedLemma: (lemma: string | undefined) => void;
    setSelectedText: (text: string | undefined) => void;
}

export default function ListEntry({
    stats,
    selectedTab,
    withErrors,
    searchSource,
    selectedLemma,
    setSelectedLemma,
    selectedText,
    setSelectedText,
}: ListEntryProps) {
    const formatter = useFormatter();
    const tFilters = useTranslations("Filters");

    const searchParams = useSearchParams();
    const href = useMemo(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("page");
        newParams.delete(LIST_TYPE);

        newParams.set("type", selectedTab === "lemma" ? "basic" : "list");
        newParams.set(SHOW_ORIG, searchSource === "ORIG" ? "true" : "false");
        newParams.set(SHOW_CORRECT, searchSource === "CORR" ? "true" : "false");

        newParams.set("type", selectedTab === "lemma" ? "basic" : "exact");
        newParams.set(LEMMA, stats.lemma!);
        if (selectedTab !== "lemma") {
            newParams.set(TEXT, stats.text!);
            newParams.set(FORMS_FILTER, stats.lemma!);
        }

        if (selectedTab === "ana") newParams.set(ANA, stats.ana!.slice(4));

        const searchWord = selectedTab === "lemma" ? stats.lemma : stats.text;
        newParams.set(RAW_QUERY, searchWord!);
        return `/${searchWord}?${newParams.toString()}`;
    }, [selectedTab, stats, searchParams, searchSource]);

    const linkClasses = clsx(
        "border-b body-2 border-static-border grid group hover:bg-secondary transition-all duration-200 w-full",
        "*:px-2 *:py-3",
        selectedTab === "lemma" && "grid-cols-2",
        selectedTab === "text" && "grid-cols-4",
        selectedTab === "ana" && "grid-cols-4",
        selectedTab === "lemma" && selectedLemma === stats.lemma && "bg-surface-static-secondary",
        selectedTab === "text" && selectedText === stats.text && "bg-surface-static-secondary",
    );

    const textClasses = clsx(
        "text-left",
        withErrors && searchSource === "ORIG" && "text-semantic-error",
        withErrors && searchSource === "CORR" && "text-semantic-correct",
    );

    const clickHandler = () => {
        if (selectedTab === "lemma") {
            setSelectedLemma(stats.lemma ?? undefined);
        }

        if (selectedTab === "text") {
            setSelectedText(stats.text);
        }
    };

    return (
        <button className={linkClasses} onClick={clickHandler}>
            {(selectedTab === "text" || selectedTab === "ana") && <span className={textClasses}>{stats.text}</span>}

            <span className={selectedTab !== "text" ? textClasses : ""}>{stats.lemma}</span>

            {selectedTab === "ana" && (
                // @ts-expect-error - next-intl doesn't like raw on parent items
                <span>{decodeAna(stats.ana, tFilters.raw("Category"), tFilters.raw("Schema"))}</span>
            )}

            <Link href={href} className="text-grey text-right">
                {formatter.number(stats.count)}
            </Link>

            {selectedTab === "text" && <span className="text-grey text-right">{formatter.number(stats.errCount)}</span>}
        </button>
    );
}
