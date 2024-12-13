"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@/assets/icons/CloseIcon";
import InformationIcon from "@/assets/icons/InformationIcon";
import ErrorsDropdownFilter from "@/components/filters/ErrorsDropdownFilter";
import SpeakerLangFilter from "@/components/filters/SpeakerLangFilter";
import TextsFilter from "@/components/filters/TextsFilter";
import IndexFiltersLoader from "@/components/loaders/IndexFiltersLoader";
import { BiblFilter } from "@/data/filters";
import IconButton from "@/design-system/button/IconButton";
import TextButton from "@/design-system/button/TextButton";

interface SearchFiltersProps {
    currentTab: "basic" | "collocations" | "list";
}

export default function SearchFilters({ currentTab }: SearchFiltersProps) {
    const [isShowingInfo, setIsShowingInfo] = useState(false);
    const tSearch = useTranslations("Search");

    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: ["firstLangFilters"],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/filters/bibl/fl-global`, { signal }).then((res) => res.json()),
    });

    if (isLoading) return <IndexFiltersLoader />;
    if (error) return <div className="text-white pt-4">Error fetching filters</div>;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mr-[70px]">
                <div className="pt-4 flex items-center gap-3">
                    <TextsFilter bg="emphasised" size="medium" />
                    <SpeakerLangFilter bg="emphasised" size="medium" filters={data} />
                    <ErrorsDropdownFilter bg="emphasised" size="medium" />
                </div>

                <TextButton
                    bg="emphasised"
                    hiearchy="ghost"
                    size="small"
                    trailingIcon={<InformationIcon />}
                    onClick={() => setIsShowingInfo(!isShowingInfo)}
                >
                    {tSearch(`type.${currentTab}.using`)}
                </TextButton>
            </div>

            {isShowingInfo && (
                <div className="bg-white shadow p-4 mt-3 rounded-md flex flex-col w-full max-w-2xl mx-auto">
                    <div className="w-full flex justify-end">
                        <IconButton
                            bg="light"
                            shape="square"
                            hiearchy="ghost"
                            size="xsmall"
                            onClick={() => setIsShowingInfo(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <ul className="text-sm flex px-3 flex-col gap-3">
                        {tSearch
                            .raw(`type.${currentTab}.examples`)
                            .map((el: { query: string; description: string }) => (
                                <li key={el.query} className="flex flex-col gap-1 py-2 border-b border-static-border">
                                    <p className="font-bold text-surface-static-emphasised">{el.query}</p>
                                    <p className="text-grey" dangerouslySetInnerHTML={{ __html: el.description }}></p>
                                </li>
                            ))}
                        {tSearch(`type.${currentTab}.extra`) !== "null" && (
                            <li className="flex flex-col gap-1 py-2 mt-2">
                                <p
                                    className="text-grey"
                                    dangerouslySetInnerHTML={{ __html: tSearch.raw(`type.${currentTab}.extra`) }}
                                ></p>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
