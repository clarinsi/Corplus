import { useTranslations } from "next-intl";
import { FilterableListProps } from "@/design-system/filterable-list/FilterableList";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";

export default function FilterListLoader({ titleLangKey }: { titleLangKey?: string }) {
    const t = useTranslations("SearchResults.filters");
    const getEntry = (i: number) => <div key={i} className="h-5 bg-static-border rounded mx-4 my-1" />;

    // @ts-expect-error
    const title = titleLangKey ? t(titleLangKey) : undefined;

    return (
        <div className="bg-white">
            {titleLangKey && <FilterableListHeader title={title} />}

            <div>
                <div className="animate-pulse">{Array.from({ length: 7 }, (_, i) => getEntry(i))}</div>
            </div>
        </div>
    );
}
