import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/[locale]/Header";
import Search from "@/app/[locale]/Search";
import StatsWrapper from "@/app/[locale]/StatsWrapper";

export default function Home() {
    const t = useTranslations("Index");
    return (
        <>
            <Header showAllSources={true} />

            <main className="bg-surface-static-emphasised">
                <div className="max-w-[67rem] mx-auto mb-[4.5rem]">
                    <div className="flex flex-col gap-4 text-white text-2xl pb-16 pt-20">
                        <h1 className="headline-s">{t("title")}</h1>
                        <h2 className="headline-m">{t("subtitle")}</h2>
                    </div>

                    <Suspense>
                        <Search />
                    </Suspense>

                    <div className="grid grid-cols-4 gap-8 pt-20 pb-24">
                        <Suspense>
                            <StatsWrapper />
                        </Suspense>
                    </div>
                </div>
            </main>
        </>
    );
}
