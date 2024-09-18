"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CaretDown from "@/assets/icons/CaretDown";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import CloseIcon from "@/assets/icons/CloseIcon";
import { FIRST_LANG_FILTER, LIST_SEPARATOR } from "@/constants";
import { BiblFilter } from "@/data/filters";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";
import { createUrl } from "@/util/util";

interface SpeakerLangFilterProps {
    bg: "light" | "emphasised";
    hierarchy?: "primary" | "ghost" | "advsearch";
    size: "small" | "medium" | "large";
    filters?: BiblFilter[];
}

export default function SpeakerLangFilter({ bg, hierarchy = "primary", size, filters }: SpeakerLangFilterProps) {
    const t = useTranslations("Buttons.FirstLang");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilters = useMemo(
        () => searchParams.get(FIRST_LANG_FILTER)?.split(LIST_SEPARATOR) ?? [],
        [searchParams],
    );
    const isActive = useMemo(() => selectedFilters.length > 0, [selectedFilters]);

    const handleFilterChange = (name: string) => {
        const newFilters = selectedFilters.includes(name)
            ? selectedFilters.filter((filter) => filter !== name)
            : [...selectedFilters, name];

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("page");

        if (newFilters.length === 0) newSearchParams.delete(FIRST_LANG_FILTER);
        else newSearchParams.set(FIRST_LANG_FILTER, newFilters.join(LIST_SEPARATOR));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const trailingIcon = useMemo(() => {
        if (!isActive) return <CaretDown />;
        return <CloseIcon />;
    }, [isActive]);

    const onTrailingClick = () => {
        if (!isActive) return;

        // Clear filters
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FIRST_LANG_FILTER);
        newSearchParams.delete("page");

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const label = useMemo(() => {
        if (selectedFilters.length === 0) return t("label");
        let output = selectedFilters.at(0)!;
        if (selectedFilters.length > 1) output += ` + ${selectedFilters.length - 1}`;
        return output;
    }, [selectedFilters, t]);

    return (
        <FilterDropdown
            bg={bg}
            hiearchy={hierarchy}
            size={size}
            isActive={isActive}
            isMultiChoice={true}
            label={label}
            trailingIcon={trailingIcon}
            onTrailingIconClick={onTrailingClick}
        >
            {filters?.map((lang) => (
                <MenuListItem
                    key={lang.name}
                    value={lang.name}
                    icon={<CheckBoxIcon />}
                    activeIcon={<CheckedBoxIcon />}
                    isActive={selectedFilters.includes(decodeURIComponent(lang.name))}
                    onClick={handleFilterChange}
                >
                    {lang.name}
                </MenuListItem>
            ))}
        </FilterDropdown>
    );
}
