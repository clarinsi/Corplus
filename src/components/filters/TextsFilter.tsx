"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import { TEXTS_FILTER } from "@/constants";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";
import { createUrl } from "@/util/util";

interface TextsFilterProps {
    bg: "light" | "emphasised";
    hierarchy?: "primary" | "ghost" | "advsearch";
    size: "small" | "medium" | "large";
}

export default function TextsFilter({ bg, hierarchy = "primary", size }: TextsFilterProps) {
    const t = useTranslations("Buttons.Texts");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilter = useMemo(() => searchParams.get(TEXTS_FILTER), [searchParams]);

    const handleFilterChange = (name: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("page");

        if (name === "all") newSearchParams.delete(TEXTS_FILTER);
        else if (name === "with-error") newSearchParams.set(TEXTS_FILTER, name);

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const label = useMemo(() => {
        if (selectedFilter === "with-error") return t("with-error");
        return t("all");
    }, [selectedFilter, t]);

    return (
        <FilterDropdown
            bg={bg}
            hiearchy={hierarchy}
            size={size}
            isActive={true}
            label={label}
            leadingIcon={hierarchy !== "advsearch" && <CaretDown />}
            trailingIcon={hierarchy === "advsearch" && <CaretDown />}
        >
            <MenuListItem
                value="all"
                isActive={selectedFilter === null}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("all")}
            </MenuListItem>
            <MenuListItem
                value="with-error"
                isActive={selectedFilter === "with-error"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("with-error")}
            </MenuListItem>
        </FilterDropdown>
    );
}
