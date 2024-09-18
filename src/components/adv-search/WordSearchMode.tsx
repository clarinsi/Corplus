"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";

interface WordSearchModeProps {
    bg: "light" | "emphasised";
    size: "small" | "medium" | "large";
    selectedMode: string;
    onChange?: (name: string) => void;
}

export default function WordSearchMode({ bg, size, selectedMode, onChange }: WordSearchModeProps) {
    const t = useTranslations("Filters.Mode");
    // @ts-ignore - can't cast to proper lang type
    const label = useMemo(() => (selectedMode ? t(selectedMode) : t("unset")), [selectedMode, t]);

    return (
        <FilterDropdown
            bg={bg}
            size={size}
            isActive={selectedMode !== undefined}
            label={label}
            leadingIcon={<CaretDown />}
        >
            <MenuListItem
                value="lemma"
                isActive={selectedMode === "lemma"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("lemma")}
            </MenuListItem>
            <MenuListItem
                value="exact"
                isActive={selectedMode === "exact"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("exact")}
            </MenuListItem>
        </FilterDropdown>
    );
}
