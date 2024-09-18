"use client";

import { useTranslations } from "next-intl";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import { TextSource } from "@/db/schema";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";

interface SearchSourceSelectorProps {
    bg: "light" | "emphasised";
    hiearchy?: "primary" | "ghost";
    size: "xsmall" | "small" | "medium" | "large";
    selectedFilter: TextSource;
    handleFilterChange?: (name: string) => void;
}

export default function SearchSourceSelector({
    bg,
    hiearchy = "primary",
    size,
    selectedFilter,
    handleFilterChange,
}: SearchSourceSelectorProps) {
    const t = useTranslations("Search.tab");

    return (
        <FilterDropdown
            bg={bg}
            hiearchy={hiearchy}
            size={size}
            isActive={true}
            label={t(`${selectedFilter}.${hiearchy === "ghost" ? "long" : "short"}`)}
            leadingIcon={hiearchy === "primary" && <CaretDown />}
            trailingIcon={hiearchy === "ghost" && <CaretDown />}
        >
            <MenuListItem
                value="orig"
                isActive={selectedFilter === "ORIG"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t(`ORIG.${hiearchy === "ghost" ? "long" : "short"}`)}
            </MenuListItem>
            <MenuListItem
                value="correct"
                isActive={selectedFilter === "CORR"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t(`CORR.${hiearchy === "ghost" ? "long" : "short"}`)}
            </MenuListItem>
        </FilterDropdown>
    );
}
