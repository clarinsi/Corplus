import { ReactNode, Suspense } from "react";
import Header from "@/app/[locale]/Header";
import SearchInfo from "@/app/[locale]/[lemma]/SearchInfo";
import AsyncSpeakerLangFilter from "@/components/filters/AsyncSpeakerLangFilter";
import ErrorsDropdownFilter from "@/components/filters/ErrorsDropdownFilter";
import TextsFilter from "@/components/filters/TextsFilter";
import { clsx } from "clsx";

interface LayoutProps {
    params: {
        lemma: string;
    };
    children: ReactNode;
}

export default function Layout({ params, children }: LayoutProps) {
    const decodedLemma = decodeURIComponent(params.lemma);
    const headingClasses = clsx("headline-s", decodedLemma === "any" ? "text-grey" : "text-surface-static-emphasised");

    return (
        <>
            <Header showSearch={true} lemma={params.lemma} />
            <div className="pb-24 bg-tertiary-surface">
                <div className="bg-white shadow-tiny">
                    <div className="py-4 flex flex-col gap-2 max-w-custom px-8 mx-auto">
                        <h1 className={headingClasses}>
                            {decodedLemma === "any" ? "(*)" : decodedLemma == null ? "/" : decodedLemma}
                        </h1>

                        <Suspense>
                            <SearchInfo />
                        </Suspense>
                    </div>

                    <hr className="text-static-border" />

                    <div className="py-2  flex gap-2 max-w-custom px-8 mx-auto">
                        <TextsFilter bg="light" size="small" />
                        <Suspense>
                            {/* @ts-ignore */}
                            <AsyncSpeakerLangFilter />
                            <ErrorsDropdownFilter bg="light" size="small" />
                        </Suspense>
                    </div>
                </div>

                {children}
            </div>
        </>
    );
}
