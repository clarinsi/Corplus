"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import SearchFilters from "@/app/[locale]/SearchFilters";
import IskanjeIcon from "@/assets/icons/IskanjeIcon";
import OkolicaIcon from "@/assets/icons/OkolicaIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import SeznamIcon from "@/assets/icons/SeznamIcon";
import SearchSourceSelector from "@/components/SearchSourceSelector";
import { TextSource } from "@/db/schema";
import SearchBar from "@/design-system/SearchBar";
import Tab from "@/design-system/Tab";
import TextButton from "@/design-system/button/TextButton";
import { parseSearchSource } from "@/util/parsing.util";
import { executeSearch } from "@/util/search.util";

export type SearchType = "basic" | "collocations" | "list" | "exact";
export type WordSearchMode = "lemma" | "text";

export default function Search() {
    const locale = useLocale();
    const currentParams = useSearchParams();
    const t = useTranslations("Search");
    const [selectedTab, setSelectedTab] = useState<SearchType>("basic");
    const [selectedSource, setSelectedSource] = useState<TextSource>("ORIG");
    const [isLoading, setIsLoading] = useState(false);

    const handleTabClick = (name: string) => setSelectedTab(name as SearchType);
    const handleSourceChange = (name: string) => setSelectedSource(parseSearchSource(name));

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await executeSearch(e, selectedTab, selectedSource, undefined, currentParams, locale).finally(() =>
            setIsLoading(false),
        );
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="flex justify-between items-end mr-[70px]">
                <div className="flex w-fit">
                    <div className="rounded-t overflow-clip">
                        <Tab
                            label={t("tab.basic")}
                            name="basic"
                            isActive={selectedTab === "basic"}
                            icon={<IskanjeIcon />}
                            onClick={handleTabClick}
                        />
                        <Tab
                            label={t("tab.collocations")}
                            name="collocations"
                            isActive={selectedTab === "collocations"}
                            icon={<OkolicaIcon />}
                            onClick={handleTabClick}
                        />
                        <Tab
                            label={t("tab.list")}
                            name="list"
                            isActive={selectedTab === "list"}
                            icon={<SeznamIcon />}
                            onClick={handleTabClick}
                        />
                    </div>

                    <div className="ml-3 self-center">
                        <SearchSourceSelector
                            bg="emphasised"
                            hiearchy="ghost"
                            size="small"
                            selectedFilter={selectedSource}
                            handleFilterChange={handleSourceChange}
                        />
                    </div>
                </div>

                <div className="self-center">
                    <TextButton
                        type="link"
                        href="/adv"
                        bg="emphasised"
                        hiearchy="ghost"
                        size="small"
                        leadingIcon={<SearchIcon />}
                    >
                        {t("type.advanced")}
                    </TextButton>
                </div>
            </div>

            <SearchBar roundTopLeft={false} searchType={selectedTab} isLoading={isLoading} />

            <SearchFilters currentTab={selectedTab} />
        </form>
    );
}
