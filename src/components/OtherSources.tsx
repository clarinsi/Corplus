"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import SourceEntryLoader from "@/components/loaders/SourceEntryLoader";
import axios from "axios";

interface OtherSourcesProps {
    currentLemma?: string;
}

export default function OtherSources({ currentLemma }: OtherSourcesProps) {
    const t = useTranslations("Header.all-sources-menu");

    return (
        <div className="shadow-tiny mb-0.5">
            <div className="container mx-auto flex items-center gap-8 flex-wrap py-8">
                <ErrorBoundary errorComponent={ErrorComponent}>
                    <Suspense fallback={<SourceEntryLoader />}>
                        <SloLeksSource currentLemma={currentLemma} />
                    </Suspense>
                </ErrorBoundary>
                <SourceEntry
                    href={`https://viri.cjvt.si/gigafida/Concordance/Search?Query=${currentLemma}`}
                    title={t("gigafida.title")}
                    subtitle={t("gigafida.subtitle")}
                />
                <SourceEntry
                    href={`https://viri.cjvt.si/gos/Concordance/Search?TranscriptionType=Conversational&Query=${currentLemma}`}
                    title={t("gos.title")}
                    subtitle={t("gos.subtitle")}
                />
            </div>
        </div>
    );
}

const ErrorComponent = () => {
    return <></>;
};

function SourceEntry({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
    return (
        <Link
            href={href}
            className="group rounded-md bg-surface-static-secondary shadow p-4 min-w-[16rem] transition-all duration-200 hover:bg-secondary"
            target="_blank"
        >
            <h3 className="headline-s !font-normal mb-1 text-grey group-hover:text-black transition-all duration-200">
                {title}
            </h3>
            <p className="caption text-light-grey group-hover:text-grey transition-all duration-200">{subtitle}</p>
        </Link>
    );
}

function SloLeksSource({ currentLemma }: { currentLemma?: string }) {
    const t = useTranslations("Header.all-sources-menu.sloleks");
    const { data } = useSuspenseQuery({
        queryKey: ["sloleks-id", currentLemma],
        queryFn: () => axios.get(`/api/sloleks/${currentLemma}`, { baseURL: process.env.NEXT_PUBLIC_BASE_URL }).then((res) => res.data),
    });

    return (
        <SourceEntry
            href={`https://viri.cjvt.si/sloleks/slv/headword/${data.id}`}
            title={t("title")}
            subtitle={t("subtitle")}
        />
    );
}
