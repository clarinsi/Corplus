import { Suspense } from "react";
import { useTranslations } from "next-intl";
import FiltersSidebar from "@/app/[locale]/[lemma]/FiltersSidebar";
import ListResults from "@/app/[locale]/[lemma]/list/ListResults";
import SearchResultsLoader from "@/components/loaders/SearchResultsLoader";

interface PageProps {
    params: {
        lemma: string;
    };
    searchParams: {} & Record<string, string>;
}

export default function ListPage({ params, searchParams }: PageProps) {
    const t = useTranslations("SearchResults");
    const currentLemma = decodeURIComponent(params.lemma);

    return (
        <div className="m-8 gap-x-8 grid grid-cols-4 container mx-auto">
            <div className="bg-white rounded pb-6">
                <div className="flex justify-between items-center">
                    <h3 className="body-2-title text-surface-static-emphasised ml-4 py-4">{t("filters-title")}</h3>
                </div>

                <Suspense>
                    <FiltersSidebar
                        searchParams={searchParams}
                        currentLemma={currentLemma}
                        showWordClass={true}
                        hideLemmaForms={true}
                    />
                </Suspense>
            </div>

            <Suspense fallback={<SearchResultsLoader />}>
                <ListResults currentLemma={currentLemma} />
            </Suspense>
        </div>
    );
}
