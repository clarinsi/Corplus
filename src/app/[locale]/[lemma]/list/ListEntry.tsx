"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { LEMMA, RAW_QUERY, SHOW_CORRECT, SHOW_ORIG } from "@/constants";
import { ListStats } from "@/data/list";
import { TextSource } from "@/db/schema";
import { Link } from "@/navigation";
import { decodeAna } from "@/util/parsing.util";
import { clsx } from "clsx";

interface ListEntryProps {
    stats: ListStats;
    currentLemma: string;
    selectedTab: "lemma" | "text" | "ana";
    withErrors: boolean;
    searchSource: TextSource;
}

export default function ListEntry({ stats, selectedTab, withErrors, searchSource }: ListEntryProps) {
    const formatter = useFormatter();
    const tFilters = useTranslations("Filters");

    const searchParams = useSearchParams();
    const href = useMemo(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("page");
        newParams.set("type", selectedTab === "lemma" ? "basic" : "list");
        newParams.set(SHOW_ORIG, searchSource === "ORIG" ? "true" : "false");
        newParams.set(SHOW_CORRECT, searchSource === "CORR" ? "true" : "false");
        newParams.set(LEMMA, stats.lemma!);
        const searchWord = selectedTab === "lemma" ? stats.lemma : stats.text;
        newParams.set(RAW_QUERY, searchWord!);
        return `/${searchWord}?${newParams.toString()}`;
    }, [selectedTab, stats, searchParams, searchSource]);

    const linkClasses = clsx(
        "odd:bg-surface-static-secondary border-b body-2 border-static-border grid group hover:bg-secondary transition-all duration-200",
        "*:px-2 *:py-3",
        selectedTab === "lemma" && "grid-cols-2",
        selectedTab === "text" && "grid-cols-4",
        selectedTab === "ana" && "grid-cols-4",
    );

    const textClasses = clsx(
        withErrors && searchSource === "ORIG" && "text-semantic-error",
        withErrors && searchSource === "CORR" && "text-semantic-correct",
    );

    return (
        <Link href={href} className={linkClasses}>
            {(selectedTab === "text" || selectedTab === "ana") && <div className={textClasses}>{stats.text}</div>}
            <div className={selectedTab !== "text" ? textClasses : ""}>{stats.lemma}</div>
            {selectedTab === "ana" && (
                // @ts-expect-error - next-intl doesn't like raw on parent items
                <div>{decodeAna(stats.ana, tFilters.raw("Category"), tFilters.raw("Schema"))}</div>
            )}
            <div className="text-grey text-right">{formatter.number(stats.count)}</div>
            {selectedTab === "text" && <div className="text-grey text-right">{formatter.number(stats.errCount)}</div>}
        </Link>
    );
}
