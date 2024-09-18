import { Suspense } from "react";
import { useTranslations } from "next-intl";
import FiltersSidebar from "@/app/[locale]/[lemma]/FiltersSidebar";
import SearchResults from "@/app/[locale]/[lemma]/SearchResults";
import StatisticsInfo from "@/components/StatisticsInfo";
import UnitFormatWrapper from "@/components/UnitFormatWrapper";
import { ERRORS_FILTER, NO_STRING_SEARCH } from "@/constants";
import { redirect } from "@/navigation";

interface PageProps {
    params: {
        lemma: string;
    };
    searchParams: Record<string, string>;
}

export default function Page({ params, searchParams }: PageProps) {
    const t = useTranslations("SearchResults");
    const currentLemma = decodeURIComponent(params.lemma);

    if (currentLemma === NO_STRING_SEARCH && searchParams[ERRORS_FILTER] === undefined) {
        redirect("/");
    }

    return (
        <div className="m-8 gap-x-8 grid grid-cols-4 max-w-custom px-8 mx-auto">
            <div className="bg-white rounded shadow-tiny pb-6">
                <div className="flex justify-between items-center">
                    <h3 className="body-2-title text-surface-static-emphasised ml-4">{t("filters-title")}</h3>

                    <div className="flex items-center">
                        <UnitFormatWrapper searchParams={searchParams} />

                        <StatisticsInfo />
                    </div>
                </div>

                <Suspense>
                    <FiltersSidebar searchParams={searchParams} currentLemma={currentLemma} />
                </Suspense>
            </div>

            <Suspense>
                <SearchResults />
            </Suspense>
        </div>
    );
}
