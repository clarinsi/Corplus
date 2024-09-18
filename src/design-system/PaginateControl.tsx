"use client";

import { ReactNode, useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CheckIcon from "@/assets/icons/CheckIcon";
import ChevronLeftIcon from "@/assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import OverflowMenuIcon from "@/assets/icons/OverflowMenuIcon";
import CopyButton from "@/components/CopyButton";
import { SentenceBundle } from "@/data/searchv2";
import IconButton from "@/design-system/button/IconButton";
import { createUrl, punctuationRegex } from "@/util/util";

type PaginateControlProps = {
    showOrig: boolean;
    showCorrect: boolean;
    showCopy?: boolean;
    trailing?: ReactNode;
    trailingAction?: () => void;
    useAlternativeResultsLabel?: boolean;
} & PaginatedResponse<SentenceBundle[] | undefined>;

export default function PaginateControl({
    meta,
    data,
    showOrig,
    showCorrect,
    showCopy = true,
    trailing,
    trailingAction,
    useAlternativeResultsLabel = false,
}: PaginateControlProps) {
    const t = useTranslations("Pagination");
    const f = useFormatter();
    const [isInputtingPage, setIsInputtingPage] = useState(false);
    const params = useSearchParams();
    const path = usePathname();
    const router = useRouter();
    const prevPage = useMemo(() => {
        const prev = meta.currentPage - 1;
        if (prev < 1) return meta.currentPage;
        return prev;
    }, [meta]);
    const firstPage = 1;
    const nextPage = useMemo(() => {
        const next = meta.currentPage + 1;
        if (next > meta.totalPages) return meta.currentPage;
        return next;
    }, [meta]);
    const lastPage = useMemo(() => meta.totalPages, [meta]);

    const handlePageInput = (e: any) => {
        const value = e.target.value;
        if (value === "") {
            setIsInputtingPage(false);
            return;
        }

        const valueNum = Number(value);
        if (Number.isNaN(valueNum) || valueNum < 1 || valueNum > meta.totalPages) return;
        setIsInputtingPage(false);
        handlePageChange(valueNum);
    };

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(params);
        newParams.set("page", String(page));

        router.push(createUrl(path, newParams));
    };

    const handleCopy = async () => {
        if (!data) return;
        let origOut: string[] = [];
        let corrOut: string[] = [];

        if (showOrig)
            origOut = data.flatMap(
                (p) =>
                    p.orig?.words
                        .map((w, index) => (punctuationRegex.test(w.text) || index === 0 ? w.text : ` ${w.text}`))
                        .join("") || [],
            );

        if (showCorrect)
            corrOut = data.flatMap(
                (p) =>
                    p.corr?.words
                        .map((w, index) => (punctuationRegex.test(w.text) || index === 0 ? w.text : ` ${w.text}`))
                        .join("") || [],
            );

        // Join orig and corr sentences by index
        let length = Math.max(origOut.length, corrOut.length);
        let output = [];
        for (let i = 0; i < length; i++) {
            if (showOrig) output.push(origOut.at(i));
            if (showCorrect) output.push(corrOut.at(i));
        }
        await navigator.clipboard.writeText(output.join("\n"));
    };

    const shouldDisableArrows = meta.totalPages < 2;
    const metaCurrentPageLower = (meta.currentPage - 1) * 25 + 1;
    const metaCurrentPageUpper = meta.totalItems < 25 ? meta.totalItems : meta.currentPage * 25;

    return (
        <div className="flex">
            <div className="px-4 py-3 flex items-center gap-1 caption whitespace-nowrap text-light-grey border-l border-static-border">
                <span className="text-grey">
                    {f.number(metaCurrentPageLower)}-{f.number(metaCurrentPageUpper)}
                </span>
                od
                <span className="text-grey">{f.number(meta.totalItems)}</span>
                {useAlternativeResultsLabel ? t("results") : t("concordance")}
            </div>

            <div className="px-4 flex items-center gap-1 border-l border-static-border">
                <IconButton
                    onClick={() => handlePageChange(prevPage)}
                    bg="light"
                    shape="square"
                    hiearchy="ghost"
                    size="xsmall"
                    disabled={shouldDisableArrows || meta.currentPage === 1}
                >
                    <ChevronLeftIcon />
                </IconButton>

                {meta.currentPage > 1 && (
                    <IconButton
                        onClick={() => handlePageChange(firstPage)}
                        bg="light"
                        shape="square"
                        hiearchy="ghost"
                        size="xsmall"
                    >
                        1
                    </IconButton>
                )}

                {meta.currentPage && meta.currentPage !== meta.totalPages && (
                    <IconButton bg="light" shape="square" hiearchy="primary" size="xsmall">
                        {meta.currentPage}
                    </IconButton>
                )}

                {meta.currentPage === 1 && meta.totalPages > 2 && (
                    <IconButton
                        onClick={() => handlePageChange(nextPage)}
                        bg="light"
                        shape="square"
                        hiearchy="ghost"
                        size="xsmall"
                    >
                        {meta.currentPage + 1}
                    </IconButton>
                )}

                {!isInputtingPage && meta.totalPages > 2 && (
                    <IconButton
                        type="button"
                        bg="light"
                        shape="square"
                        hiearchy="secondary"
                        size="xsmall"
                        onClick={() => setIsInputtingPage(true)}
                    >
                        <OverflowMenuIcon />
                    </IconButton>
                )}

                {isInputtingPage && (
                    <div className="relative">
                        <input
                            type="text"
                            className="w-11 border border-primary rounded-l caption p-2 text-left text-grey outline-none"
                            autoFocus={true}
                            onBlur={handlePageInput}
                        />
                        <div className="absolute top-0 -right-7">
                            <IconButton bg="light" shape="square" hiearchy="primary" size="xsmall">
                                <CheckIcon />
                            </IconButton>
                        </div>
                    </div>
                )}

                {meta.totalPages > 1 && (
                    <IconButton
                        onClick={() => handlePageChange(lastPage)}
                        bg="light"
                        shape="square"
                        hiearchy={meta.currentPage === meta.totalPages ? "primary" : "ghost"}
                        size="xsmall"
                    >
                        {meta.totalPages}
                    </IconButton>
                )}

                <IconButton
                    onClick={() => handlePageChange(nextPage)}
                    bg="light"
                    shape="square"
                    hiearchy="ghost"
                    size="xsmall"
                    disabled={shouldDisableArrows || meta.currentPage === meta.totalPages}
                >
                    <ChevronRightIcon />
                </IconButton>
            </div>

            {showCopy && (
                <div className="pl-3 pr-4 flex items-center border-l border-static-border">
                    <CopyButton onClick={handleCopy} />
                </div>
            )}

            {trailing && (
                <div className="pl-3 pr-4 flex items-center border-l border-static-border">
                    <IconButton bg="light" shape="square" hiearchy="ghost" size="xsmall" onClick={trailingAction}>
                        {trailing}
                    </IconButton>
                </div>
            )}
        </div>
    );
}
