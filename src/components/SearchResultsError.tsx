import { Suspense } from "react";
import { useTranslations } from "next-intl";
import ViewControl from "@/app/[locale]/[lemma]/ViewControl";

export default function SearchResultsError() {
    const t = useTranslations("SearchResults");

    return (
        <div className="bg-white shadow-tiny rounded overflow-hidden col-span-3 flex flex-col justify-between">
            <div className="flex justify-between border-b border-static-border">
                <Suspense>
                    <ViewControl />
                </Suspense>
            </div>

            <div className="grow">
                <p className="px-4 my-3 callout">{t("no-results")}</p>
            </div>
        </div>
    );
}
