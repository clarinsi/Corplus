import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { WordSearchMode } from "@/app/[locale]/Search";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import ExcludeCategoryDropdown from "@/components/adv-search/ExcludeCategoryDropdown";
import SingleChoiceList, { SingleChoiceFilter } from "@/components/adv-search/SingleChoiceList";
import WordCategoryFilter from "@/components/adv-search/WordCategoryFilter";
import { filters } from "@/components/adv-search/config";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";
import TextButton from "@/design-system/button/TextButton";
import AdvRow from "./adv-search/AdvRow";

export type DistanceMode = "range" | "exact";

export default function ContextWord({
    index,
    removeContextWord,
    isLast,
}: {
    index: number;
    removeContextWord: (i: number) => void;
    isLast: boolean;
}) {
    const t = useTranslations("Search");
    const tCat = useTranslations("Filters.Category");
    const tFilters = useTranslations("Filters.Schema");

    const [searchString, setSearchString] = useState<string>("");

    const [notInContext, setNotInContext] = useState<string>("false");
    const notInContextOptions: SingleChoiceFilter[] = [
        { label: t("advanced.context.false"), value: "false" },
        { label: t("advanced.context.true"), value: "true" },
    ];

    const [selectedMode, setSelectedMode] = useState<WordSearchMode>("lemma");
    const handleModeChange = (name: string) => setSelectedMode(name as WordSearchMode);
    const modeFilters: SingleChoiceFilter[] = [
        { label: t("advanced.forms.lemma"), value: "lemma" },
        { label: t("advanced.forms.text"), value: "text" },
    ];

    const [selectedCategory, setSelectedCategory] = useState<string>();
    const changeSelectedCategory = (name: string) => {
        setSelectedCategory(name);
        setSelectedCategoryFilters(new Set());
    };
    const [excludeCategory, setExcludeCategory] = useState<string>("false");
    const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<Set<string>>(new Set());
    const updateSelectedCategoryFilters = (value: string) => {
        const newSet = new Set(selectedCategoryFilters);

        if (newSet.has(value)) newSet.delete(value);
        else newSet.add(value);

        setSelectedCategoryFilters(newSet);
    };
    const [distanceMode, setDistanceMode] = useState<DistanceMode>("range");
    const handleDistanceModeChange = (name: string) => setDistanceMode(name as DistanceMode);
    const distanceModeFilters: SingleChoiceFilter[] = [
        { label: t("advanced.distanceMode.range"), value: "range" },
        { label: t("advanced.distanceMode.exact"), value: "exact" },
    ];

    const [leftDistance, setLeftDistance] = useState<string>("1");
    const [rightDistance, setRightDistance] = useState<string>("1");

    const serializedValue = useMemo(() => {
        const values = [];

        if (searchString !== "") values.push(`Lemma=${searchString}`);
        if (notInContext !== "false") values.push(`NotInContext=${notInContext}`);
        values.push(`Mode=${selectedMode}`);
        values.push(`DistanceMode=${distanceMode}`);
        values.push(`LeftDistance=${leftDistance}`);
        values.push(`RightDistance=${rightDistance}`);
        if (selectedCategory) values.push(`Category=${selectedCategory}`);
        if (excludeCategory !== "false") values.push(`ExcludeCategory=${excludeCategory}`);
        if (selectedCategoryFilters.size > 0) {
            // Convert set to array
            const filterString = Array.from(selectedCategoryFilters)
                // Split values by - and group them by the first part
                .reduce(
                    (acc, curr) => {
                        const [key, value] = curr.split("-");
                        acc[key] = [...(acc[key] || []), value];
                        return acc;
                    },
                    {} as Record<string, string[]>,
                );
            const filterStringArray = Object.entries(filterString).map(([key, value]) => `${key}=${value.join(",")}`);
            filterStringArray.forEach((filter) => values.push(filter));
        }

        return values.join(";");
    }, [
        searchString,
        notInContext,
        selectedMode,
        selectedCategory,
        excludeCategory,
        selectedCategoryFilters,
        distanceMode,
        leftDistance,
        rightDistance,
    ]);

    return (
        <div className="px-4 py-2">
            <input type="hidden" name="AdvContext" value={serializedValue} />

            <div className="flex justify-end items-center">
                {isLast && (
                    <TextButton bg="light" hiearchy="ghost" size="medium" onClick={() => removeContextWord(index)}>
                        {t("advanced.remove")}
                    </TextButton>
                )}
            </div>

            <div className="pt-4 pb-5 flex flex-col gap-4 w-80">
                <h4 className="caption !text-sm text-light-grey mb-0.5">{t("advanced.context.title")}</h4>
                <SingleChoiceList
                    selectedValue={notInContext}
                    changeHandler={setNotInContext}
                    filters={notInContextOptions}
                />
            </div>

            <div className="bg-surface-static-secondary px-4 py-2 flex items-center w-2/3">
                <input
                    onChange={(e) => setSearchString(e.target.value)}
                    className="placeholder:text-light-grey py-2.5 body-2 bg-transparent outline-none grow"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    required
                />
            </div>

            <AdvRow>
                <div className="pt-4 pb-5 flex flex-col gap-4 w-80">
                    <h4 className="caption !text-sm text-light-grey mb-0.5">{t("advanced.searchMethod")}</h4>
                    <SingleChoiceList
                        selectedValue={selectedMode}
                        changeHandler={handleModeChange}
                        filters={modeFilters}
                    />
                </div>

                <div className="pt-4 pb-5 flex flex-col self-start gap-4">
                    <h4 className="caption !text-sm text-grey mb-0.5">{t("advanced.word-category")}</h4>
                    <div className="flex gap-4">
                        <ExcludeCategoryDropdown selectedValue={excludeCategory} onChange={setExcludeCategory} />
                        <WordCategoryFilter
                            bg="light"
                            hierarchy="advsearch"
                            size="small"
                            selectedCategory={selectedCategory}
                            onChange={changeSelectedCategory}
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
                                                key={`nested-${option}-${index}`}
                                                className="body-2 flex items-center"
                                            >
                                                <input
                                                    className="mr-2"
                                                    type="checkbox"
                                                    onChange={(e) =>
                                                        updateSelectedCategoryFilters(
                                                            `${filter.name}-${e.target.value}`,
                                                        )
                                                    }
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

            <AdvRow>
                <div className="pt-4 pb-5 flex flex-col gap-4 w-80">
                    <h4 className="caption !text-sm text-light-grey mb-0.5">{t("advanced.distanceTitle")}</h4>
                    <SingleChoiceList
                        selectedValue={distanceMode}
                        changeHandler={handleDistanceModeChange}
                        filters={distanceModeFilters}
                    />
                </div>

                <div className="pt-10 pb-5 flex gap-4 items-center self-center">
                    <DistanceDropdown selectedValue={leftDistance} onChange={setLeftDistance} />
                    <span>{t("advanced.distanceWord")}</span>
                    <DistanceDropdown selectedValue={rightDistance} onChange={setRightDistance} />
                </div>
            </AdvRow>
        </div>
    );
}

export function DistanceDropdown({
    selectedValue,
    onChange,
}: {
    selectedValue: string;
    onChange?: (value: string) => void;
}) {
    return (
        <FilterDropdown
            bg="light"
            hiearchy="advsearch"
            size="small"
            isActive={true}
            label={selectedValue}
            trailingIcon={<CaretDown />}
        >
            <MenuListItem
                value="0"
                isActive={selectedValue === "0"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                0
            </MenuListItem>
            <MenuListItem
                value="1"
                isActive={selectedValue === "1"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                1
            </MenuListItem>

            <MenuListItem
                value="2"
                isActive={selectedValue === "2"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                2
            </MenuListItem>

            <MenuListItem
                value="3"
                isActive={selectedValue === "3"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                3
            </MenuListItem>

            <MenuListItem
                value="4"
                isActive={selectedValue === "4"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                4
            </MenuListItem>

            <MenuListItem
                value="5"
                isActive={selectedValue === "5"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                5
            </MenuListItem>
        </FilterDropdown>
    );
}
