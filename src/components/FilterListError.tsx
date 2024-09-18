import { useTranslations } from "next-intl";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";

export default function FilterListError({ titleLangKey }: { titleLangKey?: string }) {
    const t = useTranslations("SearchResults");

    // @ts-expect-error
    const title = titleLangKey ? t(`filters.${titleLangKey}`) : undefined;

    return (
        <div className="bg-white">
            {titleLangKey && <FilterableListHeader title={title} />}

            <p className="callout px-4 pb-3 text-grey">{t("no-results")}</p>
        </div>
    );
}
