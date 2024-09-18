"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SearchType } from "@/app/[locale]/Search";
import SearchIcon from "@/assets/icons/SearchIcon";
import ZoomResetIcon from "@/assets/icons/ZoomResetIcon";
import SearchHistory from "@/components/SearchHistory";
import SearchSourceSelector from "@/components/SearchSourceSelector";
import SearchTypeSelector from "@/components/SearchTypeSelector";
import { LEFT_DISTANCE, RIGHT_DISTANCE } from "@/constants";
import { TextSource } from "@/db/schema";
import IconButton from "@/design-system/button/IconButton";
import { parseSearchSource, parseSearchType } from "@/util/parsing.util";
import { executeSearch } from "@/util/search.util";
import { clsx } from "clsx";

interface HeaderSearchBarProps {
    setIsLoading: (isLoading: boolean) => void;
}

export default function HeaderSearchBar({ setIsLoading }: HeaderSearchBarProps) {
    const locale = useLocale();
    const currentParams = useSearchParams();
    const [type, setType] = useState<SearchType>(parseSearchType(currentParams.get("type")));
    const [source, setSource] = useState<TextSource>(parseSearchSource(currentParams.get("source")));
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleTypeChange = (name: string) => setType(name as SearchType);
    const handleSourceChange = (name: string) => setSource(parseSearchSource(name));
    const onHistoryClick = (e: any) => {
        e.preventDefault();
        setIsHistoryOpen(!isHistoryOpen);
    };

    const formClasses = clsx(
        "px-4 relative flex items-center bg-white w-full h-10",
        isHistoryOpen ? "rounded-t" : "rounded",
    );

    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await executeSearch(e, type, source, undefined, currentParams, locale).finally(() => setIsLoading(false));
    };

    return (
        <form onSubmit={submitHandler} className={formClasses}>
            <div className="pr-2 flex items-center h-full gap-2 border-r border-static-border">
                <SearchTypeSelector
                    bg="light"
                    size="xsmall"
                    selectedFilter={type}
                    handleFilterChange={handleTypeChange}
                />
                <SearchSourceSelector
                    bg="light"
                    size="xsmall"
                    selectedFilter={source}
                    handleFilterChange={handleSourceChange}
                />
            </div>
            {type === "collocations" && (
                <select
                    className="bg-white ml-4 rounded-4xl pl-3 pr-1 py-1 border border-static-border text-grey"
                    name="leftDistance"
                    defaultValue={currentParams.get(LEFT_DISTANCE) || "3"}
                >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            )}
            <span className="h-4 w-4 ml-4 mr-2 aspect-square fill-light-grey">
                <SearchIcon />
            </span>
            <input
                name="search-string"
                className="w-full focus:outline-none body-1"
                autoComplete="off"
                spellCheck={false}
            />
            {type === "collocations" && (
                <select
                    className="bg-white mr-2 rounded-4xl pl-3 pr-1 py-1 border border-static-border text-grey"
                    name="rightDistance"
                    defaultValue={currentParams.get(RIGHT_DISTANCE) || "3"}
                >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            )}

            <IconButton
                bg="light"
                shape="round"
                hiearchy={isHistoryOpen ? "primary" : "ghost"}
                size="xsmall"
                onClick={onHistoryClick}
            >
                <ZoomResetIcon />
            </IconButton>

            {isHistoryOpen && (
                <div className="absolute left-0 top-[2.5rem] z-10 shadow-tiny w-full rounded-b-md overflow-hidden border-t border-static-border">
                    <SearchHistory />
                </div>
            )}
        </form>
    );
}
