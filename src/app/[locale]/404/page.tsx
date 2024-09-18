import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/[locale]/Header";
import SearchInfo from "@/app/[locale]/[lemma]/SearchInfo";
import AsyncSpeakerLangFilter from "@/components/filters/AsyncSpeakerLangFilter";
import ErrorsDropdownFilter from "@/components/filters/ErrorsDropdownFilter";
import TextsFilter from "@/components/filters/TextsFilter";

export default function NotFound() {
    const t = useTranslations("NotFound");

    return (
        <div className="bg-surface-static-secondary">
            <Header showSearch={true} lemma="" />
            <div className="pb-24 bg-surface-static-secondary">
                <div className="bg-white shadow-tiny">
                    <div className="py-4 px-8 md:px-0 flex flex-col gap-2 container mx-auto">
                        <h1 className="text-surface-static-emphasised text-2xl font-bold">{t("title")}</h1>

                        <Suspense>
                            <SearchInfo />
                        </Suspense>
                    </div>

                    <hr className="text-static-border" />

                    <div className="py-2 px-8 md:px-0 flex gap-4 container mx-auto">
                        <TextsFilter bg="light" size="small" />
                        <AsyncSpeakerLangFilter />
                        <Suspense>
                            <ErrorsDropdownFilter bg="light" size="small" />
                        </Suspense>
                    </div>
                </div>
            </div>

            <div className="container mx-auto pb-32 py-12 rounded">
                <p className="p-6 bg-white">{t("body")}</p>
            </div>
        </div>
    );
}
