import React from "react";
import { useTranslations } from "next-intl";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";

export default function ExcludeCategoryDropdown({
    selectedValue,
    onChange,
}: {
    selectedValue: string;
    onChange?: (value: string) => void;
}) {
    const t = useTranslations("Search.advanced.excludeCategory");
    const selectedLabel = t(selectedValue as "true" | "false");

    return (
        <FilterDropdown
            bg="light"
            hiearchy="advsearch"
            size="small"
            isActive={true}
            label={selectedLabel}
            trailingIcon={<CaretDown />}
        >
            <MenuListItem
                value="false"
                isActive={selectedValue === "false"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("false")}
            </MenuListItem>

            <MenuListItem
                value="true"
                isActive={selectedValue === "true"}
                onClick={onChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("true")}
            </MenuListItem>
        </FilterDropdown>
    );
}
