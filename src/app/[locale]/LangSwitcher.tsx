"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";
import { usePathname, useRouter } from "@/navigation";
import { createUrl } from "@/util/util";

export default function LangSwitcher() {
    const locale = useLocale();
    const t = useTranslations("Buttons.Lang");
    const localizedRouter = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();

    const handleClick = (name: string) => {
        localizedRouter.replace(createUrl(path, searchParams), { locale: name });
    };

    return (
        <FilterDropdown
            bg="emphasised"
            hiearchy="ghost"
            size="medium"
            trailingIcon={<CaretDown />}
            label={t(locale as "sl" | "en")}
        >
            <MenuListItem
                value="sl"
                isActive={locale === "sl"}
                onClick={handleClick}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("sl")}
            </MenuListItem>
            <MenuListItem
                value="en"
                isActive={locale === "en"}
                onClick={handleClick}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("en")}
            </MenuListItem>
        </FilterDropdown>
    );
}
