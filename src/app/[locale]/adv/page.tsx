"use client";

import { useQuery } from "@tanstack/react-query";
import React, { FormEvent, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Header from "@/app/[locale]/Header";
import { SearchType } from "@/app/[locale]/Search";
import CheckIcon from "@/assets/icons/CheckIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import ContextWord from "@/components/ContextWord";
import AdvRow from "@/components/adv-search/AdvRow";
import ExcludeCategoryDropdown from "@/components/adv-search/ExcludeCategoryDropdown";
import SingleChoiceList, { SingleChoiceFilter } from "@/components/adv-search/SingleChoiceList";
import WordCategoryFilter from "@/components/adv-search/WordCategoryFilter";
import { filters } from "@/components/adv-search/config";
import ErrorsDropdownFilter from "@/components/filters/ErrorsDropdownFilter";
import SpeakerLangFilter from "@/components/filters/SpeakerLangFilter";
import TextsFilter from "@/components/filters/TextsFilter";
import { BiblFilter } from "@/data/filters";
import { TextSource } from "@/db/schema";
import TextButton from "@/design-system/button/TextButton";
import { usePathname, useRouter } from "@/navigation";
import { parseSearchSource } from "@/util/parsing.util";
import { executeSearch } from "@/util/search.util";

export default function AdvancedSearchPage() {
    const locale = useLocale();
    const t = useTranslations("Search");
    const tCat = useTranslations("Filters.Category");
    const tFilters = useTranslations("Filters.Schema");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);

    const { data: firstLangFilters } = useQuery<BiblFilter[]>({
        queryKey: ["firstLangFilters"],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            fetch(`/api/filters/bibl/fl-global`, { signal }).then((res) => res.json()),
    });

    const [selectedSource, setSelectedSource] = useState<TextSource>("ORIG");
    const sourceFilters: SingleChoiceFilter[] = [
        { label: t("tab.ORIG.long"), value: "ORIG" },
        { label: t("tab.CORR.long"), value: "CORR" },
    ];
    const handleSourceChange = (name: string) => setSelectedSource(parseSearchSource(name));

    const [selectedMode, setSelectedMode] = useState<SearchType>("basic");
    const modeFilters: SingleChoiceFilter[] = [
        { label: t("advanced.forms.lemma"), value: "basic" },
        { label: t("advanced.forms.text"), value: "list" },
    ];
    const handleModeChange = (name: string) => setSelectedMode(name as SearchType);
    const [selectedCategory, setSelectedCategory] = useState<string>();
    const [excludeCategory, setExcludeCategory] = useState<string>("false");
    const [contextWords, setContextWords] = useState<string[]>([]);

    const newContextWord = () => {
        if (contextWords.length >= 3) return;
        setContextWords([...contextWords, ""]);
    };

    const removeContextWord = (index: number) => {
        contextWords.splice(index, 1);
        setContextWords([...contextWords]);
    };

    const handleFormSubmit = (e: FormEvent) =>
        executeSearch(e, "basic", selectedSource, selectedCategory, searchParams, locale, excludeCategory === "true");

    const resetForm = () => {
        formRef.current?.reset();
        setSelectedSource("ORIG");
        setSelectedMode("basic");
        setSelectedCategory(undefined);
        setExcludeCategory("false");

        // Clear query params
        router.replace(pathname, { scroll: false });
    };

    return (
        <>
            <Header showAllSources={true} />

            <main className="bg-tertiary-surface pb-0.5">
                <div className="bg-white shadow-tiny h-16"></div>
                <form
                    ref={formRef}
                    className="max-w-[67rem] mx-auto bg-white shadow-tiny rounded m-8"
                    onSubmit={handleFormSubmit}
                >
                    <div className="border-b-thin border-static-border">
                        <h2 className="body-2-title p-4">{t("type.advanced")}</h2>
                    </div>

                    <div>
                        <h3 className="body-2-title text-surface-static-emphasised p-4">{t("advanced.conditions")}</h3>
                    </div>

                    <AdvRow>
                        <div className="pt-4 pb-5 flex flex-col gap-4">
                            <h4 className="caption !text-sm text-light-grey mb-0.5">{t("advanced.search")}</h4>
                            <SingleChoiceList
                                selectedValue={selectedSource}
                                changeHandler={handleSourceChange}
                                filters={sourceFilters}
                            />
                        </div>
                    </AdvRow>

                    <AdvRow border={true}>
                        <div className="grow">
                            <h4 className="caption !text-sm text-grey pb-4">{t("advanced.conditions-extra")}</h4>
                            <TextsFilter bg="light" hierarchy="advsearch" size="small" />
                        </div>

                        <div className="grow">
                            <SpeakerLangFilter
                                bg="light"
                                hierarchy="advsearch"
                                size="small"
                                filters={firstLangFilters}
                            />
                        </div>

                        <div className="grow">
                            <ErrorsDropdownFilter bg="light" hierarchy="advsearch" size="small" />
                        </div>
                    </AdvRow>

                    <div>
                        <h3 className="body-2-title text-surface-static-emphasised p-4">{t("advanced.search-word")}</h3>
                    </div>

                    <AdvRow border={true}>
                        <div className="w-full">
                            <h4 className="caption !text-sm text-grey mb-4">{t("advanced.insert-word")}</h4>

                            <div className="bg-surface-static-secondary px-4 py-2 flex items-center w-2/3">
                                <span className="fill-grey w-4 h-4 mr-2">
                                    <SearchIcon />
                                </span>
                                <input
                                    name="search-string"
                                    className="placeholder:text-light-grey py-2.5 body-2 bg-transparent outline-none grow"
                                    type="text"
                                    placeholder={t("advanced.word")}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </AdvRow>

                    <AdvRow border={true}>
                        <div className="pt-4 pb-5 flex flex-col gap-4 w-80">
                            <h4 className="caption !text-sm text-light-grey mb-0.5">{t("advanced.search-mode")}</h4>
                            <SingleChoiceList
                                selectedValue={selectedMode}
                                changeHandler={handleModeChange}
                                filters={modeFilters}
                            />
                        </div>

                        <div className="pt-4 pb-5 flex flex-col self-start gap-4">
                            <h4 className="caption !text-sm text-grey mb-0.5">{t("advanced.word-category")}</h4>
                            <div className="flex gap-4">
                                <ExcludeCategoryDropdown
                                    selectedValue={excludeCategory}
                                    onChange={setExcludeCategory}
                                />
                                <WordCategoryFilter
                                    bg="light"
                                    hierarchy="advsearch"
                                    size="small"
                                    selectedCategory={selectedCategory}
                                    onChange={setSelectedCategory}
                                />
                            </div>
                        </div>
                    </AdvRow>

                    {selectedCategory && (
                        <>
                            <div>
                                <h3 className="body-2-title text-surface-static-emphasised p-4">
                                    {/* @ts-ignore - can't cast to lang type */}
                                    {tCat(selectedCategory)}
                                </h3>
                            </div>

                            <AdvRow border={true}>
                                <div className="flex flex-col gap-4">
                                    {filters[selectedCategory]?.map((filter, index) => (
                                        <div key={index} className="select-none">
                                            <h4 className="caption !text-sm text-light-grey pb-4">
                                                {tFilters(`${filter.name}.title`)}
                                            </h4>
                                            <div className="ml-0.5 flex gap-6 accent-black">
                                                {filter.values.map((option, index) => (
                                                    <label
                                                        key={`${option}-${index}`}
                                                        className="body-2 flex items-center"
                                                    >
                                                        <input
                                                            className="mr-2"
                                                            type="checkbox"
                                                            name={filter.name}
                                                            value={option}
                                                        />
                                                        {/* @ts-ignore - can't cast to lang type */}
                                                        {tFilters(`${filter.name}.${option}`)}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AdvRow>
                        </>
                    )}

                    {contextWords.map((_, index) => (
                        <ContextWord
                            key={index}
                            index={index}
                            removeContextWord={removeContextWord}
                            isLast={index === contextWords.length - 1}
                        />
                    ))}

                    <div className="p-4 flex gap-2 justify-between items-center">
                        <TextButton
                            bg="light"
                            hiearchy="ghost"
                            size="medium"
                            onClick={newContextWord}
                            leadingIcon={<CheckIcon />}
                            disabled={contextWords.length >= 3}
                        >
                            {t("advanced.addContext")}
                        </TextButton>

                        <div>
                            <TextButton bg="light" hiearchy="ghost" size="medium" onClick={resetForm}>
                                {t("advanced.reset")}
                            </TextButton>
                            <TextButton bg="light" hiearchy="primary" size="medium" isSubmit={true}>
                                {t("advanced.search")}
                            </TextButton>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
}
