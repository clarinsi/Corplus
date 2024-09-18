"use client";

import { useMemo } from "react";
import { useFormatter } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CONTEXT_WORD } from "@/constants";
import { CollocationStats } from "@/data/collocation";
import { TextSource } from "@/db/schema";
import { Link } from "@/navigation";
import { clsx } from "clsx";

interface CollocationEntryProps {
    stats: CollocationStats;
    currentLemma: string;
    withErrors: boolean;
    searchSource: TextSource;
}

export default function CollocationEntry({ stats, currentLemma, withErrors, searchSource }: CollocationEntryProps) {
    const formatter = useFormatter();

    const searchParams = useSearchParams();
    const href = useMemo(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(CONTEXT_WORD, stats.lemma);
        newParams.delete("page");
        return `/${currentLemma}?${newParams.toString()}`;
    }, [currentLemma, stats.lemma, searchParams]);

    const textClasses = clsx(
        withErrors && searchSource === "ORIG" && "text-semantic-error",
        withErrors && searchSource === "CORR" && "text-semantic-correct",
    );

    return (
        <Link
            href={href}
            className="odd:bg-surface-static-secondary border-b body-2 border-static-border grid grid-cols-5 group hover:bg-secondary transition-all duration-200"
        >
            <div className={`px-2 py-3 group-hover:text-surface-static-emphasised ${textClasses}`}>{stats.lemma}</div>
            <div className="px-2 py-3 group-hover:text-surface-static-emphasised text-grey text-right">
                {formatter.number(stats.count)}
            </div>
            <div className="px-2 py-3 group-hover:text-surface-static-emphasised text-grey text-right">
                {formatter.number(stats.totalCount)}
            </div>
            <div className="px-2 py-3 group-hover:text-surface-static-emphasised text-grey text-right">
                {formatter.number(stats.logDice)}
            </div>
            <div className="px-2 py-3 group-hover:text-surface-static-emphasised text-grey text-right">
                {formatter.number(stats.errCount)}
            </div>
        </Link>
    );
}
