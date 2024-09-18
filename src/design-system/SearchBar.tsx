"use client";

import { useState } from "react";
import { SearchType } from "@/app/[locale]/Search";
import { LoadingIcon } from "@/assets/icons/LoadingIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import ZoomResetIcon from "@/assets/icons/ZoomResetIcon";
import SearchHistory from "@/components/SearchHistory";
import IconButton from "@/design-system/button/IconButton";
import { clsx } from "clsx";

interface SearchBarProps {
    roundTopLeft?: boolean;
    searchType: SearchType;
    isLoading: boolean;
}

export default function SearchBar({ roundTopLeft = true, searchType, isLoading }: SearchBarProps) {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const onHistoryClick = (e: any) => {
        e.preventDefault();
        setIsHistoryOpen(!isHistoryOpen);
    };

    const formClasses = clsx(
        "px-4 py-3 relative grow flex gap-4 justify-between items-center bg-white rounded h-16",
        !roundTopLeft && "rounded-tl-none",
    );

    return (
        <div className="flex gap-2">
            <div className={formClasses}>
                {searchType === "collocations" && (
                    <select className="bg-white p-1" name="leftDistance" defaultValue="3">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                )}
                <span className="h-5 w-5 flex items-center fill-light-grey">
                    <SearchIcon />
                </span>
                <input
                    name="search-string"
                    className="w-full title-m focus:outline-none placeholder:font-light text-lg"
                    autoComplete="off"
                    spellCheck={false}
                />
                {searchType === "collocations" && (
                    <select className="bg-white p-1" name="rightDistance" defaultValue="3">
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
                    size="small"
                    onClick={onHistoryClick}
                >
                    <ZoomResetIcon />
                </IconButton>

                <div className="absolute left-0 top-14 z-10 w-full rounded-b-md overflow-hidden">
                    {isHistoryOpen && <SearchHistory />}
                </div>
            </div>

            <IconButton
                shouldSubmit={true}
                bg="emphasised"
                shape="round"
                hiearchy="primary"
                size="large"
                disabled={isLoading}
            >
                {isLoading ? <LoadingIcon className="stroke-white" /> : <SearchIcon />}
            </IconButton>
        </div>
    );
}
